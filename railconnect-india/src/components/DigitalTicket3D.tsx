import React, { useState } from 'react';
import { Booking } from '../types';
import { sound } from '../services/sound';

interface DigitalTicket3DProps {
  booking: Booking;
  onClose?: () => void;
}

export const DigitalTicket3D: React.FC<DigitalTicket3DProps> = ({ booking, onClose }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFlip = () => {
    sound.playClick(900);
    setIsFlipped(!isFlipped);
  };

  const handlePrint = () => {
    sound.playClick(1000);
    window.print();
  };

  const handleShare = () => {
    sound.playClick(1100);
    const text = `RailConnect India e-Ticket: PNR ${booking.pnr} | Train ${booking.trainNumber} ${booking.trainName} | Coach ${booking.coach} Seat ${booking.seatNumber} (${booking.berth}) | Status: ${booking.status}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full p-4">
      {/* 3D Flippable Ticket Card */}
      <div className="w-full h-[450px] perspective-1000 my-4 cursor-pointer" onClick={handleFlip}>
        <div
          className={`w-full h-full relative preserve-3d transition-transform duration-700 rounded-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT OF TICKET */}
          <div className="absolute inset-0 backface-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/90 border border-cyan-500/50 shadow-2xl flex flex-col justify-between overflow-hidden">
            {/* Holographic Watermark lines */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/40">
                    🚆
                  </div>
                  <div>
                    <h3 className="font-hud font-bold text-base text-cyan-300 tracking-wider">
                      RAILCONNECT INDIA
                    </h3>
                    <p className="text-[10px] text-cyan-400/80 uppercase font-mono-rail">
                      ELECTRONIC RESERVATION SLIP (ERS)
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase">PNR NUMBER</span>
                  <div className="font-mono-rail font-bold text-cyan-300 text-sm tracking-wider">
                    {booking.pnr}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400">BOOKING STATUS:</span>
                <span
                  className={`px-3 py-1 rounded-md text-xs font-hud font-bold ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                >
                  {booking.status}
                </span>
              </div>
            </div>

            {/* Journey Details */}
            <div className="bg-slate-950/60 rounded-xl p-4 border border-cyan-500/20 my-2">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <div className="text-xs text-slate-400">TRAIN</div>
                  <div className="font-hud font-bold text-white text-sm">
                    {booking.trainNumber} - {booking.trainName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">DATE</div>
                  <div className="text-sm font-semibold text-cyan-300">{booking.date}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">FROM</span>
                  <span className="font-semibold text-slate-200">{booking.from}</span>
                </div>
                <div className="text-cyan-400 font-bold px-2">───────►</div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">TO</span>
                  <span className="font-semibold text-slate-200">{booking.to}</span>
                </div>
              </div>
            </div>

            {/* Berth & Coach HUD */}
            <div className="grid grid-cols-4 gap-2 text-center py-2 bg-cyan-950/40 rounded-xl border border-cyan-500/20">
              <div className="border-r border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">COACH</span>
                <span className="font-hud font-bold text-lg text-cyan-300">{booking.coach}</span>
              </div>
              <div className="border-r border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">BERTH</span>
                <span className="font-hud font-bold text-lg text-amber-300">
                  {booking.seatNumber}
                </span>
              </div>
              <div className="border-r border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">TYPE</span>
                <span className="text-xs font-semibold text-slate-200 block mt-1">
                  {booking.berth}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">PLATFORM</span>
                <span className="font-hud font-bold text-lg text-emerald-400">
                  {booking.platform || '04'}
                </span>
              </div>
            </div>

            {/* Passenger & Footer */}
            <div className="border-t border-cyan-500/30 pt-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">PASSENGER</span>
                <span className="font-semibold text-white">
                  {booking.passengerName} ({booking.passengerAge} / {booking.passengerGender})
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">TOTAL FARE</span>
                <span className="font-mono-rail font-bold text-emerald-400 text-base">
                  ₹{booking.fare}
                </span>
              </div>
            </div>

            <div className="text-center text-[10px] text-cyan-400/70 mt-1">
              Tap ticket to flip for QR Code & Verification
            </div>
          </div>

          {/* BACK OF TICKET */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-2xl p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 border border-cyan-500/50 shadow-2xl flex flex-col justify-between">
            <div className="text-center border-b border-slate-800 pb-3">
              <span className="font-hud text-xs text-cyan-300 font-bold tracking-widest uppercase">
                DIGITAL VERIFICATION MATRIX
              </span>
            </div>

            {/* Simulated 2D QR Code */}
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="p-3 bg-white rounded-xl shadow-lg border border-cyan-400/40">
                {/* SVG QR Code pattern */}
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                  {/* Position detection squares */}
                  <rect x="5" y="5" width="25" height="25" fill="#0284c7" rx="3" />
                  <rect x="9" y="9" width="17" height="17" fill="#ffffff" />
                  <rect x="13" y="13" width="9" height="9" fill="#0284c7" />

                  <rect x="70" y="5" width="25" height="25" fill="#0284c7" rx="3" />
                  <rect x="74" y="9" width="17" height="17" fill="#ffffff" />
                  <rect x="78" y="13" width="9" height="9" fill="#0284c7" />

                  <rect x="5" y="70" width="25" height="25" fill="#0284c7" rx="3" />
                  <rect x="9" y="74" width="17" height="17" fill="#ffffff" />
                  <rect x="13" y="78" width="9" height="9" fill="#0284c7" />

                  {/* QR Matrix Bits */}
                  <rect x="36" y="8" width="8" height="6" fill="#0f172a" />
                  <rect x="48" y="14" width="6" height="8" fill="#0f172a" />
                  <rect x="38" y="24" width="8" height="8" fill="#0f172a" />
                  <rect x="12" y="38" width="8" height="8" fill="#0f172a" />
                  <rect x="26" y="42" width="6" height="6" fill="#0f172a" />
                  <rect x="38" y="38" width="12" height="12" fill="#0284c7" />
                  <rect x="56" y="40" width="8" height="8" fill="#0f172a" />
                  <rect x="70" y="38" width="8" height="6" fill="#0f172a" />
                  <rect x="84" y="44" width="8" height="8" fill="#0f172a" />
                  <rect x="40" y="58" width="8" height="8" fill="#0f172a" />
                  <rect x="54" y="54" width="6" height="10" fill="#0f172a" />
                  <rect x="68" y="60" width="10" height="6" fill="#0f172a" />
                  <rect x="38" y="72" width="10" height="10" fill="#0f172a" />
                  <rect x="56" y="76" width="8" height="8" fill="#0f172a" />
                  <rect x="74" y="74" width="14" height="10" fill="#0284c7" />
                </svg>
              </div>
              <span className="text-[11px] font-mono-rail text-slate-400 mt-2">
                VERIFY-PNR-{booking.pnr}
              </span>
            </div>

            {/* Prototype Disclaimer */}
            <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-500/30 text-[10px] text-amber-300/90 leading-relaxed text-center">
              ⚠️ <strong>College Project Prototype:</strong> This digital ticket is generated by
              RailConnect India for demonstration and educational purposes. Not an official Indian
              Railways / IRCTC ticket.
            </div>

            <div className="text-center text-[10px] text-cyan-400/70 pt-2 border-t border-slate-800">
              Tap ticket again to view front side
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2">
        <button
          onClick={handleFlip}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-hud text-xs transition-all flex items-center gap-2"
        >
          🔄 Flip Ticket
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-hud text-xs transition-all flex items-center gap-2"
        >
          🖨️ Print Ticket
        </button>

        <button
          onClick={handleShare}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-hud text-xs transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/30"
        >
          {copied ? '✓ PNR Copied!' : '📤 Share Ticket'}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-hud"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
