'use client';

import { useMemo, useCallback } from 'react';
import type { HexState, MapId, HexId, PlayerColor } from '@/engine/types';

interface MarsBoardProps {
  board: HexState[];
  mapId: MapId;
  validHexIds?: HexId[];
  isPlacementActive?: boolean;
  onHexClick?: (hexId: HexId) => void;
  playerColorMap?: Record<string, PlayerColor>;
  disabled?: boolean;
}

// Hex geometry constants
const COL_SPACING = 95;
const ROW_SPACING = 90;
const VIEWBOX_W = 680;
const VIEWBOX_H = 620;
const CENTER_X = VIEWBOX_W / 2;
const CENTER_Y = VIEWBOX_H / 2;
const PLANET_RADIUS = 280;

// Grid structure: row -> col offsets (hex IDs 1-19)
const GRID = [
  { row: 0, cols: [1, 2, 3] },
  { row: 1, cols: [0.5, 1.5, 2.5, 3.5] },
  { row: 2, cols: [0, 1, 2, 3, 4] },
  { row: 3, cols: [0.5, 1.5, 2.5, 3.5] },
  { row: 4, cols: [1, 2, 3] },
];

// Generate pointy-top hex polygon points string
function hexPoints(cx: number, cy: number, size: number = 45): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    pts.push(`${cx + size * Math.cos(angle)},${cy + size * Math.sin(angle)}`);
  }
  return pts.join(' ');
}

// Compute hex center position from grid row/col
function hexCenter(row: number, col: number): { x: number; y: number } {
  const gridWidth = 4 * COL_SPACING;
  const gridHeight = 4 * ROW_SPACING;
  const offsetX = CENTER_X - gridWidth / 2;
  const offsetY = CENTER_Y - gridHeight / 2;
  return {
    x: offsetX + col * COL_SPACING,
    y: offsetY + row * ROW_SPACING,
  };
}

// Hex fill and stroke based on type
function hexStyle(hex: HexState): {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
} {
  if (hex.bonusTag) {
    const bonusStyles: Record<string, { fill: string; fillOpacity: number; stroke: string }> = {
      production: { fill: '#8B4528', fillOpacity: 0.55, stroke: '#E8872D' },
      nature: { fill: '#3A6B2A', fillOpacity: 0.45, stroke: '#4CAF50' },
      science: { fill: '#4A5A6A', fillOpacity: 0.45, stroke: '#E0E0E0' },
      space: { fill: '#7A6A5A', fillOpacity: 0.45, stroke: '#9A9A9A' },
      energy: { fill: '#6A5A28', fillOpacity: 0.50, stroke: '#F5C842' },
    };
    const s = bonusStyles[hex.bonusTag] || bonusStyles.production;
    return { ...s, strokeWidth: 7 };
  }

  if (hex.type === 'water') {
    return { fill: '#3A6A8A', fillOpacity: 0.6, stroke: '#5A9ABB', strokeWidth: 1.5 };
  }

  return { fill: '#8B4528', fillOpacity: 0.45, stroke: '#806050', strokeWidth: 1.5 };
}

