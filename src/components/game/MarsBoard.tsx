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

// Hex geometry constants — spaced for etched hex shadows/glow with 9px gaps
const COL_SPACING = 117;
const ROW_SPACING = 115;
const VIEWBOX_W = 780;
const VIEWBOX_H = 760;
const CENTER_X = VIEWBOX_W / 2;
const CENTER_Y = VIEWBOX_H / 2;
const PLANET_RADIUS = 350;

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

// --- Etched hex base components ---

function HexBase({ cx, cy, hex, isValid }: { cx: number; cy: number; hex: HexState; isValid: boolean }) {
  const tx = cx - 50;
  const ty = cy - 58;

  if (hex.bonusTag) {
    return <BonusHexBase tx={tx} ty={ty} tag={hex.bonusTag} isValid={isValid} cx={cx} cy={cy} />;
  }
  if (hex.type === 'water') {
    return <WaterHexBase tx={tx} ty={ty} isValid={isValid} cx={cx} cy={cy} />;
  }
  return <LandHexBase tx={tx} ty={ty} isValid={isValid} cx={cx} cy={cy} />;
}

function LandHexBase({ tx, ty, isValid, cx, cy }: { tx: number; ty: number; isValid: boolean; cx: number; cy: number }) {
  return (
    <g>
      <g transform={`translate(${tx}, ${ty})`}>
        <polygon points="50,2 101,31 101,89 50,118 -1,89 -1,31" fill="#3A1808" fillOpacity="0.4" />
        <polygon points="50,0 100,29 100,87 50,116 0,87 0,29" fill="#8B4528" fillOpacity="0.35" stroke="#6A4A35" strokeWidth="2" />
        <path d="M50,0 L100,29" stroke="#B87050" strokeWidth="1" opacity="0.4" />
        <path d="M50,0 L0,29" stroke="#B87050" strokeWidth="1" opacity="0.4" />
        <path d="M0,87 L50,116" stroke="#3A1A08" strokeWidth="1" opacity="0.3" />
        <path d="M100,87 L50,116" stroke="#3A1A08" strokeWidth="1" opacity="0.3" />
      </g>
      {isValid && <ValidPulse cx={cx} cy={cy} />}
    </g>
  );
}

function WaterHexBase({ tx, ty, isValid, cx, cy }: { tx: number; ty: number; isValid: boolean; cx: number; cy: number }) {
  return (
    <g>
      <g transform={`translate(${tx}, ${ty})`}>
        <polygon points="50,2 101,31 101,89 50,118 -1,89 -1,31" fill="#0A2030" fillOpacity="0.5" />
        <polygon points="50,0 100,29 100,87 50,116 0,87 0,29" fill="#2A4A5A" fillOpacity="0.4" stroke="#4A7A90" strokeWidth="2.5" />
        <polygon points="50,8 92,33 92,83 50,108 8,83 8,33" fill="#2A6A8A" fillOpacity="0.5" />
        <polygon points="50,14 86,36 86,80 50,102 14,80 14,36" fill="#3A7A9A" fillOpacity="0.35" />
        <path d="M25 55 Q38 50 50 54 Q62 58 78 53" fill="none" stroke="#5AAFCC" strokeWidth="0.7" opacity="0.35" />
        <path d="M30 68 Q45 63 55 67 Q70 72 80 67" fill="none" stroke="#5AAFCC" strokeWidth="0.6" opacity="0.25" />
        <path d="M22 42 Q35 38 50 42 Q65 46 82 41" fill="none" stroke="#5AAFCC" strokeWidth="0.5" opacity="0.2" />
        <path d="M50,0 L100,29" stroke="#6ABADD" strokeWidth="1" opacity="0.25" />
        <path d="M50,0 L0,29" stroke="#6ABADD" strokeWidth="1" opacity="0.25" />
      </g>
      {isValid && <ValidPulse cx={cx} cy={cy} />}
    </g>
  );
}

