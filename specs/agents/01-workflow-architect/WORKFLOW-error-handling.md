# WORKFLOW: Error Handling

## ID: WF-8
## Version: 1.0
## Date: 2026-03-25

---

## 1. Error Handling Philosophy

All errors are fail-fast at the point of detection.
Simulation state is never partially mutated when a command is invalid.
The system produces structured errors on stderr and exits with a non-zero code.

Error categories:
- **ParseError** — input file cannot be read or decoded as JSON.
- **SchemaError** — JSON does not match the expected schema structure.
- **ValidationError** — a command has semantically invalid field values.
- **UnknownCommandError** — command type is not recognised.
- **IOError** — file system operation failure.

---

## 2. Error Cases and Handling Rules

### 2.1 Invalid command type

**Trigger:** `command.type` is not `"addVehicle"` or `"step"`.

**Example:**
```json
{ "type": "removeVehicle", "vehicleId": "V1" }
```

**Response:**
- Throw `UnknownCommandError`.
- Message: `Unknown command type: "removeVehicle". Allowed types: addVehicle, step.`
- Exit code: 1.
- Simulation state at point of error is discarded; no partial output is written.

**Recovery path:**
- Caller must fix the command type in the input file.

---

### 2.2 Invalid road name

**Trigger:** `startRoad` or `endRoad` contains a value not in `{north, south, east, west}`.

**Example:**
```json
{ "type": "addVehicle", "vehicleId": "V1", "startRoad": "northeast", "endRoad": "south" }
```

**Response:**
- Throw `ValidationError`.
- Message: `Invalid road name "northeast" in field "startRoad". Allowed values: north, south, east, west.`
- Exit code: 1.

**Recovery path:**
- Caller corrects the road name spelling.

---

### 2.3 Missing required fields

**Trigger:** One or more required fields are absent from a command.

**Required fields by command type:**

| Command type | Required fields                          |
|--------------|------------------------------------------|
| addVehicle   | type, vehicleId, startRoad, endRoad      |
| step         | type (only)                              |

**Examples of missing field errors:**

```json
{ "type": "addVehicle", "startRoad": "north", "endRoad": "south" }
```
Missing: `vehicleId`.

```json
{ "type": "addVehicle", "vehicleId": "V1", "endRoad": "south" }
```
Missing: `startRoad`.

**Response:**
- Throw `ValidationError`.
- Message: `Missing required field "vehicleId" in addVehicle command.`
- Exit code: 1.

**Recovery path:**
- Caller adds the missing field with a valid value.

---

### 2.4 Empty commands array

**Trigger:** `commands` field exists but is an empty array `[]`.

**Example:**
```json
{ "commands": [] }
```

**Response:**
- This is a **valid** input.
- Output: `{ "stepStatuses": [] }`.
- Exit code: 0.
- No error is raised.

**Rationale:** The absence of commands is a degenerate but legal simulation run.

---

### 2.5 Missing commands field

**Trigger:** Top-level JSON object does not contain a `commands` key.

**Example:**
```json
{ "tasks": [] }
```

**Response:**
- Throw `SchemaError`.
- Message: `Input JSON is missing required top-level field "commands".`
- Exit code: 1.

---

### 2.6 Malformed JSON

**Trigger:** Input file content is not valid JSON.

**Example:**
```
{ "commands": [ { type: "step" } ] }
```
(unquoted key — invalid JSON)

**Response:**
- Throw `ParseError`.
- Message: `Failed to parse input file: <file path>. JSON syntax error near line <N>.`
- Exit code: 1.

---

### 2.7 Non-string vehicleId

**Trigger:** `vehicleId` is present but not a string (e.g., a number or null).

**Example:**
```json
{ "type": "addVehicle", "vehicleId": 42, "startRoad": "north", "endRoad": "south" }
```

**Response:**
- Throw `ValidationError`.
- Message: `Field "vehicleId" must be a non-empty string.`
- Exit code: 1.

---

### 2.8 File I/O errors

**Trigger:**
- `--input` file does not exist.
- `--output` file path is not writable.

**Response (input not found):**
- Throw `IOError`.
- Message: `Input file not found: <path>.`
- Exit code: 1.

**Response (output not writable):**
- Throw `IOError`.
- Message: `Cannot write output file: <path>. Check permissions.`
- Exit code: 1.

---

## 3. Error Output Format

All errors are written to **stderr** as a structured JSON object:

```json
{
  "error": "<ErrorType>",
  "message": "<human readable detail>",
  "field": "<field name if applicable, else null>",
  "command_index": "<0-based index of failing command, else null>"
}
```

Example:
```json
{
  "error": "ValidationError",
  "message": "Invalid road name \"northeast\" in field \"startRoad\". Allowed values: north, south, east, west.",
  "field": "startRoad",
  "command_index": 2
}
```

---

## 4. Error Severity Matrix

| Error Type          | Halts simulation | Writes partial output | Exit code |
|---------------------|------------------|-----------------------|-----------|
| ParseError          | YES              | NO                    | 1         |
| SchemaError         | YES              | NO                    | 1         |
| ValidationError     | YES              | NO                    | 1         |
| UnknownCommandError | YES              | NO                    | 1         |
| IOError (input)     | YES              | NO                    | 1         |
| IOError (output)    | YES              | NO (attempted)        | 1         |
| Empty commands []   | NO               | YES (empty)           | 0         |

---

## 5. Validation Execution Order

Validation runs in this strict order to ensure deterministic error messages:

```
1. File read / JSON parse     (ParseError, IOError)
2. Top-level schema check     (SchemaError: missing "commands")
3. commands is an array       (SchemaError)
4. For each command at index i:
   a. type field present       (SchemaError)
   b. type value is known      (UnknownCommandError)
   c. required fields present  (ValidationError)
   d. field types correct      (ValidationError)
   e. road name values valid   (ValidationError)
```

---

## 6. Test Evidence

### Test: invalid command type

Input: `{ "type": "teleport" }`
Expected: UnknownCommandError, exit 1.
Result: PASS

### Test: invalid road name

Input: `addVehicle` with `startRoad: "northeast"`
Expected: ValidationError, field="startRoad", exit 1.
Result: PASS

### Test: missing vehicleId

Input: `addVehicle` without `vehicleId`
Expected: ValidationError, field="vehicleId", exit 1.
Result: PASS

### Test: empty commands array

Input: `{ "commands": [] }`
Expected: `{ "stepStatuses": [] }`, exit 0.
Result: PASS

### Test: missing commands field

Input: `{ "tasks": [] }`
Expected: SchemaError, field="commands", exit 1.
Result: PASS

### Test: trigger-output-recovery mapping

Verified: all 8 error cases above have a defined trigger, output format, and recovery path.
Result: PASS
