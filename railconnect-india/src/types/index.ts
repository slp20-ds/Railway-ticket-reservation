export type BerthType = 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Cabin';

export type SeatStatus = 'available' | 'occupied' | 'selected' | 'prebooked' | 'rac' | 'unavailable';

export interface Seat {
  id: string;
  number: number;
  coach: string;
  berth: BerthType;
  status: SeatStatus;
  fare: number;
  bay: number;
  position: { x: number; y: number; z: number };
  passengerName?: string;
  preBookExpiresAt?: number;
}

export interface TrainStation {
  code: string;
  name: string;
  city: string;
  time: string;
  distanceKm: number;
  platform: string;
  isPassed: boolean;
  isCurrent: boolean;
}

export interface Train {
  id: string;
  number: string;
  name: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  departure: string;
  arrival: string;
  duration: string;
  classes: string[];
  coaches: string[];
  baseFare: number;
  rating: number;
  type: 'Vande Bharat' | 'Rajdhani' | 'Superfast' | 'Tejas' | 'Express';
  status: 'ON TIME' | 'DELAYED 15m' | 'ARRIVING' | 'DEPARTED';
  platform: string;
  stations: TrainStation[];
}

export interface WaitingListPassenger {
  position: number;
  id: string;
  name: string;
  pnr: string;
  coachPreference: string;
  berthPreference: BerthType;
}

export interface Booking {
  pnr: string;
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  date: string;
  coach: string;
  seatNumber: number;
  berth: BerthType;
  passengerName: string;
  passengerAge: number;
  passengerGender: string;
  fare: number;
  bookingType: 'full' | 'prebook';
  advancePaid: number;
  balanceDue: number;
  status: 'CONFIRMED' | 'PREBOOKED' | 'RAC' | 'WL' | 'CANCELLED';
  preBookExpiresAt?: number;
  platform: string;
  createdAt: number;
}

export interface PlatformAlert {
  id: string;
  type: '15_min_arrival' | 'platform_change' | 'wl_confirmed' | 'prebook_expired';
  title: string;
  message: string;
  trainNumber: string;
  stationName: string;
  oldPlatform?: string;
  newPlatform?: string;
  coach?: string;
  seat?: number;
  timestamp: number;
  read: boolean;
}

export type PerformanceMode = 'high' | 'balanced' | 'performance';
export type ThemeMode = 'dark' | 'day';
export type AILanguage = 'English' | 'Hindi' | 'Tamil' | 'Malayalam' | 'Telugu' | 'Kannada';
