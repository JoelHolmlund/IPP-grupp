import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";
import { Mail } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendResetLink() {
    if (!email.trim()) {
      Alert.alert("Ange din e-postadress");
      return;
    }
    setLoading(true);
    setSent(false);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: undefined,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Kunde inte skicka", error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backWrap} onPress={() => router.back()}>
            <Text style={styles.backText}>← Tillbaka</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Glömt lösenord?</Text>
            <Text style={styles.subtitle}>
              Ange din e-post så skickar vi en länk för att återställa lösenordet.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputWrap}>
              <Mail size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="E-postadress"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!sent}
              />
            </View>

            {sent ? (
              <View style={styles.successWrap}>
                <Text style={styles.successText}>
                  Kontrollera din e-post. Vi har skickat en länk för att återställa lösenordet.
                </Text>
              </View>
            ) : (
              <Pressable
                style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                onPress={sendResetLink}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Skicka återställningslänk</Text>
                )}
              </Pressable>
            )}
          </View>

          <View style={styles.footer}>
            <Pressable onPress={() => router.back()} disabled={loading}>
              <Text style={styles.footerLink}>← Tillbaka till inloggning</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 16,
  },
  backWrap: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 16,
    color: "#166534",
    fontWeight: "500",
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 8,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    paddingVertical: 14,
  },
  primaryBtn: {
    backgroundColor: "#166534",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  successWrap: {
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    padding: 16,
  },
  successText: {
    fontSize: 15,
    color: "#166534",
    lineHeight: 22,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginTop: 28,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: "600",
    color: "#166534",
  },
});
