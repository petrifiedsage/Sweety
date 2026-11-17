import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { HeartPulse, LayoutGrid, Clock, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const pillNavClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-stone-900 text-white shadow-sm'
        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
    }`;

  return (
    <header className="sticky top-0 z-30 bg-[#F7F6F2]/90 backdrop-blur-md border-b border-stone-200/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <HeartPulse className="h-4 w-4" />
            </div>
            <span className="font-display text-lg font-extrabold tracking-tight text-stone-900">
              Sweety
            </span>
          </NavLink>

          {/* Center Apple Health Style Pill Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1 bg-stone-200/70 p-1 rounded-full border border-stone-200/80"
          >
            <NavLink to="/dashboard" className={pillNavClass}>
              <LayoutGrid className="h-3.5 w-3.5" />
              Today
            </NavLink>
            <NavLink to="/history" className={pillNavClass}>
              <Clock className="h-3.5 w-3.5" />
              History
            </NavLink>
            <NavLink to="/reports" className={pillNavClass}>
              <BarChart2 className="h-3.5 w-3.5" />
              Reports
            </NavLink>
          </nav>

          {/* User Profile Pill & Sign Out */}
          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden sm:flex items-center gap-2 bg-white pl-1.5 pr-3 py-1 rounded-full border border-stone-200/80 shadow-soft">
                <div className="h-6 w-6 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold flex items-center justify-center">
                  {initials}
                </div>
                <span className="text-xs font-semibold text-stone-800 max-w-[130px] truncate">
                  {user.name}
                </span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-600 bg-white border border-stone-200/80 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors shadow-soft"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Mobile Pill Switcher */}
        <nav className="flex md:hidden items-center justify-center gap-1 bg-stone-200/70 p-1 rounded-full mb-2.5">
          <NavLink to="/dashboard" className={pillNavClass}>
            <LayoutGrid className="h-3.5 w-3.5" />
            Today
          </NavLink>
          <NavLink to="/history" className={pillNavClass}>
            <Clock className="h-3.5 w-3.5" />
            History
          </NavLink>
          <NavLink to="/reports" className={pillNavClass}>
            <BarChart2 className="h-3.5 w-3.5" />
            Reports
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
