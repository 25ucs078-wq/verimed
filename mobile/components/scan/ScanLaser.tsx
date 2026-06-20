import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { colors } from "../../theme/colors";

interface ScanLaserProps {
  height?: number;
}

export const ScanLaser: React.FC<ScanLaserProps> = ({ height = 240 }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(height, {
        duration: 2000,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true
    );
  }, [height]);

  const laserStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View style={[styles.container, { height }]}>
      <Animated.View style={[styles.laser, laserStyle]}>
        <View style={styles.glow} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  laser: {
    height: 3,
    backgroundColor: colors.authentic,
    width: "100%",
    shadowColor: colors.authentic,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  glow: {
    height: 15,
    backgroundColor: "rgba(45, 224, 194, 0.15)",
    width: "100%",
    position: "absolute",
    bottom: -6,
  },
});
