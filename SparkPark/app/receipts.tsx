import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import React, { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getReceipts } from "../lib/parking-session";
import type { ParkingReceipt } from "../lib/types";
import { ChevronLeft } from "lucide-react-native";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ReceiptsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [receipts, setReceipts] = useState<ParkingReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await getReceipts();
      setReceipts(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Tidigare parkeringar</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#166534" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#166534"]} />
          }
        >
          {receipts.length === 0 ? (
            <Text style={styles.empty}>Inga kvitton än.</Text>
          ) : (
            receipts.map((r) => (
              <View key={r.id} style={styles.receiptCard}>
                <Text style={styles.receiptPlace}>{r.parkering_name}</Text>
                <Text style={styles.receiptZone}>Zon {r.parkering_zone_code}</Text>
                <Text style={styles.receiptMeta}>
                  {formatDate(r.started_at)} · {formatTime(r.started_at)}–{formatTime(r.ended_at)}
                </Text>
                <Text style={styles.receiptDuration}>
                  {formatDuration(r.duration_seconds)} · {r.price_per_minute} kr/min
                </Text>
                <Text style={styles.receiptCost}>{r.total_cost.toFixed(2)} kr</Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  empty: {
    fontSize: 14,
    color: "#6b7280",
    paddingVertical: 24,
    textAlign: "center",
  },
  receiptCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  receiptPlace: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  receiptZone: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  receiptMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 6,
  },
  receiptDuration: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  receiptCost: {
    fontSize: 18,
    fontWeight: "700",
    color: "#166534",
    marginTop: 8,
  },
});
