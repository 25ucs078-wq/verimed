import React, { useState } from "react";
import { StyleSheet, View, Text, SafeAreaView, Pressable, Platform, Dimensions } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { colors } from "../../theme/colors";
import { api } from "../../lib/api";
import { useVeriMedStore } from "../../lib/store";
import { GlassCard } from "../../components/glass/GlassCard";
import { GlassSheet } from "../../components/glass/GlassSheet";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");

// Mock coordinates for regions on our SVG canvas
const REGIONS_GEOMETRY = [
  { name: "North America", x: 100, y: 120, lat: 37.0902, lng: -95.7129 },
  { name: "Sub-Saharan Africa", x: 230, y: 260, lat: 9.0820, lng: 8.6753 },
  { name: "South Asia", x: 340, y: 200, lat: 20.5937, lng: 78.9629 },
  { name: "East Asia", x: 420, y: 160, lat: 35.8617, lng: 104.1954 }
];

export default function RiskMap() {
  const { isOnline } = useVeriMedStore();
  const [selectedRegion, setSelectedRegion] = useState<any>(null);
  const [filterMode, setFilterMode] = useState<"all" | "high" | "moderate">("all");

  const { data: riskMapData } = useQuery({
    queryKey: ["riskMap"],
    queryFn: api.getRiskMap,
    enabled: isOnline,
  });

  // Blend API data with geometries
  const mapPoints = REGIONS_GEOMETRY.map((geom) => {
    const apiDetail = riskMapData?.find((r: any) => r.region === geom.name) || {
      threat_index: geom.name === "Sub-Saharan Africa" ? 0.85 : geom.name === "South Asia" ? 0.72 : geom.name === "East Asia" ? 0.68 : 0.45,
      counterfeit_percent: geom.name === "Sub-Saharan Africa" ? 18.5 : geom.name === "South Asia" ? 12.3 : geom.name === "East Asia" ? 9.8 : 2.1,
      seizure_count: geom.name === "Sub-Saharan Africa" ? 450 : geom.name === "South Asia" ? 890 : geom.name === "East Asia" ? 1200 : 120,
      trend: geom.name === "North America" ? "decreasing" : "increasing"
    };

    return {
      ...geom,
      ...apiDetail
    };
  });

  const filteredPoints = mapPoints.filter((pt) => {
    if (filterMode === "high") return pt.threat_index >= 0.7;
    if (filterMode === "moderate") return pt.threat_index < 0.7;
    return true;
  });

  const handlePointPress = (point: any) => {
    setSelectedRegion(point);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Filter Chips */}
      <View style={styles.filterContainer}>
        <Pressable
          onPress={() => setFilterMode("all")}
          style={[styles.chip, filterMode === "all" && styles.chipActive]}
        >
          <Text style={[styles.chipText, filterMode === "all" && styles.chipTextActive]}>
            All Regions
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilterMode("high")}
          style={[styles.chip, filterMode === "high" && styles.chipActive]}
        >
          <Text style={[styles.chipText, filterMode === "high" && styles.chipTextActive]}>
            High Risk (≥70%)
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilterMode("moderate")}
          style={[styles.chip, filterMode === "moderate" && styles.chipActive]}
        >
          <Text style={[styles.chipText, filterMode === "moderate" && styles.chipTextActive]}>
            Moderate Risk
          </Text>
        </Pressable>
      </View>

      {/* Interactive Geopolitical SVG Canvas representing World Radar Map */}
      <View style={styles.mapContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 500 350" style={styles.mapSvg}>
          {/* Subtle background radar circles */}
          <Circle cx="250" cy="175" r="80" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" fill="none" />
          <Circle cx="250" cy="175" r="160" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" fill="none" />
          <Circle cx="250" cy="175" r="240" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" fill="none" />

          {/* Connective mesh grid lines */}
          <Path
            d="M50 175 H450 M250 50 V300 M100 120 L230 260 M230 260 L340 200 M340 200 L420 160"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Render active region hot nodes */}
          {filteredPoints.map((pt, idx) => {
            const isHigh = pt.threat_index >= 0.70;
            const markerColor = isHigh ? colors.counterfeit : colors.warning;
            const glowOpacity = isHigh ? 0.25 : 0.15;

            return (
              <G key={idx} onPress={() => handlePointPress(pt)}>
                {/* Outer radar glow circles */}
                <Circle cx={pt.x} cy={pt.y} r="28" fill={markerColor} opacity={glowOpacity} />
                <Circle cx={pt.x} cy={pt.y} r="14" fill={markerColor} opacity={0.35} />
                <Circle cx={pt.x} cy={pt.y} r="6" fill={markerColor} />
                
                {/* Text tag overlays */}
                <SvgText
                  x={pt.x}
                  y={pt.y - 36}
                  fill={colors.textLight}
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {pt.name}
                </SvgText>
                <SvgText
                  x={pt.x}
                  y={pt.y - 24}
                  fill={markerColor}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {Math.round(pt.threat_index * 100)}% Risk
                </SvgText>
              </G>
            );
          })}
        </Svg>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>Tap radar hotspots to investigate regional metrics</Text>
        </View>
      </View>

      {/* Region investigation details in a bottom drawer */}
      <GlassSheet
        visible={selectedRegion !== null}
        onClose={() => setSelectedRegion(null)}
        title={selectedRegion?.name}
      >
        {selectedRegion && (
          <View style={styles.detailDrawer}>
            <View style={styles.statGrid}>
              <GlassCard style={styles.detailCard} intensity={40}>
                <Text style={styles.detailLabel}>Threat Index</Text>
                <Text
                  style={[
                    styles.detailValue,
                    {
                      color: selectedRegion.threat_index >= 0.7 ? colors.counterfeit : colors.warning,
                    },
                  ]}
                >
                  {Math.round(selectedRegion.threat_index * 100)}%
                </Text>
              </GlassCard>

              <GlassCard style={styles.detailCard} intensity={40}>
                <Text style={styles.detailLabel}>Trend Status</Text>
                <Text style={styles.detailValue}>{selectedRegion.trend.toUpperCase()}</Text>
              </GlassCard>

              <GlassCard style={styles.detailCard} intensity={40}>
                <Text style={styles.detailLabel}>Counterfeit Rate</Text>
                <Text style={styles.detailValue}>{selectedRegion.counterfeit_percent}%</Text>
              </GlassCard>

              <GlassCard style={styles.detailCard} intensity={40}>
                <Text style={styles.detailLabel}>Seizures Logged</Text>
                <Text style={styles.detailValue}>{selectedRegion.seizure_count}</Text>
              </GlassCard>
            </View>

            <View style={styles.flagsSection}>
              <Text style={styles.flagsTitle}>Dominant Anomalies Detected</Text>
              <View style={styles.flagChipsRow}>
                <View style={styles.flagChip}>
                  <Text style={styles.flagChipText}>Route Deviation</Text>
                </View>
                <View style={styles.flagChip}>
                  <Text style={styles.flagChipText}>SmartID Sig Fail</Text>
                </View>
                {selectedRegion.threat_index >= 0.8 && (
                  <View style={styles.flagChip}>
                    <Text style={styles.flagChipText}>Temp Break</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
      </GlassSheet>

      <View style={{ height: 90 }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundStart,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: Platform.OS === "android" ? 40 : 10,
    marginBottom: 16,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  chipActive: {
    backgroundColor: "rgba(45, 224, 194, 0.12)",
    borderColor: colors.authentic,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.authentic,
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#03050C",
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: "hidden",
  },
  mapSvg: {
    width: "100%",
    height: "100%",
  },
  instructionsContainer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },
  instructionsText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  detailDrawer: {
    paddingVertical: 10,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  detailCard: {
    width: "48%",
    marginBottom: 12,
    padding: 16,
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textLight,
  },
  flagsSection: {
    marginTop: 8,
  },
  flagsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textLight,
    marginBottom: 10,
  },
  flagChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  flagChip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  flagChipText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "600",
  },
});
