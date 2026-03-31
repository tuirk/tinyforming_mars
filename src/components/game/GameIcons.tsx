/**
 * Centralized game icons — mini embossed medallion versions matching board style.
 * Used across Supply, ResourceTokenSupply, StandardProjects, and PlayerDashboard.
 */

// --- Parameter tile stamps (mini embossed hex tokens) ---

export function HeatStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-28 -28 56 56" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="2" r="24" fill="#000" fillOpacity="0.35" />
      <circle cx="0" cy="0" r="24" fill="#6A0000" />
      <path d="M-17,-17 A24,24 0 0,1 17,-17" fill="none" stroke="#D32F2F" strokeWidth="3" strokeLinecap="round" />
      <path d="M17,17 A24,24 0 0,1 -17,17" fill="none" stroke="#3A0000" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="18" fill="#B71C1C" />
      <ellipse cx="-2" cy="-4" rx="12" ry="8" fill="#D32F2F" fillOpacity="0.5" />
      <circle cx="0" cy="4" r="6" fill="#FF8A80" stroke="#FFCDD2" strokeWidth="1.5" />
      <rect x="-2" y="-8" width="4" height="10" rx="2" fill="#FF8A80" />
    </svg>
  );
}

export function GreeneryStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-28 -28 56 56" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="2" r="24" fill="#000" fillOpacity="0.35" />
      <circle cx="0" cy="0" r="24" fill="#0D3B0F" />
      <path d="M-17,-17 A24,24 0 0,1 17,-17" fill="none" stroke="#2E7D32" strokeWidth="3" strokeLinecap="round" />
      <path d="M17,17 A24,24 0 0,1 -17,17" fill="none" stroke="#061A04" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="18" fill="#1E5A14" />
      <ellipse cx="-2" cy="-4" rx="12" ry="8" fill="#2E7D32" fillOpacity="0.5" />
      <path d="M-7 8 Q-4 0 0 -10 Q4 0 7 8" fill="#66BB6A" />
      <line x1="0" y1="-10" x2="0" y2="10" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />
      <path d="M-10 8 Q-7 2 -5 -2" fill="none" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 8 Q7 2 5 -2" fill="none" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function WaterStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-28 -28 56 56" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="2" r="24" fill="#000" fillOpacity="0.35" />
      <circle cx="0" cy="0" r="24" fill="#062B6E" />
      <path d="M-17,-17 A24,24 0 0,1 17,-17" fill="none" stroke="#1565C0" strokeWidth="3" strokeLinecap="round" />
      <path d="M17,17 A24,24 0 0,1 -17,17" fill="none" stroke="#021840" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="18" fill="#0D47A1" />
      <ellipse cx="-2" cy="-4" rx="12" ry="8" fill="#1565C0" fillOpacity="0.5" />
      <path d="M0 -8 Q7 2 5 6 Q0 12 -5 6 Q-7 2 0 -8 Z" fill="#90CAF9" stroke="#BBDEFB" strokeWidth="1" />
      <ellipse cx="-2" cy="0" rx="2" ry="1.5" fill="#BBDEFB" opacity="0.6" />
    </svg>
  );
}

// --- City stamp ---

export function CityStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-28 -28 56 56" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="2" r="24" fill="#000" fillOpacity="0.3" />
      <circle cx="0" cy="0" r="24" fill="#555" />
      <path d="M-17,-17 A24,24 0 0,1 17,-17" fill="none" stroke="#999" strokeWidth="3" strokeLinecap="round" />
      <path d="M17,17 A24,24 0 0,1 -17,17" fill="none" stroke="#2A2A2A" strokeWidth="3" strokeLinecap="round" />
      <circle cx="0" cy="0" r="18" fill="#777" />
      <ellipse cx="-2" cy="-4" rx="12" ry="8" fill="#888" fillOpacity="0.5" />
      <rect x="-8" y="-4" width="16" height="14" rx="1.5" fill="#DDD" stroke="#BBB" strokeWidth="1" />
      <rect x="-11" y="-8" width="8" height="10" rx="1" fill="#CCC" stroke="#AAA" strokeWidth="0.8" />
      <rect x="-5" y="0" width="3" height="3" fill="#666" />
      <rect x="3" y="0" width="3" height="3" fill="#666" />
      <rect x="-5" y="5" width="3" height="3" fill="#666" />
      <rect x="3" y="5" width="3" height="3" fill="#666" />
    </svg>
  );
}

// --- Resource token stamps (embossed medallions) ---

export function NatureTokenStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="1.5" r="20" fill="#000" fillOpacity="0.3" />
      <circle cx="0" cy="0" r="20" fill="#0D2A08" />
      <path d="M-14,-14 A20,20 0 0,1 14,-14" fill="none" stroke="#2E7D32" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14,14 A20,20 0 0,1 -14,14" fill="none" stroke="#061A04" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="0" cy="0" r="15" fill="#1A4A10" />
      <path d="M-5 6 Q-3 0 0 -8 Q3 0 5 6" fill="#66BB6A" />
      <line x1="0" y1="-8" x2="0" y2="8" stroke="#81C784" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ProductionTokenStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="1.5" r="20" fill="#000" fillOpacity="0.3" />
      <circle cx="0" cy="0" r="20" fill="#5A2A10" />
      <path d="M-14,-14 A20,20 0 0,1 14,-14" fill="none" stroke="#A06030" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14,14 A20,20 0 0,1 -14,14" fill="none" stroke="#2A1508" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="0" cy="0" r="15" fill="#7A4020" />
      <rect x="-9" y="-2" width="18" height="9" rx="1.5" fill="none" stroke="#FFD085" strokeWidth="1.5" />
      <rect x="-3" y="-9" width="3" height="7" rx="1" fill="#FFD085" />
      <rect x="2" y="-11" width="2.5" height="9" rx="1" fill="#FFD085" />
    </svg>
  );
}

