'use client';

import { useState } from 'react';
import { LegalModal } from './LegalModal';

export function GameFooter() {
  const [legalModal, setLegalModal] = useState<'disclaimer' | 'privacy' | 'terms' | null>(null);

  const btnStyle: React.CSSProperties = {
    background: 'none', border: 'none', color: '#3a3a5e', cursor: 'pointer', fontSize: '10px', padding: 0, fontFamily: 'inherit',
  };

  return (
    <>
      <footer style={{
        background: '#0a0a15',
        borderTop: '1px solid #1a1a2e',
        padding: '10px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '11px', color: '#5a5a7a', lineHeight: 1.6 }}>
          <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '10px', color: '#8a8aaa', fontWeight: 500 }}>
            TINYforming Mars
          </span>
          <span style={{ color: '#2a2a3e', margin: '0 6px' }}>·</span>
          <span>Original game by <a href="https://boardgamegeek.com/boardgame/282493/tinyforming-mars" target="_blank" rel="noopener noreferrer" style={{ color: '#8a8aaa', textDecoration: 'none' }}>Michael Bevilacqua</a></span>
          <span style={{ color: '#2a2a3e', margin: '0 6px' }}>·</span>
          <a href="https://boardgamegeek.com/boardgame/282493/tinyforming-mars" target="_blank" rel="noopener noreferrer" style={{ color: '#E8872D', textDecoration: 'none' }}>
            BoardGameGeek
          </a>
        </div>
        <div style={{ fontSize: '10px', color: '#3a3a5e' }}>
          <span>Digital adaptation by <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={{ color: '#E8872D', textDecoration: 'none' }}>Tuirk</a></span>
          <span style={{ margin: '0 4px' }}>·</span>
          <button onClick={() => setLegalModal('disclaimer')} style={btnStyle}>Disclaimer</button>
          <span style={{ margin: '0 4px' }}>·</span>
          <button onClick={() => setLegalModal('privacy')} style={btnStyle}>Privacy</button>
          <span style={{ margin: '0 4px' }}>·</span>
          <button onClick={() => setLegalModal('terms')} style={btnStyle}>Terms</button>
        </div>
      </footer>
      {legalModal && <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />}
    </>
  );
}
