import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggleButton({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={(e) => toggleTheme(e)}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative h-[42px] w-[42px] rounded-full flex items-center justify-center bg-[#F7F6F2] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-xs hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden cursor-pointer focus:outline-none ${className}`}
    >
      {/* Sun Icon (visible in Light mode, rotates out in Dark mode) */}
      <span
        className={`absolute inset-0 flex items-center justify-center text-amber-500 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark
            ? 'rotate-90 scale-0 opacity-0'
            : 'rotate-0 scale-100 opacity-100'
        }`}
      >
        <Sun className="h-[18px] w-[18px]" />
      </span>

      {/* Moon Icon (visible in Dark mode, rotates in from -90deg) */}
      <span
        className={`absolute inset-0 flex items-center justify-center text-teal-400 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      >
        <Moon className="h-[18px] w-[18px]" />
      </span>
    </button>
  );
}
