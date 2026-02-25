import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { LogOut } from "lucide-react-native";

export default function MenuScreen() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/(auth)");
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.content}>
        <Text style={styles.title}>Mer</Text>
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.logoutBtnText}>Logga ut</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 24,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#374151",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
