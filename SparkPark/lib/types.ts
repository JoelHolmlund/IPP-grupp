export type Parking = {
  id: string;
  zone_code: string;
  name: string;
  city: string;
  type: string;
  latitude: number;
  longitude: number;
  created_at?: string;
};

export type ParkingWithDistance = Parking & {
  distanceMeters?: number;
};

export type ParkingSession = {
  id: string;
  user_id: string;
  parkering_id: string;
  started_at: string;
  parkering?: Parking;
};

export type ParkingReceipt = {
  id: string;
  user_id: string;
  parkering_id: string;
  parkering_name: string;
  parkering_zone_code: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  price_per_minute: number;
  total_cost: number;
  created_at?: string;
};

export const PRICE_PER_MINUTE = 10;

/** Kostnad i kr (10 kr/min), räknat i sekunder, avrundat till 2 decimaler */
export function costFromSeconds(seconds: number, krPerMin = PRICE_PER_MINUTE): number {
  return Math.round((seconds / 60) * krPerMin * 100) / 100;
}
