import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Fraunces, Inter, Cormorant, Karla, Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const karla = Karla({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const cormorant = Cormorant({ 
  subsets: ['latin'], 
  variable: '--font-serif',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-plex',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'VoiceShield AI - Clone Detection System',
  description: 'Enterprise AI Voice Clone Detection System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${karla.variable} ${cormorant.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <body className="bg-background text-slate-100 min-h-screen flex flex-col font-sans relative overflow-x-hidden">
        {/* Abstract Background Effects */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px]" />
        </div>

        <Navbar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
