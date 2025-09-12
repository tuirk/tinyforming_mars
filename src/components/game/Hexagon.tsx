'use client';

import { useMemo } from 'react';
import type { Hex } from '@/lib/game/types';
import { WaterCube, GreeneryCube, HeatCube } from './icons';
import { cn } from '@/lib/utils';

interface HexagonProps {
  hex: Hex;
  size: number;
}

export function Hexagon({ hex, size }: HexagonProps) {
  const points = useMemo(() => {
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i - 30;
      const angle_rad = Math.PI / 180 * angle_deg;
      const x = size + size * Math.cos(angle_rad);
      const y = size + size * Math.sin(angle_rad);
      hexPoints.push(`${x},${y}`);
    }
    return hexPoints.join(' ');
  }, [size]);

  const cube = hex.cubes[0];

  return (
    <svg
      viewBox={`0 0 ${size * 2} ${size * 2}`}
      className="w-full h-full cursor-pointer drop-shadow-lg"
    >
      <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
              </feMerge>
          </filter>
      </defs>
      <polygon
        points={points}
        className={cn(
          "transition-colors duration-300",
          hex.type === 'water' ? "fill-primary/20 stroke-primary/50" : "fill-secondary/20 stroke-border",
          "hover:fill-accent/20"
        )}
        strokeWidth="2"
      />
      
      {cube && (
        <g className="cube-animation">
          {cube === 'Water' && <WaterCube x={size/2} y={size/2} width={size} height={size} />}
          {cube === 'Greenery' && <GreeneryCube x={size/2} y={size/2} width={size} height={size} />}
          {cube === 'Heat' && <HeatCube x={size/2} y={size/2} width={size} height={size} />}
        </g>
      )}

      {hex.owner && (
        <circle cx={size} cy={size} r={size/4} className={cn(
          'stroke-2',
          hex.owner === 'White' ? 'fill-gray-100 stroke-gray-300' : 'fill-gray-800 stroke-gray-600'
        )} />
      )}
      
      <text x={size} y={size * 1.8} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">{hex.id}</text>
    </svg>
  );
}
