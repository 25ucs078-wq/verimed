import React from "react";
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Switch, Platform } from "react-native";
import { router } from "expo-router";
import { colors } from "../theme/colors";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";
import { useVeriMedStore } from "../lib/store";

export default function ProfileSettings() {
  const { isOnline, setOnline, clearHistory, recentScans } = useVeriMedStore();

  const handleToggleOnline = (value: boolean) => {
    setOnline(value);
  };

  const handleClearHistory = () => {
    clearHistory();
    alert("Scan history cleared.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Operator Profile</Text>
          <Text style={styles.closeBtn} onPress={() => router.back()}>Close</Text>
        </View>

        {/* User Card */}
        <GlassCard style={styles.userCard} intensity={40}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SJ</Text>
          </View>
          <Text style={styles.userName}>Dr. Sarah Jenkins</Text>
          <Text style={styles.userRole}>Licensed Pharmacist</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>License No</Text>
            <Text style={styles.metaValue}>PH-IND-80221</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Organization</Text>
            <Text style={styles.metaValue}>St. Jude Regional Clinic</Text>
          </View>
        </GlassCard>

        {/* Settings options */}
        <Text style={styles.sectionHeader}>Developer Settings</Text>

        <GlassCard style={styles.settingsCard} intensity={35}>
          {/* Online mode toggle */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsLeft}>
              <Text style={styles.settingTitle}>Simulate Online State</Text>
              <Text style={styles.settingDesc}>
                Toggle internet connectivity status.
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: "#767577", true: colors.authentic }}
              thumbColor={isOnline ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={styles.divider} />

          {/* History control */}
          <View style={styles.settingsRow}>
            <View style={styles.settingsLeft}>
              <Text style={styles.settingTitle}>Clear Scan History</Text>
              <Text style={styles.settingDesc}>
                Resets the recent scans list. ({recentScans.length} logged)
              </Text>
            </View>
          </View>
          <GlassButton
            title="Reset History"
            variant="danger"
            onPress={handleClearHistory}
            style={styles.actionBtn}
          />
        </GlassCard>

        {/* Information disclosures */}
        <Text style={styles.sectionHeader}>Data Disclosures</Text>
        <GlassCard style={styles.infoCard} intensity={30}>
          <Text style={styles.infoText}>
            VeriMed operates in compliance with India DCGI Schedule H track-and-trace requirements and WHO counterfeit vigilance protocols. 
            All scans are cryptographically authenticated using manufacturer certificates cached locally.
          </Text>
        </GlassCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundStart,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 40 : 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.textLight,
  },
  closeBtn: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  userCard: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(139, 123, 255, 0.15)",
    borderWidth: 1.5,
    borderColor: colors.info,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: colors.info,
    fontSize: 24,
    fontWeight: "800",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textLight,
  },
  userRole: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: "600",
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 18,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingVertical: 6,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  metaValue: {
    color: colors.textLight,
    fontWeight: "600",
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingsCard: {
    marginBottom: 24,
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsLeft: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textLight,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  actionBtn: {
    marginTop: 14,
  },
  infoCard: {
    marginBottom: 40,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
