import React from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { colors } from "../../theme/colors";

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: "dark" | "light" | "default";
  borderRadius?: number;
  borderWidth?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 45,
  tint = "dark",
  borderRadius = 24,
  borderWidth = 1,
  ...props
}) => {
  return (
    <View style={[styles.container, { borderRadius }, style]} {...props}>
      <BlurView
        intensity={intensity}
        tint={tint}
        style={[
          styles.blur,
          {
            borderRadius,
            borderWidth,
            borderColor: colors.glassBorder,
          },
        ]}
      >
        <View style={styles.highlight} />
        <View style={styles.content}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: "transparent",
  },
  blur: {
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.glassHighlight,
  },
  content: {
    padding: 20,
  },
});
