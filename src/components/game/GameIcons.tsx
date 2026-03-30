/**
 * Centralized game icons — mini stamp versions of board tokens and resource tokens.
 * Used across Supply, ResourceTokenSupply, StandardProjects, and PlayerDashboard.
 *
 * These match the visual style of the MarsBoard puffy tokens and bonus icons.
 */

// --- Parameter tile stamps (mini puffy hex tokens) ---

export function HeatStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <polygon points="47,12 70,25 70,55 47,68 24,55 24,25" fill="#000" fillOpacity="0.3" />
      <polygon points="45,10 68,23 68,53 45,66 22,53 22,23" fill="#6A0000" />
      <polygon points="22,23 22,53 45,66 45,62 24,50 24,26" fill="#B71C1C" />
      <polygon points="68,23 68,53 45,66 45,62 66,50 66,26" fill="#8B1515" />
      <polygon points="45,10 68,23 66,26 45,14 24,26 22,23" fill="#EF5350" />
      <polygon points="45,14 66,26 66,50 45,62 24,50 24,26" fill="#D32F2F" />
      <polygon points="45,14 66,26 66,34 45,22 24,34 24,26" fill="#E53935" fillOpacity="0.8" />
      <circle cx="45" cy="44" r="8" fill="#FF8A80" stroke="#FFCDD2" strokeWidth="2" />
    </svg>
  );
}

export function GreeneryStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <polygon points="47,12 70,25 70,55 47,68 24,55 24,25" fill="#000" fillOpacity="0.3" />
      <polygon points="45,10 68,23 68,53 45,66 22,53 22,23" fill="#0D3B0F" />
      <polygon points="22,23 22,53 45,66 45,62 24,50 24,26" fill="#1B5E20" />
      <polygon points="68,23 68,53 45,66 45,62 66,50 66,26" fill="#145218" />
      <polygon points="45,10 68,23 66,26 45,14 24,26 22,23" fill="#4CAF50" />
      <polygon points="45,14 66,26 66,50 45,62 24,50 24,26" fill="#2E7D32" />
      <polygon points="45,14 66,26 66,34 45,22 24,34 24,26" fill="#43A047" fillOpacity="0.8" />
      <path d="M38 50 Q42 38 45 32 Q48 38 52 50" fill="#A5D6A7" />
      <line x1="45" y1="32" x2="45" y2="54" stroke="#C8E6C9" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function WaterStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <polygon points="47,12 70,25 70,55 47,68 24,55 24,25" fill="#000" fillOpacity="0.3" />
      <polygon points="45,10 68,23 68,53 45,66 22,53 22,23" fill="#062B6E" />
      <polygon points="22,23 22,53 45,66 45,62 24,50 24,26" fill="#0D47A1" />
      <polygon points="68,23 68,53 45,66 45,62 66,50 66,26" fill="#0A3A8A" />
      <polygon points="45,10 68,23 66,26 45,14 24,26 22,23" fill="#2196F3" />
      <polygon points="45,14 66,26 66,50 45,62 24,50 24,26" fill="#1565C0" />
      <polygon points="45,14 66,26 66,34 45,22 24,34 24,26" fill="#1E88E5" fillOpacity="0.8" />
      <path d="M45 30 Q52 40 50 46 Q45 52 40 46 Q38 40 45 30 Z" fill="#90CAF9" stroke="#BBDEFB" strokeWidth="1.5" />
    </svg>
  );
}

// --- City stamp ---

export function CityStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg">
      <polygon points="47,12 70,25 70,55 47,68 24,55 24,25" fill="#000" fillOpacity="0.3" />
      <polygon points="45,10 68,23 68,53 45,66 22,53 22,23" fill="#555" />
      <polygon points="22,23 22,53 45,66 45,62 24,50 24,26" fill="#777" />
      <polygon points="68,23 68,53 45,66 45,62 66,50 66,26" fill="#666" />
      <polygon points="45,10 68,23 66,26 45,14 24,26 22,23" fill="#BBB" />
      <polygon points="45,14 66,26 66,50 45,62 24,50 24,26" fill="#999" />
      <rect x="34" y="28" width="22" height="20" rx="2" fill="#DDD" stroke="#BBB" strokeWidth="1.5" />
      <rect x="30" y="24" width="10" height="12" rx="1" fill="#CCC" stroke="#AAA" strokeWidth="1" />
      <rect x="37" y="32" width="4" height="4" fill="#666" />
      <rect x="46" y="32" width="4" height="4" fill="#666" />
      <rect x="37" y="40" width="4" height="4" fill="#666" />
      <rect x="46" y="40" width="4" height="4" fill="#666" />
    </svg>
  );
}

// --- Resource token stamps (circular with inner icon) ---

export function NatureTokenStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#1A3A12" stroke="#4CAF50" strokeWidth="2.5" />
      <path d="M12 22 Q14 14 16 9 Q18 14 20 22" fill="#5CBF60" />
      <path d="M9 23 Q12 17 14 13" fill="none" stroke="#5CBF60" strokeWidth="1.5" />
      <path d="M23 23 Q20 17 18 13" fill="none" stroke="#5CBF60" strokeWidth="1.5" />
    </svg>
  );
}

export function ProductionTokenStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#5A3A20" stroke="#E8872D" strokeWidth="2.5" />
      <rect x="6" y="13" width="20" height="10" rx="1.5" fill="none" stroke="#FFD085" strokeWidth="1.5" />
      <rect x="8" y="15" width="4" height="2.5" fill="#FFD085" />
      <rect x="14" y="15" width="4" height="2.5" fill="#FFD085" />
      <rect x="11" y="8" width="3" height="5" fill="#FFD085" />
      <rect x="18" y="7" width="2.5" height="6" fill="#FFD085" />
    </svg>
  );
}

export function ScienceTokenStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#1A1A1A" stroke="#AAA" strokeWidth="2.5" />
      <circle cx="16" cy="12" r="5.5" fill="none" stroke="#F5C842" strokeWidth="1.5" />
      <line x1="16" y1="17.5" x2="16" y2="24" stroke="#F5C842" strokeWidth="1.5" />
      <line x1="13" y1="24" x2="19" y2="24" stroke="#F5C842" strokeWidth="1.5" />
    </svg>
  );
}

// --- Credits stamp (coin) ---

export function CreditsStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" fill="#B8860B" stroke="#F5C842" strokeWidth="2" />
      <circle cx="16" cy="16" r="9" fill="none" stroke="#F5C842" strokeWidth="1.5" />
      <text x="16" y="20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F5C842">$</text>
    </svg>
  );
}

// --- Pass stamp (flag) ---

export function PassStamp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="13" fill="#2A2A3A" stroke="#888" strokeWidth="2" />
      <line x1="12" y1="8" x2="12" y2="26" stroke="#AAA" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 8 L22 12 L12 16 Z" fill="#AAA" />
    </svg>
  );
}
