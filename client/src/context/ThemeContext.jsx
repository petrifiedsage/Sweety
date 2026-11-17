import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('sweety_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore storage errors
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('sweety_theme', theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  function toggleTheme(event) {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Add temporary class for smooth color/surface transition across all elements
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 550);

    // If browser supports View Transitions API and click coordinates are available, animate circular reveal
    if (
      typeof document !== 'undefined' &&
      typeof document.startViewTransition === 'function' &&
      event?.clientX !== undefined &&
      event?.clientY !== undefined
    ) {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      root.style.setProperty('--theme-Origin-X', `${x}px`);
      root.style.setProperty('--theme-Origin-Y', `${y}px`);
      root.style.setProperty('--theme-End-Radius', `${endRadius}px`);

      document.startViewTransition(() => {
        if (nextTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        setTheme(nextTheme);
      });
      return;
    }

    setTheme(nextTheme);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
