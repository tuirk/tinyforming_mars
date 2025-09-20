
'use client';

import { useMemo } from 'react';
import type { Hex } from '@/lib/game/types';
import { WaterCube, GreeneryCube, HeatCube, ScienceResource, ProductionResource, NatureResource, SpaceTagIcon } from './icons';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Building2 } from 'lucide-react';


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

  const innerPoints = useMemo(() => {
    const margin = 4;
    const innerSize = size - margin;
    const hexPoints = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i - 30;
      const angle_rad = Math.PI / 180 * angle_deg;
      const x = size + innerSize * Math.cos(angle_rad);
      const y = size + innerSize * Math.sin(angle_rad);
      hexPoints.push(`${x},${y}`);
    }
    return hexPoints.join(' ');
}, [size]);

  const occupiedBy = hex.occupiedBy;

  const renderBonus = () => {
    const bonusType = hex.resourceTokenIcon || hex.bonusTag;
    if (!bonusType) return null;

    const iconProps = {
        x: size - (size / 4),
        y: size - (size / 4),
        width: size / 2,
        height: size / 2,
        className: 'fill-background/50 stroke-foreground/50',
        strokeWidth: 1,
    };

    let icon = null;
    switch(bonusType) {
        case 'Science': icon = <ScienceResource {...iconProps} />; break;
        case 'Production': icon = <ProductionResource {...iconProps} />; break;
        case 'Nature': icon = <NatureResource {...iconProps} />; break;
        case 'Space': icon = <SpaceTagIcon {...iconProps} />; break;
    }

    const tooltipText = hex.resourceTokenIcon 
      ? `Resource Bonus: Gain 1 ${hex.resourceTokenIcon} token when placing water here.`
      : `Bonus Tag: Gain 1 ${hex.bonusTag} tag when placing a city here.`;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <g>{icon}</g>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
  }

  const frameColorClass = hex.frameColor ? {
    'gray': 'stroke-gray-400',
    'white': 'stroke-white',
    'green': 'stroke-green-400',
    'orange': 'stroke-orange-400',
  }[hex.frameColor] : 'stroke-orange-300/30';

  const hexFillClass = (hex.isWaterReserved ? "fill-blue-900/50" : "fill-orange-900/30");


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
          hexFillClass,
          frameColorClass,
          "hover:fill-accent/30"
        )}
        strokeWidth="2"
      />
      
      {renderBonus()}
      
      {occupiedBy.type && (
        <g className="cube-animation">
          {occupiedBy.type === 'Water' && <WaterCube x={size/2} y={size/2} width={size} height={size} />}
          {occupiedBy.type === 'Greenery' && <GreeneryCube x={size/2} y={size/2} width={size} height={size} />}
          {occupiedBy.type === 'Heat' && <HeatCube x={size/2} y={size/2} width={size} height={size} />}
          {occupiedBy.type === 'city' && (
            <g transform={`translate(${size/2}, ${size/2}) scale(0.8)`}>
              <Building2 className={cn(
                'stroke-2 w-full h-full',
                occupiedBy.playerId === 'White' ? 'fill-gray-100 stroke-gray-300' : 'fill-gray-800 stroke-gray-600'
              )} />
            </g>
          )}
        </g>
      )}
      
      <text x={size} y={size * 1.8} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">{hex.id}</text>
    </svg>
  );
}
