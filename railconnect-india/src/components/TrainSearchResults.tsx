import React from 'react';
import { Train } from '../types';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';

interface TrainSearchResultsProps {
  trains: Train[];
  onSelectTrainAndCoach: (trainId: string) => void;
  onViewRouteTelemetry: (trainId: string) => void;
}

export const TrainSearchResults: React.FC<TrainSearchResultsProps> = ({
  trains,
  onSelectTrainAndCoach,
  onViewRouteTelemetry,
}) => {
  const handleSelectTrain = (tId: string) => {
    sound.playClick(950);
    railStore.setActiveTrain(tId);
    onSelectTrainAndCoach(tId);
  };

  const handleViewRoute = (tId: string) => {
    sound.playClick(850);
    railStore.setActiveTrain(tId);
    onViewRouteTelemetry(tId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Search Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-500/30 pb-4">
        <div>
          <h2 className="font-hud font-bold text-xl md:text-2xl text-white flex items-center gap-2">
            <span>AVAILABLE EXPRESS TRAINS</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono-rail">
              {trains.length} Trains
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Indian Railways schedule telemetry • 3D Coach Selection enabled
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-mono-rail block">
            SELECTED DATE
          </span>
          <span className="text-xs font-bold text-cyan-300 font-hud">14 OCT 2026 (WEDNESDAY)</span>
        </div>
      </div>

      {/* Train Cards List */}
      <div className="space-y-4">
        {trains.map((train) => (
          <div
            key={train.id}
            className="group glass-panel rounded-2xl p-5 md:p-6 border border-cyan-500/30 hover:border-cyan-400/80 transition-all duration-300 hover:scale-[1.01] hover:glow-cyan-sm relative overflow-hidden"
          >
            {/* Top Row: Train Number, Name, Type, Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 font-mono-rail font-bold text-cyan-300 text-xs">
                  #{train.number}
                </span>
                <div>
                  <h3 className="font-hud font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                    {train.name}
                  </h3>
                  <span className="text-[11px] text-slate-400">{train.type} Express</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono-rail text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {train.status}
                </span>

                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 font-hud text-xs font-bold">
                  PLATFORM {train.platform}
                </span>
              </div>
            </div>

            {/* Middle Row: Departure -> Duration -> Arrival */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center my-4">
              {/* Origin */}
              <div className="md:col-span-3">
                <div className="font-mono-rail font-bold text-2xl text-white">
                  {train.departure}
                </div>
                <div className="font-hud font-semibold text-sm text-cyan-300">{train.from}</div>
                <div className="text-[10px] text-slate-400 font-mono-rail">{train.fromCode}</div>
              </div>

              {/* Journey Path / Visual Train Animation */}
              <div className="md:col-span-6 flex flex-col items-center justify-center px-4">
                <span className="text-xs text-slate-400 font-mono-rail mb-1">
                  Duration: {train.duration}
                </span>

                <div className="w-full relative flex items-center">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-cyan-400/20" />
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 mx-2 relative">
                    {/* Animated moving train icon along the track */}
                    <span className="absolute -top-3 transform -translate-x-1/2 group-hover:translate-x-4 transition-all duration-700 text-xs">
                      🚆
                    </span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" />
                </div>

                <div className="flex justify-between w-full text-[10px] text-slate-500 mt-1 font-mono-rail">
                  <span>Direct Route</span>
                  <span>{train.stations.length} Intermediate Stops</span>
                </div>
              </div>

              {/* Destination */}
              <div className="md:col-span-3 text-left md:text-right">
                <div className="font-mono-rail font-bold text-2xl text-white">{train.arrival}</div>
                <div className="font-hud font-semibold text-sm text-emerald-300">{train.to}</div>
                <div className="text-[10px] text-slate-400 font-mono-rail">{train.toCode}</div>
              </div>
            </div>

            {/* Bottom Row: Classes, Availability & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {train.classes.map((cls) => (
                  <div
                    key={cls}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-left min-w-[70px]"
                  >
                    <span className="block text-[10px] text-slate-400 font-mono-rail uppercase">
                      {cls}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">AVAILABLE</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <span className="text-[10px] text-slate-400 block uppercase">STARTING FROM</span>
                  <span className="font-mono-rail font-bold text-xl text-emerald-400">
                    ₹{train.baseFare}
                  </span>
                </div>

                <button
                  onClick={() => handleViewRoute(train.id)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 font-hud text-xs transition-all cursor-pointer"
                >
                  VIEW 3D ROUTE
                </button>

                <button
                  onClick={() => handleSelectTrain(train.id)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 cursor-pointer flex items-center gap-1.5"
                >
                  <span>ENTER COACH & SELECT SEAT</span>
                  <span>💺</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
