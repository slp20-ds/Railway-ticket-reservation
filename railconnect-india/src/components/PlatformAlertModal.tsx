import React from 'react';
import { PlatformAlert } from '../types';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';

interface PlatformAlertModalProps {
  alert: PlatformAlert | null;
  onClose: () => void;
}

export const PlatformAlertModal: React.FC<PlatformAlertModalProps> = ({ alert, onClose }) => {
  if (!alert) return null;

  const isPlatformChange = alert.type === 'platform_change';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl relative overflow-hidden ${
          isPlatformChange
            ? 'bg-gradient-to-b from-rose-950/90 via-slate-950 to-slate-950 border-rose-500/60 glow-rose'
            : 'bg-gradient-to-b from-cyan-950/90 via-slate-950 to-slate-950 border-cyan-500/60 glow-cyan'
        }`}
      >
        {/* Pulsing Alert Badge */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg ${
                isPlatformChange
                  ? 'bg-rose-600 text-white shadow-rose-600/40 animate-pulse'
                  : 'bg-cyan-600 text-white shadow-cyan-600/40'
              }`}
            >
              {isPlatformChange ? '⚠️' : '🚆'}
            </div>
            <div>
              <h3
                className={`font-hud font-bold text-lg tracking-wider ${
                  isPlatformChange ? 'text-rose-400' : 'text-cyan-300'
                }`}
              >
                {alert.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono-rail">
                TRAIN {alert.trainNumber} • {new Date(alert.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick(600);
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {isPlatformChange ? (
          <div className="space-y-6 my-4 text-center">
            <p className="text-sm text-rose-200">{alert.message}</p>

            {/* Platform transition graphic 4 -> 6 */}
            <div className="flex items-center justify-center gap-6 py-4 bg-slate-900/80 rounded-xl border border-rose-500/30">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-mono-rail">
                  OLD PLATFORM
                </span>
                <div className="font-hud font-bold text-3xl text-slate-500 line-through">
                  {alert.oldPlatform || '04'}
                </div>
              </div>

              <div className="text-2xl text-rose-400 font-bold animate-pulse">──────►</div>

              <div className="text-center">
                <span className="text-[10px] text-rose-300 block uppercase font-mono-rail font-bold">
                  NEW PLATFORM
                </span>
                <div className="font-hud font-bold text-4xl text-rose-400 animate-bounce">
                  {alert.newPlatform || '06'}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 text-left">
              🔔 <strong>Action Required:</strong> Please proceed immediately via the overbridge to{' '}
              <strong>Platform {alert.newPlatform || '06'}</strong>. Coach S4 will be aligned near
              escalator 2.
            </div>
          </div>
        ) : (
          <div className="space-y-4 my-4">
            <p className="text-sm text-slate-200 leading-relaxed">{alert.message}</p>

            {/* Coach & Platform Indicators */}
            <div className="grid grid-cols-3 gap-3 text-center py-4 bg-slate-900/80 rounded-xl border border-cyan-500/30">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">PLATFORM</span>
                <div className="font-hud font-bold text-2xl text-amber-400">04</div>
              </div>
              <div className="border-x border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">YOUR COACH</span>
                <div className="font-hud font-bold text-2xl text-cyan-300">
                  {alert.coach || 'S4'}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">YOUR SEAT</span>
                <div className="font-hud font-bold text-2xl text-emerald-400">
                  {alert.seat || 36}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-300">
              ℹ️ Baggage tag and coach position guidelines are enabled in the 3D Platform HUD.
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
          <button
            onClick={() => {
              sound.playClick(800);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs font-bold transition-all cursor-pointer"
          >
            Acknowledge Alert
          </button>
        </div>
      </div>
    </div>
  );
};
