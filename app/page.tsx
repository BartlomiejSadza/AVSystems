import { SimulationProvider } from './components/SimulationProvider';
import { PixelSimulatorApp } from './components/PixelSimulatorApp';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1D2B53]">
      <SimulationProvider>
        <PixelSimulatorApp />
      </SimulationProvider>
    </main>
  );
}
