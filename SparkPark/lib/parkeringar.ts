import { supabase } from "./supabase";
import type { Parking, ParkingWithDistance } from "./types";

export async function fetchParkeringar(): Promise<Parking[]> {
  const { data, error } = await supabase
    .from("parkeringar")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Parking[];
}

/** Ungefär avstånd i meter (haversine). */
export function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // meter
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function withDistances(
  parkeringar: Parking[],
  userLat: number,
  userLon: number
): ParkingWithDistance[] {
  return parkeringar.map((p) => ({
    ...p,
    distanceMeters: distanceMeters(userLat, userLon, p.latitude, p.longitude),
  }));
}
