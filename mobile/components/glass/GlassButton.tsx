import React from "react";
import { Pressable, StyleSheet, Text, View, Platform, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { colors } from "../../theme/colors";

interface GlassButtonProps {
  onPress?: () => void;
  title: string;
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassButton: React.FC<GlassButtonProps> = ({
  onPress,
  title,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  icon,
}) => {
  const scale = useSharedValue(1);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return { borderColor: colors.glassBorder, text: colors.textLight };
      case "success":
        return { borderColor: colors.authentic, text: colors.authentic };
      case "danger":
        return { borderColor: colors.counterfeit, text: colors.counterfeit };
      case "warning":
        return { borderColor: colors.warning, text: colors.warning };
      default:
        return { borderColor: colors.glassBorder, text: colors.textLight };
    }
  };

  const currentVariant = getVariantStyles();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { damping: 10, stiffness: 200 });
    
    // Perform subtle haptic feedback
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {
        // Ignored in simulators or environments without haptics
      }
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[styles.container, animatedStyle, style]}
    >
      <BlurView
        intensity={30}
        tint="dark"
        style={[
          styles.blur,
          {
            borderColor: currentVariant.borderColor,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color={currentVariant.text} />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={[styles.text, { color: currentVariant.text }]}>
                {title}
              </Text>
            </>
          )}
        </View>
      </BlurView>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  blur: {
    borderRadius: 16,
    borderWidth: 1,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 50,
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
