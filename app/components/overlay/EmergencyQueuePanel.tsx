'use client';

import type { Road } from '../../lib/simulation-adapter';

interface EmergencyQueuePanelProps {
  emergencyQueues: Record<Road, string[]>;
}

const ROAD_ORDER: readonly Road[] = ['north', 'south', 'east', 'west'];

function roadLabel(road: Road): string {
  return road.slice(0, 1).toUpperCase();
}

export function EmergencyQueuePanel({ emergencyQueues }: EmergencyQueuePanelProps) {
  const totalEmergency = ROAD_ORDER.reduce((sum, road) => sum + emergencyQueues[road].length, 0);

  return (
    <section
      className="min-w-0 border-2 border-[#7E2553] bg-[#1D2B53] px-2 py-1.5"
      aria-label="Emergency queues"
    >
      <div className="mb-1 flex items-center justify-between">
        <p className="m-0 font-pixel text-[10px] uppercase tracking-widest text-[#FFEC27]">
          Emergency
        </p>
        <p className="m-0 font-pixel text-[9px] text-[#FFF1E8]">{totalEmergency}</p>
      </div>

      {totalEmergency === 0 ? (
        <p className="m-0 font-pixel text-[9px] leading-tight text-[#C2C3C7]">
          No emergency vehicles waiting.
        </p>
      ) : null}

      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {ROAD_ORDER.map((road) => {
          const queue = emergencyQueues[road];
          return (
            <li key={road} className="flex items-start gap-2">
              <span className="font-pixel text-[9px] text-[#29ADFF]">{roadLabel(road)}</span>
              <span className="break-all font-pixel text-[9px] leading-tight text-[#FFF1E8]">
                {queue.length > 0 ? queue.join(', ') : '-'}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default EmergencyQueuePanel;
