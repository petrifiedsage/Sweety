import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthTransition } from '../components/AuthLayout';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_CAPITAL_REGEX = /[A-Z]/;
const HAS_NUMBER_REGEX = /[0-9]/;

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { triggerLoginExit } = useAuthTransition();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    if (!HAS_CAPITAL_REGEX.test(password) || !HAS_NUMBER_REGEX.test(password)) {
      setError('Password must contain at least one capital letter and one number.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      triggerLoginExit(() => {
        navigate('/dashboard', { replace: true });
      });
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  }

  return (
    <>
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
          Get Started
        </span>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-stone-900">
          Create your account
        </h1>
      </div>

      <div className="my-auto py-1">
        {error && (
          <div
            role="alert"
            className="mb-3 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
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
              className="mt-1 block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 px-4 py-2.5 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
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
              className="mt-1 block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 px-4 py-2.5 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 1 capital letter & 1 number"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Retype password
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="block w-full rounded-2xl border border-stone-300 bg-[#F7F6F2]/60 pl-4 pr-11 py-2.5 text-sm font-medium text-stone-900 placeholder-stone-400 focus:bg-white focus:border-teal-600 focus:outline-none focus:ring-4 focus:ring-teal-600/15 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? 'Hide retyped password' : 'Show retyped password'
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-stone-700 transition-colors"
              >
                {showConfirmPassword ? (
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
            <span>{submitting ? 'Creating account...' : 'Register'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-stone-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-teal-700 hover:text-teal-800">
          Sign in
        </Link>
      </p>
    </>
  );
}
