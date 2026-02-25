import "../../global.css";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import * as Location from "expo-location";
import React, { useState, useEffect, useMemo } from "react";
import MapView, { Marker } from "react-native-maps";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { MapPin, Star, Search, ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";
import { fetchParkeringar, withDistances } from "../../lib/parkeringar";
import { startSession } from "../../lib/parking-session";
import type { ParkingWithDistance } from "../../lib/types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SHEET_EXPANDED = SCREEN_HEIGHT * 0.55;
const SHEET_COLLAPSED = 100;
const SPRING_CONFIG = { damping: 20, stiffness: 200 };

function formatDistance(m?: number): string {
  if (m == null) return "–";
  if (m < 1000) return `~${Math.round(m)} m`;
  return `~${(m / 1000).toFixed(1)} km`;
}

export default function HittaScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [filter, setFilter] = useState<"nearby" | "favorites">("nearby");
  const [parkeringar, setParkeringar] = useState<ParkingWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParking, setSelectedParking] = useState<ParkingWithDistance | null>(null);

  const sheetHeight = useSharedValue(SHEET_EXPANDED);
  const startHeight = useSharedValue(SHEET_EXPANDED);

  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    }
    getCurrentLocation();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchParkeringar();
        if (cancelled) return;
        if (location) {
          const withDist = withDistances(
            data,
            location.coords.latitude,
            location.coords.longitude
          );
          setParkeringar(withDist);
        } else {
          setParkeringar(data.map((p) => ({ ...p, distanceMeters: undefined })));
        }
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [location?.coords.latitude, location?.coords.longitude]);

  const filteredList = useMemo(() => {
    let list = [...parkeringar].sort(
      (a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999)
    );
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.zone_code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }
    if (filter === "favorites") {
      // Tills vidare: inga favoriter sparade, visa samma lista
    }
    return list;
  }, [parkeringar, searchQuery, filter]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startHeight.value = sheetHeight.value;
    })
    .onUpdate((e) => {
      const next = startHeight.value - e.translationY;
      sheetHeight.value = Math.max(SHEET_COLLAPSED, Math.min(SHEET_EXPANDED, next));
    })
    .onEnd((e) => {
      const mid = (SHEET_EXPANDED + SHEET_COLLAPSED) / 2;
      const shouldCollapse = sheetHeight.value < mid || e.velocityY > 100;
      sheetHeight.value = withSpring(
        shouldCollapse ? SHEET_COLLAPSED : SHEET_EXPANDED,
        SPRING_CONFIG
      );
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const handleSelectParking = (p: ParkingWithDistance) => {
    setSelectedParking(p);
    sheetHeight.value = withSpring(SHEET_EXPANDED, SPRING_CONFIG);
  };

  const [starting, setStarting] = useState(false);
  const handleStartParking = async () => {
    if (!selectedParking) return;
    setStarting(true);
    try {
      await startSession(selectedParking.id);
      setSelectedParking(null);
      router.push("/(tabs)/parking");
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  if (!location && !errorMsg) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#166534" />
      </View>
    );
  }

  const region = {
    latitude: location?.coords.latitude ?? 59.3293,
    longitude: location?.coords.longitude ?? 18.0686,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={region}
      >
        {parkeringar.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.name}
            description={p.zone_code}
            pinColor="#166534"
            onPress={() => handleSelectParking(p)}
          />
        ))}
      </MapView>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, sheetAnimatedStyle]}>
          <View style={styles.handleBar} />
          <View style={styles.sheetContent}>
            <View style={styles.searchRow}>
              <Search size={20} color="#6b7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Sök efter zonkod eller plats"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.filterRow}>
              <Pressable
                style={[styles.filterBtn, filter === "nearby" && styles.filterBtnActive]}
                onPress={() => setFilter("nearby")}
              >
                <MapPin size={18} color={filter === "nearby" ? "#fff" : "#374151"} />
                <Text style={[styles.filterBtnText, filter === "nearby" && styles.filterBtnTextActive]}>
                  I närheten
                </Text>
              </Pressable>
              <Pressable
                style={[styles.filterBtn, filter === "favorites" && styles.filterBtnActive]}
                onPress={() => setFilter("favorites")}
              >
                <Star size={18} color={filter === "favorites" ? "#fff" : "#374151"} />
                <Text style={[styles.filterBtnText, filter === "favorites" && styles.filterBtnTextActive]}>
                  Favoriter
                </Text>
              </Pressable>
            </View>

            {selectedParking && (
              <Pressable
                style={styles.startParkingBar}
                onPress={handleStartParking}
                disabled={starting}
              >
                {starting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Text style={styles.startParkingLabel}>
                      Starta parkering vid {selectedParking.name}
                    </Text>
                    <ChevronRight size={20} color="#fff" />
                  </>
                )}
              </Pressable>
            )}

            {loading ? (
              <View style={styles.listPlaceholder}>
                <ActivityIndicator size="small" color="#166534" />
                <Text style={styles.listPlaceholderText}>Hämtar parkeringar…</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredList.length === 0 ? (
                  <Text style={styles.emptyText}>Inga parkeringar hittades</Text>
                ) : (
                  filteredList.map((item) => (
                    <Pressable
                      key={item.id}
                      style={[
                        styles.listItem,
                        selectedParking?.id === item.id && styles.listItemSelected,
                      ]}
                      onPress={() => handleSelectParking(item)}
                    >
                      <View style={styles.zoneCode}>
                        <Text style={styles.zoneCodeText}>{item.zone_code}</Text>
                      </View>
                      <View style={styles.listItemBody}>
                        <Text style={styles.listItemName}>{item.name}</Text>
                        <Text style={styles.listItemMeta}>
                          {item.city} · {formatDistance(item.distanceMeters)} · {item.type}
                        </Text>
                      </View>
                      <ChevronRight size={20} color="#9ca3af" />
                    </Pressable>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f3f4f6",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  filterBtnActive: {
    backgroundColor: "#166534",
  },
  filterBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  filterBtnTextActive: {
    color: "#fff",
  },
  startParkingBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#166534",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  startParkingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  list: {
    flex: 1,
  },
  listPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 20,
  },
  listPlaceholderText: {
    fontSize: 14,
    color: "#6b7280",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    padding: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  listItemSelected: {
    borderWidth: 2,
    borderColor: "#166534",
  },
  zoneCode: {
    backgroundColor: "#166534",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  zoneCodeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  listItemBody: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  listItemMeta: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
});
