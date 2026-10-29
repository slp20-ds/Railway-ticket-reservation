import React, { useState } from 'react';
import { Booking } from '../types';
import { DigitalTicket3D } from './DigitalTicket3D';
import { PreBookingManager } from './PreBookingManager';
import { sound } from '../services/sound';

interface DashboardProps {
  bookings: Booking[];
  onBookNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ bookings, onBookNew }) => {
  const [activeTicket, setActiveTicket] = useState<Booking | null>(null);
  const [activePreBook, setActivePreBook] = useState<Booking | null>(null);

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const prebookedList = bookings.filter((b) => b.status === 'PREBOOKED');

  const totalSpent = bookings.reduce((sum, b) => sum + b.advancePaid, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Dashboard Top Header */}
      <div className="glass-panel rounded-2xl p-6 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-cyan-400 font-mono-rail uppercase tracking-widest block">
            PASSENGER TELEMETRY PORTAL
          </span>
          <h2 className="font-hud font-extrabold text-2xl text-white">
            WELCOME, ABHINAND V
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            RailConnect Frequent Traveler ID: #RC-948201 • Active Prototype Mode
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick(900);
            onBookNew();
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
        >
          + Book New Journey
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel border border-cyan-500/30">
          <span className="text-[10px] text-slate-400 font-hud uppercase block">
            ACTIVE BOOKINGS
          </span>
          <div className="font-mono-rail font-bold text-2xl text-cyan-300 mt-1">
            {bookings.length}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {confirmedBookings.length} Confirmed • {prebookedList.length} Pre-booked
          </span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-blue-500/30">
          <span className="text-[10px] text-slate-400 font-hud uppercase block">
            TOTAL FARE EXPENDITURE
          </span>
          <div className="font-mono-rail font-bold text-2xl text-emerald-400 mt-1">
            ₹{totalSpent}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Prototype Settlements</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-amber-500/30">
          <span className="text-[10px] text-slate-400 font-hud uppercase block">
            LOYALTY REWARDS
          </span>
          <div className="font-mono-rail font-bold text-2xl text-amber-300 mt-1">
            1,420 PTS
          </div>
          <span className="text-[10px] text-amber-400/80 mt-1 block">RailConnect Platinum</span>
        </div>

        <div className="p-4 rounded-xl glass-panel border border-purple-500/30">
          <span className="text-[10px] text-slate-400 font-hud uppercase block">
            CARBON OFFSET SAVINGS
          </span>
          <div className="font-mono-rail font-bold text-2xl text-purple-300 mt-1">
            48.2 KG
          </div>
          <span className="text-[10px] text-purple-400/80 mt-1 block">Compared to Air Travel</span>
        </div>
      </div>

      {/* My Bookings List */}
      <div className="space-y-4">
        <h3 className="font-hud font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
          <span>🚆 YOUR ELECTRONIC TICKETS & SMART PRE-BOOKINGS</span>
        </h3>

        {bookings.length === 0 ? (
          <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800">
            <p className="text-sm text-slate-400">No journeys booked yet.</p>
            <button
              onClick={onBookNew}
              className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-hud underline"
            >
              Search trains and select your 3D seat
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <div
                key={b.pnr}
                className="p-5 rounded-2xl glass-panel border border-cyan-500/30 hover:border-cyan-400/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono-rail">
                        PNR: {b.pnr}
                      </span>
                      <h4 className="font-hud font-bold text-base text-white">
                        {b.trainNumber} - {b.trainName}
                      </h4>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-hud font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : b.status === 'PREBOOKED'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Route:</span>
                      <span>
                        {b.from} ➔ {b.to}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Date:</span>
                      <span>{b.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Seat Allocation:</span>
                      <span className="font-hud font-bold text-cyan-300">
                        Coach {b.coach} / Berth {b.seatNumber} ({b.berth})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Passenger:</span>
                      <span>{b.passengerName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      sound.playClick(900);
                      setActiveTicket(b);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-hud text-xs transition-all cursor-pointer"
                  >
                    View 3D Digital Ticket
                  </button>

                  {b.status === 'PREBOOKED' && (
                    <button
                      onClick={() => {
                        sound.playClick(950);
                        setActivePreBook(b);
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-hud text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
                    >
                      ⏳ Manage Pre-Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3D Digital Ticket Modal Overlay */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg">
            <button
              onClick={() => setActiveTicket(null)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
            <DigitalTicket3D booking={activeTicket} onClose={() => setActiveTicket(null)} />
          </div>
        </div>
      )}

      {/* Pre-Booking Countdown Modal Overlay */}
      {activePreBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl">
            <button
              onClick={() => setActivePreBook(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
            <PreBookingManager
              booking={activePreBook}
              onPaymentSuccess={() => setActivePreBook(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
