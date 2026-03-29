let counter = 0;

export function generateVehicleId(): string {
  counter += 1;
  return `V${String(counter).padStart(3, '0')}`;
}

export function resetVehicleIdCounter(): void {
  counter = 0;
}
