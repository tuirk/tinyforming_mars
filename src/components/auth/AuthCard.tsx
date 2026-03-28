'use client';

import { useState, type FormEvent } from 'react';
import { signIn, signUp, signInWithGoogle, resetPassword } from '@/lib/firebase/auth';
import { createUserDocument } from '@/lib/firebase/user';
import { getAuthErrorMessage } from '@/lib/firebase/errors';
import { FirebaseError } from 'firebase/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Loader2 } from 'lucide-react';

type Tab = 'signin' | 'signup';

export function AuthCard() {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function clearForm() {
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowForgot(false);
    setResetSent(false);
  }

  function switchTab(t: Tab) {
    clearForm();
    setTab(t);
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof FirebaseError ? getAuthErrorMessage(err.code) : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email, password, displayName || undefined);
      await createUserDocument(result.user);
    } catch (err) {
      setError(err instanceof FirebaseError ? getAuthErrorMessage(err.code) : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      await createUserDocument(result.user);
    } catch (err) {
      if (err instanceof FirebaseError) {
        const msg = getAuthErrorMessage(err.code);
        if (msg) setError(msg);
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      setError(err instanceof FirebaseError ? getAuthErrorMessage(err.code) : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="font-heading text-2xl font-bold">TINYforming Mars</h1>
          <p className="text-sm text-muted-foreground">
            {tab === 'signin' ? 'Sign in to play' : 'Create an account to play'}
          </p>
        </CardHeader>
        <CardContent>
          {/* Tab toggle */}
          <div className="mb-4 flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 'signin'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Forgot password inline */}
          {showForgot ? (
            resetSent ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
                <p className="text-center text-sm text-muted-foreground">
                  If an account exists for <strong>{email}</strong>, we&apos;ve sent a reset link.
                </p>
                <Button variant="outline" size="sm" onClick={() => { setShowForgot(false); setResetSent(false); }}>
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive a password reset link.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForgot(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                  </Button>
                </div>
              </form>
            )
          ) : tab === 'signin' ? (
            /* Sign In form */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setShowForgot(true); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          ) : (
            /* Sign Up form */
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Google sign-in — always visible unless in forgot flow */}
          {!showForgot && (
            <>
              <div className="relative my-6">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or
                </span>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogle}
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </Button>
            </>
          )}
        </CardContent>
        {!showForgot && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {tab === 'signin' ? (
                <>Don&apos;t have an account?{' '}
                  <button type="button" onClick={() => switchTab('signup')} className="font-medium text-foreground hover:underline">
                    Sign Up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => switchTab('signin')} className="font-medium text-foreground hover:underline">
                    Sign In
                  </button>
                </>
              )}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
