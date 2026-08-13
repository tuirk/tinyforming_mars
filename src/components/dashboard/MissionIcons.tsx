'use client';

/** 16×16 space pixel-art icons for mission cards (crispEdges + scaled up). */

const PX = 3; // display: 48×48

type Pixel = [x: number, y: number, color: string];

function PixelArt({ pixels, title }: { pixels: Pixel[]; title: string }) {
  return (
    <svg
      width={16 * PX}
      height={16 * PX}
      viewBox="0 0 16 16"
      shapeRendering="crispEdges"
      aria-hidden
      role="img"
      aria-label={title}
      style={{ display: 'block', margin: '0 auto', imageRendering: 'pixelated' }}
    >
      {pixels.map(([x, y, fill], i) => (
        <rect key={i} x={x} y={y} width={1} height={1} fill={fill} />
      ))}
    </svg>
  );
}

/** Probe / AI sat facing Mars — Player vs AI */
const AI_PIXELS: Pixel[] = [
  // Mars arc (right)
  [13, 4, '#C4623A'], [14, 4, '#A8502E'],
  [12, 5, '#C4623A'], [13, 5, '#E8872D'], [14, 5, '#C4623A'], [15, 5, '#8B3D22'],
  [12, 6, '#A8502E'], [13, 6, '#C4623A'], [14, 6, '#A8502E'], [15, 6, '#6B2D18'],
  [13, 7, '#8B3D22'], [14, 7, '#6B2D18'],
  // Probe body
  [3, 6, '#8a8aaa'], [4, 6, '#c0c0d0'], [5, 6, '#8a8aaa'],
  [2, 7, '#5a5a7a'], [3, 7, '#e0e0e0'], [4, 7, '#4FC3F7'], [5, 7, '#e0e0e0'], [6, 7, '#5a5a7a'],
  [3, 8, '#8a8aaa'], [4, 8, '#c0c0d0'], [5, 8, '#8a8aaa'],
  // Dish / antenna
  [4, 3, '#E8872D'], [4, 4, '#F0A050'], [4, 5, '#8a8aaa'],
  [1, 7, '#E8872D'], [7, 7, '#E8872D'],
  // Stars
  [1, 2, '#e0e0e0'], [9, 3, '#8a8aaa'], [10, 9, '#e0e0e0'], [2, 11, '#5a5a7a'],
];

/** Lone rocket over Mars — Solo */
const SOLO_PIXELS: Pixel[] = [
  // Mars bottom-right
  [10, 11, '#8B3D22'], [11, 11, '#A8502E'], [12, 11, '#C4623A'], [13, 11, '#A8502E'], [14, 11, '#8B3D22'],
  [9, 12, '#6B2D18'], [10, 12, '#C4623A'], [11, 12, '#E8872D'], [12, 12, '#C4623A'], [13, 12, '#A8502E'], [14, 12, '#6B2D18'],
  [10, 13, '#8B3D22'], [11, 13, '#A8502E'], [12, 13, '#8B3D22'], [13, 13, '#6B2D18'],
  // Rocket
  [5, 2, '#e0e0e0'],
  [4, 3, '#c0c0d0'], [5, 3, '#F0A050'], [6, 3, '#c0c0d0'],
  [4, 4, '#8a8aaa'], [5, 4, '#4FC3F7'], [6, 4, '#8a8aaa'],
  [4, 5, '#c0c0d0'], [5, 5, '#e0e0e0'], [6, 5, '#c0c0d0'],
  [3, 6, '#E8872D'], [4, 6, '#8a8aaa'], [5, 6, '#c0c0d0'], [6, 6, '#8a8aaa'], [7, 6, '#E8872D'],
  [5, 7, '#EF5350'],
  [4, 8, '#E8872D'], [5, 8, '#F0A050'], [6, 8, '#E8872D'],
  // Stars
  [1, 1, '#e0e0e0'], [12, 2, '#8a8aaa'], [14, 5, '#e0e0e0'], [2, 10, '#5a5a7a'],
];

/** Twin rockets / dual crew — Play with a Friend */
const FRIEND_PIXELS: Pixel[] = [
  // Shared Mars base
  [4, 13, '#8B3D22'], [5, 13, '#A8502E'], [6, 13, '#C4623A'], [7, 13, '#A8502E'],
  [8, 13, '#C4623A'], [9, 13, '#A8502E'], [10, 13, '#8B3D22'], [11, 13, '#6B2D18'],
  [5, 14, '#6B2D18'], [6, 14, '#8B3D22'], [7, 14, '#A8502E'], [8, 14, '#8B3D22'], [9, 14, '#6B2D18'],
  // Left rocket (you)
  [4, 3, '#e0e0e0'],
  [3, 4, '#c0c0d0'], [4, 4, '#4CAF50'], [5, 4, '#c0c0d0'],
  [3, 5, '#8a8aaa'], [4, 5, '#e0e0e0'], [5, 5, '#8a8aaa'],
  [2, 6, '#4CAF50'], [3, 6, '#8a8aaa'], [4, 6, '#c0c0d0'], [5, 6, '#8a8aaa'], [6, 6, '#4CAF50'],
  [4, 7, '#EF5350'],
  [3, 8, '#E8872D'], [4, 8, '#F0A050'], [5, 8, '#E8872D'],
  // Right rocket (friend)
  [11, 3, '#e0e0e0'],
  [10, 4, '#c0c0d0'], [11, 4, '#4FC3F7'], [12, 4, '#c0c0d0'],
  [10, 5, '#8a8aaa'], [11, 5, '#e0e0e0'], [12, 5, '#8a8aaa'],
  [9, 6, '#4FC3F7'], [10, 6, '#8a8aaa'], [11, 6, '#c0c0d0'], [12, 6, '#8a8aaa'], [13, 6, '#4FC3F7'],
  [11, 7, '#EF5350'],
  [10, 8, '#E8872D'], [11, 8, '#F0A050'], [12, 8, '#E8872D'],
  // Link / radio beam between them
  [7, 5, '#E8872D'], [8, 5, '#F0A050'],
  // Stars
  [1, 2, '#8a8aaa'], [14, 2, '#e0e0e0'], [8, 1, '#5a5a7a'], [1, 10, '#e0e0e0'],
];

export function MissionIconAi() {
  return <PixelArt pixels={AI_PIXELS} title="Player vs AI" />;
}

export function MissionIconSolo() {
  return <PixelArt pixels={SOLO_PIXELS} title="Solo Mode" />;
}

export function MissionIconFriend() {
  return <PixelArt pixels={FRIEND_PIXELS} title="Play with a Friend" />;
}
