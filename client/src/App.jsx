import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useOutlet,
} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/AuthLayout';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import ReportsPage from './pages/ReportsPage';

const AppTransitionContext = createContext({
  triggerLogoutExit: (cb) => cb(),
});

export function useAppTransition() {
  return useContext(AppTransitionContext);
}

function AuthenticatedLayout() {
  const location = useLocation();
  const currentOutlet = useOutlet();

  const [displayedOutlet, setDisplayedOutlet] = useState(currentOutlet);
  const [displayedPath, setDisplayedPath] = useState(location.pathname);
  const [tabPhase, setTabPhase] = useState('visible'); // 'visible' | 'fading-out'
  const [layoutExiting, setLayoutExiting] = useState(false);

  // Fade out old tab content, swap outlet, and fade in new tab content
  useEffect(() => {
    if (location.pathname !== displayedPath) {
      setTabPhase('fading-out');
      const timer = setTimeout(() => {
        setDisplayedOutlet(currentOutlet);
        setDisplayedPath(location.pathname);
        setTabPhase('visible');
      }, 170);
      return () => clearTimeout(timer);
    } else {
      setDisplayedOutlet(currentOutlet);
    }
  }, [location.pathname, displayedPath, currentOutlet]);

  function triggerLogoutExit(callback) {
    setLayoutExiting(true);
    setTimeout(() => {
      callback();
    }, 220);
  }

  const isDashboard = displayedPath.startsWith('/dashboard');

  return (
    <AppTransitionContext.Provider value={{ triggerLogoutExit }}>
      <div
        className={`min-h-screen bg-[#F7F6F2] dark:bg-stone-950 flex flex-col animate-fade-in transition-all duration-220 ease-out ${
          isDashboard ? 'lg:h-screen lg:overflow-hidden' : 'pb-10'
        } ${layoutExiting ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'}`}
      >
        <Navbar />
        <div
          className={`flex-1 flex flex-col min-h-0 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            tabPhase === 'fading-out'
              ? 'opacity-0 translate-y-1.5'
              : 'opacity-100 translate-y-0'
          }`}
        >
          {displayedOutlet}
        </div>
      </div>
    </AppTransitionContext.Provider>
  );
}

function ThemedToastContainer() {
  const { isDark } = useTheme();
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme={isDark ? 'dark' : 'light'}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ThemedToastContainer />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
