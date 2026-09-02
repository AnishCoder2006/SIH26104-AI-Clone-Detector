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
  variable: '--font-karla',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const cormorant = Cormorant({ 
  subsets: ['latin'], 
  variable: '--font-cormorant',
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
  icons: {
    icon: '/tab-icon.png',
    shortcut: '/tab-icon.png',
    apple: '/tab-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${karla.variable} ${cormorant.variable} ${spaceGrotesk.variable} ${ibmPlexSans.variable}`}>
      <head>
        <link rel="icon" href="/tab-icon.png" type="image/png" />
        <link rel="shortcut icon" href="/tab-icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/tab-icon.png" />
      </head>
      <body className="bg-background text-slate-100 min-h-screen flex flex-col font-sans relative overflow-x-hidden">
        {/* Immersive World Map Background Layer - Global */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-2]">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
            style={{ backgroundImage: "url('/bg-world-map.png')" }}
          />
          {/* Deep dark overlay gradient for text legibility & cyber aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#070B14]/80 via-[#070B14]/50 to-[#070B14]/85" />
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
