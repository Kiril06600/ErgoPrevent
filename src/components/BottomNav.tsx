import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from "react-native";
import type { LayoutChangeEvent } from "react-native";
import { Link, usePathname, type Href } from "expo-router";
import { Feather } from "@expo/vector-icons";
import PressableScale from "./PressableScale";
import { useAppTheme } from "../theme/ThemeContext";

type BottomNavProps = {
  fixed?: boolean;
};

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

type NavItem = {
  label: string;
  href: Href;
  activePaths: string[];
  iconName: FeatherIconName;
};

const navItems: NavItem[] = [
  {
    label: "Accueil",
    href: "/",
    activePaths: ["/"],
    iconName: "home",
  },
  {
    label: "Routine",
    href: "/routine",
    activePaths: ["/routine", "/timer", "/exercises", "/daily-checkin"],
    iconName: "check-circle",
  },
  {
    label: "Plan",
    href: "/personal-plan",
    activePaths: ["/personal-plan", "/questionnaire", "/workstation-audit"],
    iconName: "list",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    activePaths: ["/dashboard", "/progress", "/education", "/explore"],
    iconName: "bar-chart-2",
  },
  {
    label: "Profil",
    href: "/profile",
    activePaths: ["/profile", "/export-data"],
    iconName: "user",
  },
];

function isCurrentPathActive(pathname: string, activePaths: string[]) {
  return activePaths.some((path) => pathname === path);
}

export default function BottomNav({ fixed = false }: BottomNavProps) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { mode } = useAppTheme();

  const showLabels = width >= 700;
  const isMobile = width < 700;
  const isLightMode = mode === "light";

  const styles = createStyles(isMobile, showLabels, isLightMode);
  const [containerWidth, setContainerWidth] = useState(0);

  const activeIndexFromPath = navItems.findIndex((item) =>
    isCurrentPathActive(pathname, item.activePaths)
  );

  const activeIndex = activeIndexFromPath >= 0 ? activeIndexFromPath : 0;
  const itemWidth = containerWidth > 0 ? containerWidth / navItems.length : 0;

  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const indicatorScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (itemWidth <= 0) {
      return;
    }

    Animated.parallel([
      Animated.spring(indicatorTranslateX, {
        toValue: activeIndex * itemWidth,
        useNativeDriver: true,
        speed: 16,
        bounciness: 8,
      }),
      Animated.sequence([
        Animated.spring(indicatorScale, {
          toValue: 0.96,
          useNativeDriver: true,
          speed: 28,
          bounciness: 4,
        }),
        Animated.spring(indicatorScale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 22,
          bounciness: 6,
        }),
      ]),
    ]).start();
  }, [activeIndex, itemWidth, indicatorTranslateX, indicatorScale]);

  function handleContainerLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;

    if (Math.abs(nextWidth - containerWidth) > 1) {
      setContainerWidth(nextWidth);
    }
  }

  const glassEffect =
    Platform.OS === "web"
      ? ({
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
        } as any)
      : null;

  const iconColor = isLightMode ? "#000000" : "#FFFFFF";
  const labelColor = isLightMode ? "#000000" : "#FFFFFF";

  if (!fixed) {
    return <View style={styles.navSpacer} />;
  }

  return (
    <View style={styles.navWrapper} pointerEvents="box-none">
      <View
        style={[styles.navContainer, glassEffect]}
        onLayout={handleContainerLayout}
      >
        {itemWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicatorTrack,
              {
                width: itemWidth,
                transform: [
                  { translateX: indicatorTranslateX },
                  { scale: indicatorScale },
                ],
              },
            ]}
          >
            <View style={styles.activeIndicator} />
          </Animated.View>
        )}

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <Link key={item.label} href={item.href} asChild>
              <PressableScale
                style={styles.navItem}
                pressedStyle={styles.navItemPressed}
                scaleTo={0.94}
              >
                <View style={styles.iconWrap}>
                  <Feather
                    name={item.iconName}
                    size={showLabels ? 23 : 28}
                    color={iconColor}
                    style={styles.icon}
                  />
                </View>

                {showLabels && (
                  <Text
                    style={[
                      styles.navLabel,
                      { color: labelColor },
                      isActive ? styles.navLabelActive : null,
                    ]}
                  >
                    {item.label}
                  </Text>
                )}
              </PressableScale>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(
  isMobile: boolean,
  showLabels: boolean,
  isLightMode: boolean
) {
  return StyleSheet.create({
    navWrapper: {
      position: Platform.OS === "web" ? ("fixed" as any) : "absolute",
      left: 0,
      right: 0,
      bottom: isMobile ? 14 : 22,
      zIndex: 999999,
      elevation: 999999,
      paddingHorizontal: isMobile ? 18 : 24,
      alignItems: "center",
    },
    navContainer: {
      width: "100%",
      maxWidth: showLabels ? 720 : 390,
      minHeight: showLabels ? 76 : 64,
      borderRadius: 999,
      padding: showLabels ? 7 : 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden",
      position: "relative",
      backgroundColor: isLightMode
        ? "rgba(255,255,255,0.74)"
        : "rgba(4,8,10,0.78)",
      borderWidth: 1,
      borderColor: isLightMode
        ? "rgba(0,0,0,0.12)"
        : "rgba(255,255,255,0.22)",
      boxShadow: isLightMode
        ? "0px 18px 42px rgba(0,0,0,0.16), inset 0px 1px 1px rgba(255,255,255,0.8)"
        : "0px 18px 42px rgba(0,0,0,0.55), inset 0px 1px 1px rgba(255,255,255,0.16)",
    },
    activeIndicatorTrack: {
      position: "absolute",
      left: 0,
      top: 6,
      bottom: 6,
      zIndex: 0,
      paddingHorizontal: 5,
    },
    activeIndicator: {
      flex: 1,
      borderRadius: 999,
      backgroundColor: isLightMode
        ? "rgba(255,255,255,0.9)"
        : "rgba(255,255,255,0.18)",
      borderWidth: 1,
      borderColor: isLightMode
        ? "rgba(255,255,255,0.95)"
        : "rgba(255,255,255,0.26)",
      boxShadow: isLightMode
        ? "0px 8px 18px rgba(0,0,0,0.14), inset 0px 1px 1px rgba(255,255,255,0.95)"
        : "0px 8px 18px rgba(0,0,0,0.22), inset 0px 1px 1px rgba(255,255,255,0.18)",
    },
    navItem: {
      flex: 1,
      minHeight: showLabels ? 62 : 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      paddingHorizontal: showLabels ? 8 : 0,
      paddingVertical: showLabels ? 6 : 0,
      zIndex: 10,
      elevation: 10,
      backgroundColor: "transparent",
      opacity: 1,
    },
    navItemPressed: {
      opacity: 1,
    },
    iconWrap: {
      width: showLabels ? 36 : 42,
      height: showLabels ? 36 : 42,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 20,
      elevation: 20,
      opacity: 1,
      backgroundColor: "transparent",
    },
    icon: {
      opacity: 1,
      zIndex: 30,
      elevation: 30,
    },
    navLabel: {
      marginTop: 3,
      fontSize: 10.5,
      lineHeight: 13,
      fontWeight: "500",
      textAlign: "center",
      opacity: 1,
      zIndex: 20,
      elevation: 20,
    },
    navLabelActive: {
      fontWeight: "600",
    },
    navSpacer: {
      height: showLabels ? 116 : 94,
    },
  });
}