export function MarsBoard({
  board,
  mapId,
  validHexIds = [],
  isPlacementActive = false,
  onHexClick,
  playerColorMap,
  disabled = false,
}: MarsBoardProps) {
  // Build hex ID -> position mapping
  const hexPositions = useMemo(() => {
    const positions: Record<number, { x: number; y: number }> = {};
    let hexIndex = 1;
    for (const { row, cols } of GRID) {
      for (const col of cols) {
        positions[hexIndex] = hexCenter(row, col);
        hexIndex++;
      }
    }
    return positions;
  }, []);

  const hexMap = useMemo(() => {
    const map: Record<number, HexState> = {};
    for (const hex of board) {
      map[hex.id] = hex;
    }
    return map;
  }, [board]);

  const handleHexClick = useCallback(
    (hexId: HexId) => {
      if (!disabled) onHexClick?.(hexId);
    },
    [onHexClick, disabled],
  );

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 800, pointerEvents: disabled ? 'none' : undefined }}
    >
      <defs>
        <radialGradient id="mars-bg" cx="50%" cy="48%" r="48%">
          <stop offset="0%" stopColor="#C4623A" />
          <stop offset="40%" stopColor="#A8502E" />
          <stop offset="70%" stopColor="#8B3D22" />
          <stop offset="100%" stopColor="#6B2D18" />
        </radialGradient>
        <radialGradient id="mars-tex1" cx="30%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#B8583A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="mars-tex2" cx="70%" cy="60%" r="40%">
          <stop offset="0%" stopColor="#7A3520" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <clipPath id="planet-clip">
          <circle cx={CENTER_X} cy={CENTER_Y} r={PLANET_RADIUS} />
        </clipPath>
      </defs>

      {/* Mars planet background */}
      <circle cx={CENTER_X} cy={CENTER_Y} r={PLANET_RADIUS} fill="url(#mars-bg)" />
      <circle cx={CENTER_X} cy={CENTER_Y} r={PLANET_RADIUS} fill="url(#mars-tex1)" />
      <circle cx={CENTER_X} cy={CENTER_Y} r={PLANET_RADIUS} fill="url(#mars-tex2)" />

      {/* Surface texture lines */}
      <g clipPath="url(#planet-clip)" opacity="0.12">
        <path d="M100 250 Q200 240 300 260 Q400 280 500 255" stroke="#5A2010" strokeWidth="8" fill="none" />
        <path d="M120 350 Q250 340 380 365 Q450 375 550 345" stroke="#5A2010" strokeWidth="6" fill="none" />
        <path d="M150 180 Q280 175 340 195 Q420 210 500 185" stroke="#6A3020" strokeWidth="5" fill="none" />
        <path d="M80 420 Q200 430 320 410 Q440 395 560 415" stroke="#5A2515" strokeWidth="7" fill="none" />
      </g>

      {/* Labels */}
      <text
        x={CENTER_X}
        y="52"
        textAnchor="middle"
        fontFamily="'Impact','Arial Black',sans-serif"
        fontSize="14"
        fill="#D4956A"
        letterSpacing="4"
        fontWeight="700"
      >
        NORTH
      </text>
      <text
        x={CENTER_X}
        y="582"
        textAnchor="middle"
        fontFamily="'Impact','Arial Black',sans-serif"
        fontSize="14"
        fill="#D4956A"
        letterSpacing="4"
        fontWeight="700"
      >
        SOUTH
      </text>
      <text
        x="610"
        y="78"
        textAnchor="end"
        fontFamily="'Impact','Arial Black',sans-serif"
        fontSize="22"
        fill="#E8872D"
        letterSpacing="2"
        fontWeight="700"
      >
        {mapId.toUpperCase()}
      </text>

      {/* Hex grid */}
      {Object.entries(hexPositions).map(([idStr, pos]) => {
        const id = parseInt(idStr);
        const hex = hexMap[id];
        if (!hex) return null;

        const style = hexStyle(hex);
        const isValid = validHexIds.includes(id);
        const hasTile = hex.tile !== null;
        const hasCity = hex.city !== null;

        return (
          <g
            key={id}
            onClick={() => handleHexClick(id)}
            style={{
              cursor: onHexClick && !disabled ? 'pointer' : 'default',
              opacity: isPlacementActive && !isValid ? 0.5 : 1,
            }}
          >
            {/* Base hex shape */}
            <polygon
              points={hexPoints(pos.x, pos.y)}
              fill={style.fill}
              fillOpacity={style.fillOpacity}
              stroke={isValid ? '#66FF66' : style.stroke}
              strokeWidth={isValid ? 5 : style.strokeWidth}
            />

            {/* Valid placement pulse animation */}
            {isValid && (
              <polygon points={hexPoints(pos.x, pos.y, 40)} fill="#66FF66" fillOpacity="0.15">
                <animate
                  attributeName="fill-opacity"
                  values="0.15;0.3;0.15"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </polygon>
            )}

            {/* Content layer — mutually exclusive */}
            {hasTile ? (
              <PuffyTile cx={pos.x} cy={pos.y} tileType={hex.tile!} />
            ) : hasCity ? (
              <PuffyCity
                cx={pos.x}
                cy={pos.y}
                color={playerColorMap?.[hex.city!.playerId] ?? 'white'}
              />
            ) : (
              <>
                {hex.bonusTag && <BonusIcon cx={pos.x} cy={pos.y} tag={hex.bonusTag} />}
                {hex.type === 'water' && hex.resourceTokenIcon && (
                  <ResourceTokenIcon cx={pos.x} cy={pos.y} tokenType={hex.resourceTokenIcon} />
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// --- Bonus hex center icons ---

function BonusIcon({ cx, cy, tag }: { cx: number; cy: number; tag: string }) {
  const configs: Record<string, { bgFill: string; borderColor: string; r: number }> = {
    production: { bgFill: '#C46830', borderColor: '#E8872D', r: 18 },
    nature: { bgFill: '#1A3A12', borderColor: '#4CAF50', r: 16 },
    science: { bgFill: '#1A1A1A', borderColor: '#E0E0E0', r: 16 },
    space: { bgFill: '#3A3A3A', borderColor: '#999', r: 16 },
    energy: { bgFill: '#3A3520', borderColor: '#F5C842', r: 16 },
  };
  const c = configs[tag] || configs.production;

  return (
    <g>
      <circle cx={cx} cy={cy} r={c.r} fill={c.bgFill} stroke={c.borderColor} strokeWidth="2.5" />
      {tag === 'production' && <FactoryIcon cx={cx} cy={cy} color="#FFD085" />}
      {tag === 'nature' && <PlantIcon cx={cx} cy={cy} color="#5CBF60" />}
      {tag === 'science' && <LightbulbIcon cx={cx} cy={cy} color="#F5C842" />}
      {tag === 'space' && <RocketIcon cx={cx} cy={cy} />}
      {tag === 'energy' && <BoltIcon cx={cx} cy={cy} color="#F5C842" />}
    </g>
  );
}

// --- Water hex resource token icons ---

function ResourceTokenIcon({
  cx,
  cy,
  tokenType,
}: {
  cx: number;
  cy: number;
  tokenType: string;
}) {
  const bgColors: Record<string, string> = {
    nature: '#1A3A12',
    science: '#1A1A1A',
    production: '#5A3A20',
  };
  const borderColors: Record<string, string> = {
    nature: '#4CAF50',
    science: '#AAA',
    production: '#E8872D',
  };

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={15}
        fill={bgColors[tokenType] || '#1A1A1A'}
        stroke={borderColors[tokenType] || '#888'}
        strokeWidth="1.5"
      />
      {tokenType === 'nature' && <PlantIcon cx={cx} cy={cy} color="#5CBF60" />}
      {tokenType === 'science' && <LightbulbIcon cx={cx} cy={cy} color="#F5C842" />}
      {tokenType === 'production' && <FactoryIcon cx={cx} cy={cy} color="#FFD085" />}
    </g>
  );
}

// --- Puffy 3D tile tokens ---

function PuffyTile({ cx, cy, tileType }: { cx: number; cy: number; tileType: string }) {
  switch (tileType) {
    case 'greenery':
      return <PuffyGreenery cx={cx} cy={cy} />;
    case 'water':
      return <PuffyWater cx={cx} cy={cy} />;
    case 'heat':
      return <PuffyHeat cx={cx} cy={cy} />;
    default:
      return null;
  }
}

function PuffyGreenery({ cx, cy }: { cx: number; cy: number }) {
  const tx = cx - 45;
  const ty = cy - 52;
  return (
    <g transform={`translate(${tx}, ${ty})`}>
      {/* Shadow */}
      <polygon points="47,24 74,39 74,73 47,88 20,73 20,39" fill="#000" fillOpacity="0.35" />
      {/* Dark base */}
      <polygon points="45,20 72,35 72,72 45,87 18,72 18,35" fill="#0D3B0F" />
      {/* Side left */}
      <polygon points="18,35 18,72 45,87 45,82 20,68 20,38" fill="#1B5E20" />
      {/* Side right */}
      <polygon points="72,35 72,72 45,87 45,82 70,68 70,38" fill="#145218" />
      {/* Top edge */}
      <polygon points="45,20 72,35 70,38 45,24 20,38 18,35" fill="#4CAF50" />
      {/* Main top */}
      <polygon points="45,24 70,38 70,68 45,82 20,68 20,38" fill="#2E7D32" />
      {/* Highlight band */}
      <polygon points="45,24 70,38 70,48 45,34 20,48 20,38" fill="#43A047" fillOpacity="0.8" />
      {/* Shine */}
      <polygon points="45,24 58,31 55,35 45,28 35,35 32,31" fill="#66BB6A" fillOpacity="0.5" />
      {/* Tree icon */}
      <path d="M38 62 Q40 52 45 44 Q50 52 52 62" fill="#A5D6A7" />
      <path
        d="M33 64 Q38 54 41 48"
        fill="none"
        stroke="#C8E6C9"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M57 64 Q52 54 49 48"
        fill="none"
        stroke="#C8E6C9"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="45"
        y1="44"
        x2="45"
        y2="67"
        stroke="#C8E6C9"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

function PuffyWater({ cx, cy }: { cx: number; cy: number }) {
  const tx = cx - 45;
  const ty = cy - 52;
  return (
    <g transform={`translate(${tx}, ${ty})`}>
      <polygon points="47,24 74,39 74,73 47,88 20,73 20,39" fill="#000" fillOpacity="0.35" />
      <polygon points="45,20 72,35 72,72 45,87 18,72 18,35" fill="#062B6E" />
      <polygon points="18,35 18,72 45,87 45,82 20,68 20,38" fill="#0D47A1" />
      <polygon points="72,35 72,72 45,87 45,82 70,68 70,38" fill="#0A3A8A" />
      <polygon points="45,20 72,35 70,38 45,24 20,38 18,35" fill="#2196F3" />
      <polygon points="45,24 70,38 70,68 45,82 20,68 20,38" fill="#1565C0" />
      <polygon points="45,24 70,38 70,48 45,34 20,48 20,38" fill="#1E88E5" fillOpacity="0.8" />
      <polygon points="45,24 58,31 55,35 45,28 35,35 32,31" fill="#42A5F5" fillOpacity="0.5" />
      {/* Water drop icon */}
      <path
        d="M45 42 Q54 52 51 59 Q45 66 39 59 Q36 52 45 42 Z"
        fill="#90CAF9"
        stroke="#BBDEFB"
        strokeWidth="1.5"
      />
      <ellipse cx="41" cy="52" rx="2.5" ry="2" fill="#BBDEFB" opacity="0.7" />
    </g>
  );
}

function PuffyHeat({ cx, cy }: { cx: number; cy: number }) {
  const tx = cx - 45;
  const ty = cy - 52;
  return (
    <g transform={`translate(${tx}, ${ty})`}>
      <polygon points="47,24 74,39 74,73 47,88 20,73 20,39" fill="#000" fillOpacity="0.35" />
      <polygon points="45,20 72,35 72,72 45,87 18,72 18,35" fill="#6A0000" />
      <polygon points="18,35 18,72 45,87 45,82 20,68 20,38" fill="#B71C1C" />
      <polygon points="72,35 72,72 45,87 45,82 70,68 70,38" fill="#8B1515" />
      <polygon points="45,20 72,35 70,38 45,24 20,38 18,35" fill="#EF5350" />
      <polygon points="45,24 70,38 70,68 45,82 20,68 20,38" fill="#D32F2F" />
      <polygon points="45,24 70,38 70,48 45,34 20,48 20,38" fill="#E53935" fillOpacity="0.8" />
      <polygon points="45,24 58,31 55,35 45,28 35,35 32,31" fill="#EF5350" fillOpacity="0.5" />
      {/* Thermometer icon */}
      <rect x="41" y="36" width="8" height="26" rx="4" fill="none" stroke="#FFCDD2" strokeWidth="2.5" />
      <circle cx="45" cy="63" r="7" fill="#FF8A80" stroke="#FFCDD2" strokeWidth="2" />
      <rect x="42.5" y="42" width="5" height="16" fill="#FF8A80" />
      <line x1="50" y1="44" x2="53" y2="44" stroke="#FFCDD2" strokeWidth="1.5" />
      <line x1="50" y1="48" x2="52" y2="48" stroke="#FFCDD2" strokeWidth="1.5" />
      <line x1="50" y1="52" x2="53" y2="52" stroke="#FFCDD2" strokeWidth="1.5" />
    </g>
  );
}

// --- Puffy 3D city tokens ---

function PuffyCity({
  cx,
  cy,
  color,
}: {
  cx: number;
  cy: number;
  color: 'white' | 'black';
}) {
  const tx = cx - 45;
  const ty = cy - 52;

  if (color === 'white') {
    return (
      <g transform={`translate(${tx}, ${ty})`}>
        <polygon points="47,24 74,39 74,73 47,88 20,73 20,39" fill="#000" fillOpacity="0.3" />
        <polygon points="45,20 72,35 72,72 45,87 18,72 18,35" fill="#777" />
        <polygon points="18,35 18,72 45,87 45,82 20,68 20,38" fill="#999" />
        <polygon points="72,35 72,72 45,87 45,82 70,68 70,38" fill="#888" />
        <polygon points="45,20 72,35 70,38 45,24 20,38 18,35" fill="#DDD" />
        <polygon points="45,24 70,38 70,68 45,82 20,68 20,38" fill="#B0B0B0" />
        <polygon points="45,24 70,38 70,48 45,34 20,48 20,38" fill="#CCC" fillOpacity="0.7" />
        <polygon points="45,24 58,31 55,35 45,28 35,35 32,31" fill="#E8E8E8" fillOpacity="0.5" />
        {/* Buildings */}
        <rect x="34" y="40" width="22" height="24" rx="2" fill="#F5F5F5" stroke="#DDD" strokeWidth="1.5" />
        <rect x="30" y="36" width="12" height="14" rx="1" fill="#ECECEC" stroke="#CCC" strokeWidth="1" />
        <rect x="44" y="38" width="9" height="12" rx="1" fill="#ECECEC" stroke="#CCC" strokeWidth="1" />
        {/* Windows */}
        <rect x="37" y="44" width="4" height="4" fill="#AAA" />
        <rect x="46" y="44" width="4" height="4" fill="#AAA" />
        <rect x="37" y="52" width="4" height="4" fill="#AAA" />
        <rect x="46" y="52" width="4" height="4" fill="#AAA" />
      </g>
    );
  }

  // Black city
  return (
    <g transform={`translate(${tx}, ${ty})`}>
      <polygon points="47,24 74,39 74,73 47,88 20,73 20,39" fill="#000" fillOpacity="0.45" />
      <polygon points="45,20 72,35 72,72 45,87 18,72 18,35" fill="#0A0A0A" />
      <polygon points="18,35 18,72 45,87 45,82 20,68 20,38" fill="#1A1A1A" />
      <polygon points="72,35 72,72 45,87 45,82 70,68 70,38" fill="#111" />
      <polygon points="45,20 72,35 70,38 45,24 20,38 18,35" fill="#444" />
      <polygon points="45,24 70,38 70,68 45,82 20,68 20,38" fill="#222" />
      <polygon points="45,24 70,38 70,48 45,34 20,48 20,38" fill="#333" fillOpacity="0.7" />
      <polygon points="45,24 58,31 55,35 45,28 35,35 32,31" fill="#444" fillOpacity="0.5" />
      {/* Buildings */}
      <rect x="34" y="40" width="22" height="24" rx="2" fill="#2A2A2A" stroke="#444" strokeWidth="1.5" />
      <rect x="30" y="36" width="12" height="14" rx="1" fill="#222" stroke="#3A3A3A" strokeWidth="1" />
      <rect x="44" y="38" width="9" height="12" rx="1" fill="#222" stroke="#3A3A3A" strokeWidth="1" />
      {/* Yellow lit windows */}
      <rect x="37" y="44" width="4" height="4" fill="#F5C842" />
      <rect x="46" y="44" width="4" height="4" fill="#F5C842" />
      <rect x="37" y="52" width="4" height="4" fill="#F5C842" />
      <rect x="46" y="52" width="4" height="4" fill="#F5C842" />
    </g>
  );
}

// --- Micro icon components ---

function FactoryIcon({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <rect x={cx - 12} y={cy - 6} width={24} height={16} rx={2} fill="none" stroke={color} strokeWidth="1.5" />
      <rect x={cx - 10} y={cy - 4} width={6} height={3} fill={color} />
      <rect x={cx - 2} y={cy - 4} width={6} height={3} fill={color} />
      <rect x={cx + 6} y={cy - 4} width={4} height={3} fill={color} />
      <line x1={cx - 12} y1={cy + 2} x2={cx + 12} y2={cy + 2} stroke={color} strokeWidth="1" />
      <rect x={cx - 6} y={cy - 10} width={4} height={5} fill={color} />
      <rect x={cx + 3} y={cy - 12} width={3} height={7} fill={color} />
    </g>
  );
}

function PlantIcon({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <path
        d={`M${cx - 7} ${cy + 8} Q${cx - 5} ${cy - 2} ${cx} ${cy - 10} Q${cx + 5} ${cy - 2} ${cx + 7} ${cy + 8}`}
        fill={color}
        stroke="none"
      />
      <path
        d={`M${cx - 12} ${cy + 8} Q${cx - 8} ${cy} ${cx - 5} ${cy - 4}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d={`M${cx + 12} ${cy + 8} Q${cx + 8} ${cy} ${cx + 5} ${cy - 4}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
    </g>
  );
}

function LightbulbIcon({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy - 4} r={7} fill="none" stroke={color} strokeWidth="1.8" />
      <line x1={cx} y1={cy + 3} x2={cx} y2={cy + 10} stroke={color} strokeWidth="1.8" />
      <line x1={cx - 4} y1={cy + 10} x2={cx + 4} y2={cy + 10} stroke={color} strokeWidth="1.8" />
    </g>
  );
}

function BoltIcon({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <polygon
      points={`${cx - 2},${cy - 12} ${cx + 5},${cy - 2} ${cx},${cy - 1} ${cx + 2},${cy + 12} ${cx - 5},${cy + 2} ${cx},${cy + 1}`}
      fill={color}
      stroke="none"
    />
  );
}

function RocketIcon({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <path
        d={`M${cx - 3} ${cy + 10} L${cx - 8} ${cy} L${cx - 3} ${cy - 12} L${cx + 3} ${cy - 12} L${cx + 8} ${cy} L${cx + 3} ${cy + 10} Z`}
        fill="#E85530"
        stroke="none"
      />
      <path
        d={`M${cx - 2} ${cy - 10} L${cx} ${cy - 17} L${cx + 2} ${cy - 10}`}
        fill="#F8A030"
        stroke="none"
      />
      <circle cx={cx} cy={cy - 5} r={2.5} fill="#FFF" opacity="0.5" />
    </g>
  );
}
