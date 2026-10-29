import React from 'react';
import { RouteJourney3D } from './3d/RouteJourney3D';
import { Platform3DView } from './3d/Platform3DView';
import { Train, PerformanceMode, ThemeMode } from '../types';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';

interface LiveTrackingViewProps {
  train: Train;
  platform: string;
  userCoach: string;
  performanceMode: PerformanceMode;
  themeMode: ThemeMode;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  train,
  platform,
  userCoach,
  performanceMode,
  themeMode,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Telemetry Header */}
      <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-hud font-bold text-xs text-emerald-400 uppercase tracking-widest">
              LIVE 3D SATELLITE TELEMETRY
            </span>
          </div>
          <h2 className="font-hud font-extrabold text-2xl text-white">
            {train.number} - {train.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Approaching <strong>Katpadi Junction (KPD)</strong> • Current Speed: <span className="text-cyan-300 font-mono-rail font-bold">112 km/h</span>
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-mono-rail">STATUS</span>
            <span className="text-sm font-hud font-bold text-emerald-400">{train.status}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-mono-rail">ASSIGNED PLATFORM</span>
            <span className="text-sm font-hud font-bold text-amber-400">PLATFORM {platform}</span>
          </div>

          <button
            onClick={() => {
              sound.playClick(900);
              railStore.simulate15MinAlert();
            }}
            className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-hud text-xs font-bold transition-all shadow-md shadow-cyan-600/30 cursor-pointer"
          >
            🔔 Test 15-Min Alert
          </button>
        </div>
      </div>

      {/* 3D Route Canvas Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-hud font-bold text-base text-cyan-300 uppercase tracking-wider">
            1. 3D Dynamic Railway Journey Route
          </h3>
          <span className="text-xs text-slate-400">WebGL 3D Interpolation</span>
        </div>
        <RouteJourney3D
          stations={train.stations}
          trainNumber={train.number}
          trainName={train.name}
          performanceMode={performanceMode}
          themeMode={themeMode}
        />
      </div>

      {/* 3D Platform Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-hud font-bold text-base text-amber-300 uppercase tracking-wider">
            2. 3D Platform & Coach Positioning HUD
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick(900);
                railStore.simulatePlatformChange(platform === '04' ? '06' : '04');
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-hud text-[11px] transition-all cursor-pointer"
            >
              ⚠️ Simulate Platform Change
            </button>
          </div>
        </div>

        <Platform3DView
          platform={platform}
          userCoach={userCoach}
          trainNumber={train.number}
          themeMode={themeMode}
        />
      </div>

      {/* Station Schedule Timeline */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/25">
        <h4 className="font-hud font-bold text-sm text-white mb-4 uppercase tracking-wider">
          STATION SCHEDULE & STOP DETAILS
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {train.stations.map((st) => (
            <div
              key={st.code}
              className={`p-3.5 rounded-xl border transition-all ${
                st.isCurrent
                  ? 'bg-amber-950/30 border-amber-500/60 shadow-lg glow-amber'
                  : st.isPassed
                  ? 'bg-slate-900/40 border-slate-800 opacity-70'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-hud font-bold text-sm text-slate-200">{st.name}</span>
                <span className="font-mono-rail text-xs text-cyan-400 font-bold">{st.time}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Code: {st.code} • Dist: {st.distanceKm} km</span>
                <span className={st.isCurrent ? 'text-amber-400 font-bold' : ''}>
                  Plat: {st.platform}
                </span>
              </div>
              {st.isCurrent && (
                <div className="mt-2 text-[10px] text-amber-300 font-hud font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>CURRENT TRAIN LOCATION</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
