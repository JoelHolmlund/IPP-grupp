import { supabase } from "./supabase";
import type { ParkingSession, ParkingReceipt } from "./types";
import { costFromSeconds, PRICE_PER_MINUTE } from "./types";

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Skapa anonym session om användaren inte är inloggad (för demo). */
export async function ensureUser(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return user.id;
  const { data: { user: anon }, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!anon) throw new Error("Kunde inte skapa användare");
  return anon.id;
}

export async function startSession(parkeringId: string): Promise<ParkingSession> {
  const userId = await ensureUser();
  const { data, error } = await supabase
    .from("parking_sessions")
    .insert({ user_id: userId, parkering_id: parkeringId })
    .select()
    .single();
  if (error) throw error;
  const session = data as ParkingSession;
  const { data: parkering } = await supabase
    .from("parkeringar")
    .select("*")
    .eq("id", session.parkering_id)
    .single();
  return { ...session, parkering: parkering ?? undefined };
}

export async function getActiveSession(): Promise<ParkingSession | null> {
  const sessions = await getActiveSessions();
  return sessions[0] ?? null;
}

/** Alla aktiva parkeringar för användaren (nyast först). */
export async function getActiveSessions(): Promise<ParkingSession[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data: sessions, error } = await supabase
    .from("parking_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });
  if (error) throw error;
  if (!sessions?.length) return [];
  const withParkering: ParkingSession[] = await Promise.all(
    sessions.map(async (s) => {
      const { data: parkering } = await supabase
        .from("parkeringar")
        .select("*")
        .eq("id", s.parkering_id)
        .single();
      return { ...s, parkering: parkering ?? undefined } as ParkingSession;
    })
  );
  return withParkering;
}

export async function stopSession(sessionId: string): Promise<ParkingReceipt> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Ej inloggad");

  const { data: session, error: sessionError } = await supabase
    .from("parking_sessions")
    .select("*, parkeringar(name, zone_code)")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .single();
  if (sessionError || !session) throw new Error("Session hittades inte");

  const startedAt = new Date(session.started_at);
  const endedAt = new Date();
  const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
  const totalCost = costFromSeconds(durationSeconds, PRICE_PER_MINUTE);

  const parkering = (session as { parkeringar: { name: string; zone_code: string } }).parkeringar;
  const receipt = {
    user_id: userId,
    parkering_id: session.parkering_id,
    parkering_name: parkering?.name ?? "Okänd plats",
    parkering_zone_code: parkering?.zone_code ?? "",
    started_at: session.started_at,
    ended_at: endedAt.toISOString(),
    duration_seconds: durationSeconds,
    price_per_minute: PRICE_PER_MINUTE,
    total_cost: totalCost,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("parking_receipts")
    .insert(receipt)
    .select()
    .single();
  if (insertError) throw insertError;

  await supabase.from("parking_sessions").delete().eq("id", sessionId).eq("user_id", userId);

  return inserted as ParkingReceipt;
}

export async function getReceipts(): Promise<ParkingReceipt[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from("parking_receipts")
    .select("*")
    .eq("user_id", userId)
    .order("ended_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ParkingReceipt[];
}
