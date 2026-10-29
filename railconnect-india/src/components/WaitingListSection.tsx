import React, { useState } from 'react';
import { WaitingListPassenger } from '../types';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface WaitingListSectionProps {
  waitingList: WaitingListPassenger[];
}

export const WaitingListSection: React.FC<WaitingListSectionProps> = ({ waitingList }) => {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradedPassenger, setUpgradedPassenger] = useState<string | null>(null);

  const handleSimulateUpgrade = () => {
    if (waitingList.length === 0) return;
    const top = waitingList[0];
    setIsUpgrading(true);
    sound.playClick(900);

    setTimeout(() => {
      railStore.simulateWLUpgrade();
      setUpgradedPassenger(top.name);
      setIsUpgrading(false);

      // Trigger celebratory confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // Ignore
      }

      setTimeout(() => setUpgradedPassenger(null), 5000);
    }, 1200);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-xl max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="font-hud font-bold text-lg text-cyan-300 flex items-center gap-2">
            <span>⚡ AUTOMATED WAITING LIST QUEUE (WL)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real-time automated seat allocation on cancellation or pre-booking expiry
          </p>
        </div>
        <button
          onClick={handleSimulateUpgrade}
          disabled={isUpgrading || waitingList.length === 0}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-hud text-xs transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
        >
          {isUpgrading ? 'Upgrading...' : '🚀 Upgrade Top WL'}
        </button>
      </div>

      {/* Upgraded Banner */}
      {upgradedPassenger && (
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/60 shadow-lg text-center animate-bounce">
          <div className="text-2xl mb-1">🎉</div>
          <h4 className="font-hud font-bold text-emerald-300 text-sm">
            WAITING LIST UPGRADE CONFIRMED!
          </h4>
          <p className="text-xs text-slate-200 mt-0.5">
            Passenger <strong>{upgradedPassenger}</strong> (WL 1) has been automatically confirmed for
            Seat S4/36!
          </p>
        </div>
      )}

      {/* Interactive Queue Cards */}
      <div className="space-y-3">
        {waitingList.map((passenger, idx) => (
          <div
            key={passenger.id}
            className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
              idx === 0
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-hud font-bold text-sm ${
                  idx === 0
                    ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/50'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                WL {passenger.position}
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-200">{passenger.name}</div>
                <div className="text-[11px] text-slate-400 font-mono-rail">
                  PNR: {passenger.pnr} • Pref: {passenger.coachPreference} ({passenger.berthPreference})
                </div>
              </div>
            </div>

            <div className="text-right">
              {idx === 0 ? (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-hud font-bold animate-pulse">
                  NEXT IN LINE
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-mono-rail">In Queue</span>
              )}
            </div>
          </div>
        ))}

        {waitingList.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-xs">
            No passengers in the waiting list queue currently.
          </div>
        )}
      </div>

      {/* Algorithmic Flow Indicator */}
      <div className="mt-5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-center text-[10px] text-slate-400">
        <div className="flex-1">
          <span className="block font-bold text-slate-300">1. Seat Released</span>
          <span className="text-[9px] text-slate-500">Expired Pre-Book / Cancel</span>
        </div>
        <span className="text-cyan-400 font-bold px-2">──►</span>
        <div className="flex-1">
          <span className="block font-bold text-cyan-300">2. Real-Time Scan</span>
          <span className="text-[9px] text-slate-500">Priority Engine</span>
        </div>
        <span className="text-cyan-400 font-bold px-2">──►</span>
        <div className="flex-1">
          <span className="block font-bold text-emerald-300">3. CNF Issued</span>
          <span className="text-[9px] text-slate-500">Auto SMS / App Alert</span>
        </div>
      </div>
    </div>
  );
};
