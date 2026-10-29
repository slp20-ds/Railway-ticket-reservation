import React, { useState } from 'react';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';

interface HeroSearchProps {
  onSearch: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch }) => {
  const [fromStation, setFromStation] = useState('Chennai Central (MAS)');
  const [toStation, setToStation] = useState('KSR Bengaluru (SBC)');
  const [date, setDate] = useState('2026-10-14');
  const [travelClass, setTravelClass] = useState('SL');
  const [quota, setQuota] = useState('General');

  const popularRoutes = [
    { from: 'Chennai Central (MAS)', to: 'KSR Bengaluru (SBC)', label: 'MAS ➔ SBC' },
    { from: 'Hazrat Nizamuddin (NZM)', to: 'Thiruvananthapuram (TVC)', label: 'NZM ➔ TVC' },
    { from: 'Chennai Egmore (MS)', to: 'Madurai Jn (MDU)', label: 'MS ➔ MDU' },
  ];

  const handleSwap = () => {
    sound.playClick(900);
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleSelectRoute = (f: string, t: string) => {
    sound.playClick(850);
    setFromStation(f);
    setToStation(t);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick(1000);
    railStore.setSearchParams({
      origin: fromStation,
      destination: toStation,
      date,
      classType: travelClass,
    });
    onSearch();
  };

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-12 pb-8">
      {/* Hero Title HUD */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-hud text-xs uppercase tracking-widest mb-4 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>FUTURISTIC INDIAN RAILWAY RESERVATION PROTOTYPE</span>
        </div>

        <h1 className="font-hud font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-wider leading-tight drop-shadow-md">
          RAILCONNECT <span className="text-cyan-400">INDIA</span>
        </h1>

        <p className="font-hud text-base sm:text-xl text-slate-300 mt-2 font-medium">
          Your Journey Starts Here
        </p>

        <p className="text-xs sm:text-sm text-cyan-400/90 font-mono-rail uppercase tracking-widest mt-1">
          Search • Reserve in 3D • Travel Smart
        </p>
      </div>

      {/* Floating Glassmorphic Search Terminal */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-2xl relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Origin Station */}
            <div className="md:col-span-5 relative">
              <label className="block text-[10px] text-cyan-400 font-hud uppercase tracking-wider mb-1.5">
                FROM STATION
              </label>
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 focus-within:border-cyan-400 rounded-xl px-3.5 py-3 transition-colors">
                <span className="text-cyan-400 text-lg">🚉</span>
                <input
                  type="text"
                  value={fromStation}
                  onChange={(e) => setFromStation(e.target.value)}
                  placeholder="Enter origin station or code"
                  className="bg-transparent text-white font-medium text-sm outline-none w-full"
                  required
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="md:col-span-2 flex justify-center -my-2 md:my-0">
              <button
                type="button"
                onClick={handleSwap}
                className="w-10 h-10 rounded-full bg-slate-900 hover:bg-cyan-950 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 flex items-center justify-center transition-all hover:rotate-180 duration-300 shadow-md cursor-pointer"
                title="Swap origin & destination"
              >
                ⇄
              </button>
            </div>

            {/* Destination Station */}
            <div className="md:col-span-5 relative">
              <label className="block text-[10px] text-cyan-400 font-hud uppercase tracking-wider mb-1.5">
                TO STATION
              </label>
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 focus-within:border-cyan-400 rounded-xl px-3.5 py-3 transition-colors">
                <span className="text-emerald-400 text-lg">🏁</span>
                <input
                  type="text"
                  value={toStation}
                  onChange={(e) => setToStation(e.target.value)}
                  placeholder="Enter destination station or code"
                  className="bg-transparent text-white font-medium text-sm outline-none w-full"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date, Class & Quota */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-slate-400 font-hud uppercase tracking-wider mb-1.5">
                JOURNEY DATE
              </label>
              <div className="bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-white text-sm outline-none w-full font-mono-rail"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-hud uppercase tracking-wider mb-1.5">
                TRAVEL CLASS
              </label>
              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none w-full font-sans cursor-pointer"
              >
                <option value="SL">Sleeper (SL)</option>
                <option value="3A">AC 3 Tier (3A)</option>
                <option value="2A">AC 2 Tier (2A)</option>
                <option value="1A">AC First Class (1A)</option>
                <option value="CC">AC Chair Car (CC)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-hud uppercase tracking-wider mb-1.5">
                QUOTA TYPE
              </label>
              <select
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-sm outline-none w-full font-sans cursor-pointer"
              >
                <option value="General">General Quota</option>
                <option value="Tatkal">Tatkal Quota</option>
                <option value="Ladies">Ladies Quota</option>
                <option value="Lower Berth">Senior Citizen / Lower Berth</option>
              </select>
            </div>
          </div>

          {/* Quick Route Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-hud">POPULAR ROUTES:</span>
            {popularRoutes.map((r) => (
              <button
                key={r.label}
                type="button"
                onClick={() => handleSelectRoute(r.from, r.to)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-950 border border-slate-700/80 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-mono-rail transition-all cursor-pointer"
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-extrabold text-base uppercase tracking-wider shadow-xl shadow-cyan-500/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>SEARCH TRAINS IN 3D TELEMETRY</span>
            <span className="text-xl">➔</span>
          </button>
        </form>
      </div>
    </div>
  );
};
