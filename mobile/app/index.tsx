import React, { useState } from "react";
import { StyleSheet, View, Text, SafeAreaView, Dimensions, Platform } from "react-native";
import { router } from "expo-router";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";
import { colors } from "../theme/colors";
import Svg, { Circle, Path } from "react-native-svg";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "Verify Packaging",
    desc: "Our neural vision network analyzes packaging print quality, logo alignment, and color gamut deviations in real-time.",
    icon: (color: string) => (
      <Svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
        <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <Path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </Svg>
    )
  },
  {
    title: "Secure SmartID QR",
    desc: "Verify cryptographically signed batches. Immediate offline validation of serialization parameters per DCGI regulations.",
    icon: (color: string) => (
      <Svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
        <Path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
        <Path d="M7 7h4v4H7zm6 0h4v4h-4zm0 6h4v4h-4zm-6 0h4v4H7z" />
      </Svg>
    )
  },
  {
    title: "Offline-First Sync",
    desc: "No internet? No problem. VeriMed validates scans against a local SQLite cache. Scans queue in outbox and sync automatically.",
    icon: (color: string) => (
      <Svg width={80} height={80} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5}>
        <Path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </Svg>
    )
  }
];

export default function Onboarding() {
  const [activeSlide, setActiveSlide] = useState(0);

  const handleNext = () => {
    if (activeSlide < SLIDES.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      router.replace("/(tabs)/home");
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)/home");
  };

  const currentSlide = SLIDES[activeSlide];

  return (
    <SafeAreaView style={styles.container}>
      {/* Mesh Glow Background */}
      <View style={styles.meshGlow} />
      <View style={styles.meshGlowSecondary} />

      <View style={styles.header}>
        <Text style={styles.logo}>Veri<Text style={{ color: colors.authentic }}>Med</Text></Text>
        <Text style={styles.skipBtn} onPress={handleSkip}>Skip</Text>
      </View>

      <View style={styles.content}>
        <GlassCard style={styles.card} intensity={55}>
          <View style={styles.iconContainer}>
            {currentSlide.icon(colors.authentic)}
          </View>
          
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.desc}>{currentSlide.desc}</Text>

          {/* Dots Indicator */}
          <View style={styles.indicatorContainer}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === activeSlide ? colors.authentic : "rgba(255, 255, 255, 0.2)",
                    width: i === activeSlide ? 24 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </GlassCard>
      </View>

      <View style={styles.footer}>
        <GlassButton
          title={activeSlide === SLIDES.length - 1 ? "Get Started" : "Continue"}
          onPress={handleNext}
          style={styles.actionBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundStart,
  },
  meshGlow: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(45, 224, 194, 0.15)",
    ...Platform.select({ web: { filter: "blur(80px)" } }),
  },
  meshGlowSecondary: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "rgba(139, 123, 255, 0.12)",
    ...Platform.select({ web: { filter: "blur(100px)" } }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 40 : 10,
    height: 60,
  },
  logo: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.textLight,
    letterSpacing: -0.5,
  },
  skipBtn: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
    textAlign: "center",
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(45, 224, 194, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(45, 224, 194, 0.15)",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.textLight,
    marginBottom: 12,
    textAlign: "center",
  },
  desc: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  actionBtn: {
    width: "100%",
  },
});
