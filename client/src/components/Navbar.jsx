import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  IoGridOutline,
  IoTimeOutline,
  IoBarChartOutline,
  IoLogOutOutline,
} from 'react-icons/io5';
import GradientMenu from '@/components/ui/gradient-menu';
import ThemeToggleButton from './ThemeToggleButton';
import SweetyIcon from './SweetyIcon';
import { useAuth } from '../context/AuthContext';
import { useAppTransition } from '../App';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { triggerLogoutExit } = useAppTransition();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    triggerLogoutExit(() => {
      logout();
      navigate('/login');
    });
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const navItems = [
    {
      title: 'Today',
      icon: <IoGridOutline />,
      gradientFrom: '#14b8a6',
      gradientTo: '#0f766e',
      active: location.pathname.startsWith('/dashboard'),
      onClick: () => navigate('/dashboard'),
    },
    {
      title: 'History',
      icon: <IoTimeOutline />,
      gradientFrom: '#38bdf8',
      gradientTo: '#0284c7',
      active: location.pathname.startsWith('/history'),
      onClick: () => navigate('/history'),
    },
    {
      title: 'Reports',
      icon: <IoBarChartOutline />,
      gradientFrom: '#a855f7',
      gradientTo: '#6366f1',
      active: location.pathname.startsWith('/reports'),
      onClick: () => navigate('/reports'),
    },
  ];

  const logoutItems = [
    {
      title: 'Sign out',
      icon: <IoLogOutOutline />,
      gradientFrom: '#fb7185',
      gradientTo: '#e11d48',
      active: false,
      onClick: handleLogout,
    },
  ];

  return (
    <header className="sticky top-3 z-30 px-4 sm:px-6 lg:px-8 pt-2 pb-1">
      <div className="max-w-6xl mx-auto flex justify-center">
        {/* Floating Pill-Shaped Navbar Container */}
        <nav
          aria-label="Main navigation"
          className="w-full flex items-center justify-between gap-3 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-200/90 dark:border-stone-800 shadow-card rounded-full px-3.5 py-2"
        >
          {/* Left: Brand Pill */}
          <NavLink
            to="/dashboard"
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full hover:bg-stone-100/80 dark:hover:bg-stone-800/80 transition-colors group shrink-0"
          >
            <SweetyIcon className="h-9 w-9 shrink-0 shadow-xs rounded-xl group-hover:scale-105 transition-transform" />
            <span className="font-display text-lg font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              Sweety
            </span>
          </NavLink>

          {/* Center: Expanding Gradient Pill Menu */}
          <GradientMenu items={navItems} />

          {/* Right: User Badge, Animated Theme Toggle & Expanding Gradient Sign-Out Pill */}
          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <div className="hidden md:flex items-center gap-2 bg-[#F7F6F2] dark:bg-stone-800 pl-1.5 pr-3.5 py-1.5 rounded-full border border-stone-200/80 dark:border-stone-700">
                <div className="h-6 w-6 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[11px] font-bold flex items-center justify-center">
                  {initials}
                </div>
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
            )}

            <ThemeToggleButton />

            <GradientMenu items={logoutItems} />
          </div>
        </nav>
      </div>
    </header>
  );
}
