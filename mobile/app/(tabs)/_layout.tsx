import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, TouchableOpacity, Text, Platform } from "react-native";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle } from "react-native-svg";
import { colors } from "../../theme/colors";

// Simple custom line SVG icons
const HomeIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <Path d="M9 22V12h6v10" />
  </Svg>
);

const ScanIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
    <Circle cx={12} cy={12} r={3} />
  </Svg>
);

const MapIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <Circle cx={12} cy={12} r={3} />
  </Svg>
);

const AlertsIcon = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
  </Svg>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBarHidden, // We hide the default bar
      }}
      tabBar={({ state, descriptors, navigation }) => {
        return (
          <View style={styles.container}>
            <BlurView intensity={60} tint="dark" style={styles.blurBar}>
              <View style={styles.inner}>
                {state.routes.map((route, index) => {
                  const isFocused = state.index === index;
                  const color = isFocused ? colors.authentic : colors.textMuted;
                  
                  const onPress = () => {
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  };

                  const getIcon = () => {
                    switch (route.name) {
                      case "home":
                        return <HomeIcon color={color} />;
                      case "scan":
                        return <ScanIcon color={color} />;
                      case "map":
                        return <MapIcon color={color} />;
                      case "alerts":
                        return <AlertsIcon color={color} />;
                      default:
                        return null;
                    }
                  };

                  const getLabel = () => {
                    switch (route.name) {
                      case "home":
                        return "Home";
                      case "scan":
                        return "Scan";
                      case "map":
                        return "Map";
                      case "alerts":
                        return "Alerts";
                      default:
                        return "";
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={route.key}
                      onPress={onPress}
                      style={styles.tabItem}
                      activeOpacity={0.8}
                    >
                      <View style={styles.iconWrapper}>
                        {getIcon()}
                        {isFocused && <View style={[styles.activeDot, { backgroundColor: colors.authentic }]} />}
                      </View>
                      <Text style={[styles.label, { color }]}>{getLabel()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </BlurView>
          </View>
        );
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="map" />
      <Tabs.Screen name="alerts" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarHidden: {
    display: "none",
  },
  container: {
    position: "absolute",
    bottom: Platform.select({ ios: 24, android: 16, default: 16 }),
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  blurBar: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  inner: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: 12,
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: "absolute",
    bottom: -6,
  },
});
