'use client';

import { useMemo } from 'react';
import type { HexState, MapId, HexId, PlayerColor } from '@/engine/types';
import { getMapHexes } from '@/engine/maps';
import { Hexagon } from './Hexagon';

interface HexGridProps {
  board: HexState[];
  mapId: MapId;
  validHexIds?: HexId[];
  isPlacementActive?: boolean;
  onHexClick?: (hexId: HexId) => void;
  playerColorMap?: Record<string, PlayerColor>;
  disabled?: boolean;
}

const HEX_SIZE = 50;
const HEX_WIDTH = HEX_SIZE * Math.sqrt(3);
const HEX_HEIGHT = HEX_SIZE * 2;

export function HexGrid({
  board,
  mapId,
  validHexIds,
  isPlacementActive = false,
  onHexClick,
  playerColorMap,
  disabled = false,
}: HexGridProps) {
  const hexDefs = useMemo(() => getMapHexes(mapId), [mapId]);

  const hexStateById = useMemo(() => {
    const map: Record<number, HexState> = {};
    for (const hex of board) {
      map[hex.id] = hex;
    }
    return map;
  }, [board]);

  const hexPositions = useMemo(() => {
    const positions: Record<number, { x: number; y: number }> = {};
    const gridWidth = 5 * HEX_WIDTH;
    const gridHeight = 5 * (HEX_HEIGHT * 0.75) + HEX_HEIGHT * 0.25;

    for (const def of hexDefs) {
      positions[def.id] = {
        x: def.col * HEX_WIDTH + HEX_WIDTH / 2,
        y: def.row * (HEX_HEIGHT * 0.75) + HEX_HEIGHT / 2,
      };
    }
    return { positions, width: gridWidth, height: gridHeight };
  }, [hexDefs]);

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
        {hexDefs.map((hexDef) => {
          const hexState = hexStateById[hexDef.id];
          if (!hexState) return null;
          const { x, y } = hexPositions.positions[hexDef.id];
          const isValid = validHexIds?.includes(hexDef.id) ?? false;

          return (
            <div
              key={hexDef.id}
              className="absolute transition-transform duration-300 hover:scale-110 hover:-translate-y-2"
              style={{
                left: x,
                top: y,
                width: HEX_WIDTH,
                height: HEX_HEIGHT,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Hexagon
                hexState={hexState}
                size={HEX_SIZE}
                isValid={isValid}
                isPlacementActive={isPlacementActive}
                onClick={() => {
                  if (!disabled && onHexClick) onHexClick(hexDef.id);
                }}
                playerColorMap={playerColorMap}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
