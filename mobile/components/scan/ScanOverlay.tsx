import React from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { colors } from "../../theme/colors";

const { width } = Dimensions.get("window");
const SCAN_SIZE = 260;

interface ScanOverlayProps {
  statusText?: string;
  subText?: string;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  statusText = "Align code within frame",
  subText = "Integrating packaging structural AI check...",
}) => {
  return (
    <View style={styles.container}>
      {/* Dark semi-transparent mask around focus area */}
      <View style={styles.maskContainer}>
        <View style={styles.maskRow} />
        <View style={styles.maskMiddle}>
          <View style={styles.maskSide} />
          <View style={styles.cutout} />
          <View style={styles.maskSide} />
        </View>
        <View style={styles.maskRow} />
      </View>

      {/* Glass border corners */}
      <View style={styles.frameContainer}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
      </View>

      {/* Floating text labels */}
      <View style={styles.infoContainer}>
        <Text style={styles.statusText}>{statusText}</Text>
        <Text style={styles.subText}>{subText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  maskContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  maskRow: {
    flex: 1,
    backgroundColor: "rgba(7, 10, 24, 0.65)",
  },
  maskMiddle: {
    height: SCAN_SIZE,
    flexDirection: "row",
  },
  maskSide: {
    flex: 1,
    backgroundColor: "rgba(7, 10, 24, 0.65)",
  },
  cutout: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    backgroundColor: "transparent",
  },
  frameContainer: {
    width: SCAN_SIZE + 4,
    height: SCAN_SIZE + 4,
    position: "absolute",
  },
  cornerTopLeft: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.authentic,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.authentic,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.authentic,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.authentic,
    borderBottomRightRadius: 16,
  },
  infoContainer: {
    position: "absolute",
    bottom: Platform.select({ ios: 100, android: 80, default: 80 }),
    alignItems: "center",
    width: "80%",
  },
  statusText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
});

import { Platform } from "react-native";
