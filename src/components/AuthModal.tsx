import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup' | 'instagram';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onSuccess,
}) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, loginWithInstagram } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'instagram'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [instagramPassword, setInstagramPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Listen for OAuth postMessage events (for Instagram popup callback)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        if (event.data?.provider === 'instagram') {
          // If code is returned, sign in user or close modal with success
          onClose();
          if (onSuccess) onSuccess();
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onClose, onSuccess]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signupWithEmail(email.trim(), password, name.trim());
      } else if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else if (mode === 'instagram') {
        if (!instagramHandle.trim()) {
          throw new Error('Please enter your Instagram username or handle');
        }
        if (!instagramPassword || instagramPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await loginWithInstagram(instagramHandle.trim(), instagramPassword);
      }
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      let msg = err.message || 'Authentication failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        msg = 'Invalid credentials. Please verify your email/handle and password.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Please log in.';
      } else if (msg.includes('auth/weak-password')) {
        msg = 'Password should be at least 6 characters.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      setError(msg);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      setLoading(false);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Google sign-in failed');
    }
  };

  const handleInstagramPopup = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithInstagram();
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Could not open Instagram sign in');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 relative max-h-[92vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>

        {/* Branding header */}
        <div className="flex flex-col items-center text-center pt-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-2">
            <span className="material-symbols-outlined text-[26px]">luggage</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Trip<span className="text-blue-600">Swipe</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === 'instagram'
              ? 'Sign in using your Instagram travel credentials'
              : mode === 'signup'
              ? 'Create your free account to sync packing lists across devices'
              : 'Sign in to access your saved trips and encrypted travel wallet'}
          </p>
        </div>

        {/* 1-Tap Social Credentials (Google & Instagram) */}
        <div className="flex flex-col gap-2 pt-1">
          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-11 rounded-full bg-white border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2.5 hover:bg-slate-50 active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Instagram Sign-in Button */}
          <button
            type="button"
            onClick={() => {
              setMode('instagram');
              setError(null);
            }}
            disabled={loading}
            className="w-full h-11 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
          >
            {/* Instagram Camera SVG Icon */}
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
            <span>Sign in with Instagram</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-0.5">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold absolute">
            or with email / handle
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('instagram');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'instagram' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Instagram ID
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] text-red-600 flex-shrink-0 mt-0.5">
              error
            </span>
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Forms */}
        {mode === 'instagram' ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="p-2.5 rounded-xl bg-pink-50/70 border border-pink-100 text-[11px] text-pink-900 leading-snug flex items-center gap-2">
              <span className="material-symbols-outlined text-pink-600 text-[18px]">photo_camera</span>
              <span>Connect your Instagram handle to import your travel persona & trip spots.</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Instagram Handle / Username</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  required
                  placeholder="username (e.g. wanderer.india)"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                  className="w-full h-11 pl-8 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Password / Travel PIN</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={instagramPassword}
                  onChange={(e) => setInstagramPassword(e.target.value)}
                  className="w-full h-11 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-1 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <>
                  <span>Sign In as @{instagramHandle || 'Instagrammer'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                  mail
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-1 rounded-full bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Free Account' : 'Sign In'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Guest Mode Dismissal */}
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-800 underline text-center pt-1 cursor-pointer"
        >
          Explore without account (Guest Mode)
        </button>
      </div>
    </div>
  );
};
