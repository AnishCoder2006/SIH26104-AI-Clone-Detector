import React from 'react';

interface RadialGaugeProps {
  score: number;
  size?: number;
}

export function RadialGauge({ score, size = 180 }: RadialGaugeProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  let color = '#10b981'; // emerald-500
  if (score > 50) color = '#ef4444'; // red-500
  else if (score > 20) color = '#f59e0b'; // amber-500

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono tracking-tight" style={{ color }}>
          {score.toFixed(1)}
        </span>
        <span className="text-[11px] text-slate-500 uppercase tracking-[0.2em] font-mono mt-1">Risk Score</span>
      </div>
    </div>
  );
}
