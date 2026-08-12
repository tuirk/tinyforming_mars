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
const strongStyle: React.CSSProperties = { color: '#e0e0e0' };
const metaStyle: React.CSSProperties = { ...pStyle, fontSize: '11px', color: '#5a5a7a' };

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
        connected to Michael Bevilacqua, FryxGames, Stronghold Games, or any publisher of Terraforming Mars
        or TINYforming Mars. Created out of love for the original game, for personal and community enjoyment.
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
      <p style={pStyle}>
        This project is provided as-is, free of charge, with no warranties of any kind. Digital rules
        implementations may contain errors; the physical print-and-play rulebook is the authority for the original game.
      </p>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <p style={metaStyle}>Last updated: August 2026</p>
      <p style={pStyle}>
        TINYforming Mars (&quot;we&quot;, &quot;the app&quot;) is a free hobby project. This policy explains what data
        is collected when you use the site, how it is used, and how to request deletion. It is not legal advice.
      </p>

      <h4 style={h4Style}>Who processes your data</h4>
      <p style={pStyle}>
        The app is operated by{' '}
        <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={linkStyle}>Tuirk</a>.
        Authentication, database, and hosting run on <strong style={strongStyle}>Google Firebase</strong>.
        Optional AI features use <strong style={strongStyle}>Google&apos;s Gemini API</strong>.
        Google processes data under its own terms and privacy policy as a service provider / processor for those services.
      </p>

      <h4 style={h4Style}>What we collect</h4>
      <p style={pStyle}>
        <strong style={strongStyle}>Guest (anonymous) sign-in:</strong> If you choose &quot;Play as guest&quot;,
        Firebase Authentication creates an anonymous user ID. No email or name is required. The session is stored
        in your browser so you stay signed in across visits until you sign out or clear site data.
      </p>
      <p style={pStyle}>
        <strong style={strongStyle}>Email / password:</strong> If you register or sign in with email, Firebase
        stores your email address and an encrypted password hash (we never see your password). An optional
        display name you provide is stored in your profile.
      </p>
      <p style={pStyle}>
        <strong style={strongStyle}>Google sign-in:</strong> If you sign in with Google, we receive your Google
        account UID and, if Google provides them, email, display name, and profile photo URL. We store these in
        Firebase Authentication and your Firestore user profile.
      </p>
      <p style={pStyle}>
        <strong style={strongStyle}>Game &amp; profile data:</strong> Game state, win/loss stats, and tutorial
        progress may be stored in Firebase Firestore under your user ID. This is gameplay and account metadata,
        not payment or location data.
      </p>
      <p style={pStyle}>
        <strong style={strongStyle}>Local device storage:</strong> The app may store preferences in your browser
        (for example AI difficulty mode and tutorial progress) via <code style={{ color: '#c0c0d0' }}>localStorage</code>.
        Firebase Auth also keeps a session token in browser storage.
      </p>
      <p style={pStyle}>
        <strong style={strongStyle}>AI features (Gemini):</strong> If you select the Gemini AI mode, a game-state
        summary and candidate moves are sent to Google&apos;s Gemini API to choose a move. Do not put personal or
        sensitive information into gameplay that would be included in that summary. On Google&apos;s unpaid /
        free Gemini API tiers, Google may use API inputs and outputs to improve Google products and services,
        and human reviewers may review disconnected samples — see the{' '}
        <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Gemini API Additional Terms
        </a>.
      </p>

      <h4 style={h4Style}>What we do not collect</h4>
      <p style={pStyle}>
        We do not run advertising SDKs, do not sell personal data, and do not use Google Analytics for Firebase
        in this app. We do not intentionally collect precise location, contacts, or payment card data.
      </p>

      <h4 style={h4Style}>Cookies &amp; similar tech</h4>
      <p style={pStyle}>
        We do not set advertising or analytics cookies. Essential browser storage is used for authentication
        session and optional UI preferences as described above. Third-party hosts (Firebase / Google) may set
        their own technical cookies or storage as part of providing those services.
      </p>

      <h4 style={h4Style}>Why we use this data</h4>
      <p style={pStyle}>
        To sign you in, save games and stats, remember preferences, operate the AI opponent, host the app,
        and secure the service (abuse prevention). We do not use your data for ads.
      </p>

      <h4 style={h4Style}>Retention</h4>
      <p style={pStyle}>
        Account and game data are kept while your account exists. Guest accounts may be removed if you clear
        browser data (you lose access to that anonymous ID) or if Firebase automatic clean-up is enabled for
        inactive anonymous accounts (typically after about 30 days when that console setting is on).
        Signed-in account data remains until you request deletion or delete the account path we support.
      </p>

      <h4 style={h4Style}>Sharing</h4>
      <p style={pStyle}>
        We share data with Google only as needed to run Firebase and Gemini. We do not sell your data.
        See{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Google Privacy Policy
        </a>
        {' '}and{' '}
        <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Firebase privacy &amp; security
        </a>.
      </p>

      <h4 style={h4Style}>Your choices &amp; deletion</h4>
      <p style={pStyle}>
        Sign out from the dashboard to end the active session. To remove a guest session, sign out and clear
        this site&apos;s data in your browser settings. To request deletion of a registered account&apos;s
        Firestore profile and related game documents, contact us via{' '}
        <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={linkStyle}>GitHub</a>
        {' '}with the email associated with the account. We will delete data we control; Google may retain
        logs per its own policies.
      </p>

      <h4 style={h4Style}>Children</h4>
      <p style={pStyle}>
        The app is a general-audience hobby game. It is not directed at children under 13, and we do not
        knowingly collect personal information from children under 13. If you believe a child provided data,
        contact us via GitHub so we can delete it.
      </p>

      <h4 style={h4Style}>International users</h4>
      <p style={pStyle}>
        Data may be processed on Google infrastructure in the United States or other countries. If you use
        the app from the EEA/UK, Google&apos;s data processing terms for Firebase generally apply between
        Google and the developer for covered services.
      </p>

      <h4 style={h4Style}>Changes</h4>
      <p style={pStyle}>
        We may update this policy as the app changes. The &quot;Last updated&quot; date above will change when we do.
        Continued use after an update means you acknowledge the revised policy.
      </p>

      <h4 style={h4Style}>Contact</h4>
      <p style={pStyle}>
        Questions or deletion requests:{' '}
        <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={linkStyle}>github.com/tuirk</a>.
      </p>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p style={metaStyle}>Last updated: August 2026</p>
      <p style={pStyle}>
        By accessing or using TINYforming Mars, you agree to these Terms of use and our Privacy policy.
        If you do not agree, do not use the app.
      </p>

      <h4 style={h4Style}>Nature of the service</h4>
      <p style={pStyle}>
        TINYforming Mars is a free, non-commercial hobby project: an unofficial digital adaptation of the
        print-and-play board game by Michael Bevilacqua. Features may change, break, or be withdrawn at any time.
        There is no paid subscription and no guarantee of uptime.
      </p>

      <h4 style={h4Style}>Accounts</h4>
      <p style={pStyle}>
        You may play as a guest (anonymous Firebase account), with email/password, or with Google.
        You are responsible for activity under your account. Guest progress is tied to the browser session
        identity and can be lost if you clear site data. Do not create accounts for others without permission.
      </p>

      <h4 style={h4Style}>Acceptable use</h4>
      <p style={pStyle}>
        Use the app only for lawful personal play. Do not attempt to disrupt the service, abuse APIs,
        scrape or attack infrastructure, harass others, or use AI features in ways that violate Google&apos;s{' '}
        <a href="https://policies.google.com/terms/generative-ai/use-policy" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Generative AI Prohibited Use Policy
        </a>.
      </p>

      <h4 style={h4Style}>No warranty</h4>
      <p style={pStyle}>
        THE APP IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
        express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
        We do not warrant that rules logic is error-free, that games will be saved, or that AI play is fair or available.
      </p>

      <h4 style={h4Style}>Limitation of liability</h4>
      <p style={pStyle}>
        To the maximum extent permitted by law, the operator is not liable for any indirect, incidental,
        special, consequential, or lost-data damages arising from use of the app. Because the service is free,
        our total liability for any claim relating to the app is limited to zero (US$0) or the minimum
        amount required by applicable law.
      </p>

      <h4 style={h4Style}>Intellectual property</h4>
      <p style={pStyle}>
        The original TINYforming Mars game design belongs to Michael Bevilacqua. Terraforming Mars and related
        marks belong to their respective owners. The digital adaptation code and UI are created by{' '}
        <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={linkStyle}>Tuirk</a>.
        You may not claim the project as official or commercially redistribute the app without permission.
      </p>

      <h4 style={h4Style}>Third-party services</h4>
      <p style={pStyle}>
        The app uses Firebase (Authentication, Firestore, hosting) and may use Google&apos;s Gemini API for
        optional AI. Your use of those services is also subject to Google&apos;s applicable terms, including
        the{' '}
        <a href="https://firebase.google.com/terms" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Firebase Terms
        </a>
        {' '}and{' '}
        <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          Gemini API Additional Terms
        </a>.
      </p>

      <h4 style={h4Style}>Termination</h4>
      <p style={pStyle}>
        We may suspend or remove access (including disabling accounts) if these terms are violated or if
        the project is shut down. You may stop using the app at any time and request data deletion as described
        in the Privacy policy.
      </p>

      <h4 style={h4Style}>Changes</h4>
      <p style={pStyle}>
        We may update these terms. The &quot;Last updated&quot; date will change when we do. Continued use
        after changes constitutes acceptance of the updated terms.
      </p>

      <h4 style={h4Style}>Contact</h4>
      <p style={pStyle}>
        For questions, open an issue or message via{' '}
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
