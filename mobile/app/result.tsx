import React from "react";
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Platform } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { colors } from "../theme/colors";
import { GlassCard } from "../components/glass/GlassCard";
import { GlassButton } from "../components/glass/GlassButton";
import { ResultGauge } from "../components/scan/ResultGauge";

export default function ScanResult() {
  const { data } = useLocalSearchParams<{ data: string }>();
  
  if (!data) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>No result data found.</Text>
        <GlassButton title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const result = JSON.parse(data);
  const isAuthentic = result.is_authentic;
  
  // Accents based on authenticity
  const statusColor = isAuthentic ? colors.authentic : colors.counterfeit;
  const statusBg = isAuthentic ? "rgba(45, 224, 194, 0.05)" : "rgba(255, 85, 119, 0.05)";

  const deviations = result.deviations || { logo: 0.0, typography: 0.0, color_gamut: 0.0 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analysis Result</Text>
          <Text style={styles.closeBtn} onPress={() => router.back()}>Close</Text>
        </View>

        {/* Circular Radial Gauge */}
        <View style={styles.gaugeContainer}>
          <ResultGauge score={result.confidence_score} isAuthentic={isAuthentic} />
        </View>

        {/* Status Headline Banner */}
        <View style={[styles.statusBanner, { borderColor: statusColor, backgroundColor: statusBg }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {isAuthentic ? "✓ Verified Authentic" : "⚠ Suspect Counterfeit"}
          </Text>
          {result.is_offline && (
            <Text style={styles.offlineIndicator}>Verified Offline via Local Cache</Text>
          )}
        </View>

        {/* Medicine / Batch Details Card */}
        <GlassCard style={styles.detailsCard} intensity={40}>
          <Text style={styles.sectionTitle}>Product Specifications</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Brand Name</Text>
            <Text style={styles.detailValue}>{result.brand_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Generic Formula</Text>
            <Text style={styles.detailValue}>{result.generic_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Manufacturer</Text>
            <Text style={styles.detailValue}>{result.manufacturer_name}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Batch Number</Text>
            <Text style={styles.detailValue}>{result.batch_number}</Text>
          </View>
        </GlassCard>

        {/* QR SmartID Verification Info (if QR Scan) */}
        {result.qr_scan && (
          <GlassCard style={styles.detailsCard} intensity={40}>
            <Text style={styles.sectionTitle}>SmartID Cryptographic Integrity</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Public Signature Check</Text>
              <Text style={[styles.detailValue, { color: result.signature_valid ? colors.authentic : colors.counterfeit }]}>
                {result.signature_valid ? "VALID" : "FAILED / TAMPERED"}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Batch Status</Text>
              <Text style={[styles.detailValue, { color: result.batch_status === "active" ? colors.authentic : colors.counterfeit }]}>
                {result.batch_status.toUpperCase()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Security Token</Text>
              <Text style={[styles.detailValue, styles.tokenText]}>{result.signature_token}</Text>
            </View>
          </GlassCard>
        )}

        {/* Deviation Breakdown Progress Bars (if Packaging scan) */}
        {!result.qr_scan && (
          <GlassCard style={styles.detailsCard} intensity={40}>
            <Text style={styles.sectionTitle}>Package Metric Deviation</Text>

            {/* Logo bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressName}>Logo Print Alignment</Text>
                <Text style={styles.progressPercent}>{Math.round(deviations.logo * 100)}% / max 5%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, deviations.logo * 1000)}%`,
                      backgroundColor: deviations.logo > 0.05 ? colors.counterfeit : colors.authentic,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Typography bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressName}>Typography & Kerning</Text>
                <Text style={styles.progressPercent}>{Math.round(deviations.typography * 100)}% / max 3%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, deviations.typography * 1000)}%`,
                      backgroundColor: deviations.typography > 0.03 ? colors.counterfeit : colors.authentic,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Color Gamut bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressName}>Color Spectrum Fidelity</Text>
                <Text style={styles.progressPercent}>{Math.round(deviations.color_gamut * 100)}% / max 7%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, deviations.color_gamut * 1000)}%`,
                      backgroundColor: deviations.color_gamut > 0.07 ? colors.counterfeit : colors.authentic,
                    },
                  ]}
                />
              </View>
            </View>
          </GlassCard>
        )}

        {/* Flagged Categories Summary */}
        {!isAuthentic && result.flagged_categories && result.flagged_categories.length > 0 && (
          <GlassCard style={styles.warningCard} intensity={40}>
            <Text style={styles.warningTitle}>Flagged Anomaly Triggers</Text>
            {result.flagged_categories.map((cat: string, index: number) => (
              <Text key={index} style={styles.warningItem}>
                • {cat}
              </Text>
            ))}
          </GlassCard>
        )}

        {/* Actions footer */}
        <View style={styles.footer}>
          {!isAuthentic && (
            <GlassButton
              title="Report Suspect Product"
              variant="danger"
              onPress={() => router.push({
                pathname: "/report",
                params: { batchNumber: result.batch_number }
              })}
              style={styles.actionBtn}
            />
          )}
          <GlassButton
            title="Scan Another Product"
            variant="primary"
            onPress={() => router.back()}
            style={styles.actionBtn}
          />
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: colors.textLight,
    fontSize: 16,
    marginBottom: 20,
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
  gaugeContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  statusBanner: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: "800",
  },
  offlineIndicator: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    fontWeight: "600",
  },
  detailsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 14,
  },
  detailValue: {
    color: colors.textLight,
    fontWeight: "600",
    fontSize: 14,
  },
  tokenText: {
    fontFamily: Platform.select({ ios: "Courier", android: "monospace" }),
    fontSize: 11,
    maxWidth: "60%",
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressName: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "600",
  },
  progressPercent: {
    color: colors.textMuted,
    fontSize: 11,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  warningCard: {
    borderColor: colors.counterfeit,
    borderWidth: 1,
    backgroundColor: "rgba(255, 85, 119, 0.04)",
    marginBottom: 20,
  },
  warningTitle: {
    color: colors.counterfeit,
    fontWeight: "800",
    fontSize: 14,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  warningItem: {
    color: colors.textLight,
    fontSize: 13,
    marginTop: 4,
  },
  footer: {
    marginTop: 10,
  },
  actionBtn: {
    marginBottom: 12,
  },
});
