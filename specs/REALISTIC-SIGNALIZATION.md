# Realistic signalization (specification)

## Streszczenie (PL)

Model czasu: jeden `step` = jeden dyskretny tick (np. 1 s), ustalona kolejność: sygnał → wyjazdy → aktualizacja sterownika. Ruch: typ manewru z `startRoad` + `endRoad` (prosto / lewo / prawo / zawracanie). Minimum czterech faz chronionych (NS prosto, NS lewo, EW prosto, EW lewo) bez konfliktujących zieleni. Segmenty GREEN / YELLOW / ALL_RED z konfigurowalną długością; zera pomijane. Aktuacja: min/max green, gap-out po min green przy braku popytu, opcjonalne skip-empty. Wybór następnej fazy po ALL_RED: ważona suma kolejek (zgodność manewru z fazą, opcjonalnie `roadPriorities`), remis: round-robin w stałej kolejności pierścienia. Bezpieczeństwo: żółty bez nowych wyjazdów, ALL_RED na opróżnienie. Awariaja: przymus fazy dla manewru pojazdu awaryjnego na czele kolejki. Wyjście JSON bez zmian kształtu `{ stepStatuses: [{ leftVehicles }] }`; wejście: opcjonalne `options.signalTimings`. Migracja: inna semantyka niż „jedna zmiana fazy na step”; testy mogą użyć zdegenerowanych czasów.

---

## 1. Time model

- Each CLI `step` command advances the simulation by **exactly one discrete tick** (nominal real time e.g. 1 s; the numeric value is not emitted in I/O unless extended later).
- **Order of operations within one tick** (must be deterministic and documented in tests):
  1. **Apply signal state for discharge** — Using the controller state _at the start of the tick_, determine which movements may initiate or continue departure this tick (green vs yellow vs red; see §5–§7).
  2. **Dequeue eligible vehicles** — For each approach, if the head vehicle’s movement is served and the signal allows a departure for that movement, dequeue up to the per-tick capacity (current product: **at most one departure per road per tick** unless a future spec raises throughput).
  3. **Advance controller** — Decrement segment timers; transition GREEN→YELLOW→ALL_RED→next GREEN as rules dictate; run gap-out / max-green; select next phase when appropriate; apply emergency preemption flags after departures if specified below.

No other ordering is valid for conformance.

---

## 2. Movement model

Roads are the compass legs `north | south | east | west`. A vehicle **approaches** on `startRoad` (the leg it entered from) and **exits** onto `endRoad` (destination leg). Relative movement is defined from the approach.

**Opposite leg** (straight across the intersection):

| `startRoad` | Opposite (straight `endRoad`) |
| ----------- | ----------------------------- |
| north       | south                         |
| south       | north                         |
| east        | west                          |
| west        | east                          |

**Classification** (for `startRoad` ≠ `endRoad` unless u-turn):

| Condition                                | Movement                                    |
| ---------------------------------------- | ------------------------------------------- |
| `endRoad` equals opposite of `startRoad` | `straight`                                  |
| `endRoad` equals `startRoad`             | `u_turn`                                    |
| Otherwise                                | `left` or `right` per right-hand rule below |

**Right-hand rule (clockwise ring N → E → S → W):**  
Index roads `N=0, E=1, S=2, W=3`. Let `iS` / `iE` be indices of `startRoad` / `endRoad`.

- `d = (iE - iS + 4) % 4`
- `d === 0` → u-turn (also caught by `endRoad === startRoad`)
- `d === 1` → `right`
- `d === 2` → `straight` (consistent with opposite table)
- `d === 3` → `left`

**Quick reference table:**

| startRoad | straight | left  | right | u_turn |
| --------- | -------- | ----- | ----- | ------ |
| north     | south    | west  | east  | north  |
| south     | north    | east  | west  | south  |
| east      | west     | north | south | east   |
| west      | east     | south | north | west   |

Implementations **must** use `endRoad` for movement classification (not optional for routing).

---

## 3. Conflict-free signal phases (protected movements)

