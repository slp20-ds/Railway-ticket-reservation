import React, { useState } from 'react';
import { CoachInteriorCanvas } from './3d/CoachInteriorCanvas';
import { Seat, Train, PerformanceMode, ThemeMode } from '../types';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';

interface CoachSeatSelectorProps {
  train: Train;
  seats: Seat[];
  selectedSeat: Seat | null;
  performanceMode: PerformanceMode;
  themeMode: ThemeMode;
  onProceedToBooking: () => void;
  onTriggerAiForSeat: () => void;
}

export const CoachSeatSelector: React.FC<CoachSeatSelectorProps> = ({
  train,
  seats,
  selectedSeat,
  performanceMode,
  themeMode,
  onProceedToBooking,
  onTriggerAiForSeat,
}) => {
  const currentCoach = railStore.getState().coach;
  const coachesList = ['S1', 'S2', 'S3', 'S4', 'S5', 'B1', 'B2'];
  const [selectedBerthFilter, setSelectedBerthFilter] = useState<string>('All');

  const handleSeatClick = (seat: Seat) => {
    railStore.selectSeat(seat);
  };

  const handleCoachChange = (c: string) => {
    railStore.setCoach(c);
  };

  // Count seat stats
  const availableCount = seats.filter((s) => s.status === 'available').length;
  const occupiedCount = seats.filter((s) => s.status === 'occupied').length;
  const prebookedCount = seats.filter((s) => s.status === 'prebooked').length;
  const racCount = seats.filter((s) => s.status === 'rac').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Train & Coach Banner */}
      <div className="glass-panel rounded-2xl p-4 md:p-6 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono-rail text-xs font-bold">
              #{train.number}
            </span>
            <h2 className="font-hud font-bold text-lg md:text-xl text-white">
              {train.name} • 3D COACH BERTH SELECTION
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {train.from} ({train.fromCode}) ➔ {train.to} ({train.toCode}) • Departs {train.departure}
          </p>
        </div>

        {/* Coach Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs text-slate-400 font-hud uppercase mr-1">COACH:</span>
          {coachesList.map((c) => (
            <button
              key={c}
              onClick={() => handleCoachChange(c)}
              className={`px-3 py-1.5 rounded-xl font-hud font-bold text-xs transition-all cursor-pointer ${
                currentCoach === c
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40 scale-105'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas Box */}
      <div className="relative">
        <CoachInteriorCanvas
          coachName={currentCoach}
          seats={seats}
          selectedSeat={selectedSeat}
          onSeatSelect={handleSeatClick}
          performanceMode={performanceMode}
          themeMode={themeMode}
        />

        {/* AI Seat Recommendation Floating Button */}
        <div className="absolute top-4 right-32 z-20 hidden sm:block">
          <button
            onClick={() => {
              sound.playClick(900);
              onTriggerAiForSeat();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-hud text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
          >
            <span>✨</span>
            <span>Ask AI for Seat Recommendation</span>
          </button>
        </div>
      </div>

      {/* Selected Seat Drawer & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Real-time Coach Statistics */}
        <div className="md:col-span-6 grid grid-cols-4 gap-2 text-center">
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <span className="block font-mono-rail text-lg font-bold text-emerald-400">
              {availableCount}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-hud">Available</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30">
            <span className="block font-mono-rail text-lg font-bold text-blue-400">
              {prebookedCount}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-hud">Pre-Booked</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30">
            <span className="block font-mono-rail text-lg font-bold text-purple-400">{racCount}</span>
            <span className="text-[10px] text-slate-400 uppercase font-hud">RAC</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="block font-mono-rail text-lg font-bold text-slate-400">
              {occupiedCount}
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-hud">Occupied</span>
          </div>
        </div>

        {/* Selected Seat Card & Checkout Action */}
        <div className="md:col-span-6">
          {selectedSeat ? (
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/60 shadow-xl flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-hud tracking-widest block">
                  SELECTED 3D BERTH
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-hud font-bold text-2xl text-white">
                    {selectedSeat.coach} / {selectedSeat.number}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-300 font-semibold">
                    {selectedSeat.berth} Berth
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Fare: <span className="text-emerald-400 font-bold font-mono-rail">₹{selectedSeat.fare}</span>
                  <span className="text-slate-500 ml-2">(or ₹{Math.round(selectedSeat.fare * 0.1)} Smart Pre-Book)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playClick(1000);
                  onProceedToBooking();
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/40 transition-all hover:scale-105 cursor-pointer whitespace-nowrap"
              >
                PROCEED TO BOOK ➔
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center flex flex-col items-center justify-center">
              <p className="text-xs text-slate-400">
                Click any <strong className="text-emerald-400">green available berth</strong> inside the
                3D virtual coach above to select your seat.
              </p>
              <button
                onClick={() => {
                  sound.playClick(900);
                  onTriggerAiForSeat();
                }}
                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 underline font-hud cursor-pointer"
              >
                Need help? Ask RailBot AI to pick a Lower/Window berth
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
