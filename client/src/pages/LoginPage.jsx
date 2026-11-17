import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HeartPulse,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Sunrise,
  Coffee,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Unable to sign in. Please check your credentials.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleInstantDemoLogin() {
    setEmail('demo@sweety.test');
    setPassword('Demo@1234');
    setError('');
    setSubmitting(true);
    try {
      await login({ email: 'demo@sweety.test', password: 'Demo@1234' });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Demo account not seeded yet. Run `npm run seed --prefix server` or register a new account.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[32px] border border-stone-200/90 shadow-card overflow-hidden">
        {/* Left Wellness Showcase Panel */}
        <div className="lg:col-span-6 bg-gradient-to-br from-stone-900 via-stone-900 to-teal-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-sm">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight">Sweety</span>
            </div>

            <h2 className="mt-8 font-display text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
              Calm, structured daily glucose tracking.
            </h2>
            <p className="mt-3 text-sm text-stone-300 leading-relaxed max-w-md">
              Monitor your four daily meal-related check-ins and uncover meaningful trends with
              daily, month-to-date, and monthly insights.
            </p>
          </div>

          {/* Mini Apple Health Preview Card */}
          <div className="my-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                  Daily Target Summary
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-extrabold text-white">118.5</span>
                  <span className="text-xs font-semibold text-stone-300">mg/dL avg</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full">
                <CheckCircle2 className="h-3.5 w-3.5" />
                4/4 Logged
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-2.5">
                <Sunrise className="h-4 w-4 text-amber-300 shrink-0" />
                <div>
                  <p className="text-stone-300 text-[11px]">Morning</p>
                  <p className="font-bold text-white">95 mg/dL</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-2.5">
                <Coffee className="h-4 w-4 text-sky-300 shrink-0" />
                <div>
                  <p className="text-stone-300 text-[11px]">Breakfast</p>
                  <p className="font-bold text-white">120 mg/dL</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-2.5">
                <Sun className="h-4 w-4 text-teal-300 shrink-0" />
                <div>
                  <p className="text-stone-300 text-[11px]">After Lunch</p>
                  <p className="font-bold text-white">144 mg/dL</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-3 flex items-center gap-2.5">
                <Moon className="h-4 w-4 text-indigo-300 shrink-0" />
                <div>
                  <p className="text-stone-300 text-[11px]">After Dinner</p>
                  <p className="font-bold text-white">115 mg/dL</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-400 flex items-center justify-between">
            <span>Target Range: 70–140 mg/dL</span>
            <span>Private &amp; Isolated Account Data</span>
          </div>
        </div>

        {/* Right Sign-In Form Panel */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Welcome Back
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
              Sign in to your account
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Enter your credentials below or launch the pre-seeded demo account.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-sm font-medium text-rose-700"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-stone-500"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 px-4 py-3 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-stone-500"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2 block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 px-4 py-3 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex justify-center items-center gap-2 py-3 px-5 rounded-full text-sm font-bold text-white bg-stone-900 hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <span>{submitting ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* One-Click Demo Sign In */}
          <div className="mt-6 pt-6 border-t border-stone-100">
            <button
              type="button"
              disabled={submitting}
              onClick={handleInstantDemoLogin}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200/90 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              One-Click Demo Login (demo@sweety.test)
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-stone-500">
            New to Sweety?{' '}
            <Link to="/register" className="font-bold text-teal-700 hover:text-teal-800">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