Minimum **four** green sub-phases (each may be drawn as a green arrow for turning phases). No two phases may grant **conflicting** movements simultaneously. Conflicts follow standard crossing paths: e.g. NS straight conflicts with EW straight and with left turns that cut across opposing traffic.

**Phase ring (canonical order for round-robin tie-break, §6):**

| Phase id (suggested) | Served movements (from approaches)                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NS_THROUGH`         | **Minimum:** `straight` from **north** and **south**. **Default:** also `right` from **north** and **south** (same phase, no new conflicts vs EW in vehicle-only model). |
| `NS_LEFT`            | `left` and `u_turn` from **north** and **south**                                                                                                                         |
| `EW_THROUGH`         | **Minimum:** `straight` from **east** and **west**. **Default:** also `right` from **east** and **west**.                                                                |
| `EW_LEFT`            | `left` and `u_turn` from **east** and **west**                                                                                                                           |

**Rationale:** Left and u-turn cut across opposing approaches; they are isolated in `*_LEFT`. Rights share the same approach as through and do not cross the opposing through stream in this intersection topology.

**Normative rule:** A vehicle at the head of a queue is **eligible** for the active phase iff its derived `movement` is listed for that phase **and** its `startRoad` matches the phase axis (N/S vs E/W).

Implementations may add phases (e.g. split turn arrows) only if the conflict matrix remains acyclic for simultaneous greens.

---

## 4. Segments and timings

Each green sub-phase runs a **profile** of contiguous segments:

1. **GREEN** — departures allowed per §5–§7.
2. **YELLOW** — **no new departures**; movements that already entered the intersection may be modeled as clearing instantly this tick or held for a dedicated clearance model; **normative for this product:** no vehicle may begin a new departure on yellow (see §7).
3. **ALL_RED** — no departures; **clearance** interval before a new phase may show green.

**Configurable durations** (non-negative integers, in ticks):

- Per-phase or global defaults: `greenMin`, `greenMax`, `yellowTicks`, `allRedTicks`.
- **Zero-duration segments** are **skipped** (no-op): e.g. `yellowTicks = 0` and `allRedTicks = 0` yields an instant transition for tests (**degenerate profile**).

**Controller state** must record: active phase id, segment kind (`GREEN` | `YELLOW` | `ALL_RED`), ticks remaining in segment, and ticks spent in current GREEN (for min/max green).

---

## 5. Actuation

- **Min green:** While in GREEN, the controller **must not** begin yellow for **lack of demand** until `minGreenTicks` have elapsed in that GREEN (unless **max green** or **emergency** forces earlier termination — emergency handling overrides normal actuation).
- **Max green:** GREEN ends no later than after `maxGreenTicks` (transition to YELLOW then ALL_RED as configured), even if demand persists.
- **Gap-out:** After `minGreenTicks`, if **demand for the current phase** is **zero** (no queued vehicle on any approach of that phase whose movement is served by this phase), transition GREEN → YELLOW on this tick (after dequeue step, demand is evaluated on **remaining** queues per implementation choice: normative — evaluate **after** departures in step 2 so gap-out reflects post-service state).
- **Skip-empty (optional flag):** When **entering** GREEN for a phase (first tick of GREEN after ALL_RED), if there is **no** eligible demand for that phase, **immediately** skip GREEN/YELLOW for that phase and advance selection (treat as zero-length green for that visit) **or** jump to next phase without dwelling — must be deterministic; document chosen variant in release notes.

---

## 6. Adaptive next phase selection

Selection runs when a new GREEN phase must be chosen — typically **after** ALL_RED completes (or on init).

1. For each phase `p` in the ring, compute **weighted demand** `D(p) = Σ w(r)` over every vehicle `v` **waiting** in queue on road `r = v.startRoad` such that `v`’s movement is served in phase `p`.
   - **Optional `roadPriorities`:** map `road → non-negative weight` (default `1`). Multiply each vehicle’s contribution by `w(r)` (or add only at head — **normative:** count **all** queued vehicles matching the phase’s movements to reflect back-pressure). If a weight is missing, use `1`.
2. Choose `p` with **maximum** `D(p)`.
3. **Tie-break:** **Round-robin** on the **fixed ring order**:  
   `NS_THROUGH → NS_LEFT → EW_THROUGH → EW_LEFT → …`  
   Track `lastServedPhaseIndex` (or equivalent); among tied phases, pick the **next** candidate after the last served, wrapping circularly. **Do not** use ad-hoc alternation between two phases only.

**Emergency** (§8) overrides this section when applicable.

---

## 7. Safety invariants

- **Single green conflict class:** At any tick, the set of movements granted a **departure permit** must be a subset of **one** phase row in §3 (no mixing NS_THROUGH with EW_LEFT, etc.).
- **Yellow:** No **new** departures; first tick of yellow does not release vehicles that were waiting at stop line (they were not “in intersection” from prior tick in this product’s discrete model).
- **ALL_RED:** No departures; enforces clearance between conflicting greens.
- **Determinism:** Same initial state + same command stream ⇒ same `stepStatuses`.

---

## 8. Emergency (preemption)

- If any queue has **`priority: emergency`** on the **head** vehicle, the controller **must** interrupt the normal ring/timers and transition toward **forced GREEN** for the **unique phase** that serves that vehicle’s **movement** and **startRoad** (movement-aware).
- If multiple emergency heads require **different** phases, resolution order: **highest** preemption priority (document: e.g. smaller ring index first, or lexicographic `vehicleId`) — pick one deterministic rule and test it.
- After the emergency is served (queue head no longer emergency or no longer demands that phase), restore normal actuation from a defined baseline (e.g. begin ALL_RED then adaptive selection).

---

## 9. JSON I/O

**Output (unchanged, required):**

```json
{
  "stepStatuses": [{ "leftVehicles": ["vehicleId", "..."] }]
}
```

One entry per `step` command, in order. `leftVehicles` lists vehicles that **departed this tick** (dequeued from approach after successful service).

**Input:** Existing `commands` array unchanged. **Optional** top-level `options.signalTimings` (name fixed for this spec) — object whose exact keys are implementation-defined but **must** include documented defaults; suggested shape for implementers:

```json
{
  "commands": [ ... ],
  "options": {
    "roadPriorities": { "north": 1, "south": 1, "east": 1, "west": 1 },
    "signalTimings": {
      "minGreenTicks": 5,
      "maxGreenTicks": 60,
      "yellowTicks": 3,
      "allRedTicks": 2,
      "skipEmptyPhases": false,
      "perPhase": {
        "NS_THROUGH": { "minGreenTicks": 5, "maxGreenTicks": 60 },
        "NS_LEFT": { ... }
      }
    }
  }
}
```

Validators should accept absence of `options` and apply defaults. **Breaking vs prior:** see §10.

---

## 10. Migration and compatibility

- **Breaking change:** The legacy model selects between **two** coarse phases per step (`NS_STRAIGHT` / `EW_STRAIGHT`) with **implicit** instant transition and **no** yellow/all-red; every vehicle on a green road may match the phase without movement filtering.
- **New model:** Phase is **movement-qualified**; multiple ticks may elapse **without** a phase change; `leftVehicles` per tick may be empty during yellow/all-red or when the active green serves no head vehicle on a road.
- **Tests:** Use **degenerate timings** — e.g. `minGreenTicks = 1`, `maxGreenTicks = 1`, `yellowTicks = 0`, `allRedTicks = 0`, and optional `skipEmptyPhases` — to approximate single-tick greens and reduce divergence from golden files during migration.
- **Telemetry / GUI:** If `phaseId` or timing fields are exposed, extend them to four (or more) phase ids; do not overload legacy two-phase strings without versioning.

---

## 11. Checklist for implementers

- [ ] Movement derivation matches §2 table and formula.
- [ ] Phase/movement matrix matches §3; conflict checks automated in tests.
- [ ] Per-tick order: signal → dequeue → advance controller.
- [ ] Yellow blocks new departures; all-red clears conflicts.
- [ ] Gap-out, min/max green, optional skip-empty.
- [ ] Weighted demand uses movements, not just road counts.
- [ ] Tie-break is full-ring round-robin.
- [ ] Emergency uses queue-head + movement-aware phase.
- [ ] Zod/schema updated for optional `options.signalTimings` when implemented.
