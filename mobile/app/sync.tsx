import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../theme/colors";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";
import { useVeriMedStore } from "../lib/store";
import { api } from "../lib/api";

export default function OfflineSyncCenter() {
  const {
    isOnline,
    lastSyncTime,
    pendingOutboxCount,
    cachedMedicineCount,
    cachedBatchCount,
    syncWithBackend,
    loadStats,
  } = useVeriMedStore();

  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert(
        "Offline Mode Active",
        "Please reconnect to the network or toggle Online Mode in settings to sync local outbox logs with the server."
      );
      return;
    }

    setSyncing(true);
    try {
      // Execute Zustand store sync
      await syncWithBackend(api.syncOfflineData);
      
      // Update local counts
      await loadStats();
      
      Alert.alert("Sync Successful", "Local outbox reports uploaded. Offline cache database updated.");
    } catch (e: any) {
      Alert.alert("Sync Failed", e.message || "Failed to establish synchronization session.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sync & Cache Center</Text>
          <Text style={styles.closeBtn} onPress={() => router.back()}>Close</Text>
        </View>

        {/* Sync Hero Card */}
        <GlassCard style={styles.syncCard} intensity={45}>
          <View style={styles.radarContainer}>
            <View
              style={[
                styles.radarSignal,
                {
                  borderColor: isOnline ? colors.authentic : colors.warning,
                  backgroundColor: isOnline ? "rgba(45, 224, 194, 0.05)" : "rgba(255, 182, 72, 0.05)",
                },
              ]}
            >
              <Text
                style={[
                  styles.radarText,
                  { color: isOnline ? colors.authentic : colors.warning },
                ]}
              >
                {isOnline ? "CONNECTED" : "DISCONNECTED"}
              </Text>
            </View>
          </View>

          <Text style={styles.syncStatusHeadline}>
            {pendingOutboxCount > 0
              ? `${pendingOutboxCount} Pending Logs Awaiting Transmission`
              : "All Local Scans Synchronized"}
          </Text>

          <Text style={styles.lastSyncText}>
            Last Sync:{" "}
            {lastSyncTime
              ? new Date(lastSyncTime).toLocaleString()
              : "Never (Initial Sync Required)"}
          </Text>
        </GlassCard>

        {/* Cache status metrics */}
        <Text style={styles.sectionHeader}>Local SQLite Offline Mirror</Text>
        
        <View style={styles.statsGrid}>
          <GlassCard style={styles.statMiniCard} intensity={35}>
            <Text style={styles.statNumber}>{cachedMedicineCount}</Text>
            <Text style={styles.statLabel}>Core Formulas</Text>
          </GlassCard>

          <GlassCard style={styles.statMiniCard} intensity={35}>
            <Text style={styles.statNumber}>{cachedBatchCount}</Text>
            <Text style={styles.statLabel}>Batch Trees</Text>
          </GlassCard>
        </View>

        <GlassCard style={styles.infoCard} intensity={30}>
          <Text style={styles.infoTitle}>Offline-First SmartID Validation</Text>
          <Text style={styles.infoDesc}>
            VeriMed downloads serialized cryptographical trees covering batches in a 50km radius. This allows signatures to be verified offline instantly without any connection to the main servers.
          </Text>
        </GlassCard>

        {/* Sync Control Button */}
        <View style={styles.footer}>
          {syncing ? (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={colors.authentic} />
              <Text style={styles.progressText}>Draining outbox & indexing cache...</Text>
            </View>
          ) : (
            <GlassButton
              title={isOnline ? "Sync Data & Update Cache" : "Connection Required to Sync"}
              variant="primary"
              disabled={!isOnline}
              onPress={handleSync}
            />
          )}
        </View>

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
  syncCard: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 24,
  },
  radarContainer: {
    marginBottom: 16,
  },
  radarSignal: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  radarText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  syncStatusHeadline: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  lastSyncText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statMiniCard: {
    width: "48%",
    alignItems: "center",
    paddingVertical: 18,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.authentic,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  infoCard: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textLight,
    marginBottom: 6,
  },
  infoDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  footer: {
    marginTop: 10,
  },
  progressContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  progressText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 10,
  },
});
