'use client';

import { useMemo } from 'react';
import type { HexState, PlayerColor } from '@/engine/types';
import {
  WaterCube,
  GreeneryCube,
  HeatCube,
  ScienceResource,
  ProductionResource,
  NatureResource,
} from './icons';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

interface HexagonProps {
  hexState: HexState;
  size: number;
  isValid?: boolean;
  isPlacementActive?: boolean;
  onClick?: () => void;
  playerColorMap?: Record<string, PlayerColor>;
}

export function Hexagon({
  hexState,
  size,
  isValid = false,
  isPlacementActive = false,
  onClick,
  playerColorMap,
}: HexagonProps) {
  // Outer hex polygon points
  const points = useMemo(() => {
    const hexPoints: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i - 30;
      const angle_rad = (Math.PI / 180) * angle_deg;
      const x = size + size * Math.cos(angle_rad);
      const y = size + size * Math.sin(angle_rad);
      hexPoints.push(`${x},${y}`);
    }
    return hexPoints.join(' ');
  }, [size]);

  // Inner hex polygon points (4px margin)
  const innerPoints = useMemo(() => {
    const margin = 4;
    const innerSize = size - margin;
    const hexPoints: string[] = [];
    for (let i = 0; i < 6; i++) {
      const angle_deg = 60 * i - 30;
      const angle_rad = (Math.PI / 180) * angle_deg;
      const x = size + innerSize * Math.cos(angle_rad);
      const y = size + innerSize * Math.sin(angle_rad);
      hexPoints.push(`${x},${y}`);
    }
    return hexPoints.join(' ');
  }, [size]);

  // --- Fill color based on hex type ---
  const hexFill =
    hexState.type === 'water' ? 'hsl(210, 70%, 15%)' : 'hsl(30, 30%, 20%)';

  // --- Frame/border stroke from bonusTag ---
  const frameStrokeClass = (() => {
    switch (hexState.bonusTag) {
      case 'production':
        return 'stroke-orange-400';
      case 'nature':
        return 'stroke-green-400';
      case 'science':
        return 'stroke-blue-200';
      case 'space':
        return 'stroke-gray-400';
      default:
        return 'stroke-orange-300/30';
    }
  })();

  const frameStrokeWidth = hexState.bonusTag ? 3 : 2;

  // --- Placement mode styling ---
  const placementCursor = (() => {
    if (!isPlacementActive) return 'cursor-pointer';
    return isValid ? 'cursor-pointer' : 'cursor-not-allowed';
  })();

  const placementOpacity = isPlacementActive && !isValid ? 'opacity-40' : '';

  // Unique glow filter ID
  const glowId = `glow-${hexState.id}`;

  // --- Resource token icon on unoccupied water hexes ---
  const renderResourceToken = () => {
    if (hexState.resourceTokenIcon === null || hexState.tile !== null) return null;

    const iconProps = {
      x: size - size / 4,
      y: size - size / 4,
      width: size / 2,
      height: size / 2,
      className: 'fill-background/50 stroke-foreground/50',
      strokeWidth: 1,
    };

    switch (hexState.resourceTokenIcon) {
      case 'science':
        return <ScienceResource {...iconProps} />;
      case 'production':
        return <ProductionResource {...iconProps} />;
      case 'nature':
        return <NatureResource {...iconProps} />;
      default:
        return null;
    }
  };

  // --- Tile rendering ---
  const renderTile = () => {
    if (!hexState.tile) return null;

    const cubeProps = {
      x: size / 2,
      y: size / 2,
      width: size,
      height: size,
    };

    switch (hexState.tile) {
      case 'water':
        return <WaterCube {...cubeProps} />;
      case 'greenery':
        return <GreeneryCube {...cubeProps} />;
      case 'heat':
        return <HeatCube {...cubeProps} />;
      default:
        return null;
    }
  };

  // --- City rendering ---
  const renderCity = () => {
    if (!hexState.city) return null;

    const color: PlayerColor | undefined =
      playerColorMap?.[hexState.city.playerId];
    const isWhite = color === 'white';

    return (
      <g transform={`translate(${size * 0.3}, ${size * 0.3}) scale(1.4)`}>
        <Building2
          className={cn(
            'stroke-2 w-full h-full',
            isWhite
              ? 'fill-gray-100 stroke-gray-300'
              : 'fill-gray-800 stroke-gray-600',
          )}
        />
      </g>
    );
  };

  return (
    <svg
      viewBox={`0 0 ${size * 2} ${size * 2}`}
      className={cn(
        'w-full h-full drop-shadow-lg transition-opacity duration-300',
        placementCursor,
        placementOpacity,
      )}
      onClick={onClick}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer polygon — frame/border */}
      <polygon
        points={points}
        className={cn(
          'transition-colors duration-300',
          frameStrokeClass,
          'hover:fill-accent/30',
        )}
        fill={hexFill}
        strokeWidth={frameStrokeWidth}
        filter={isPlacementActive && isValid ? `url(#${glowId})` : undefined}
      />

      {/* Inner polygon — visible inner border */}
      <polygon
        points={innerPoints}
        fill="transparent"
        className={cn(
          'transition-colors duration-300',
          isPlacementActive && isValid
            ? 'stroke-green-400 animate-pulse'
            : 'stroke-transparent',
        )}
        strokeWidth={isPlacementActive && isValid ? 2 : 0}
      />

      {/* Resource token icon on empty water hexes */}
      {renderResourceToken()}

      {/* Tile (water cube, greenery cube, heat cube) */}
      {hexState.tile && <g className="cube-animation">{renderTile()}</g>}

      {/* City */}
      {hexState.city && <g className="cube-animation">{renderCity()}</g>}

      {/* Hex ID label (debug) */}
      <text
        x={size}
        y={size * 1.8}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] font-mono"
      >
        {hexState.id}
      </text>
    </svg>
  );
}
