'use client';

interface LegalModalProps {
  type: 'disclaimer' | 'privacy' | 'terms';
  onClose: () => void;
}

const titles: Record<string, string> = {
  disclaimer: 'Disclaimer',
  privacy: 'Privacy policy',
  terms: 'Terms of use',
};

const h4Style: React.CSSProperties = {
  fontFamily: "'Orbitron', monospace",
  fontSize: '12px',
  fontWeight: 500,
  color: '#e0e0e0',
  margin: '20px 0 8px',
  letterSpacing: '1px',
};

const pStyle: React.CSSProperties = { margin: '0 0 12px', color: '#8a8aaa' };
const linkStyle: React.CSSProperties = { color: '#E8872D', textDecoration: 'none' };

function DisclaimerContent() {
  return (
    <>
      <p style={pStyle}>
        TINYforming Mars (this website) is an unofficial, non-commercial, fan-made digital
        adaptation of the print-and-play board game &quot;TINYforming Mars&quot; designed by Michael Bevilacqua.
      </p>
      <h4 style={h4Style}>This project is</h4>
      <p style={pStyle}>
        A free hobby project with no monetization. Not affiliated with, endorsed by, or officially
        connected to Michael Bevilacqua or any publisher of TINYforming Mars. Created out of love
        for the original game, for personal and community enjoyment.
      </p>
      <h4 style={h4Style}>The original game</h4>
      <p style={pStyle}>
        TINYforming Mars is a free print-and-play game by Michael Bevilacqua. All game rules,
        mechanics, card designs, and concepts belong to the original creator. The original game
        can be found on{' '}
        <a href="https://boardgamegeek.com/boardgame/282493/tinyforming-mars" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          BoardGameGeek
        </a>.
      </p>
      <h4 style={h4Style}>Digital adaptation</h4>
      <p style={pStyle}>
        The digital artwork, UI design, and code for this web application were created by{' '}
        <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={linkStyle}>Tuirk</a>.
        The AI opponent and digital-specific features are original additions to the digital version.
        If the original creator has any concerns about this adaptation, please reach out via GitHub
        and it will be addressed promptly.
      </p>
      <p style={pStyle}>This project is provided as-is, free of charge, with no warranties of any kind.</p>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <p style={{ ...pStyle, fontSize: '11px', color: '#5a5a7a' }}>Last updated: March 2026</p>
      <p style={pStyle}>TINYforming Mars is a free hobby project. We respect your privacy and collect as little data as possible.</p>
      <h4 style={h4Style}>What we collect</h4>
      <p style={pStyle}>
        <strong style={{ color: '#e0e0e0' }}>Firebase Anonymous Authentication:</strong> When you use the app, Firebase may create an anonymous user ID to enable game saving. This does not require any personal information. If you sign in with email, your email is stored by Firebase Authentication.
      </p>
      <p style={pStyle}>
        <strong style={{ color: '#e0e0e0' }}>Game data:</strong> Your game state is stored in Firebase Firestore. This data contains no personal information beyond gameplay choices.
      </p>
      <p style={pStyle}>
        <strong style={{ color: '#e0e0e0' }}>AI features:</strong> When the AI uses the Gemini thinking node, a game state summary is sent to Google&apos;s Gemini API. This contains only game data.
      </p>
      <h4 style={h4Style}>What we do not collect</h4>
      <p style={pStyle}>We do not use cookies for tracking, analytics tools, advertising, or sell any data to third parties.</p>
      <h4 style={h4Style}>Data deletion</h4>
      <p style={pStyle}>
        Clear your browser&apos;s local storage to remove your anonymous session, or contact us via{' '}
        <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={linkStyle}>GitHub</a>{' '}
        to request data deletion.
      </p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p style={{ ...pStyle, fontSize: '11px', color: '#5a5a7a' }}>Last updated: March 2026</p>
      <p style={pStyle}>By using TINYforming Mars, you agree to the following terms.</p>
      <h4 style={h4Style}>Nature of the service</h4>
      <p style={pStyle}>TINYforming Mars is a free, non-commercial hobby project. It is an unofficial digital adaptation of the print-and-play board game by Michael Bevilacqua. The app is provided &quot;as-is&quot; without any guarantees.</p>
      <h4 style={h4Style}>No warranty</h4>
      <p style={pStyle}>We make no warranties regarding availability, accuracy, or fitness for any purpose. Game state may be lost due to technical issues.</p>
      <h4 style={h4Style}>Intellectual property</h4>
      <p style={pStyle}>
        The original game design belongs to Michael Bevilacqua. The digital adaptation code and UI are created by{' '}
        <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={linkStyle}>Tuirk</a>.
      </p>
      <h4 style={h4Style}>Third-party services</h4>
      <p style={pStyle}>This app uses Firebase (Google) for authentication, storage, and hosting, and may use Google&apos;s Gemini API for AI features.</p>
      <h4 style={h4Style}>Contact</h4>
      <p style={pStyle}>
        For questions, open an issue on{' '}
        <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={linkStyle}>GitHub</a>.
      </p>
    </>
  );
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#151525', border: '1px solid #2a2a3e', borderRadius: '12px', maxWidth: '640px', width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #2a2a3e', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 600, color: '#e0e0e0' }}>{titles[type]}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5a5a7a', cursor: 'pointer', fontSize: '18px', padding: '0 4px', fontFamily: 'system-ui' }}>×</button>
        </div>
        <div style={{ padding: '24px', overflowY: 'auto', fontSize: '13px', fontFamily: "'Inter', system-ui, sans-serif", color: '#8a8aaa', lineHeight: 1.8 }}>
          {type === 'disclaimer' && <DisclaimerContent />}
          {type === 'privacy' && <PrivacyContent />}
          {type === 'terms' && <TermsContent />}
        </div>
      </div>
    </div>
  );
}
