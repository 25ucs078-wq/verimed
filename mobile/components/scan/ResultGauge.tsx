import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { colors } from "../../theme/colors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ResultGaugeProps {
  score: number; // 0.0 to 1.0
  isAuthentic: boolean;
  size?: number;
  strokeWidth?: number;
}

export const ResultGauge: React.FC<ResultGaugeProps> = ({
  score,
  isAuthentic,
  size = 180,
  strokeWidth = 14,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressShared = useSharedValue(0);

  useEffect(() => {
    progressShared.value = withDelay(
      300,
      withTiming(score, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [score]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - progressShared.value * circumference;
    return {
      strokeDashoffset,
    };
  });

  // Decide colors based on authenticity
  const gaugeColor = isAuthentic
    ? colors.authentic
    : score > 0.6
    ? colors.warning
    : colors.counterfeit;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Track circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={gaugeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.textContainer}>
        <Text style={[styles.percentage, { color: gaugeColor }]}>
          {Math.round(score * 100)}%
        </Text>
        <Text style={styles.label}>
          {isAuthentic ? "Confidence" : "Risk Index"}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  textContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentage: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
