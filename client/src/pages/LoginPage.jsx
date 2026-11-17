import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthTransition } from '../components/AuthLayout';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { triggerLoginExit } = useAuthTransition();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      triggerLoginExit(() => {
        navigate('/dashboard', { replace: true });
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Unable to sign in. Please check your credentials.';
      setError(msg);
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
      triggerLoginExit(() => {
        navigate('/dashboard', { replace: true });
      });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Demo account not seeded yet. Run `npm run seed --prefix server` or register a new account.'
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
          Welcome Back
        </span>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
          Sign in to your account
        </h1>
      </div>

      <div className="my-auto py-2">
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-medium text-rose-700"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
              className="mt-1.5 block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 px-4 py-2.5 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 pl-4 pr-11 py-2.5 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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
        <div className="mt-4 pt-4 border-t border-stone-100">
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
      </div>

      <p className="text-center text-sm text-stone-500">
        New to Sweety?{' '}
        <Link to="/register" className="font-bold text-teal-700 hover:text-teal-800">
          Create an account
        </Link>
      </p>
    </>
  );
}
