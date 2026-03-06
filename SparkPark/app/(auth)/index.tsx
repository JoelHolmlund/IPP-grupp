import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";
import { router } from "expo-router";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SCOOTER_LOGO = require("../../assets/images/scooter-outline.png");

const C = {
  green: "#2D5A27",
  greenDark: "#1E3E1B",
  lime: "#A2FF00",
  white: "#FFFFFF",
  offWhite: "#F7F9F7",
  textDark: "#1A1C1A",
  textMuted: "#6B7280",
  border: "#E2E8E0",
  inputBg: "#F3F5F3",
} as const;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function signInWithEmail() {
    if (!email.trim() || !password) {
      Alert.alert("Fyll i e-post och lösenord");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      Alert.alert("Inloggning misslyckades", error.message);
      setLoading(false);
    } else {
      router.replace("/(tabs)");
    }
  }

  return (
    <View style={styles.root}>
      {/* Grön hero med logotyp */}
      <View style={styles.heroSection}>
        <SafeAreaView edges={["top"]} style={styles.heroSafe}>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          <View style={styles.heroCircle3} />

          <View style={styles.heroContent}>
            <View style={styles.logoWrap}>
              <Image
                source={SCOOTER_LOGO}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroTitle}>SparkPark</Text>
            <Text style={styles.heroSubtitle}>
              Smidig parkering för elsparkcyklar
            </Text>
          </View>
        </SafeAreaView>
        <View style={styles.heroCurve} />
      </View>

      {/* Formulär */}
      <KeyboardAvoidingView
        style={styles.formSection}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.formTitle}>Välkommen tillbaka</Text>
          <Text style={styles.formSubtitle}>Logga in för att fortsätta</Text>

          <Text style={styles.label}>E-post</Text>
          <View style={[styles.inputWrap, emailFocused && styles.inputFocused]}>
            <Mail
              size={18}
              color={emailFocused ? C.green : C.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="namn@exempel.se"
              placeholderTextColor="#B0B5B0"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Text style={styles.label}>Lösenord</Text>
          <View style={[styles.inputWrap, passwordFocused && styles.inputFocused]}>
            <Lock
              size={18}
              color={passwordFocused ? C.green : C.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Ange ditt lösenord"
              placeholderTextColor="#B0B5B0"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              {showPassword ? (
                <EyeOff size={18} color={C.textMuted} />
              ) : (
                <Eye size={18} color={C.textMuted} />
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.forgotWrap}
            onPress={() => router.push("/(auth)/forgot-password")}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Glömt lösenord?</Text>
          </Pressable>

          <TouchableOpacity
            onPress={signInWithEmail}
            disabled={loading}
            activeOpacity={0.85}
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Logga in</Text>
                <View style={styles.loginBtnArrow}>
                  <ArrowRight size={20} color={C.green} strokeWidth={2.5} />
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>eller</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/register")}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.registerBtn}
          >
            <Text style={styles.registerBtnText}>Skapa nytt konto</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const HERO_HEIGHT = 280;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.white,
  },
  heroSection: {
    height: HERO_HEIGHT,
    backgroundColor: C.green,
    overflow: "hidden",
  },
  heroSafe: {
    flex: 1,
  },
  heroCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.06)",
    top: -60,
    right: -40,
  },
  heroCircle2: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.04)",
    top: 40,
    left: -50,
  },
  heroCircle3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(162,255,0,0.12)",
    bottom: 60,
    right: 30,
  },
  heroContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 30,
  },
  logoWrap: {
    width: 80,
    height: 80,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    tintColor: C.white,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.white,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  heroCurve: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 32,
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  formSection: {
    flex: 1,
    backgroundColor: C.white,
  },
  formScroll: {
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.textDark,
  },
  formSubtitle: {
    fontSize: 14,
    color: C.textMuted,
    marginTop: 4,
    marginBottom: 28,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: C.textDark,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: C.green,
    backgroundColor: C.white,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
    paddingVertical: 0,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "500",
    color: C.green,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 18,
    marginBottom: 4,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: C.white,
    letterSpacing: 0.3,
  },
  loginBtnArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.lime,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.border,
  },
  dividerText: {
    fontSize: 13,
    color: C.textMuted,
    marginHorizontal: 16,
  },
  registerBtn: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: C.green,
    backgroundColor: C.white,
  },
  registerBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: C.green,
  },
});