const BONUS_COLORS: Record<string, {
  glow: string; glowOp: number;
  shadow: string; shadowOp: number;
  fill: string; fillOp: number; stroke: string;
  hiLight: string; hiOp: number;
  loLight: string; loOp: number;
  echo: string; echoOp: number;
}> = {
  production: { glow: '#E8872D', glowOp: 0.15, shadow: '#5A2010', shadowOp: 0.5, fill: '#8B4528', fillOp: 0.4, stroke: '#E8872D', hiLight: '#F0A850', hiOp: 0.5, loLight: '#8A4010', loOp: 0.4, echo: '#E8872D', echoOp: 0.25 },
  nature: { glow: '#4CAF50', glowOp: 0.12, shadow: '#0D3B0F', shadowOp: 0.5, fill: '#3A6B2A', fillOp: 0.35, stroke: '#4CAF50', hiLight: '#66BB6A', hiOp: 0.5, loLight: '#1B5E20', loOp: 0.4, echo: '#4CAF50', echoOp: 0.25 },
  science: { glow: '#E0E0E0', glowOp: 0.1, shadow: '#1A1A2A', shadowOp: 0.5, fill: '#4A5A6A', fillOp: 0.35, stroke: '#E0E0E0', hiLight: '#FFF', hiOp: 0.35, loLight: '#888', loOp: 0.3, echo: '#E0E0E0', echoOp: 0.2 },
  space: { glow: '#9A9A9A', glowOp: 0.1, shadow: '#1A1A1E', shadowOp: 0.5, fill: '#7A6A5A', fillOp: 0.35, stroke: '#9A9A9A', hiLight: '#BBB', hiOp: 0.4, loLight: '#555', loOp: 0.3, echo: '#9A9A9A', echoOp: 0.2 },
  energy: { glow: '#F5C842', glowOp: 0.12, shadow: '#2A2010', shadowOp: 0.5, fill: '#6A5A28', fillOp: 0.4, stroke: '#F5C842', hiLight: '#FFE082', hiOp: 0.5, loLight: '#8A6A10', loOp: 0.4, echo: '#F5C842', echoOp: 0.25 },
};

function BonusHexBase({ tx, ty, tag, isValid, cx, cy }: { tx: number; ty: number; tag: string; isValid: boolean; cx: number; cy: number }) {
  const c = BONUS_COLORS[tag] || BONUS_COLORS.production;
  return (
    <g>
      <g transform={`translate(${tx}, ${ty})`}>
        <polygon points="50,-3 104,28 104,90 50,120 -4,90 -4,28" fill={c.glow} fillOpacity={c.glowOp} />
        <polygon points="50,2 101,31 101,89 50,118 -1,89 -1,31" fill={c.shadow} fillOpacity={c.shadowOp} />
        <polygon points="50,0 100,29 100,87 50,116 0,87 0,29" fill={c.fill} fillOpacity={c.fillOp} stroke={c.stroke} strokeWidth="7" />
        <path d="M50,0 L100,29" stroke={c.hiLight} strokeWidth="2" opacity={c.hiOp} />
        <path d="M50,0 L0,29" stroke={c.hiLight} strokeWidth="2" opacity={c.hiOp} />
        <path d="M0,87 L50,116" stroke={c.loLight} strokeWidth="2" opacity={c.loOp} />
        <path d="M100,87 L50,116" stroke={c.loLight} strokeWidth="2" opacity={c.loOp} />
        <polygon points="50,7 93,32 93,84 50,109 7,84 7,32" fill="none" stroke={c.echo} strokeWidth="0.5" opacity={c.echoOp} />
      </g>
      {isValid && <ValidPulse cx={cx} cy={cy} />}
    </g>
  );
}

