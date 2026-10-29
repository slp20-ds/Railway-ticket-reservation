/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroStationCanvas } from './components/3d/HeroStationCanvas';
import { HeroSearch } from './components/HeroSearch';
import { TrainSearchResults } from './components/TrainSearchResults';
import { CoachSeatSelector } from './components/CoachSeatSelector';
import { PassengerAndPayment } from './components/PassengerAndPayment';
import { DigitalTicket3D } from './components/DigitalTicket3D';
import { LiveTrackingView } from './components/LiveTrackingView';
import { PreBookingManager } from './components/PreBookingManager';
import { WaitingListSection } from './components/WaitingListSection';
import { Dashboard } from './components/Dashboard';
import { PlatformAlertModal } from './components/PlatformAlertModal';
import { DemoControlCenter } from './components/DemoControlCenter';
import { RailBotChat } from './components/RailBotChat';
import { RailwayLoadingScreen } from './components/RailwayLoadingScreen';
import { railStore } from './services/railStore';
import { Booking } from './types';
import { sound } from './services/sound';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('search');
  const [state, setState] = useState(railStore.getState());
  const [activeCreatedBooking, setActiveCreatedBooking] = useState<Booking | null>(null);
  const [isDemoCenterOpen, setIsDemoCenterOpen] = useState(false);

  // Subscribe to real-time railStore updates
  useEffect(() => {
    const unsubscribe = railStore.subscribe(() => {
      setState({ ...railStore.getState() });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const activeTrain = railStore.getActiveTrain();

  // Navigation handlers
  const handleProceedToBooking = () => {
    if (state.selectedSeat) {
      setActiveTab('booking');
    }
  };

  const handleBookingComplete = (booking: Booking) => {
    setActiveCreatedBooking(booking);
    setActiveTab('ticket');
  };

  const handleBackToSeats = () => {
    setActiveTab('coach3d');
  };

  const handleSelectTrainAndCoach = (trainId: string) => {
    railStore.setActiveTrain(trainId);
    setActiveTab('coach3d');
  };

  const handleViewRouteTelemetry = (trainId: string) => {
    railStore.setActiveTrain(trainId);
    setActiveTab('live');
  };

  const handleTriggerAiQuestion = (question: string) => {
    // Open RailBot and send question automatically
    // The RailBot button will respond to this
  };

  if (isLoading) {
    return <RailwayLoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div
      className={`min-h-screen relative selection:bg-cyan-500 selection:text-black ${
        state.themeMode === 'day' ? 'bg-slate-900 text-slate-100' : 'bg-slate-950 text-slate-100'
      }`}
    >
      {/* Background rail scanline grid */}
      <div className="fixed inset-0 rail-grid-bg pointer-events-none opacity-40 z-0" />

      {/* Main Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        performanceMode={state.performanceMode}
        setPerformanceMode={(m) => railStore.setPerformanceMode(m)}
        themeMode={state.themeMode}
        setThemeMode={(m) => railStore.setThemeMode(m)}
        soundEnabled={state.soundEnabled}
        toggleSound={() => railStore.toggleSound()}
        onOpenDemoCenter={() => setIsDemoCenterOpen(true)}
        unreadAlertCount={state.alerts.length}
      />

      {/* Dynamic View Content */}
      <main className="relative pt-20 pb-24 z-10">
        {/* VIEW 1: SEARCH & HERO 3D STATION */}
        {activeTab === 'search' && (
          <div className="space-y-8">
            {/* Cinematic 3D Station Hero Section */}
            <div className="relative min-h-[580px] md:min-h-[660px] flex items-center justify-center overflow-hidden border-b border-cyan-500/20">
              <HeroStationCanvas
                performanceMode={state.performanceMode}
                themeMode={state.themeMode}
              />
              <HeroSearch onSearch={() => {}} />
            </div>

            {/* Express Train Results List */}
            <TrainSearchResults
              trains={state.trains}
              onSelectTrainAndCoach={handleSelectTrainAndCoach}
              onViewRouteTelemetry={handleViewRouteTelemetry}
            />
          </div>
        )}

        {/* VIEW 2: 3D COACH INTERIOR & SEAT SELECTOR */}
        {activeTab === 'coach3d' && (
          <CoachSeatSelector
            train={activeTrain}
            seats={state.seats}
            selectedSeat={state.selectedSeat}
            performanceMode={state.performanceMode}
            themeMode={state.themeMode}
            onProceedToBooking={handleProceedToBooking}
            onTriggerAiForSeat={() => {
              // Open RailBot
            }}
          />
        )}

        {/* VIEW 3: PASSENGER DETAILS & 3D PAYMENT */}
        {activeTab === 'booking' && (
          <PassengerAndPayment
            train={activeTrain}
            seat={state.selectedSeat || state.seats[0]}
            onBookingComplete={handleBookingComplete}
            onBackToSeats={handleBackToSeats}
          />
        )}

        {/* VIEW 4: 3D DIGITAL TICKET */}
        {activeTab === 'ticket' && (
          <div className="py-6">
            <div className="text-center mb-4">
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block animate-ping mr-2" />
              <span className="font-hud font-bold text-sm text-emerald-400 uppercase tracking-widest">
                BOOKING CONFIRMED & PNR ISSUED
              </span>
            </div>
            <DigitalTicket3D
              booking={activeCreatedBooking || state.bookings[0]}
              onClose={() => setActiveTab('dashboard')}
            />
          </div>
        )}

        {/* VIEW 5: LIVE 3D TELEMETRY & ROUTE */}
        {activeTab === 'live' && (
          <LiveTrackingView
            train={activeTrain}
            platform={state.platform}
            userCoach={state.coach}
            performanceMode={state.performanceMode}
            themeMode={state.themeMode}
          />
        )}

        {/* VIEW 6: SMART PRE-BOOKING MANAGEMENT */}
        {activeTab === 'prebook' && (
          <div className="py-6 px-4">
            <PreBookingManager
              booking={state.bookings[0]}
              onPaymentSuccess={() => {
                sound.playSuccess();
              }}
            />
          </div>
        )}

        {/* VIEW 7: AUTOMATED WAITING LIST */}
        {activeTab === 'waitinglist' && (
          <div className="py-6 px-4">
            <WaitingListSection waitingList={state.waitingList} />
          </div>
        )}

        {/* VIEW 8: USER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <Dashboard bookings={state.bookings} onBookNew={() => setActiveTab('search')} />
        )}
      </main>

      {/* Real-Time Platform Alert / Platform Change Modal */}
      {state.activeAlertModal && (
        <PlatformAlertModal
          alert={state.activeAlertModal}
          onClose={() => railStore.dismissAlertModal()}
        />
      )}

      {/* College Presentation Demo Control Center Modal */}
      <DemoControlCenter
        isOpen={isDemoCenterOpen}
        onClose={() => setIsDemoCenterOpen(false)}
        onTriggerAiQuestion={handleTriggerAiQuestion}
      />

      {/* RailBot AI Assistant (Floating 3D AI Orb + Chat) */}
      <RailBotChat
        currentPage={activeTab}
        onNavigateToBooking={() => setActiveTab('booking')}
        onNavigateToPlatform={() => setActiveTab('live')}
      />

      {/* Global Prototype Disclaimer Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/90 border-t border-slate-800/80 px-4 py-2 text-center text-[10px] text-slate-500 backdrop-blur-md">
        <span>
          🚆 <strong>RailConnect India</strong> • College Project Prototype • Powered by Three.js &
          RailBot AI • Not affiliated with IRCTC or Indian Railways.
        </span>
      </footer>
    </div>
  );
}
