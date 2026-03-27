import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Traffic Lights Simulation',
  description: '4-way intersection traffic light simulator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-sim-base text-sim-text min-h-screen antialiased">{children}</body>
    </html>
  );
}
