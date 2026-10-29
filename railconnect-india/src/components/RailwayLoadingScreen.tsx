import React, { useState, useEffect } from 'react';

interface RailwayLoadingScreenProps {
  onComplete: () => void;
}

export const RailwayLoadingScreen: React.FC<RailwayLoadingScreenProps> = ({ onComplete }) => {
  const [signal, setSignal] = useState<'red' | 'yellow' | 'green'>('red');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase 1: Red signal
    const t1 = setTimeout(() => {
      setSignal('yellow');
    }, 700);

    // Phase 2: Green signal
    const t2 = setTimeout(() => {
      setSignal('green');
    }, 1400);

    // Progress counter
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 4;
      });
    }, 60);

    // Complete loading after sequence
    const t3 = setTimeout(() => {
      onComplete();
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(interval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      {/* 3D Track & Train Animation */}
      <div className="w-full max-w-md relative mb-8">
        {/* Track Line */}
        <div className="w-full h-1 bg-slate-800 rounded-full relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Gliding Train Icon */}
        <div
          className="absolute -top-6 text-2xl transition-all duration-200"
          style={{ left: `calc(${progress}% - 16px)` }}
        >
          🚆
        </div>
      </div>

      {/* Railway Signal Lights */}
      <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-700/80 px-6 py-3 rounded-2xl shadow-xl mb-6">
        {/* Red Light */}
        <div
          className={`w-4 h-4 rounded-full transition-all duration-300 ${
            signal === 'red'
              ? 'bg-rose-500 shadow-lg shadow-rose-500/80 scale-125'
              : 'bg-rose-950/60'
          }`}
        />
        {/* Yellow Light */}
        <div
          className={`w-4 h-4 rounded-full transition-all duration-300 ${
            signal === 'yellow'
              ? 'bg-amber-400 shadow-lg shadow-amber-400/80 scale-125'
              : 'bg-amber-950/60'
          }`}
        />
        {/* Green Light */}
        <div
          className={`w-4 h-4 rounded-full transition-all duration-300 ${
            signal === 'green'
              ? 'bg-emerald-400 shadow-lg shadow-emerald-400/80 scale-125'
              : 'bg-emerald-950/60'
          }`}
        />
      </div>

      <h2 className="font-hud font-bold text-xl md:text-2xl text-white tracking-wider mb-2">
        RAILCONNECT INDIA
      </h2>

      <p className="font-hud text-xs text-cyan-400 tracking-widest uppercase animate-pulse">
        Preparing Your Journey • Initializing 3D Telemetry... ({progress}%)
      </p>
    </div>
  );
};
