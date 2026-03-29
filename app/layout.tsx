import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pixelFont = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
});

export const metadata: Metadata = {
  title: 'Traffic Lights Simulation',
  description: '4-way intersection traffic light simulator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${pixelFont.variable} bg-sim-base text-sim-text min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
