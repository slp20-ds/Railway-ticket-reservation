import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini Client server-side
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey) {
  genAI = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// RailBot AI Endpoint
app.post('/api/railbot', async (req: Request, res: Response) => {
  try {
    const { message, context, language = 'English', action } = req.body;

    const systemInstruction = `You are RailBot AI, the Smart Railway Travel Assistant for RailConnect India — a futuristic, next-generation Indian Railway Reservation System prototype.
Important persona guidelines:
1. Tone: Friendly, concise, highly professional, futuristic, and helpful.
2. Prototype Policy context:
   - "Smart Pre-Booking": Users can reserve any seat by paying an initial 10% advance fare. They have a 24-hour countdown timer to pay the remaining 90%. If the timer expires, the seat is released back to the waiting list passenger (e.g., WL 1) and advance is forfeited per prototype demo rules. Always clarify this is a proposed demo prototype feature, not an official IRCTC policy!
   - Official terminology: Clarify RAC (Reservation Against Cancellation), WL (Waiting List), PNR (Passenger Name Record - 10-digit number), Berth types (Lower, Middle, Upper, Side Lower, Side Upper, Cabin).
   - 15-Minute Platform Alert: Simulated smart geo-station notification giving platform number, coach indicator, and audio chime.
3. Language Support:
   - The user has requested the answer in ${language}.
   - Respond fluently in ${language}. (If Tamil, answer in Tamil script; if Hindi, in Devanagari script; if Malayalam, Malayalam script; if Telugu, Telugu script; if Kannada, Kannada script; if English, English).
   - Keep train numbers, coach codes (e.g., S4, B2), and station names easily readable.
4. Context-awareness:
   - Always reference the user's active page and booking state provided in the context (Train: ${context?.trainName || 'Not selected'}, Coach: ${context?.coach || 'S4'}, Selected Seat: ${context?.selectedSeat || 'None'}, Total Fare: ₹${context?.fare || '1500'}, Countdown remaining: ${context?.countdown || 'N/A'}, Current Platform: ${context?.platform || '04'}).
5. Suggested Actions:
   - If suggesting a seat or an action, provide a direct recommendation.`;

    if (!genAI || !apiKey) {
      // Fallback domain-aware assistant response if API key is not yet set
      const fallbackReply = generateFallbackResponse(message, context, language);
      return res.json({
        reply: fallbackReply.reply,
        suggestedAction: fallbackReply.action,
        isDemoData: true,
        language,
      });
    }

    const promptText = `User Question: "${message}"
Current Page & Booking Context:
- Current Page: ${context?.currentPage || 'Home'}
- Selected Train: ${context?.trainNumber || '12627'} - ${context?.trainName || 'Karnataka Express'} (${context?.from || 'Chennai'} -> ${context?.to || 'Bengaluru'})
- Coach: ${context?.coach || 'S4'}
- Selected Seat: ${context?.selectedSeat ? `${context.selectedSeat.number} (${context.selectedSeat.berth})` : 'None'}
- Available Seats in coach: ${context?.availableSeatsCount || '18 seats available'}
- Booking Mode: ${context?.bookingMode || 'Full Booking'}
- Total Fare: ₹${context?.fare || 1500}
- Smart Pre-Book Paid (10%): ₹${context?.advancePaid || 150}
- Remaining Balance (90%): ₹${context?.balanceDue || 1350}
- Pre-booking countdown left: ${context?.countdown || '23h 48m'}
- PNR: ${context?.pnr || '8429103841'} (Status: ${context?.pnrStatus || 'CNF'})
- Platform: ${context?.platform || '04'}
- Train Delay Status: ${context?.delayStatus || 'On Time (0 min delay)'}

Please provide a helpful, succinct answer in ${language}. If recommending a seat or action, specify it clearly.`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I am ready to assist your railway journey.';

    // Check if reply recommends a specific seat like 36, 42, 18, 25
    let suggestedAction = null;
    const seatMatch = reply.match(/S4\/(\d{1,2})|seat\s+(\d{1,2})/i);
    if (seatMatch) {
      const seatNum = seatMatch[1] || seatMatch[2];
      suggestedAction = { type: 'select_seat', seatNumber: seatNum, label: `Select Recommended Seat (${seatNum})` };
    } else if (message.toLowerCase().includes('pay') || message.toLowerCase().includes('balance')) {
      suggestedAction = { type: 'navigate_payment', label: 'Proceed to Payment' };
    } else if (message.toLowerCase().includes('platform') || message.toLowerCase().includes('where is my coach')) {
      suggestedAction = { type: 'view_platform', label: 'Guide Me to Platform' };
    }

    return res.json({
      reply,
      suggestedAction,
      isDemoData: true,
      language,
    });
  } catch (error: any) {
    console.error('RailBot API Error:', error);
    const { message, context, language = 'English' } = req.body;
    const fallback = generateFallbackResponse(message, context, language);
    return res.json({
      reply: fallback.reply,
      suggestedAction: fallback.action,
      isDemoData: true,
      language,
      note: 'Processed via RailConnect local intelligent knowledge base',
    });
  }
});

// Domain knowledge fallback for zero-downtime offline & showcase resilience
function generateFallbackResponse(msg: string = '', ctx: any, lang: string = 'English') {
  const m = msg.toLowerCase();
  
  if (m.includes('seat') || m.includes('lower') || m.includes('window') || m.includes('berth')) {
    return {
      reply: `For Coach S4, I recommend Seat 42 (Lower Berth near window) or Seat 36 (Lower Berth). Lower berths offer convenient access and prime window views for scenic rail journeys.`,
      action: { type: 'select_seat', seatNumber: '42', label: 'Select Seat 42 (Lower Berth)' },
    };
  }

  if (m.includes('pre-book') || m.includes('10%') || m.includes('expire') || m.includes('balance') || m.includes('countdown')) {
    return {
      reply: `Smart Pre-Booking allows you to secure your preferred berth by paying only 10% advance (₹${ctx?.advancePaid || 150}). You have a 24-hour countdown window to pay the remaining 90% (₹${ctx?.balanceDue || 1350}). If the 24-hour timer expires without final payment, the seat is automatically transferred to the next waiting-list passenger (WL 1) and advance is forfeited per RailConnect demo policy.`,
      action: { type: 'navigate_payment', label: 'Pay Remaining 90%' },
    };
  }

  if (m.includes('rac')) {
    return {
      reply: `RAC stands for Reservation Against Cancellation. With an RAC ticket, you are guaranteed boarding and travel on the train! Passengers with RAC share a side lower berth (2 passengers per berth) until cancellations upgrade one to a full berth.`,
      action: null,
    };
  }

  if (m.includes('wl') || m.includes('waiting')) {
    return {
      reply: `WL stands for Waiting List. If your ticket shows WL 1, you will be the first passenger automatically upgraded to Confirmed (CNF) as soon as any seat is cancelled or an expired Smart Pre-Booking is released!`,
      action: null,
    };
  }

  if (m.includes('platform') || m.includes('coach') || m.includes('where is')) {
    return {
      reply: `Train ${ctx?.trainNumber || '12627'} (${ctx?.trainName || 'Karnataka Express'}) is scheduled on Platform ${ctx?.platform || '04'}. Coach S4 is positioned mid-train behind the AC coaches. Our 3D Platform HUD displays animated coach pointers!`,
      action: { type: 'view_platform', label: 'Open 3D Platform View' },
    };
  }

  if (m.includes('alert') || m.includes('15')) {
    return {
      reply: `The 15-Minute Arrival Alert triggers automated auditory chimes and visual HUD indicators when your train is within 15 km / 15 minutes of the station, helping you assemble at Platform ${ctx?.platform || '04'} without rush.`,
      action: null,
    };
  }

  return {
    reply: `Welcome to RailConnect India! I can assist you with 3D seat recommendations (Lower/Middle/Upper berths), Smart Pre-Booking (10% advance), PNR status tracking, live platform indicators, and IRCTC travel rules. What would you like to explore?`,
    action: { type: 'select_seat', seatNumber: '36', label: 'Highlight Seat S4/36' },
  };
}

// Development or Production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`RailConnect India server running on http://localhost:${port}`);
  });
}

startServer();
