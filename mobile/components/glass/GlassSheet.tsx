import React, { useEffect } from "react";
import { StyleSheet, View, Text, Modal, Pressable, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { colors } from "../../theme/colors";

interface GlassSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const { height } = Dimensions.get("window");

export const GlassSheet: React.FC<GlassSheetProps> = ({
  visible,
  onClose,
  title,
  children,
}) => {
  const translateY = useSharedValue(height);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      translateY.value = withTiming(height, { duration: 200 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheetContainer, animatedStyle]}>
          <BlurView intensity={70} tint="dark" style={styles.blur}>
            <View style={styles.dragIndicatorContainer}>
              <View style={styles.dragIndicator} />
            </View>

            <View style={styles.header}>
              {title && <Text style={styles.title}>{title}</Text>}
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeTxt}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.content}>{children}</View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 5, 12, 0.7)",
  },
  backdropPressable: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: height * 0.75,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  blur: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.glassBorder,
    paddingBottom: Platform.select({ ios: 40, android: 24, default: 24 }),
  },
  dragIndicatorContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textLight,
  },
  closeBtn: {
    padding: 4,
  },
  closeTxt: {
    color: colors.textMuted,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 24,
  },
});

import { Platform } from "react-native";
