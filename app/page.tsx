import { SimulationProvider } from './components/SimulationProvider';
import { SimulationApp } from './components/SimulationApp';

export default function Home() {
  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-xl font-semibold mb-6">Traffic Lights Simulation</h1>
      <SimulationProvider>
        <SimulationApp />
      </SimulationProvider>
    </main>
  );
}