export function ScienceTokenStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="1.5" r="20" fill="#000" fillOpacity="0.3" />
      <circle cx="0" cy="0" r="20" fill="#1A1A2A" />
      <path d="M-14,-14 A20,20 0 0,1 14,-14" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14,14 A20,20 0 0,1 -14,14" fill="none" stroke="#0A0A14" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="0" cy="0" r="15" fill="#151520" />
      <circle cx="0" cy="-3" r="6" fill="none" stroke="#F5C842" strokeWidth="1.5" />
      <line x1="0" y1="3" x2="0" y2="9" stroke="#F5C842" strokeWidth="2" strokeLinecap="round" />
      <line x1="-3" y1="9" x2="3" y2="9" stroke="#F5C842" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="0" cy="-3" r="3" fill="#F5C842" fillOpacity="0.12" />
    </svg>
  );
}

// --- Credits stamp (embossed coin) ---

export function CreditsStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="1.5" r="20" fill="#000" fillOpacity="0.3" />
      <circle cx="0" cy="0" r="20" fill="#8B6914" />
      <path d="M-14,-14 A20,20 0 0,1 14,-14" fill="none" stroke="#D4A017" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14,14 A20,20 0 0,1 -14,14" fill="none" stroke="#5A3A08" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="0" cy="0" r="15" fill="#B8860B" />
      <ellipse cx="-2" cy="-3" rx="10" ry="7" fill="#D4A017" fillOpacity="0.4" />
      <circle cx="0" cy="0" r="10" fill="none" stroke="#F5C842" strokeWidth="1.5" />
      <text x="0" y="5" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#F5C842" fontFamily="serif">$</text>
    </svg>
  );
}

// --- Pass stamp (embossed flag) ---

export function PassStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-24 -24 48 48" xmlns="http://www.w3.org/2000/svg">
      <circle cx="1" cy="1.5" r="20" fill="#000" fillOpacity="0.3" />
      <circle cx="0" cy="0" r="20" fill="#2A2A3A" />
      <path d="M-14,-14 A20,20 0 0,1 14,-14" fill="none" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M14,14 A20,20 0 0,1 -14,14" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="0" cy="0" r="15" fill="#1E1E2E" />
      <line x1="-5" y1="-10" x2="-5" y2="12" stroke="#AAA" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M-5 -10 L8 -5 L-5 0 Z" fill="#AAA" />
    </svg>
  );
}

// --- Mini tag badges (simple circle + icon, for cards/scoreboard) ---

import type { TagType } from '@/engine/types';

const TAG_BADGE_STYLES: Record<TagType, { bg: string; stroke: string; iconColor: string }> = {
  energy: { bg: '#3A3520', stroke: '#F5C842', iconColor: '#F5C842' },
  production: { bg: '#5A3A20', stroke: '#E8872D', iconColor: '#FFD085' },
  nature: { bg: '#1A3A12', stroke: '#4CAF50', iconColor: '#66BB6A' },
  science: { bg: '#1A1A2A', stroke: '#888', iconColor: '#F5C842' },
  space: { bg: '#2A2A30', stroke: '#888', iconColor: '#E85530' },
};

export function TagBadge({ tag, size = 16 }: { tag: TagType; size?: number }) {
  const s = TAG_BADGE_STYLES[tag];
  return (
    <svg width={size} height={size} viewBox="-14 -14 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="0" cy="0" r="12" fill={s.bg} stroke={s.stroke} strokeWidth="1.5" />
      <TagBadgeIcon tag={tag} color={s.iconColor} />
    </svg>
  );
}

function TagBadgeIcon({ tag, color }: { tag: TagType; color: string }) {
  switch (tag) {
    case 'energy':
      return <polygon points="-2,-8 3,-1 0,0 2,8 -3,1 0,0" fill={color} />;
    case 'production':
      return (
        <g>
          <rect x="-7" y="-1" width="14" height="7" rx="1" fill="none" stroke={color} strokeWidth="1.2" />
          <rect x="-3" y="-6" width="2.5" height="5" rx="0.5" fill={color} />
          <rect x="1" y="-7" width="2" height="6" rx="0.5" fill={color} />
        </g>
      );
    case 'nature':
      return (
        <g>
          <path d="M-4 5 Q-2 -1 0 -7 Q2 -1 4 5" fill={color} />
          <line x1="0" y1="-7" x2="0" y2="6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case 'science':
      return (
        <g>
          <circle cx="0" cy="-2" r="4.5" fill="none" stroke={color} strokeWidth="1.2" />
          <line x1="0" y1="2.5" x2="0" y2="7" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-2.5" y1="7" x2="2.5" y2="7" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </g>
      );
    case 'space':
      return (
        <g>
          <path d="M-2 7 L-5 0 L-2 -7 L2 -7 L5 0 L2 7 Z" fill={color} />
          <circle cx="0" cy="-2" r="1.5" fill="#1A1A2E" opacity="0.6" />
        </g>
      );
    default:
      return null;
  }
}
