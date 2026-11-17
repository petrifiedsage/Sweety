import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, History, BarChart3, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-teal-50 text-teal-700'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <NavLink to="/dashboard" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">Sweety</span>
                <span className="hidden sm:inline-block ml-2 text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  Glucose Tracker
                </span>
              </div>
            </NavLink>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>
              <NavLink to="/history" className={navLinkClass}>
                <History className="h-4 w-4" />
                Reading History
              </NavLink>
              <NavLink to="/reports" className={navLinkClass}>
                <BarChart3 className="h-4 w-4" />
                Reports
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <User className="h-4 w-4 text-teal-600" />
                <span className="font-medium text-slate-800">{user.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="flex md:hidden items-center gap-1 pb-3 overflow-x-auto">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/history" className={navLinkClass}>
            <History className="h-4 w-4" />
            History
          </NavLink>
          <NavLink to="/reports" className={navLinkClass}>
            <BarChart3 className="h-4 w-4" />
            Reports
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
