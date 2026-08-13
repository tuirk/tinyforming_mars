'use client';

import { useState, type FormEvent } from 'react';
import { signIn, signUp, signInWithGoogle, signInAsGuest, resetPassword } from '@/lib/firebase/auth';
import { createUserDocument } from '@/lib/firebase/user';
import { getAuthErrorMessage } from '@/lib/firebase/errors';
import { FirebaseError } from 'firebase/app';
import { GameFooter } from '@/components/shared/GameFooter';
import { LandingAtmosphere } from './LandingAtmosphere';
import { Loader2, CheckCircle } from 'lucide-react';

type Tab = 'signin' | 'signup';

export function LandingPage() {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function clearForm() { setError(''); setPassword(''); setConfirmPassword(''); setShowForgot(false); setResetSent(false); }
  function switchTab(t: Tab) { clearForm(); setTab(t); }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault(); setError(''); setLoading(true);
    try { await signIn(email, password); }
    catch (err) { setError(err instanceof FirebaseError ? getAuthErrorMessage(err.code) : 'Something went wrong.'); }
    finally { setLoading(false); }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault(); setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const result = await signUp(email, password, displayName || undefined);
      await createUserDocument(result.user);
    } catch (err) { setError(err instanceof FirebaseError ? getAuthErrorMessage(err.code) : 'Something went wrong.'); }
    finally { setLoading(false); }
  }

  async function handleGoogle() {
    setError(''); setLoading(true);
    try {
      const result = await signInWithGoogle();
      await createUserDocument(result.user);
    } catch (err) { setError(err instanceof FirebaseError ? getAuthErrorMessage(err.code) : 'Something went wrong.'); }
    finally { setLoading(false); }
  }

  async function handleGuest() {
    setError('');
    setLoading(true);
    try {
      // AuthContext creates the Firestore profile; don't double-await it here
      // or the button looks frozen while Auth + Firestore both finish.
      await signInAsGuest();
    } catch (err) {
      setError(
        err instanceof FirebaseError
          ? getAuthErrorMessage(err.code) || 'Failed to start guest session.'
          : 'Failed to start guest session.',
      );
      setLoading(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    if (!email) { setError('Enter your email first.'); return; }
    setError(''); setLoading(true);
    try { await resetPassword(email); setResetSent(true); }
    catch (err) { setError(err instanceof FirebaseError ? getAuthErrorMessage(err.code) : 'Something went wrong.'); }
    finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', background: '#0d0d1a', border: '1px solid #2a2a3e',
    borderRadius: '6px', color: '#e0e0e0', fontSize: '12px', fontFamily: "'Inter', system-ui, sans-serif",
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '11px', color: '#8a8aaa', fontFamily: "'Inter', system-ui, sans-serif",
    display: 'block', marginBottom: '4px',
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d0d1a', position: 'relative', overflow: 'hidden' }}>

      <LandingAtmosphere />

      {/* Main content — fills viewport minus footer */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 24px', gap: '60px', position: 'relative', zIndex: 1, flexWrap: 'wrap' }}>

        {/* Left: Hero */}
        <div style={{ maxWidth: '380px', flexShrink: 0 }}>
          <p style={{ fontFamily: "'Orbitron', monospace", fontSize: '11px', fontWeight: 500, color: '#E8872D', letterSpacing: '6px', marginBottom: '16px' }}>
            A DIGITAL ADAPTATION
          </p>
          <h1 style={{ margin: '0 0 4px', lineHeight: 1.1 }}>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '36px', fontWeight: 700, color: '#F0A050', letterSpacing: '2px', display: 'block' }}>TINYFORMING</span>
            <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '36px', fontWeight: 700, color: '#e0e0e0', letterSpacing: '4px', display: 'block' }}>MARS</span>
          </h1>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '14px', color: '#8a8aaa', lineHeight: 1.7, margin: '20px 0', maxWidth: '380px' }}>
            Compete against an AI opponent to terraform Mars. Place cities, manage resources, and complete projects across generations in this free adaptation of the print-and-play board game.
          </p>
          <div style={{ fontSize: '11px', fontFamily: "'Inter', system-ui, sans-serif", marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', color: '#5a5a7a', marginBottom: '12px' }}>
              <span><span style={{ color: '#E8872D' }}>●</span> Player vs AI</span>
              <span><span style={{ color: '#4CAF50' }}>●</span> Free to play</span>
            </div>
            <div style={{ display: 'inline-flex', gap: '12px', alignItems: 'center', background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: '8px', padding: '8px 14px' }}>
              <span style={{ fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: 600, color: '#E8872D', letterSpacing: '2px', textTransform: 'uppercase' }}>Coming Soon</span>
              <span style={{ width: '1px', height: '14px', background: '#2a2a3e' }} />
              <span style={{ fontSize: '10px', color: '#5a5a7a' }}>Solo mode</span>
              <span style={{ fontSize: '10px', color: '#5a5a7a' }}>·</span>
              <span style={{ fontSize: '10px', color: '#5a5a7a' }}>Play with a friend</span>
              <span style={{ fontSize: '10px', color: '#5a5a7a' }}>·</span>
              <span style={{ fontSize: '10px', color: '#5a5a7a' }}>Expansion pack</span>
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#9a9ab4', fontFamily: "'Inter', system-ui, sans-serif", lineHeight: 1.8 }}>
            <span>Based on the game by <a href="https://boardgamegeek.com/boardgame/282493/tinyforming-mars" target="_blank" rel="noopener noreferrer" style={{ color: '#E8872D', textDecoration: 'none', fontWeight: 500 }}>Michael Bevilacqua</a></span><br />
            <span>Digital adaptation by <a href="https://github.com/tuirk" target="_blank" rel="noopener noreferrer" style={{ color: '#E8872D', textDecoration: 'none', fontWeight: 500 }}>Tuirk</a></span>
          </div>
        </div>

        {/* Right: Auth Card */}
        <div style={{ width: '320px', flexShrink: 0, background: '#151525', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: '14px', fontWeight: 600, color: '#e0e0e0', margin: '0 0 4px' }}>Welcome, new Martian</h2>
          <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: '11px', color: '#5a5a7a', margin: '0 0 16px' }}>Sign in to save your progress</p>

          {/* Tab toggle */}
          <div style={{ display: 'flex', background: '#0d0d1a', borderRadius: '6px', padding: '2px', gap: '2px', marginBottom: '14px' }}>
            {(['signin', 'signup'] as Tab[]).map((t) => (
              <button key={t} onClick={() => switchTab(t)} style={{
                flex: 1, padding: '6px 0', fontSize: '11px', fontFamily: "'Inter', system-ui, sans-serif",
                color: tab === t ? '#e0e0e0' : '#5a5a7a', background: tab === t ? '#2a2a3e' : 'transparent',
                borderRadius: '4px', border: 'none', cursor: 'pointer',
              }}>
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '10px', padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: '6px' }}>{error}</p>}

          {/* Forgot password */}
          {showForgot ? (
            resetSent ? (
              <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <CheckCircle style={{ width: 32, height: 32, color: '#4CAF50', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '12px', color: '#8a8aaa' }}>Reset link sent to <strong>{email}</strong></p>
                <button onClick={() => { setShowForgot(false); setResetSent(false); }} style={{ ...inputStyle, marginTop: '10px', cursor: 'pointer', textAlign: 'center', background: '#1a1a2e' }}>Back to Sign In</button>
              </div>
            ) : (
              <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '11px', color: '#5a5a7a' }}>Enter your email for a reset link.</p>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required disabled={loading} style={inputStyle} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setShowForgot(false)} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'center', background: '#1a1a2e' }}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'center', background: '#E8872D', color: '#fff', border: 'none' }}>
                    {loading ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </form>
            )
          ) : tab === 'signin' ? (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com" required disabled={loading} style={inputStyle} autoComplete="email" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>Password</label>
                  <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: '#E8872D', fontSize: '10px', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Forgot?</button>
                </div>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} required disabled={loading} style={inputStyle} autoComplete="current-password" />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '10px', background: '#E8872D', border: 'none', borderRadius: '6px',
                color: '#fff', fontSize: '13px', fontFamily: "'Orbitron', monospace", fontWeight: 500,
                letterSpacing: '1px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'LAUNCHING...' : 'LAUNCH'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" disabled={loading} style={inputStyle} autoComplete="name" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="you@example.com" required disabled={loading} style={inputStyle} autoComplete="email" />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder="At least 8 characters" required disabled={loading} style={inputStyle} autoComplete="new-password" />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }} required disabled={loading} style={inputStyle} autoComplete="new-password" />
              </div>
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '10px', background: '#E8872D', border: 'none', borderRadius: '6px',
                color: '#fff', fontSize: '13px', fontFamily: "'Orbitron', monospace", fontWeight: 500,
                letterSpacing: '1px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
              }}>
                {loading ? 'CREATING...' : 'LAUNCH'}
              </button>
            </form>
          )}

          {/* Divider + alternatives */}
          {!showForgot && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '14px 0', color: '#3a3a5e', fontSize: '10px' }}>
                <div style={{ flex: 1, height: '1px', background: '#2a2a3e' }} />
                <span>or</span>
                <div style={{ flex: 1, height: '1px', background: '#2a2a3e' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={handleGoogle} disabled={loading} style={{ ...inputStyle, cursor: 'pointer', textAlign: 'center', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span style={{ color: '#8a8aaa' }}>Continue with Google</span>
                </button>
                <button
                  onClick={handleGuest}
                  disabled={loading}
                  style={{
                    ...inputStyle,
                    cursor: loading ? 'wait' : 'pointer',
                    textAlign: 'center',
                    background: '#1a1a2e',
                    color: '#E8872D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Launching guest…
                    </>
                  ) : (
                    '+ Play as guest'
                  )}
                </button>
              </div>
              <p style={{ fontSize: '10px', color: '#3a3a5e', textAlign: 'center', marginTop: '10px' }}>No account needed to play</p>
            </>
          )}
        </div>
      </div>

      <GameFooter />
    </div>
  );
}
