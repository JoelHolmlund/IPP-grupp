import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  AppState,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getActiveSessions,
  stopSession,
} from "../../lib/parking-session";
import { costFromSeconds, PRICE_PER_MINUTE } from "../../lib/types";
import type { ParkingSession } from "../../lib/types";
import { Clock, MapPin, Receipt, ChevronRight } from "lucide-react-native";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ParkingScreen() {
  const router = useRouter();
  const [activeSessions, setActiveSessions] = useState<ParkingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stoppingId, setStoppingId] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const sessions = await getActiveSessions();
      setActiveSessions(sessions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // När appen öppnas igen (från bakgrund) – hämta aktiva sessioner från databasen så timern och biljetten är kvar
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") load();
    });
    return () => sub.remove();
  }, [load]);

  useEffect(() => {
    if (activeSessions.length === 0) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [activeSessions.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handleStopParking = async (session: ParkingSession) => {
    setStoppingId(session.id);
    try {
      await stopSession(session.id);
      await load();
    } catch (e) {
      console.error(e);
    } finally {
      setStoppingId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#166534" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#166534"]} />
      }
    >
      {activeSessions.length > 0 ? (
        <>
          <Text style={styles.persistenceHint}>
            Din parkering sparas och löper tills du stänger av – även om appen stängs.
          </Text>
          {activeSessions.map((session) => {
          const elapsedSeconds = Math.floor(
            (Date.now() - new Date(session.started_at).getTime()) / 1000
          );
          const currentCost = costFromSeconds(elapsedSeconds, PRICE_PER_MINUTE);
          const stopping = stoppingId === session.id;
          return (
            <View key={session.id} style={styles.activeCard}>
              <Text style={styles.activeLabel}>Aktiv parkering</Text>
              <View style={styles.activeRow}>
                <MapPin size={20} color="#166534" />
                <Text style={styles.activePlace}>
                  {session.parkering?.name ?? "–"} · Zon {session.parkering?.zone_code ?? "–"}
                </Text>
              </View>
              <View style={styles.timerRow}>
                <Clock size={24} color="#374151" />
                <Text style={styles.timerText}>{formatDuration(elapsedSeconds)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Timpris: {PRICE_PER_MINUTE} kr/min</Text>
                <Text style={styles.costValue}>{currentCost.toFixed(2)} kr</Text>
              </View>
              <Pressable
                style={[styles.stopBtn, stopping && styles.stopBtnDisabled]}
                onPress={() => handleStopParking(session)}
                disabled={stopping}
              >
                {stopping ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.stopBtnText}>Stäng av parkeringen</Text>
                )}
              </Pressable>
            </View>
          );
        })}
        </>
      ) : (
        <View style={styles.emptyActive}>
          <Text style={styles.emptyTitle}>Ingen aktiv parkering</Text>
          <Text style={styles.emptyHint}>
            Välj en plats under fliken Hitta och tryck på "Starta parkering vid …".
          </Text>
        </View>
      )}

      <Pressable
        style={styles.receiptsButton}
        onPress={() => router.push("/receipts")}
      >
        <View style={styles.receiptsButtonLeft}>
          <View style={styles.receiptsButtonIcon}>
            <Receipt size={22} color="#166534" />
          </View>
          <View>
            <Text style={styles.receiptsButtonTitle}>Tidigare parkeringar</Text>
            <Text style={styles.receiptsButtonSubtitle}>Se kvitton och historik</Text>
          </View>
        </View>
        <ChevronRight size={22} color="#6b7280" />
      </Pressable>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  persistenceHint: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  activeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#166534",
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  activePlace: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    flex: 1,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  timerText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 16,
  },
  costLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  costValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#166534",
  },
  stopBtn: {
    backgroundColor: "#b91c1c",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  stopBtnDisabled: {
    opacity: 0.7,
  },
  stopBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  emptyActive: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  receiptsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  receiptsButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  receiptsButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  receiptsButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  receiptsButtonSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
});
