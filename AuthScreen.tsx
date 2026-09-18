import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, ArrowRight, Sparkles, User, Lock, Mail, AtSign, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function AuthScreen() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, quickLoginDemoUser, error, setError, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        setError('Profile picture should be under 800KB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!username.trim() || username.trim().length < 2) throw new Error('Username must be at least 2 characters');
        if (!email.trim()) throw new Error('Please enter your email');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        await registerWithEmail(name, username, email, password, photoURL || undefined);
      } else {
        if (!email.trim() || !password) throw new Error('Please enter both email and password');
        await loginWithEmail(email, password);
      }
    } catch (err: unknown) {
      console.warn('Auth error handled:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/70 rounded-2xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-3">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ChatFlow</h1>
          <p className="text-sm text-slate-400 mt-1">Telegram-inspired real-time messaging</p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/80 rounded-xl mb-5 text-sm font-medium">
          <button
            id="auth-tab-login"
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              !isRegister
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              isRegister
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              {/* Photo preview / upload */}
              <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-700/50">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center flex-shrink-0 border border-slate-600">
                  {photoURL ? (
                    <img src={photoURL} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Upload profile photo</span>
                  </label>
                  <p className="text-[11px] text-slate-400 truncate">Optional (Max 800KB)</p>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="register-input-name"
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="register-input-username"
                    type="text"
                    required
                    placeholder="alexm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="auth-input-email"
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="auth-input-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            id="auth-submit-button"
            type="submit"
            disabled={submitting || loading}
            className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
          >
            {submitting || loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Register & Enter Chat' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-slate-700 w-full" />
          <span className="bg-slate-800 px-3 text-xs text-slate-400 absolute">or continue with</span>
        </div>

        {/* Google Sign In */}
        <button
          id="auth-google-button"
          type="button"
          onClick={() => loginWithGoogle()}
          disabled={loading || submitting}
          className="w-full py-2.5 px-4 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 text-white rounded-xl font-medium text-sm transition flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.31 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.0 10.04.0 12s.46 3.8 1.27 5.42l4.01-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        {/* 1-Click Multi-User Demo Switcher for Preview Testing */}
        <div className="mt-5 pt-4 border-t border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Quick Test Accounts
            </span>
            <span className="text-[11px] text-slate-400">1-click login</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              id="demo-user-alice-btn"
              type="button"
              onClick={() => quickLoginDemoUser('alice')}
              disabled={loading || submitting}
              className="py-1.5 px-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 hover:text-white flex items-center gap-2 transition"
            >
              <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-300 font-bold flex items-center justify-center text-[11px]">
                A
              </div>
              <span className="truncate">Alice (@alice)</span>
            </button>
            <button
              id="demo-user-bob-btn"
              type="button"
              onClick={() => quickLoginDemoUser('bob')}
              disabled={loading || submitting}
              className="py-1.5 px-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-700/80 rounded-lg text-xs font-medium text-slate-200 hover:text-white flex items-center gap-2 transition"
            >
              <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 font-bold flex items-center justify-center text-[11px]">
                B
              </div>
              <span className="truncate">Bob (@bob)</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Use these to test live real-time conversations across separate tabs!
          </p>
        </div>
      </div>
    </div>
  );
}