function ValidPulse({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <polygon points={hexPoints(cx, cy)} stroke="#66FF66" strokeWidth="3" fill="none" opacity="0.6" />
      <polygon points={hexPoints(cx, cy, 40)} fill="#66FF66" fillOpacity="0.15">
        <animate attributeName="fill-opacity" values="0.15;0.3;0.15" dur="1.5s" repeatCount="indefinite" />
      </polygon>
    </>
  );
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
      style={{ maxWidth: 680, pointerEvents: disabled ? 'none' : undefined }}
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
        y="60"
        textAnchor="middle"
        fontFamily="'Orbitron',monospace"
        fontSize="11"
        fill="#E8C8A0"
        letterSpacing="6"
        fontWeight="500"
      >
        NORTH
      </text>
      <text
        x={CENTER_X}
        y="710"
        textAnchor="middle"
        fontFamily="'Orbitron',monospace"
        fontSize="11"
        fill="#E8C8A0"
        letterSpacing="6"
        fontWeight="500"
      >
        SOUTH
      </text>
      <text
        x="720"
        y="78"
        textAnchor="end"
        fontFamily="'Orbitron',monospace"
        fontSize="20"
        fill="#F0A050"
        letterSpacing="3"
        fontWeight="700"
      >
        {mapId.toUpperCase()}
      </text>

      {/* Hex grid */}
      {Object.entries(hexPositions).map(([idStr, pos]) => {
        const id = parseInt(idStr);
        const hex = hexMap[id];
        if (!hex) return null;

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
            {/* Etched hex base */}
            <HexBase cx={pos.x} cy={pos.y} hex={hex} isValid={isValid} />

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
                {hex.bonusTag && <BonusMedallion cx={pos.x} cy={pos.y} tag={hex.bonusTag} />}
                {hex.type === 'water' && hex.resourceTokenIcon && (
                  <ResourceMedallion cx={pos.x} cy={pos.y} tokenType={hex.resourceTokenIcon} />
                )}
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// --- Embossed bonus medallions (26px radius) ---

function BonusMedallion({ cx, cy, tag }: { cx: number; cy: number; tag: string }) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {tag === 'production' && <ProductionMedallion />}
      {tag === 'nature' && <NatureMedallion />}
      {tag === 'science' && <ScienceMedallion />}
      {tag === 'space' && <SpaceMedallion />}
      {tag === 'energy' && <ScienceMedallion />}
    </g>
  );
}

function ProductionMedallion() {
  return (
    <g>
      <circle cx="2" cy="3" r="26" fill="#000" fillOpacity="0.4" />
      <circle cx="0" cy="0" r="26" fill="#8B4020" />
      <path d="M-18,-18 A26,26 0 0,1 18,-18" fill="none" stroke="#C46830" strokeWidth="4" strokeLinecap="round" />
      <path d="M18,18 A26,26 0 0,1 -18,18" fill="none" stroke="#5A2A12" strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="0" r="20" fill="#B85A2E" />
      <ellipse cx="-3" cy="-6" rx="14" ry="10" fill="#C46830" fillOpacity="0.6" />
      <rect x="-14" y="-4" width="28" height="14" rx="2" fill="none" stroke="#FFD085" strokeWidth="2" />
      <line x1="-14" y1="3" x2="14" y2="3" stroke="#FFD085" strokeWidth="1.5" />
      <rect x="-10" y="-2" width="6" height="4" fill="#FFD085" fillOpacity="0.8" />
      <rect x="-2" y="-2" width="6" height="4" fill="#FFD085" fillOpacity="0.8" />
      <rect x="6" y="-2" width="5" height="4" fill="#FFD085" fillOpacity="0.8" />
      <rect x="-7" y="-12" width="5" height="9" rx="1" fill="#FFD085" />
      <rect x="3" y="-15" width="4" height="12" rx="1" fill="#FFD085" />
      <circle cx="-4" cy="-16" r="2" fill="#FFD085" fillOpacity="0.4" />
      <circle cx="6" cy="-19" r="1.5" fill="#FFD085" fillOpacity="0.3" />
    </g>
  );
}

function NatureMedallion() {
  return (
    <g>
      <circle cx="2" cy="3" r="26" fill="#000" fillOpacity="0.4" />
      <circle cx="0" cy="0" r="26" fill="#1A4A10" />
      <path d="M-18,-18 A26,26 0 0,1 18,-18" fill="none" stroke="#2E7D32" strokeWidth="4" strokeLinecap="round" />
      <path d="M18,18 A26,26 0 0,1 -18,18" fill="none" stroke="#0D2A08" strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="0" r="20" fill="#1E5A14" />
      <ellipse cx="-3" cy="-6" rx="14" ry="10" fill="#2E7D32" fillOpacity="0.5" />
      <path d="M-9 10 Q-6 0 0 -12 Q6 0 9 10" fill="#66BB6A" stroke="#81C784" strokeWidth="1" />
      <path d="M-14 10 Q-10 2 -7 -4" fill="none" stroke="#81C784" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 10 Q10 2 7 -4" fill="none" stroke="#81C784" strokeWidth="3" strokeLinecap="round" />
      <line x1="0" y1="-12" x2="0" y2="12" stroke="#81C784" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function ScienceMedallion() {
  return (
    <g>
      <circle cx="2" cy="3" r="26" fill="#000" fillOpacity="0.4" />
      <circle cx="0" cy="0" r="26" fill="#2A2A3A" />
      <path d="M-18,-18 A26,26 0 0,1 18,-18" fill="none" stroke="#555" strokeWidth="4" strokeLinecap="round" />
      <path d="M18,18 A26,26 0 0,1 -18,18" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="0" r="20" fill="#1E1E2E" />
      <ellipse cx="-3" cy="-6" rx="14" ry="10" fill="#2A2A40" fillOpacity="0.6" />
      <circle cx="0" cy="-4" r="9" fill="none" stroke="#F5C842" strokeWidth="2.5" />
      <line x1="0" y1="5" x2="0" y2="13" stroke="#F5C842" strokeWidth="3" strokeLinecap="round" />
      <line x1="-5" y1="13" x2="5" y2="13" stroke="#F5C842" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="-4" y1="16" x2="4" y2="16" stroke="#F5C842" strokeWidth="2" strokeLinecap="round" />
      <line x1="0" y1="-16" x2="0" y2="-19" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
      <line x1="10" y1="-12" x2="13" y2="-14" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="-10" y1="-12" x2="-13" y2="-14" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="0" cy="-4" r="5" fill="#F5C842" fillOpacity="0.15" />
    </g>
  );
}

function SpaceMedallion() {
  return (
    <g>
      <circle cx="2" cy="3" r="26" fill="#000" fillOpacity="0.4" />
      <circle cx="0" cy="0" r="26" fill="#3A3A40" />
      <path d="M-18,-18 A26,26 0 0,1 18,-18" fill="none" stroke="#666" strokeWidth="4" strokeLinecap="round" />
      <path d="M18,18 A26,26 0 0,1 -18,18" fill="none" stroke="#1A1A1E" strokeWidth="4" strokeLinecap="round" />
      <circle cx="0" cy="0" r="20" fill="#2A2A30" />
      <ellipse cx="-3" cy="-6" rx="14" ry="10" fill="#3A3A44" fillOpacity="0.5" />
      <path d="M-4 14 L-10 2 L-4 -14 L4 -14 L10 2 L4 14 Z" fill="#E85530" stroke="#FF6E40" strokeWidth="1" />
      <path d="M-3 -12 L0 -20 L3 -12" fill="#F8A030" />
      <path d="M-1 -14 L0 -20 L1 -14" fill="#FFC107" fillOpacity="0.5" />
      <circle cx="0" cy="-4" r="3.5" fill="#1A1A2E" stroke="#FFF" strokeWidth="1" opacity="0.6" />
      <circle cx="-1" cy="-5" r="1" fill="#FFF" opacity="0.3" />
      <path d="M-10 2 L-14 8 L-8 8 Z" fill="#B71C1C" />
      <path d="M10 2 L14 8 L8 8 Z" fill="#B71C1C" />
      <path d="M-3 14 L-2 18 L0 16 L2 18 L3 14" fill="#FFC107" fillOpacity="0.7" />
    </g>
  );
}

// --- Embossed resource token medallions (22px radius, on water hexes) ---

function ResourceMedallion({ cx, cy, tokenType }: { cx: number; cy: number; tokenType: string }) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      {tokenType === 'nature' && <NatureTokenMedallion />}
      {tokenType === 'science' && <ScienceTokenMedallion />}
      {tokenType === 'production' && <ProductionTokenMedallion />}
    </g>
  );
}

function NatureTokenMedallion() {
  return (
    <g>
      <circle cx="1" cy="2" r="22" fill="#000" fillOpacity="0.35" />
      <circle cx="0" cy="0" r="22" fill="#0D2A08" />
      <path d="M-15,-15 A22,22 0 0,1 15,-15" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      <path d="M15,15 A22,22 0 0,1 -15,15" fill="none" stroke="#061A04" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="17" fill="#1A4A10" />
      <ellipse cx="-2" cy="-4" rx="12" ry="8" fill="#1E5A14" fillOpacity="0.5" />
      <path d="M-7 8 Q-5 0 0 -10 Q5 0 7 8" fill="#66BB6A" />
      <path d="M-10 8 Q-7 2 -5 -2" fill="none" stroke="#81C784" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M10 8 Q7 2 5 -2" fill="none" stroke="#81C784" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="0" y1="-10" x2="0" y2="9" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function ScienceTokenMedallion() {
  return (
    <g>
      <circle cx="1" cy="2" r="22" fill="#000" fillOpacity="0.35" />
      <circle cx="0" cy="0" r="22" fill="#1A1A2A" />
      <path d="M-15,-15 A22,22 0 0,1 15,-15" fill="none" stroke="#444" strokeWidth="3" strokeLinecap="round" />
      <path d="M15,15 A22,22 0 0,1 -15,15" fill="none" stroke="#0A0A14" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="17" fill="#151520" />
      <ellipse cx="-2" cy="-4" rx="12" ry="8" fill="#1E1E30" fillOpacity="0.5" />
      <circle cx="0" cy="-3" r="7" fill="none" stroke="#F5C842" strokeWidth="2" />
      <line x1="0" y1="4" x2="0" y2="10" stroke="#F5C842" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="-4" y1="10" x2="4" y2="10" stroke="#F5C842" strokeWidth="2" strokeLinecap="round" />
      <line x1="0" y1="-12" x2="0" y2="-14" stroke="#F5C842" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <line x1="8" y1="-8" x2="10" y2="-10" stroke="#F5C842" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <line x1="-8" y1="-8" x2="-10" y2="-10" stroke="#F5C842" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
      <circle cx="0" cy="-3" r="3.5" fill="#F5C842" fillOpacity="0.1" />
    </g>
  );
}

function ProductionTokenMedallion() {
  return (
    <g>
      <circle cx="1" cy="2" r="22" fill="#000" fillOpacity="0.35" />
      <circle cx="0" cy="0" r="22" fill="#5A2A10" />
      <path d="M-15,-15 A22,22 0 0,1 15,-15" fill="none" stroke="#A06030" strokeWidth="3" strokeLinecap="round" />
      <path d="M15,15 A22,22 0 0,1 -15,15" fill="none" stroke="#2A1508" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="17" fill="#7A4020" />
      <ellipse cx="-2" cy="-4" rx="12" ry="8" fill="#8B4A28" fillOpacity="0.5" />
      <rect x="-11" y="-4" width="22" height="12" rx="2" fill="none" stroke="#FFD085" strokeWidth="2" />
      <line x1="-11" y1="2" x2="11" y2="2" stroke="#FFD085" strokeWidth="1.5" />
      <rect x="-7" y="-2" width="5" height="3" fill="#FFD085" fillOpacity="0.8" />
      <rect x="-1" y="-2" width="5" height="3" fill="#FFD085" fillOpacity="0.8" />
      <rect x="5" y="-2" width="4" height="3" fill="#FFD085" fillOpacity="0.8" />
      <rect x="-4" y="-11" width="4" height="8" rx="1" fill="#FFD085" />
      <rect x="2" y="-13" width="3" height="10" rx="1" fill="#FFD085" />
      <circle cx="-2" cy="-14" r="1.5" fill="#FFD085" fillOpacity="0.4" />
      <circle cx="4" cy="-16" r="1" fill="#FFD085" fillOpacity="0.3" />
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

