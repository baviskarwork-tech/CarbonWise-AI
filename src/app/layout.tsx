import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { WebVitals } from '../components/WebVitals';

export const metadata: Metadata = {
  title: 'CarbonWise AI — Carbon Footprint Intelligence Platform',
  description: 'Understand, track, predict, and reduce your carbon footprint. Join our Net Zero program with AI sustainability coaching and carbon simulators.',
  keywords: 'sustainability, carbon tracking, net zero, eco advisor, green emissions calculator, climate change simulator',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark-theme">
      <body className="min-h-screen bg-dark-bg text-dark-text flex flex-col justify-between antialiased">
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold outline-none"
        >
          Skip to main content
        </a>
        <WebVitals />
        <Navbar />
        <main id="main-content" tabIndex={-1} className="flex-grow max-w-7xl mx-auto w-full px-4 py-8 md:px-8 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
