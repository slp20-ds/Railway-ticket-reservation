import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';

interface PreBookingManagerProps {
  booking: Booking;
  onPaymentSuccess?: () => void;
}

export const PreBookingManager: React.FC<PreBookingManagerProps> = ({
  booking,
  onPaymentSuccess,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 47,
    seconds: 32,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePayRemaining = () => {
    setIsProcessing(true);
    sound.playClick(900);
    setTimeout(() => {
      railStore.completePreBookingPayment(booking.pnr);
      setIsProcessing(false);
      if (onPaymentSuccess) onPaymentSuccess();
    }, 1200);
  };

  const handleSimulateExpiration = () => {
    sound.playClick(600);
    railStore.simulateExpirePreBooking();
  };

  // Progress circle calculation (out of 24h)
  const totalSeconds = 24 * 3600;
  const currentSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const progressRatio = Math.max(0, Math.min(1, currentSeconds / totalSeconds));
  const strokeDashoffset = 283 * (1 - progressRatio);

  return (
    <div className="glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 max-w-xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <h3 className="font-hud font-bold text-lg text-blue-300 tracking-wide">
              SMART PRE-BOOKING LOCK
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            10% Advance Held • 24-Hour Settlement Window
          </p>
        </div>
        <div className="px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-500/40 text-blue-300 font-mono-rail text-xs">
          PNR: {booking.pnr}
        </div>
      </div>

      {/* 3D Circular Countdown Timer */}
      <div className="flex flex-col items-center justify-center my-6">
        <div className="relative w-52 h-52 flex items-center justify-center">
          {/* Glowing background ring */}
          <div className="absolute inset-2 rounded-full bg-cyan-950/30 border border-cyan-500/20 blur-sm" />

          {/* SVG Animated Circular Progress */}
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="#0f172a"
              strokeWidth="6"
            />
            {/* Animated Cyan/Blue countdown arc */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke="url(#timerGradient)"
              strokeWidth="6"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#0ea5e9" />
              </linearGradient>
            </defs>
          </svg>

          {/* Digital Timer Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-400 font-hud tracking-widest uppercase mb-1">
              TIME REMAINING
            </span>
            <div className="font-mono-rail font-bold text-2xl md:text-3xl text-cyan-300 tracking-wider">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <span className="text-[11px] text-blue-300 font-semibold mt-1">
              Seat {booking.coach}/{booking.seatNumber} ({booking.berth})
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center max-w-sm mt-3">
          Complete the remaining 90% balance before the countdown hits 00:00:00 to finalize your
          permanent reservation.
        </p>
      </div>

      {/* Fare Breakup Breakdown */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-2 mb-6">
        <div className="flex justify-between text-xs text-slate-300">
          <span>Total Fare:</span>
          <span className="font-mono-rail font-bold">₹{booking.fare}</span>
        </div>
        <div className="flex justify-between text-xs text-emerald-400">
          <span>Advance Paid (10%):</span>
          <span className="font-mono-rail font-bold">✓ ₹{booking.advancePaid} (Paid)</span>
        </div>
        <div className="flex justify-between text-sm text-cyan-300 font-bold pt-2 border-t border-slate-800">
          <span>Remaining Balance (90%):</span>
          <span className="font-mono-rail text-base text-amber-400">₹{booking.balanceDue}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handlePayRemaining}
          disabled={isProcessing}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Securing Confirmation...
            </>
          ) : (
            <>
              💳 Pay Remaining 90% (₹{booking.balanceDue}) & Confirm Seat
            </>
          )}
        </button>

        <button
          onClick={handleSimulateExpiration}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-500/40 text-rose-300 text-xs font-hud transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          ⚡ Simulate Expiration & Auto-Transfer to Waiting List
        </button>
      </div>

      {/* College Prototype Policy Note */}
      <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[10px] text-amber-300/90 leading-relaxed text-center">
        💡 <strong>Proposed Innovation Concept:</strong> This 10% Smart Pre-Booking system is a demo
        concept designed by RailConnect India for reducing seat wastage and automating waiting list
        reallocations. It is not an official Indian Railways / IRCTC policy.
      </div>
    </div>
  );
};
