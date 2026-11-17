import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-[32px] border border-stone-200/90 shadow-card overflow-hidden">
        {/* Left Wellness Highlights Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-teal-800 via-teal-900 to-stone-900 text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-white">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight">Sweety</span>
            </div>

            <h2 className="mt-8 font-display text-3xl font-extrabold leading-tight">
              Build your personal glucose logbook.
            </h2>
            <p className="mt-3 text-sm text-teal-100/90 leading-relaxed">
              Designed for simplicity and clinical clarity—so you can focus on your daily habits.
            </p>

            <ul className="mt-8 space-y-4 text-sm">
              {[
                'Four structured daily meal-slot check-ins',
                'Automatic validation to prevent duplicate or out-of-range entries',
                'Instant Daily, Month-to-Date, and Monthly reports',
                'Visual Time-in-Range and trend analytics',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-teal-300 shrink-0 mt-0.5" />
                  <span className="text-stone-100 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 text-xs text-teal-200/70">
            Protected with bcrypt password hashing &amp; JWT session isolation.
          </p>
        </div>

        {/* Right Registration Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Get Started
            </span>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Start recording and tracking your daily blood glucose measurements.
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
                htmlFor="name"
                className="block text-xs font-bold uppercase tracking-wider text-stone-500"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-2 block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 px-4 py-3 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
              />
            </div>

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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                className="mt-2 block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 px-4 py-3 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex justify-center items-center gap-2 py-3 px-5 rounded-full text-sm font-bold text-white bg-stone-900 hover:bg-teal-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <span>{submitting ? 'Creating account...' : 'Register'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-teal-700 hover:text-teal-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
