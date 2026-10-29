import React from 'react';
import { PerformanceMode, ThemeMode } from '../types';
import { sound } from '../services/sound';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  performanceMode: PerformanceMode;
  setPerformanceMode: (mode: PerformanceMode) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onOpenDemoCenter: () => void;
  unreadAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  performanceMode,
  setPerformanceMode,
  themeMode,
  setThemeMode,
  soundEnabled,
  toggleSound,
  onOpenDemoCenter,
  unreadAlertCount,
}) => {
  const navItems = [
    { id: 'search', label: 'Trains & Search' },
    { id: 'coach3d', label: '3D Coach & Seats' },
    { id: 'live', label: 'Live 3D Telemetry' },
    { id: 'prebook', label: 'Smart Pre-Book' },
    { id: 'waitinglist', label: 'Waiting List' },
    { id: 'dashboard', label: 'My Bookings' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 border-b border-cyan-500/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => {
            sound.playClick(900);
            setActiveTab('search');
          }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white text-xl shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            🚆
          </div>
          <div>
            <div className="font-hud font-bold text-base md:text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 tracking-wider">
              RAILCONNECT INDIA
            </div>
            <div className="text-[10px] text-cyan-400/80 font-mono-rail uppercase tracking-widest hidden sm:block">
              3D RESERVATION SYSTEM
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick(800);
                setActiveTab(item.id);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-hud transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Graphics Quality */}
          <div className="hidden sm:flex items-center rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-[10px] font-hud">
            {(['performance', 'balanced', 'high'] as PerformanceMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  sound.playClick(750);
                  setPerformanceMode(mode);
                }}
                className={`px-2 py-1 rounded capitalize transition-all cursor-pointer ${
                  performanceMode === mode
                    ? 'bg-cyan-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Graphics mode: ${mode}`}
              >
                {mode === 'performance' ? 'Perf' : mode === 'balanced' ? 'Bal' : 'High'}
              </button>
            ))}
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Day / Night Theme */}
          <button
            onClick={() => {
              sound.playClick(850);
              setThemeMode(themeMode === 'dark' ? 'day' : 'dark');
            }}
            className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 flex items-center justify-center text-xs cursor-pointer"
            title={`Switch to ${themeMode === 'dark' ? 'Day' : 'Night'} Mode`}
          >
            {themeMode === 'dark' ? '🌙' : '☀️'}
          </button>

          {/* Presentation Demo Lab Trigger */}
          <button
            onClick={() => {
              sound.playClick(1000);
              onOpenDemoCenter();
            }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-hud font-bold text-xs transition-all shadow-md shadow-amber-500/30 flex items-center gap-1.5 cursor-pointer"
            title="Open College Presentation Simulator"
          >
            <span>⚡</span>
            <span className="hidden md:inline">DEMO LAB</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 px-3 py-2 bg-slate-950/90 border-t border-slate-800/80 overflow-x-auto scrollbar-none text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              sound.playClick(800);
              setActiveTab(item.id);
            }}
            className={`px-3 py-1 rounded-md whitespace-nowrap text-xs font-hud transition-all ${
              activeTab === item.id
                ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
