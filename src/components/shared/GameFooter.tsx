'use client';

import { useState } from 'react';
import { LegalModal } from './LegalModal';

const BGG_URL = 'https://boardgamegeek.com/boardgame/282493/tinyforming-mars';

export function GameFooter() {
  const [legalModal, setLegalModal] = useState<'disclaimer' | 'privacy' | 'terms' | null>(null);

  const muted: React.CSSProperties = {
    color: '#9a9ab4',
  };

  const nameLink: React.CSSProperties = {
    color: '#E8872D',
    textDecoration: 'none',
    fontWeight: 500,
  };

  const legalBtn: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#9a9ab4',
    cursor: 'pointer',
    fontSize: '10px',
    padding: 0,
    fontFamily: 'inherit',
  };

  const sep: React.CSSProperties = {
    color: '#4a4a68',
    margin: '0 6px',
  };

  return (
    <>
      <footer
        style={{
          background: '#0a0a15',
          borderTop: '1px solid #1a1a2e',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ fontSize: '11px', lineHeight: 1.6, ...muted }}>
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '10px',
              color: '#c8c8d8',
              fontWeight: 500,
            }}
          >
            TINYforming Mars
          </span>
          <span style={sep}>·</span>
          <span>
            Original game by{' '}
            <a href={BGG_URL} target="_blank" rel="noopener noreferrer" style={nameLink}>
              Michael Bevilacqua
            </a>
            <span style={{ color: '#6a6a88' }}> on BoardGameGeek</span>
          </span>
        </div>
        <div style={{ fontSize: '10px', ...muted }}>
          <span>
            Digital adaptation by{' '}
            <a
              href="https://github.com/tuirk"
              target="_blank"
              rel="noopener noreferrer"
              style={nameLink}
            >
              Tuirk
            </a>
          </span>
          <span style={sep}>·</span>
          <button type="button" onClick={() => setLegalModal('disclaimer')} style={legalBtn}>
            Disclaimer
          </button>
          <span style={sep}>·</span>
          <button type="button" onClick={() => setLegalModal('privacy')} style={legalBtn}>
            Privacy
          </button>
          <span style={sep}>·</span>
          <button type="button" onClick={() => setLegalModal('terms')} style={legalBtn}>
            Terms
          </button>
        </div>
      </footer>
      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </>
  );
}
