import React, { useState, useRef, useEffect } from 'react';
import { AiOrbCanvas, AIOrbState } from './3d/AiOrbCanvas';
import { AILanguage } from '../types';
import { railStore } from '../services/railStore';
import { sound } from '../services/sound';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: number;
  action?: {
    type: string;
    seatNumber?: string;
    label: string;
  };
}

interface RailBotChatProps {
  currentPage: string;
  onNavigateToBooking?: () => void;
  onNavigateToPlatform?: () => void;
}

export const RailBotChat: React.FC<RailBotChatProps> = ({
  currentPage,
  onNavigateToBooking,
  onNavigateToPlatform,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Namaste! I am RailBot AI, your Smart Railway Travel Assistant. Ask me anything about 3D seat selections (Lower/Upper berths), Smart Pre-Booking (10% advance), waiting list updates, or platform tracking!',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [orbState, setOrbState] = useState<AIOrbState>('idle');
  const [language, setLanguage] = useState<AILanguage>('English');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  // Voice synthesis (TTS)
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  };

  // Speech Recognition (Voice Input)
  const startVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang =
        language === 'Hindi'
          ? 'hi-IN'
          : language === 'Tamil'
          ? 'ta-IN'
          : language === 'Malayalam'
          ? 'ml-IN'
          : language === 'Telugu'
          ? 'te-IN'
          : language === 'Kannada'
          ? 'kn-IN'
          : 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setOrbState('listening');
        sound.playClick(900);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setOrbState('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        setOrbState('idle');
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setOrbState('idle');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isThinking) return;

    sound.playClick(850);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);
    setOrbState('thinking');

    // Gather live context from railStore
    const state = railStore.getState();
    const activeTrain = railStore.getActiveTrain();
    const activeBooking = state.bookings[0];

    const contextPayload = {
      currentPage,
      trainNumber: activeTrain.number,
      trainName: activeTrain.name,
      from: activeTrain.from,
      to: activeTrain.to,
      coach: state.coach,
      selectedSeat: state.selectedSeat,
      fare: state.selectedSeat ? state.selectedSeat.fare : activeTrain.baseFare,
      advancePaid: Math.round((state.selectedSeat ? state.selectedSeat.fare : 1500) * 0.1),
      balanceDue: Math.round((state.selectedSeat ? state.selectedSeat.fare : 1500) * 0.9),
      countdown: '23 hours, 47 minutes',
      pnr: activeBooking?.pnr || '8429103841',
      pnrStatus: activeBooking?.status || 'CNF',
      platform: state.platform,
      delayStatus: activeTrain.status,
    };

    try {
      const response = await fetch('/api/railbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: contextPayload,
          language,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Here is the railway information you requested.',
        timestamp: Date.now(),
        action: data.suggestedAction,
      };

      setMessages((prev) => [...prev, botMsg]);
      setOrbState('responding');
      speakText(botMsg.text);

      setTimeout(() => setOrbState('idle'), 2000);
    } catch {
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: 'RailConnect knowledge base: Lower berths offer easiest accessibility, while Upper berths provide maximum privacy. Smart Pre-Booking holds seats with 10% advance for 24 hours.',
        timestamp: Date.now(),
        action: { type: 'select_seat', seatNumber: '36', label: 'Select Lower Berth S4/36' },
      };
      setMessages((prev) => [...prev, errorMsg]);
      setOrbState('idle');
    } finally {
      setIsThinking(false);
    }
  };

  const handleExecuteAction = (action: ChatMessage['action']) => {
    if (!action) return;
    sound.playClick(1000);

    if (action.type === 'select_seat' && action.seatNumber) {
      railStore.selectSeatByNumber(action.seatNumber);
      if (onNavigateToBooking) onNavigateToBooking();
    } else if (action.type === 'navigate_payment' && onNavigateToBooking) {
      onNavigateToBooking();
    } else if (action.type === 'view_platform' && onNavigateToPlatform) {
      onNavigateToPlatform();
    }
  };

  const quickQuestions = [
    '💺 Help me choose a seat',
    '⏰ How much time is left?',
    '💳 How much do I need to pay?',
    '📍 Where is my platform?',
    '❓ What is RAC?',
    '❓ What is WL?',
  ];

  return (
    <>
      {/* Floating 3D AI Orb Launcher Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {!isOpen && (
          <button
            onClick={() => {
              sound.playClick(950);
              setIsOpen(true);
            }}
            className="group relative flex items-center gap-3 p-3 rounded-full bg-slate-900/90 border border-cyan-500/60 shadow-2xl hover:border-cyan-400 glow-cyan transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-xl"
            title="Open RailBot AI Assistant"
          >
            {/* 3D Orb Canvas */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <AiOrbCanvas state={orbState} size={48} />
            </div>

            <div className="pr-3 text-left hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-hud font-bold text-xs text-cyan-300 tracking-wider">
                  RAILBOT AI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-[10px] text-slate-400">Ask Railway Doubts</div>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[390px] md:max-w-[420px] h-[580px] rounded-2xl glass-panel-glow border border-cyan-500/50 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 border-b border-cyan-500/30 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AiOrbCanvas state={orbState} size={36} />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-hud font-bold text-sm text-cyan-300 tracking-wide">
                    RAILBOT AI
                  </h4>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 font-mono-rail">
                    v3.8
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Smart Railway Travel Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as AILanguage)}
                className="bg-slate-900 border border-slate-700 text-slate-200 text-[10px] rounded-lg px-2 py-1 outline-none font-hud"
              >
                <option value="English">English</option>
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="Tamil">தமிழ் (Tamil)</option>
                <option value="Malayalam">മലയാളം (Malayalam)</option>
                <option value="Telugu">తెలుగు (Telugu)</option>
                <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
              </select>

              {/* TTS Voice Toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors cursor-pointer ${
                  voiceEnabled
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/60'
                    : 'bg-slate-800 text-slate-400'
                }`}
                title={voiceEnabled ? 'Voice Output ON' : 'Voice Output OFF'}
              >
                {voiceEnabled ? '🔊' : '🔇'}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick Questions Chips */}
          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] whitespace-nowrap scrollbar-none">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950/70 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-[10px] transition-all cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none shadow-md shadow-cyan-600/20'
                      : 'bg-slate-900/90 text-slate-200 border border-cyan-500/25 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Context Action Button if recommended */}
                  {msg.action && (
                    <button
                      onClick={() => handleExecuteAction(msg.action)}
                      className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-hud font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/30 cursor-pointer"
                    >
                      <span>✨</span>
                      <span>{msg.action.label}</span>
                    </button>
                  )}
                </div>

                <span className="text-[9px] text-slate-500 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}

            {isThinking && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/20 max-w-[70%]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-cyan-300 text-[11px] font-mono-rail">
                  RailBot is analyzing railway telemetry...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 border-t border-cyan-500/30 bg-slate-950/90 flex items-center gap-2">
            <button
              onClick={startVoiceInput}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500/30 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 hover:border-cyan-500/50 text-slate-300'
              }`}
              title="Speak by Voice"
            >
              🎙️
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Ask RailBot in ${language}...`}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none transition-all font-sans"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isThinking}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/30 cursor-pointer"
            >
              <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
