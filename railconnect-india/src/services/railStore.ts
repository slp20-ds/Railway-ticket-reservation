import { 
  Train, 
  Seat, 
  BerthType, 
  Booking, 
  WaitingListPassenger, 
  PlatformAlert, 
  PerformanceMode, 
  ThemeMode 
} from '../types';
import { sound } from './sound';

// Pre-configured Trains
export const SAMPLE_TRAINS: Train[] = [
  {
    id: 'train-12627',
    number: '12627',
    name: 'Karnataka Express',
    from: 'Chennai Central',
    fromCode: 'MAS',
    to: 'KSR Bengaluru',
    toCode: 'SBC',
    departure: '06:00',
    arrival: '11:45',
    duration: '5h 45m',
    classes: ['2S', 'SL', '3A', '2A', '1A'],
    coaches: ['S1', 'S2', 'S3', 'S4', 'S5', 'B1', 'B2', 'A1'],
    baseFare: 850,
    rating: 4.8,
    type: 'Superfast',
    status: 'ON TIME',
    platform: '04',
    stations: [
      { code: 'MAS', name: 'Chennai Central', city: 'Chennai', time: '06:00', distanceKm: 0, platform: '04', isPassed: true, isCurrent: false },
      { code: 'AJJ', name: 'Arakkonam Jn', city: 'Arakkonam', time: '06:58', distanceKm: 69, platform: '01', isPassed: true, isCurrent: false },
      { code: 'KPD', name: 'Katpadi Jn', city: 'Katpadi', time: '07:48', distanceKm: 130, platform: '01', isPassed: false, isCurrent: true },
      { code: 'JTJ', name: 'Jolarpettai Jn', city: 'Jolarpettai', time: '09:08', distanceKm: 214, platform: '02', isPassed: false, isCurrent: false },
      { code: 'BWT', name: 'Bangarapet', city: 'Bangarapet', time: '10:18', distanceKm: 289, platform: '03', isPassed: false, isCurrent: false },
      { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', time: '11:45', distanceKm: 359, platform: '01', isPassed: false, isCurrent: false },
    ],
  },
  {
    id: 'train-20608',
    number: '20608',
    name: 'Vande Bharat Express',
    from: 'Chennai Central',
    fromCode: 'MAS',
    to: 'Mysuru Jn',
    toCode: 'MYS',
    departure: '05:50',
    arrival: '10:20',
    duration: '4h 30m',
    classes: ['CC', 'EC'],
    coaches: ['C1', 'C2', 'C3', 'C4', 'E1', 'E2'],
    baseFare: 1450,
    rating: 4.9,
    type: 'Vande Bharat',
    status: 'ON TIME',
    platform: '02',
    stations: [
      { code: 'MAS', name: 'Chennai Central', city: 'Chennai', time: '05:50', distanceKm: 0, platform: '02', isPassed: true, isCurrent: false },
      { code: 'KPD', name: 'Katpadi Jn', city: 'Katpadi', time: '07:13', distanceKm: 130, platform: '01', isPassed: false, isCurrent: true },
      { code: 'SBC', name: 'KSR Bengaluru', city: 'Bengaluru', time: '10:20', distanceKm: 359, platform: '07', isPassed: false, isCurrent: false },
    ],
  },
  {
    id: 'train-12431',
    number: '12431',
    name: 'Trivandrum Rajdhani',
    from: 'Hazrat Nizamuddin',
    fromCode: 'NZM',
    to: 'Thiruvananthapuram',
    toCode: 'TVC',
    departure: '06:16',
    arrival: '14:00',
    duration: '31h 44m',
    classes: ['3A', '2A', '1A'],
    coaches: ['B1', 'B2', 'B3', 'B4', 'A1', 'A2', 'H1'],
    baseFare: 3200,
    rating: 4.7,
    type: 'Rajdhani',
    status: 'ON TIME',
    platform: '03',
    stations: [
      { code: 'NZM', name: 'H. Nizamuddin', city: 'Delhi', time: '06:16', distanceKm: 0, platform: '03', isPassed: true, isCurrent: false },
      { code: 'KOTA', name: 'Kota Jn', city: 'Kota', time: '10:40', distanceKm: 458, platform: '02', isPassed: false, isCurrent: true },
      { code: 'BRC', name: 'Vadodara Jn', city: 'Vadodara', time: '16:00', distanceKm: 986, platform: '01', isPassed: false, isCurrent: false },
      { code: 'TVC', name: 'Thiruvananthapuram', city: 'Trivandrum', time: '14:00', distanceKm: 2848, platform: '01', isPassed: false, isCurrent: false },
    ],
  },
  {
    id: 'train-22671',
    number: '22671',
    name: 'Tejas Express',
    from: 'Chennai Egmore',
    fromCode: 'MS',
    to: 'Madurai Jn',
    toCode: 'MDU',
    departure: '06:00',
    arrival: '12:15',
    duration: '6h 15m',
    classes: ['CC', 'EC'],
    coaches: ['C1', 'C2', 'C3', 'C4', 'E1'],
    baseFare: 1150,
    rating: 4.8,
    type: 'Tejas',
    status: 'ON TIME',
    platform: '05',
    stations: [
      { code: 'MS', name: 'Chennai Egmore', city: 'Chennai', time: '06:00', distanceKm: 0, platform: '05', isPassed: true, isCurrent: false },
      { code: 'TBM', name: 'Tambaram', city: 'Chennai', time: '06:25', distanceKm: 25, platform: '01', isPassed: true, isCurrent: false },
      { code: 'TPJ', name: 'Tiruchchirappalli', city: 'Trichy', time: '09:55', distanceKm: 336, platform: '01', isPassed: false, isCurrent: true },
      { code: 'MDU', name: 'Madurai Jn', city: 'Madurai', time: '12:15', distanceKm: 497, platform: '02', isPassed: false, isCurrent: false },
    ],
  },
];

// Helper to determine Berth Type according to standard Indian Railways Coach Layout
export function getBerthType(seatNum: number): BerthType {
  const mod = seatNum % 8;
  if (mod === 1 || mod === 4) return 'Lower';
  if (mod === 2 || mod === 5) return 'Middle';
  if (mod === 3 || mod === 6) return 'Upper';
  if (mod === 7) return 'Side Lower';
  return 'Side Upper'; // mod === 0
}

// Generate Coach S4 Seats (72 standard berths)
export function generateCoachSeats(coachName = 'S4', baseFare = 850): Seat[] {
  const seats: Seat[] = [];
  const occupiedNumbers = [3, 4, 11, 12, 19, 20, 27, 28, 45, 52, 60, 68];
  const prebookedNumbers = [36]; // Seat 36 initially pre-booked with 10%
  const racNumbers = [7, 15, 23];

  for (let i = 1; i <= 72; i++) {
    const berth = getBerthType(i);
    const bay = Math.floor((i - 1) / 8);
    const mod = (i - 1) % 8;

    // Calculate 3D coordinate along coach length (X), height (Y), width (Z)
    // Aisle runs along Z = 0. Main cabin on one side (Z = 0.9 to 1.8), Side berths on other side (Z = -0.9 to -1.4)
    const baySpacing = 2.4;
    const x = (bay - 4) * baySpacing + (mod >= 6 ? 0.3 : 0);

    let y = 0.5; // Lower berth height
    if (berth === 'Middle') y = 1.35;
    if (berth === 'Upper' || berth === 'Side Upper') y = 2.15;

    let z = 1.1; // Default cabin berth side
    if (berth === 'Side Lower' || berth === 'Side Upper') {
      z = -1.15; // Side berth across the aisle
    }

    let status: Seat['status'] = 'available';
    if (occupiedNumbers.includes(i)) status = 'occupied';
    else if (prebookedNumbers.includes(i)) status = 'prebooked';
    else if (racNumbers.includes(i)) status = 'rac';

    seats.push({
      id: `${coachName}-${i}`,
      number: i,
      coach: coachName,
      berth,
      status,
      fare: baseFare + (berth === 'Lower' ? 50 : 0),
      bay: bay + 1,
      position: { x, y, z },
      preBookExpiresAt: prebookedNumbers.includes(i) ? Date.now() + 23 * 3600 * 1000 + 47 * 60 * 1000 : undefined,
    });
  }

  return seats;
}

// Initial Waiting List Queue
export const INITIAL_WAITING_LIST: WaitingListPassenger[] = [
  { position: 1, id: 'wl-1', name: 'Arjun Verma', pnr: '8492019381', coachPreference: 'S4', berthPreference: 'Lower' },
  { position: 2, id: 'wl-2', name: 'Rahul Sharma', pnr: '8492019382', coachPreference: 'S4', berthPreference: 'Middle' },
  { position: 3, id: 'wl-3', name: 'Priya Nair', pnr: '8492019383', coachPreference: 'S4', berthPreference: 'Upper' },
  { position: 4, id: 'wl-4', name: 'Ananya Iyer', pnr: '8492019384', coachPreference: 'S4', berthPreference: 'Side Lower' },
];

export interface RailState {
  trains: Train[];
  activeTrainId: string;
  coach: string;
  seats: Seat[];
  selectedSeat: Seat | null;
  bookings: Booking[];
  waitingList: WaitingListPassenger[];
  alerts: PlatformAlert[];
  platform: string;
  oldPlatform?: string;
  showPlatformChangeModal: boolean;
  performanceMode: PerformanceMode;
  themeMode: ThemeMode;
  soundEnabled: boolean;
  activeAlertModal: PlatformAlert | null;
  // Journey filters
  searchOrigin: string;
  searchDestination: string;
  searchDate: string;
  searchClass: string;
}

const STORAGE_KEY = 'railconnect_state_v1';
const CHANNEL_NAME = 'railconnect_sync_channel';

class RailStore {
  private state: RailState;
  private listeners: Set<() => void> = new Set();
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.state = this.loadInitialState();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_STATE') {
          this.state = { ...this.state, ...event.data.payload };
          this.notify(false);
        }
      };
    }
  }

  private loadInitialState(): RailState {
    const defaultTrain = SAMPLE_TRAINS[0];
    const initialSeats = generateCoachSeats('S4', defaultTrain.baseFare);
    
    // Sample initial booking for immediate demonstration
    const initialBookings: Booking[] = [
      {
        pnr: '8429103841',
        trainNumber: '12627',
        trainName: 'Karnataka Express',
        from: 'Chennai Central',
        to: 'KSR Bengaluru',
        date: '14 Oct 2026',
        coach: 'S4',
        seatNumber: 36,
        berth: 'Lower',
        passengerName: 'Karthik Raja',
        passengerAge: 29,
        passengerGender: 'Male',
        fare: 1500,
        bookingType: 'prebook',
        advancePaid: 150,
        balanceDue: 1350,
        status: 'PREBOOKED',
        preBookExpiresAt: Date.now() + 23 * 3600 * 1000 + 47 * 60 * 1000 + 32 * 1000,
        platform: '04',
        createdAt: Date.now() - 3600 * 1000,
      },
    ];

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...parsed,
            trains: SAMPLE_TRAINS, // Keep fresh train data
          };
        }
      } catch {
        // Ignore fallback
      }
    }

    return {
      trains: SAMPLE_TRAINS,
      activeTrainId: defaultTrain.id,
      coach: 'S4',
      seats: initialSeats,
      selectedSeat: null,
      bookings: initialBookings,
      waitingList: INITIAL_WAITING_LIST,
      alerts: [],
      platform: '04',
      showPlatformChangeModal: false,
      performanceMode: 'high',
      themeMode: 'dark',
      soundEnabled: true,
      activeAlertModal: null,
      searchOrigin: 'Chennai Central (MAS)',
      searchDestination: 'KSR Bengaluru (SBC)',
      searchDate: '2026-10-14',
      searchClass: 'SL',
    };
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch {
        // Ignore quota
      }
    }
  }

  private notify(broadcast = true) {
    this.saveState();
    this.listeners.forEach((listener) => listener());
    if (broadcast && this.channel) {
      this.channel.postMessage({
        type: 'SYNC_STATE',
        payload: this.state,
      });
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getState(): RailState {
    return this.state;
  }

  public getActiveTrain(): Train {
    return this.state.trains.find((t) => t.id === this.state.activeTrainId) || this.state.trains[0];
  }

  // State Mutators
  public setActiveTrain(trainId: string) {
    const train = this.state.trains.find((t) => t.id === trainId);
    if (!train) return;
    this.state.activeTrainId = trainId;
    this.state.platform = train.platform;
    this.state.seats = generateCoachSeats('S4', train.baseFare);
    this.state.selectedSeat = null;
    sound.playClick(900);
    this.notify();
  }

  public setCoach(coachName: string) {
    this.state.coach = coachName;
    const train = this.getActiveTrain();
    this.state.seats = generateCoachSeats(coachName, train.baseFare);
    this.state.selectedSeat = null;
    sound.playClick(1000);
    this.notify();
  }

  public selectSeat(seat: Seat) {
    if (seat.status === 'occupied' || seat.status === 'unavailable') {
      sound.playClick(400);
      return;
    }

    // Toggle if same seat clicked
    if (this.state.selectedSeat?.id === seat.id) {
      this.state.selectedSeat = null;
      this.state.seats = this.state.seats.map((s) =>
        s.id === seat.id ? { ...s, status: 'available' } : s
      );
      this.notify();
      return;
    }

    // Reset previous selection
    this.state.seats = this.state.seats.map((s) => {
      if (s.status === 'selected') return { ...s, status: 'available' };
      if (s.id === seat.id) return { ...s, status: 'selected' };
      return s;
    });

    this.state.selectedSeat = { ...seat, status: 'selected' };
    sound.playSeatSelected();
    this.notify();
  }

  public selectSeatByNumber(seatNumber: number | string) {
    const num = typeof seatNumber === 'string' ? parseInt(seatNumber, 10) : seatNumber;
    const target = this.state.seats.find((s) => s.number === num);
    if (target) {
      this.selectSeat(target);
    }
  }

  public clearSelectedSeat() {
    this.state.seats = this.state.seats.map((s) =>
      s.status === 'selected' ? { ...s, status: 'available' } : s
    );
    this.state.selectedSeat = null;
    this.notify();
  }

  public createBooking(params: {
    passengerName: string;
    passengerAge: number;
    passengerGender: string;
    bookingType: 'full' | 'prebook';
  }): Booking {
    const train = this.getActiveTrain();
    const seat = this.state.selectedSeat || this.state.seats.find((s) => s.status === 'available')!;
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const advancePaid = params.bookingType === 'prebook' ? Math.round(seat.fare * 0.1) : seat.fare;
    const balanceDue = params.bookingType === 'prebook' ? seat.fare - advancePaid : 0;
    const expiresAt = params.bookingType === 'prebook' ? Date.now() + 24 * 3600 * 1000 : undefined;

    const newBooking: Booking = {
      pnr,
      trainNumber: train.number,
      trainName: train.name,
      from: train.from,
      to: train.to,
      date: '14 Oct 2026',
      coach: seat.coach,
      seatNumber: seat.number,
      berth: seat.berth,
      passengerName: params.passengerName,
      passengerAge: params.passengerAge,
      passengerGender: params.passengerGender,
      fare: seat.fare,
      bookingType: params.bookingType,
      advancePaid,
      balanceDue,
      status: params.bookingType === 'prebook' ? 'PREBOOKED' : 'CONFIRMED',
      preBookExpiresAt: expiresAt,
      platform: train.platform,
      createdAt: Date.now(),
    };

    // Update seat status in coach
    this.state.seats = this.state.seats.map((s) => {
      if (s.id === seat.id) {
        return {
          ...s,
          status: params.bookingType === 'prebook' ? 'prebooked' : 'occupied',
          preBookExpiresAt: expiresAt,
          passengerName: params.passengerName,
        };
      }
      return s;
    });

    this.state.bookings.unshift(newBooking);
    this.state.selectedSeat = null;
    sound.playSuccess();
    this.notify();
    return newBooking;
  }

  public completePreBookingPayment(pnr: string) {
    this.state.bookings = this.state.bookings.map((b) => {
      if (b.pnr === pnr) {
        return {
          ...b,
          status: 'CONFIRMED',
          advancePaid: b.fare,
          balanceDue: 0,
          preBookExpiresAt: undefined,
        };
      }
      return b;
    });

    // Mark seat occupied
    const booking = this.state.bookings.find((b) => b.pnr === pnr);
    if (booking) {
      this.state.seats = this.state.seats.map((s) => {
        if (s.number === booking.seatNumber && s.coach === booking.coach) {
          return { ...s, status: 'occupied', preBookExpiresAt: undefined };
        }
        return s;
      });
    }

    sound.playSuccess();
    this.notify();
  }

  // COLLEGE DEMO ACTIONS
  public simulate15MinAlert() {
    const train = this.getActiveTrain();
    const alert: PlatformAlert = {
      id: `alert-15min-${Date.now()}`,
      type: '15_min_arrival',
      title: 'TRAIN ARRIVAL ALERT',
      message: `Your train ${train.number} ${train.name} is arriving at ${train.to} in approximately 15 MINUTES!`,
      trainNumber: train.number,
      stationName: train.to,
      coach: this.state.coach,
      seat: 36,
      timestamp: Date.now(),
      read: false,
    };

    this.state.alerts.unshift(alert);
    this.state.activeAlertModal = alert;
    sound.playArrivalChime();
    this.notify();
  }

  public simulatePlatformChange(newPlat = '06') {
    const oldPlat = this.state.platform;
    const train = this.getActiveTrain();

    this.state.oldPlatform = oldPlat;
    this.state.platform = newPlat;

    const alert: PlatformAlert = {
      id: `alert-plat-${Date.now()}`,
      type: 'platform_change',
      title: 'CRITICAL PLATFORM CHANGE',
      message: `Attention Passengers: Train ${train.number} ${train.name} platform has changed from Platform ${oldPlat} to Platform ${newPlat}!`,
      trainNumber: train.number,
      stationName: train.to,
      oldPlatform: oldPlat,
      newPlatform: newPlat,
      coach: this.state.coach,
      seat: 36,
      timestamp: Date.now(),
      read: false,
    };

    this.state.alerts.unshift(alert);
    this.state.showPlatformChangeModal = true;
    this.state.activeAlertModal = alert;
    sound.playPlatformChangeAlert();
    this.notify();
  }

  public simulateExpirePreBooking() {
    // Look for pre-booked seat S4/36 or any prebooked seat
    const prebookedSeat = this.state.seats.find((s) => s.status === 'prebooked') || this.state.seats.find((s) => s.number === 36);
    const targetSeatNumber = prebookedSeat ? prebookedSeat.number : 36;

    // 1. Mark prebooking cancelled/expired
    this.state.bookings = this.state.bookings.map((b) => {
      if (b.seatNumber === targetSeatNumber && b.bookingType === 'prebook') {
        return { ...b, status: 'CANCELLED' };
      }
      return b;
    });

    // 2. Temporarily seat released to available
    this.state.seats = this.state.seats.map((s) => {
      if (s.number === targetSeatNumber) {
        return { ...s, status: 'available', passengerName: undefined, preBookExpiresAt: undefined };
      }
      return s;
    });

    // 3. Immediately allocate to Top Waiting List Passenger (Arjun Verma WL 1)
    if (this.state.waitingList.length > 0) {
      const nextPassenger = this.state.waitingList[0];
      const remainingWL = this.state.waitingList.slice(1).map((p, idx) => ({ ...p, position: idx + 1 }));

      const train = this.getActiveTrain();
      const upgradedBooking: Booking = {
        pnr: nextPassenger.pnr,
        trainNumber: train.number,
        trainName: train.name,
        from: train.from,
        to: train.to,
        date: '14 Oct 2026',
        coach: this.state.coach,
        seatNumber: targetSeatNumber,
        berth: getBerthType(targetSeatNumber),
        passengerName: nextPassenger.name,
        passengerAge: 32,
        passengerGender: 'Male',
        fare: 1500,
        bookingType: 'full',
        advancePaid: 1500,
        balanceDue: 0,
        status: 'CONFIRMED',
        platform: this.state.platform,
        createdAt: Date.now(),
      };

      this.state.waitingList = remainingWL;
      this.state.bookings.unshift(upgradedBooking);

      // Mark seat occupied by upgraded passenger
      this.state.seats = this.state.seats.map((s) => {
        if (s.number === targetSeatNumber) {
          return { ...s, status: 'occupied', passengerName: nextPassenger.name };
        }
        return s;
      });

      const alert: PlatformAlert = {
        id: `alert-wl-${Date.now()}`,
        type: 'wl_confirmed',
        title: 'WAITING LIST CONFIRMED!',
        message: `Seat ${this.state.coach}/${targetSeatNumber} was released from an expired pre-booking and automatically confirmed for WL 1 (${nextPassenger.name})!`,
        trainNumber: train.number,
        stationName: train.to,
        coach: this.state.coach,
        seat: targetSeatNumber,
        timestamp: Date.now(),
        read: false,
      };

      this.state.alerts.unshift(alert);
      this.state.activeAlertModal = alert;
      sound.playSuccess();
    }

    this.notify();
  }

  public simulateWLUpgrade() {
    this.simulateExpirePreBooking();
  }

  public simulateTrainDelay() {
    const train = this.getActiveTrain();
    train.status = 'DELAYED 15m';
    this.state.trains = [...this.state.trains];

    const alert: PlatformAlert = {
      id: `alert-delay-${Date.now()}`,
      type: '15_min_arrival',
      title: 'TRAIN DELAY UPDATE',
      message: `Train ${train.number} ${train.name} is running late by 15 minutes due to speed restrictions. Revised arrival: 12:00 PM.`,
      trainNumber: train.number,
      stationName: train.to,
      timestamp: Date.now(),
      read: false,
    };

    this.state.alerts.unshift(alert);
    this.state.activeAlertModal = alert;
    sound.playClick(600);
    this.notify();
  }

  public dismissAlertModal() {
    this.state.activeAlertModal = null;
    this.state.showPlatformChangeModal = false;
    this.notify();
  }

  public setPerformanceMode(mode: PerformanceMode) {
    this.state.performanceMode = mode;
    this.notify();
  }

  public setThemeMode(mode: ThemeMode) {
    this.state.themeMode = mode;
    this.notify();
  }

  public toggleSound() {
    this.state.soundEnabled = !this.state.soundEnabled;
    sound.setSoundEnabled(this.state.soundEnabled);
    if (this.state.soundEnabled) sound.playClick(800);
    this.notify();
  }

  public setSearchParams(params: { origin?: string; destination?: string; date?: string; classType?: string }) {
    if (params.origin) this.state.searchOrigin = params.origin;
    if (params.destination) this.state.searchDestination = params.destination;
    if (params.date) this.state.searchDate = params.date;
    if (params.classType) this.state.searchClass = params.classType;
    this.notify();
  }

  public resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = this.loadInitialState();
    sound.playClick(700);
    this.notify();
  }
}

export const railStore = new RailStore();
