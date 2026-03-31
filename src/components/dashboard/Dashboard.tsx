'use client';

import { useState } from 'react';
import type { UserProfile } from '@/types/user';
import type { MatchType } from '@/engine/types';
import { signOut } from '@/lib/firebase/auth';
import { canAccessMatchType } from '@/lib/firebase/gameStore';
import { GameFooter } from '@/components/shared/GameFooter';
import { LogOut } from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile;
  isGuest: boolean;
  onStartGame: (matchType: MatchType) => void;
}

const MODES: { type: MatchType; title: string; description: string; icon: string; active: boolean }[] = [
  { type: 'human-vs-ai', title: 'Player vs AI', description: 'Challenge the AI across 4 difficulty levels. Terraform Mars before your opponent.', icon: '🤖', active: true },
  { type: 'solo', title: 'Solo Mode', description: 'Single-player challenge. Terraform Mars alone against the clock.', icon: '🎯', active: false },
  { type: 'human-vs-human', title: 'Play with a Friend', description: 'Invite a friend for a real-time match. Requires sign-in.', icon: '👥', active: false },
];

export function Dashboard({ userProfile, isGuest, onStartGame }: DashboardProps) {
  const displayName = userProfile.displayName || userProfile.email || 'Guest Martian';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0d0d1a', position: 'relative', overflow: 'hidden' }}>

      {/* Mars decoration (subtle) */}
      <div style={{ position: 'absolute', right: '-200px', bottom: '-200px', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%, #C4623A 0%, #3A1808 100%)', opacity: 0.1, pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1a1a2e', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 600, color: '#F0A050' }}>
            TINYforming Mars
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '12px', color: '#8a8aaa', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {displayName}
            {isGuest && <span style={{ color: '#5a5a7a', marginLeft: '6px' }}>(Guest)</span>}
          </span>
          <button
            onClick={() => signOut()}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: '1px solid #2a2a3e', borderRadius: '6px', padding: '6px 12px', color: '#5a5a7a', fontSize: '11px', cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            <LogOut size={12} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', zIndex: 1, gap: '32px' }}>

        {/* Welcome */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: "'Orbitron', monospace", fontSize: '11px', fontWeight: 500, color: '#E8872D', letterSpacing: '6px', marginBottom: '8px' }}>
            MISSION CONTROL
          </p>
          <h1 style={{ fontFamily: "'Orbitron', monospace", fontSize: '24px', fontWeight: 700, color: '#e0e0e0', margin: 0 }}>
            Choose Your Mission
          </h1>
        </div>

        {/* Mode cards */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {MODES.map((mode) => {
            const canAccess = mode.active && canAccessMatchType(mode.type, isGuest);
            const isLocked = mode.type === 'human-vs-human' && isGuest;
            const isComingSoon = !mode.active;

            return (
              <div
                key={mode.type}
                onClick={canAccess ? () => onStartGame(mode.type) : undefined}
                style={{
                  width: '220px',
                  background: '#151525',
                  border: `1px solid ${canAccess ? '#2a2a3e' : '#1a1a2e'}`,
                  borderRadius: '12px',
                  padding: '24px 20px',
                  cursor: canAccess ? 'pointer' : 'default',
                  opacity: canAccess ? 1 : 0.5,
                  transition: 'border-color 0.2s, transform 0.2s',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => { if (canAccess) { e.currentTarget.style.borderColor = '#E8872D'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2a3e'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{mode.icon}</div>
                <h3 style={{ fontFamily: "'Orbitron', monospace", fontSize: '13px', fontWeight: 600, color: '#e0e0e0', margin: '0 0 8px' }}>
                  {mode.title}
                </h3>
                <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11px', color: '#5a5a7a', lineHeight: 1.5, margin: '0 0 16px' }}>
                  {mode.description}
                </p>
                {canAccess && (
                  <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '11px', fontWeight: 500, color: '#E8872D', letterSpacing: '1px' }}>
                    PLAY
                  </span>
                )}
                {isComingSoon && (
                  <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: 500, color: '#3a3a5e', letterSpacing: '2px' }}>
                    COMING SOON
                  </span>
                )}
                {isLocked && (
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '10px', color: '#5a5a7a' }}>
                    Sign in required
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Stats */}
        {!isGuest && userProfile.stats.totalGames > 0 && (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: 700, color: '#4CAF50' }}>{userProfile.stats.wins}</div>
              <div style={{ fontSize: '10px', color: '#5a5a7a', fontFamily: "'Inter', system-ui, sans-serif" }}>Wins</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: 700, color: '#EF5350' }}>{userProfile.stats.losses}</div>
              <div style={{ fontSize: '10px', color: '#5a5a7a', fontFamily: "'Inter', system-ui, sans-serif" }}>Losses</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '20px', fontWeight: 700, color: '#8a8aaa' }}>{userProfile.stats.totalGames}</div>
              <div style={{ fontSize: '10px', color: '#5a5a7a', fontFamily: "'Inter', system-ui, sans-serif" }}>Games</div>
            </div>
          </div>
        )}
      </div>

      <GameFooter />
    </div>
  );
}
