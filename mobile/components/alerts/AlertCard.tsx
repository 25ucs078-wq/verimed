import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { GlassCard } from "../glass/GlassCard";
import { colors } from "../../theme/colors";

export interface AlertCardProps {
  title: string;
  source: string;
  severity: string; // CRITICAL, HIGH, INFO
  body: string;
  date: string;
  batches?: string[];
  manufacturers?: string[];
}

export const AlertCard: React.FC<AlertCardProps> = ({
  title,
  source,
  severity,
  body,
  date,
  batches = [],
  manufacturers = [],
}) => {
  const getSeverityColor = () => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return colors.counterfeit;
      case "HIGH":
        return colors.warning;
      case "INFO":
      default:
        return colors.info;
    }
  };

  const statusColor = getSeverityColor();

  return (
    <GlassCard style={styles.card} intensity={35}>
      <View style={styles.container}>
        {/* Severity indicator line */}
        <View style={[styles.severityBar, { backgroundColor: statusColor }]} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.badge, { borderColor: statusColor }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>
                {source}
              </Text>
            </View>
            <Text style={styles.date}>{date}</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          {/* Targeted details */}
          {(batches.length > 0 || manufacturers.length > 0) && (
            <View style={styles.detailsContainer}>
              {batches.length > 0 && (
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Batches: </Text>
                  {batches.join(", ")}
                </Text>
              )}
              {manufacturers.length > 0 && (
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Manufacturers: </Text>
                  {manufacturers.join(", ")}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 0, // Reset default padding, apply in container
  },
  container: {
    flexDirection: "row",
    minHeight: 120,
  },
  severityBar: {
    width: 5,
    height: "100%",
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 11,
    color: colors.textMuted,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textLight,
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.75)",
    lineHeight: 18,
  },
  detailsContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  detailText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  detailLabel: {
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
  },
});
