import React, { useState } from 'react';
import { Seat, Train, Booking } from '../types';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';
import confetti from 'canvas-confetti';

interface PassengerAndPaymentProps {
  train: Train;
  seat: Seat;
  onBookingComplete: (booking: Booking) => void;
  onBackToSeats: () => void;
}

export const PassengerAndPayment: React.FC<PassengerAndPaymentProps> = ({
  train,
  seat,
  onBookingComplete,
  onBackToSeats,
}) => {
  const [passengerName, setPassengerName] = useState('Abhinand V');
  const [passengerAge, setPassengerAge] = useState(24);
  const [passengerGender, setPassengerGender] = useState('Male');
  const [berthPreference, setBerthPreference] = useState(seat.berth);
  const [bookingMode, setBookingMode] = useState<'full' | 'prebook'>('prebook'); // Smart pre-book default
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('abhinand@oksbi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const totalFare = seat.fare;
  const advanceAmount = Math.round(totalFare * 0.1);
  const balanceAmount = totalFare - advanceAmount;
  const amountToPayNow = bookingMode === 'prebook' ? advanceAmount : totalFare;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    sound.playClick(900);

    // Simulate 3D payment verification latency
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      sound.playSuccess();

      // Confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#06b6d4', '#10b981', '#3b82f6', '#f59e0b'],
        });
      } catch {
        // Ignore
      }

      const booking = railStore.createBooking({
        passengerName,
        passengerAge,
        passengerGender,
        bookingType: bookingMode,
      });

      setTimeout(() => {
        onBookingComplete(booking);
      }, 1800);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBackToSeats}
        className="mb-4 text-xs font-hud text-slate-400 hover:text-cyan-300 flex items-center gap-1.5 cursor-pointer"
      >
        <span>← Back to 3D Coach</span>
      </button>

      {/* Main Checkout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Passenger Details Form */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-6 border border-cyan-500/30 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="font-hud font-bold text-xl text-white flex items-center gap-2">
              <span>PASSENGER RESERVATION DETAILS</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Train {train.number} {train.name} • Coach {seat.coach} / Berth {seat.number} ({seat.berth})
            </p>
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="block text-[10px] text-cyan-400 font-hud uppercase tracking-wider mb-1">
                PASSENGER FULL NAME
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white rounded-xl px-4 py-2.5 text-sm outline-none font-sans"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-cyan-400 font-hud uppercase tracking-wider mb-1">
                  AGE
                </label>
                <input
                  type="number"
                  value={passengerAge}
                  onChange={(e) => setPassengerAge(parseInt(e.target.value, 10))}
                  min={1}
                  max={120}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white rounded-xl px-4 py-2.5 text-sm outline-none font-mono-rail"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] text-cyan-400 font-hud uppercase tracking-wider mb-1">
                  GENDER
                </label>
                <select
                  value={passengerGender}
                  onChange={(e) => setPassengerGender(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none font-sans cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>
            </div>

            {/* Smart Pre-Booking Toggle Option */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-xs font-hud font-bold text-cyan-300 uppercase tracking-wider mb-2">
                SELECT BOOKING PAYMENT MODE
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Smart Pre-Book (10%) */}
                <div
                  onClick={() => {
                    sound.playClick(850);
                    setBookingMode('prebook');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    bookingMode === 'prebook'
                      ? 'bg-blue-950/60 border-blue-400 shadow-md shadow-blue-500/20 glow-cyan-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-hud font-bold text-sm text-blue-300">
                      ⚡ SMART PRE-BOOK
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      PAY 10% NOW
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Pay only <strong className="text-cyan-300">₹{advanceAmount}</strong> today. Hold
                    seat with 24-hr countdown timer.
                  </p>
                </div>

                {/* 2. Full Fare Booking */}
                <div
                  onClick={() => {
                    sound.playClick(850);
                    setBookingMode('full');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    bookingMode === 'full'
                      ? 'bg-emerald-950/60 border-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-hud font-bold text-sm text-emerald-300">
                      ✓ FULL FARE (100%)
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      PERMANENT CNF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    Pay complete fare <strong className="text-emerald-400">₹{totalFare}</strong> for
                    instant irrevocable ticket.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4 border-t border-slate-800">
              <label className="block text-[10px] text-slate-400 font-hud uppercase tracking-wider mb-2">
                SIMULATED PAYMENT GATEWAY
              </label>

              <div className="flex gap-2">
                {(['upi', 'card', 'netbanking'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      sound.playClick(800);
                      setPaymentMethod(method);
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-hud uppercase transition-all cursor-pointer ${
                      paymentMethod === method
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {paymentMethod === 'upi' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. name@okhdfcbank)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none font-mono-rail"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing || paymentSuccess}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/40 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
            >
              {isProcessing ? (
                <>
                  <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Processing 3D Railway Gateway...
                </>
              ) : paymentSuccess ? (
                <>
                  <span>✓ PAYMENT CONFIRMED</span>
                </>
              ) : (
                <>
                  <span>PAY ₹{amountToPayNow} & GENERATE PNR</span>
                  <span>➔</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Floating 3D Fare Card HUD */}
        <div className="lg:col-span-5 glass-panel-glow rounded-2xl p-6 border border-cyan-500/40 shadow-2xl space-y-6">
          <div className="border-b border-cyan-500/30 pb-4">
            <span className="text-[10px] text-cyan-400 font-mono-rail uppercase tracking-widest block">
              RESERVATION SUMMARY
            </span>
            <h3 className="font-hud font-bold text-lg text-white">
              {train.number} {train.name}
            </h3>
          </div>

          {/* Seat & Berth Visual Chip */}
          <div className="p-4 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-center">
            <span className="text-[10px] text-slate-400 font-hud uppercase block">
              ALLOCATED COACH & BERTH
            </span>
            <div className="font-hud font-extrabold text-3xl text-cyan-300 mt-1">
              COACH {seat.coach} / SEAT {seat.number}
            </div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">
              {seat.berth} Berth • Window View
            </div>
          </div>

          {/* Fare Breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Base Berth Fare:</span>
              <span className="font-mono-rail font-bold">₹{totalFare}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>IRCTC Convenience Fee:</span>
              <span className="font-mono-rail text-emerald-400">₹0 (Waived for Prototype)</span>
            </div>

            {bookingMode === 'prebook' ? (
              <>
                <div className="flex justify-between text-blue-300 pt-2 border-t border-slate-800">
                  <span>Smart Pre-Booking Advance (10%):</span>
                  <span className="font-mono-rail font-bold text-sm">₹{advanceAmount}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Remaining 90% Balance (due in 24h):</span>
                  <span className="font-mono-rail">₹{balanceAmount}</span>
                </div>
                <div className="flex justify-between text-white font-hud font-bold text-base pt-3 border-t border-cyan-500/30">
                  <span>PAY NOW:</span>
                  <span className="font-mono-rail text-cyan-400 text-xl">₹{advanceAmount}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-white font-hud font-bold text-base pt-3 border-t border-cyan-500/30">
                <span>TOTAL PAYABLE NOW:</span>
                <span className="font-mono-rail text-emerald-400 text-xl">₹{totalFare}</span>
              </div>
            )}
          </div>

          {/* Safety & Demo notice */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
            🔒 256-Bit Encrypted Prototype Gateway. No real bank accounts are charged. All booking
            records sync in real time.
          </div>
        </div>
      </div>
    </div>
  );
};
