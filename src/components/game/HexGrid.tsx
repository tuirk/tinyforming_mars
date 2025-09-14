'use client';

import { useMemo } from 'react';
import type { MapData, Hex, Player } from '@/lib/game/types';
import { Hexagon } from './Hexagon';

interface HexGridProps {
  map: MapData;
  onHexClick: (hex: Hex) => void;
}

const MAP_STRUCTURE = [
  // row 0
  { id: 1, row: 0, col: 1 }, { id: 2, row: 0, col: 2 }, { id: 3, row: 0, col: 3 },
  // row 1
  { id: 4, row: 1, col: 0.5 }, { id: 5, row: 1, col: 1.5 }, { id: 6, row: 1, col: 2.5 }, { id: 7, row: 1, col: 3.5 },
  // row 2
  { id: 8, row: 2, col: 0 }, { id: 9, row: 2, col: 1 }, { id: 10, row: 2, col: 2 }, { id: 11, row: 2, col: 3 }, { id: 12, row: 2, col: 4 },
  // row 3
  { id: 13, row: 3, col: 0.5 }, { id: 14, row: 3, col: 1.5 }, { id: 15, row: 3, col: 2.5 }, { id: 16, row: 3, col: 3.5 },
  // row 4
  { id: 17, row: 4, col: 1 }, { id: 18, row: 4, col: 2 }, { id: 19, row: 4, col: 3 },
];

export function HexGrid({ map, onHexClick }: HexGridProps) {
  const HEX_SIZE = 50; // Increased size by 25% from 40 to 50
  const HEX_WIDTH = HEX_SIZE * Math.sqrt(3);
  const HEX_HEIGHT = HEX_SIZE * 2;

  const hexPositions = useMemo(() => {
    const positions: { [key: number]: { x: number; y: number } } = {};
    const gridWidth = 5 * HEX_WIDTH;
    const gridHeight = 5 * (HEX_HEIGHT * 0.75);

    MAP_STRUCTURE.forEach(({ id, row, col }) => {
      positions[id] = {
        x: col * HEX_WIDTH + (HEX_WIDTH / 2),
        y: row * (HEX_HEIGHT * 0.75) + (HEX_HEIGHT / 2),
      };
    });
    return { positions, width: gridWidth, height: gridHeight };
  }, [HEX_WIDTH, HEX_HEIGHT]);

  const hexDataById = useMemo(() => {
    return map.hexes.reduce((acc, hex) => {
      acc[hex.id] = hex;
      return acc;
    }, {} as { [id: number]: Hex });
  }, [map.hexes]);

  return (
    <div className="w-full flex items-center justify-center p-2" style={{ perspective: '800px' }}>
      <div 
        className="relative transition-transform duration-500" 
        style={{
          width: hexPositions.width,
          height: hexPositions.height,
          transform: 'rotateX(50deg) rotateZ(0deg) scale(0.8)',
          transformStyle: 'preserve-3d',
        }}
      >
        {MAP_STRUCTURE.map(({ id }) => {
          const hex = hexDataById[id];
          if (!hex) return null;
          const { x, y } = hexPositions.positions[id];
          return (
            <div
              key={hex.id}
              className="absolute transition-transform duration-300 hover:scale-110 hover:-translate-y-2"
              style={{
                left: x,
                top: y,
                width: HEX_WIDTH,
                height: HEX_HEIGHT,
                transform: `translate(-50%, -50%)`,
              }}
              onClick={() => onHexClick(hex)}
            >
              <Hexagon hex={hex} size={HEX_SIZE} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
