import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PremiumLoading() {
  const [progress, setProgress] = useState(0);
  const [showNewYear, setShowNewYear] = useState(false);
  
  useEffect(() => {
    // Check if current date is before Jan 10, 2026
    const now = new Date();
    const cutoffDate = new Date('2026-01-10');
    setShowNewYear(now < cutoffDate);
  }, []);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 600); // 60000ms / 100 steps = 600ms per step (1 minute total)
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-violet-500/10 via-fuchsia-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 3}s`
          }}
        />
      ))}

      {/* Main loading card */}
      <div className="relative z-10 flex flex-col items-center gap-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-16 py-12 shadow-2xl">
        {/* Happy New Year Splash */}
        {showNewYear && (
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl blur-xl opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-bold text-xl px-8 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                <span className="text-2xl animate-spin" style={{animationDuration: '3s'}}>🎉</span>
                <span>Happy New Year 2026!</span>
                <span className="text-2xl animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}}>✨</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Logo/Icon area with glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-fuchsia-500 shadow-lg">
            <Loader2 className="h-10 w-10 text-white animate-spin" style={{animationDuration: '1.5s'}} />
          </div>
        </div>

        {/* Loading text */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-fuchsia-200 bg-clip-text text-transparent">
            Loading your workspace
          </h2>
          <p className="text-sm text-slate-400">Setting up your environment...</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 rounded-full transition-all duration-300 ease-out shadow-lg shadow-purple-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
    </div>
  );
}