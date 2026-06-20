import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  FlatList,
  Platform,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useVeriMedStore } from "../../lib/store";
import { api } from "../../lib/api";
import { colors } from "../../theme/colors";
import { GlassCard } from "../../components/glass/GlassCard";
import Svg, { Circle, Path, Rect } from "react-native-svg";

export default function HomeDashboard() {
  const { isOnline, recentScans, pendingOutboxCount, loadStats } = useVeriMedStore();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch regional risk data
  const { data: riskMapData, refetch: refetchRiskMap } = useQuery({
    queryKey: ["riskMap"],
    queryFn: api.getRiskMap,
    enabled: isOnline,
  });

  // Fetch recent news alerts
  const { data: alertsData, refetch: refetchAlerts } = useQuery({
    queryKey: ["homeAlerts"],
    queryFn: () => api.getAlerts(undefined),
    enabled: isOnline,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    if (isOnline) {
      await Promise.all([refetchRiskMap(), refetchAlerts()]);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  const totalScansCount = recentScans.length;
  const counterfeitsCount = recentScans.filter((s) => !s.isAuthentic).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.authentic} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>VeriMed Control</Text>
            <Text style={styles.subWelcome}>Scan. Verify. Stay Safe.</Text>
          </View>

          {/* Connection Status Pill */}
          <Pressable onPress={() => router.push("/sync")} style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? colors.authentic : colors.warning },
              ]}
            />
            <Text style={styles.statusText}>
              {isOnline ? "Online" : "Offline Mode"}
              {pendingOutboxCount > 0 && ` (${pendingOutboxCount} queued)`}
            </Text>
          </Pressable>
        </View>

        {/* Hero Card */}
        <GlassCard style={styles.heroCard} intensity={40}>
          <Text style={styles.heroTitle}>Integrity Dashboard</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalScansCount}</Text>
              <Text style={styles.statLabel}>Total Scans</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: colors.counterfeit }]}>
                {counterfeitsCount}
              </Text>
              <Text style={styles.statLabel}>Counterfeits Blocked</Text>
            </View>
          </View>
        </GlassCard>

        {/* Quick CTA Actions */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => router.navigate({ pathname: "/scan", params: { mode: "image" } })}
            style={styles.actionButton}
          >
            <GlassCard style={styles.actionCard} intensity={50}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.authentic} strokeWidth={2}>
                <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <Circle cx="12" cy="13" r="4" />
              </Svg>
              <Text style={styles.actionTitle}>Verify Image</Text>
              <Text style={styles.actionSub}>Check Packaging</Text>
            </GlassCard>
          </Pressable>

          <Pressable
            onPress={() => router.navigate({ pathname: "/scan", params: { mode: "qr" } })}
            style={styles.actionButton}
          >
            <GlassCard style={styles.actionCard} intensity={50}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke={colors.authentic} strokeWidth={2}>
                <Path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
                <Rect x="7" y="7" width="4" height="4" />
                <Rect x="13" y="13" width="4" height="4" />
              </Svg>
              <Text style={styles.actionTitle}>Scan QR Code</Text>
              <Text style={styles.actionSub}>Check Batch Serialization</Text>
            </GlassCard>
          </Pressable>
        </View>

        {/* Regional Threat Index Slider */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Regional Risk Index</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.riskSlider}
        >
          {riskMapData ? (
            riskMapData.map((item: any, index: number) => {
              const score = item.threat_index;
              const accentColor =
                score > 0.8
                  ? colors.counterfeit
                  : score > 0.6
                  ? colors.warning
                  : colors.authentic;

              return (
                <GlassCard key={index} style={styles.riskMiniCard} intensity={30}>
                  <Text style={styles.riskRegion}>{item.region}</Text>
                  <Text style={[styles.riskScore, { color: accentColor }]}>
                    {Math.round(score * 100)}%
                  </Text>
                  <View style={styles.trendRow}>
                    <Text style={styles.trendLabel}>Trend: </Text>
                    <Text style={[styles.trendValue, { color: accentColor }]}>
                      {item.trend.toUpperCase()}
                    </Text>
                  </View>
                </GlassCard>
              );
            })
          ) : (
            // Static local mock for offline/loading
            <GlassCard style={styles.riskMiniCard} intensity={30}>
              <Text style={styles.riskRegion}>South Asia</Text>
              <Text style={[styles.riskScore, { color: colors.warning }]}>72%</Text>
              <View style={styles.trendRow}>
                <Text style={styles.trendLabel}>Trend: </Text>
                <Text style={styles.trendValue}>STABLE</Text>
              </View>
            </GlassCard>
          )}
        </ScrollView>

        {/* Recent Scan History */}
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionTitle}>Recent Scan Activities</Text>
        </View>

        {recentScans.length > 0 ? (
          recentScans.map((item, index) => (
            <GlassCard key={index} style={styles.historyRow} intensity={30}>
              <View style={styles.historyLeft}>
                <View
                  style={[
                    styles.historyIcon,
                    {
                      borderColor: item.isAuthentic ? colors.authentic : colors.counterfeit,
                      backgroundColor: item.isAuthentic
                        ? "rgba(45, 224, 194, 0.08)"
                        : "rgba(255, 85, 119, 0.08)",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: item.isAuthentic ? colors.authentic : colors.counterfeit,
                      fontWeight: "700",
                    }}
                  >
                    {item.isAuthentic ? "✓" : "⚠"}
                  </Text>
                </View>
                <View style={styles.historyMeta}>
                  <Text style={styles.historyBrandName}>{item.brandName}</Text>
                  <Text style={styles.historyBatch}>Batch: {item.batchNumber}</Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyStatusText}>
                  {item.isAuthentic ? "Authentic" : "Counterfeit"}
                </Text>
                <Text style={styles.historyTime}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </GlassCard>
          ))
        ) : (
          <GlassCard style={styles.emptyCard} intensity={30}>
            <Text style={styles.emptyText}>No recent scans logged.</Text>
          </GlassCard>
        )}

        <View style={{ height: 100 }} />
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
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textLight,
  },
  subWelcome: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "600",
  },
  heroCard: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.authentic,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  actionButton: {
    width: "48%",
  },
  actionCard: {
    padding: 16,
    alignItems: "flex-start",
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textLight,
    marginTop: 12,
  },
  actionSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionHeaderContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textLight,
  },
  riskSlider: {
    paddingRight: 20,
    marginBottom: 24,
  },
  riskMiniCard: {
    width: 130,
    marginRight: 12,
    padding: 14,
  },
  riskRegion: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 8,
  },
  riskScore: {
    fontSize: 28,
    fontWeight: "800",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  trendLabel: {
    fontSize: 9,
    color: colors.textMuted,
  },
  trendValue: {
    fontSize: 9,
    fontWeight: "700",
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  historyLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyMeta: {},
  historyBrandName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textLight,
  },
  historyBatch: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  historyRight: {
    alignItems: "flex-end",
  },
  historyStatusText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textLight,
  },
  historyTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textMuted,
  },
});
