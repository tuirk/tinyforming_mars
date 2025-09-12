'use client';

import { useMemo } from 'react';
import type { Hex } from '@/lib/game/types';
import { WaterCube, GreeneryCube, HeatCube, ScienceTagIcon, EnergyTagIcon, ProductionTagIcon, NatureTagIcon, BuildingTagIcon } from './icons';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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

  const renderBonus = () => {
    if (!hex.bonusTag) return null;

    const iconProps = {
        x: size - (size / 4),
        y: size - (size / 4),
        width: size / 2,
        height: size / 2,
        className: 'fill-background/50 stroke-foreground/50',
        strokeWidth: 4,
    };

    let icon = null;
    switch(hex.bonusTag) {
        case 'Science': icon = <ScienceTagIcon {...iconProps} />; break;
        case 'Energy': icon = <EnergyTagIcon {...iconProps} />; break;
        case 'Production': icon = <ProductionTagIcon {...iconProps} />; break;
        case 'Nature': icon = <NatureTagIcon {...iconProps} />; break;
        case 'Building': icon = <BuildingTagIcon {...iconProps} />; break;
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <g>{icon}</g>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Bonus: {hex.bonusTag} tag placement</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
  }

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
          hex.type === 'water' ? "fill-primary/30 stroke-primary/80" : "fill-secondary/30 stroke-border",
          "hover:fill-accent/30"
        )}
        strokeWidth="2"
      />
      
      {renderBonus()}
      
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
