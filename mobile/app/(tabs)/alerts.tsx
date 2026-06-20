import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  Pressable,
  RefreshControl,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { api } from "../../lib/api";
import { useVeriMedStore } from "../../lib/store";
import { AlertCard } from "../../components/alerts/AlertCard";
import { GlassCard } from "../../components/glass/GlassCard";

const SEVERITY_FILTERS = ["ALL", "CRITICAL", "HIGH", "INFO"];

export default function AlertsHub() {
  const { isOnline } = useVeriMedStore();
  const [activeSeverity, setActiveSeverity] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch news alerts
  const { data: alertsData, refetch: refetchAlerts, isLoading } = useQuery({
    queryKey: ["newsAlerts"],
    queryFn: () => api.getAlerts(undefined),
    enabled: isOnline,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    if (isOnline) {
      await refetchAlerts();
    }
    setRefreshing(false);
  };

  // Local static fallback alerts if offline or loading fails
  const localFallbackAlerts = [
    {
      article_id: "local-1",
      publish_date: new Date().toISOString(),
      source: "Internal Risk System",
      title: "Offline Sync Warning: South Asia",
      severity_level: "HIGH",
      message_body: "Elevated failure signature counts logged in local workspace cache. Complete online synchronization in Sync Center to retrieve latest manufacturer public cryptographic keys.",
      targeted_batch_prefixes: ["CNT-"],
      targeted_manufacturers: []
    },
    {
      article_id: "local-2",
      publish_date: new Date(Date.now() - 86400000).toISOString(),
      source: "WHO Alert",
      title: "Falsified Rabies Vaccine Batches Detected in South Asia",
      severity_level: "CRITICAL",
      message_body: "The World Health Organization has issued an alert regarding falsified batches of Rabies Vaccines detected in regional clinical channels. Batch numbers RV-20612 and RV-20613 are reported to have failed laboratory authentication.",
      targeted_batch_prefixes: ["RV-206"],
      targeted_manufacturers: ["AsiaVax Corp"]
    }
  ];

  const rawAlerts = isOnline && alertsData ? alertsData : localFallbackAlerts;

  const filteredAlerts = rawAlerts.filter((item: any) => {
    if (activeSeverity === "ALL") return true;
    return item.severity_level.toUpperCase() === activeSeverity.toUpperCase();
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Scrollable Filter Chips */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Regulatory Alerts</Text>
        <Text style={styles.subTitle}>Latest global and local medical safety feeds</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {SEVERITY_FILTERS.map((sev) => (
          <Pressable
            key={sev}
            onPress={() => setActiveSeverity(sev)}
            style={[styles.chip, activeSeverity === sev && styles.chipActive]}
          >
            <Text style={[styles.chipText, activeSeverity === sev && styles.chipTextActive]}>
              {sev}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Alerts Feed */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.authentic} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.authentic}
            />
          }
        >
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((item: any, idx: number) => (
              <AlertCard
                key={item.article_id || idx}
                title={item.title}
                source={item.source}
                severity={item.severity_level}
                body={item.message_body}
                date={new Date(item.publish_date).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                batches={item.targeted_batch_prefixes}
                manufacturers={item.targeted_manufacturers}
              />
            ))
          ) : (
            <GlassCard style={styles.emptyCard} intensity={30}>
              <Text style={styles.emptyText}>No alerts matching this severity category.</Text>
            </GlassCard>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundStart,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginTop: Platform.OS === "android" ? 40 : 10,
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.textLight,
  },
  subTitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  filterScroll: {
    paddingHorizontal: 20,
    height: 48,
    marginBottom: 8,
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  chipActive: {
    backgroundColor: "rgba(139, 123, 255, 0.12)",
    borderColor: colors.info,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.info,
  },
  feedContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyCard: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
