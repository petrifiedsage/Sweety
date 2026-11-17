import React, { useState, useEffect, createContext, useContext } from 'react';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import {
  HeartPulse,
  CheckCircle2,
  Sunrise,
  Coffee,
  Sun,
  Moon,
} from 'lucide-react';

const AuthTransitionContext = createContext({
  switchAuthPage: () => {},
  triggerLoginExit: async () => {},
});

export function useAuthTransition() {
  return useContext(AuthTransitionContext);
}

export default function AuthLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOutlet = useOutlet();

  const [displayedOutlet, setDisplayedOutlet] = useState(currentOutlet);
  const [displayedPath, setDisplayedPath] = useState(location.pathname);
  const [rightCardPhase, setRightCardPhase] = useState('visible'); // 'visible' | 'fading-out'
  const [pageExiting, setPageExiting] = useState(false);

  // Coordinate fade-out then fade-in of ONLY the right card when route changes between /login and /register
  useEffect(() => {
    if (location.pathname !== displayedPath) {
      setRightCardPhase('fading-out');
      const timer = setTimeout(() => {
        setDisplayedOutlet(currentOutlet);
        setDisplayedPath(location.pathname);
        setRightCardPhase('visible');
      }, 180);
      return () => clearTimeout(timer);
    } else {
      setDisplayedOutlet(currentOutlet);
    }
  }, [location.pathname, displayedPath, currentOutlet]);

  function switchAuthPage(targetPath) {
    if (targetPath === location.pathname) return;
    navigate(targetPath);
  }

  function triggerLoginExit(callback) {
    setPageExiting(true);
    setTimeout(() => {
      callback();
    }, 220);
  }

  return (
    <AuthTransitionContext.Provider value={{ switchAuthPage, triggerLoginExit }}>
      <div
        className={`min-h-screen bg-[#F7F6F2] flex items-center justify-center p-4 sm:p-6 transition-all duration-250 ease-out animate-fade-in ${
          pageExiting ? 'opacity-0 scale-[0.985]' : 'opacity-100 scale-100'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 w-full max-w-5xl">
          {/* Persistent Left Wellness Showcase Card (Shared across /login and /register) */}
          <div className="hidden lg:flex w-full max-w-[460px] h-[620px] rounded-[32px] bg-gradient-to-br from-stone-900 via-stone-900 to-teal-950 text-white p-9 flex-col justify-between shadow-card">
            <div>
              <div className="inline-flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-teal-500 flex items-center justify-center text-white shadow-sm">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span className="font-display text-xl font-extrabold tracking-tight">
                  Sweety
                </span>
              </div>

              <h2 className="mt-8 font-display text-3xl font-extrabold leading-tight tracking-tight">
                Calm, structured daily glucose tracking.
              </h2>
            </div>

            {/* Mini Apple Health Preview Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/15 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
                    Daily Target Summary
                  </span>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="font-display text-3xl font-extrabold text-white">
                      122.5
                    </span>
                    <span className="text-xs font-semibold text-stone-300">
                      mg/dL avg
                    </span>
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
                    <p className="font-bold text-white">160 mg/dL</p>
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
          </div>

          {/* Right Form Card — Fades out and in smoothly when switching between /login and /register */}
          <div
            className={`w-full max-w-[460px] h-[620px] bg-white rounded-[32px] border border-stone-200/90 shadow-card p-8 sm:p-10 flex flex-col justify-between transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              rightCardPhase === 'fading-out'
                ? 'opacity-0 translate-y-1.5 scale-[0.985]'
                : 'opacity-100 translate-y-0 scale-100'
            }`}
          >
            {displayedOutlet}
          </div>
        </div>
      </div>
    </AuthTransitionContext.Provider>
  );
}
