import type { Metadata } from 'next';
import React from 'react';
import './globals.css';
import { Navbar } from '@/components/Navbar';

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
    <html lang="en">
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
