import React from 'react';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';

interface DemoControlCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAiQuestion: (question: string) => void;
}

export const DemoControlCenter: React.FC<DemoControlCenterProps> = ({
  isOpen,
  onClose,
  onTriggerAiQuestion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-2xl glass-panel-glow border border-amber-500/50 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-xl font-bold text-amber-400">
              🎛️
            </div>
            <div>
              <h3 className="font-hud font-bold text-lg text-amber-300 tracking-wider">
                COLLEGE DEMO CONTROL CENTER
              </h3>
              <p className="text-xs text-slate-400">
                Interactive real-time triggers for presentation evaluators & project defense
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

        {/* Control Groups */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* 1. Real-time Railway Alerts */}
          <div>
            <h4 className="font-hud text-xs font-bold text-cyan-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>🔔 Real-Time Railway Alerts</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sound.playClick(900);
                  railStore.simulate15MinAlert();
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border border-cyan-500/40 text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="font-hud font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <span>🚆</span> Simulate 15-Min Arrival Alert
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Triggers audio station chime, arrival modal, platform and coach S4 reminder.
                </p>
              </button>

              <button
                onClick={() => {
                  sound.playClick(900);
                  railStore.simulatePlatformChange('06');
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-rose-950/60 border border-rose-500/40 text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="font-hud font-bold text-rose-300 text-xs flex items-center gap-1.5">
                  <span>⚠️</span> Simulate Platform Change (4 → 6)
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Triggers auditory klaxon and full-screen animated number change transition.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Smart Pre-Booking & Waiting List Automation */}
          <div>
            <h4 className="font-hud text-xs font-bold text-amber-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>⏳ Smart Pre-Booking & Waiting List Automation</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sound.playClick(900);
                  railStore.simulateExpirePreBooking();
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-amber-950/60 border border-amber-500/40 text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="font-hud font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <span>⚡</span> Simulate Pre-Booking Expiration
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Releases held seat S4/36, transfers it instantly to WL 1 (Arjun Verma), and triggers
                  confirmation alert.
                </p>
              </button>

              <button
                onClick={() => {
                  sound.playClick(900);
                  railStore.simulateWLUpgrade();
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-emerald-500/40 text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="font-hud font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                  <span>🚀</span> Upgrade Top Waiting List (WL 1)
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Simulates automatic priority queue promotion and generates confirmed e-ticket.
                </p>
              </button>
            </div>
          </div>

          {/* 3. Train Tracking & Delays */}
          <div>
            <h4 className="font-hud text-xs font-bold text-blue-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>🛰️ Operations & Train Delays</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sound.playClick(900);
                  railStore.simulateTrainDelay();
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-blue-950/60 border border-blue-500/40 text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="font-hud font-bold text-blue-300 text-xs flex items-center gap-1.5">
                  <span>⏱️</span> Simulate Train Delay (+15 min)
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Updates schedule telemetry and sends automated passenger notification.
                </p>
              </button>

              <button
                onClick={() => {
                  sound.playTrainHorn();
                }}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-cyan-950/60 border border-slate-700 text-left transition-all hover:scale-[1.02] cursor-pointer"
              >
                <div className="font-hud font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <span>📢</span> Sound Locomotive Horn
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Plays multi-frequency electric locomotive twin horn through Web Audio synth.
                </p>
              </button>
            </div>
          </div>

          {/* 4. RailBot AI Demonstrations */}
          <div>
            <h4 className="font-hud text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>🤖 RailBot AI Quick Demonstrations</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { label: 'Seat Recommendation', q: 'Which seat is best in coach S4?' },
                { label: 'Smart Pre-Book Policy', q: 'What happens if pre-booking expires?' },
                { label: 'RAC Explanation', q: 'What does RAC mean?' },
                { label: 'Waiting List Info', q: 'How does WL 1 get upgraded?' },
                { label: 'Where is Coach S4?', q: 'Where is coach S4 positioned on the platform?' },
                { label: 'Balance Due Query', q: 'How much balance do I have to pay?' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    sound.playClick(800);
                    onTriggerAiQuestion(item.q);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg bg-slate-900 hover:bg-purple-950/60 border border-purple-500/30 text-purple-200 text-[11px] font-semibold text-center transition-all cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 mt-4 flex items-center justify-between">
          <button
            onClick={() => {
              railStore.resetDemoData();
              onClose();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-300 text-xs font-hud transition-all cursor-pointer"
          >
            Reset All Prototype Data
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-hud text-xs cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
