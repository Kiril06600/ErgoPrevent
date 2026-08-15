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
import PressableScale from "./PressableScale";
import {
  HomeIcon,
  RoutineIcon,
  PlanIcon,
  ProfileIcon,
  ProgressIcon,
} from "./ErgoIcons";

type BottomNavProps = {
  fixed?: boolean;
};

type NavItem = {
  label: string;
  href: Href;
  activePaths: string[];
  Icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
};

const navItems: NavItem[] = [
  { label: "Accueil", href: "/", activePaths: ["/"], Icon: HomeIcon },
  {
    label: "Routine",
    href: "/routine",
    activePaths: ["/routine", "/timer", "/exercises", "/daily-checkin"],
    Icon: RoutineIcon,
  },
  {
    label: "Plan",
    href: "/personal-plan",
    activePaths: ["/personal-plan", "/questionnaire", "/workstation-audit"],
    Icon: PlanIcon,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    activePaths: ["/dashboard", "/progress", "/education", "/explore"],
    Icon: ProgressIcon,
  },
  {
    label: "Profil",
    href: "/profile",
    activePaths: ["/profile", "/export-data"],
    Icon: ProfileIcon,
  },
];

function isCurrentPathActive(pathname: string, activePaths: string[]) {
  return activePaths.some((path) => pathname === path);
}

export default function BottomNav({ fixed = false }: BottomNavProps) {
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const showLabels = width >= 700;
  const isMobile = width < 700;

  const styles = createStyles(isMobile, showLabels);
  const [containerWidth, setContainerWidth] = useState(0);

  const activeIndexFromPath = navItems.findIndex((item) =>
    isCurrentPathActive(pathname, item.activePaths)
  );

  const activeIndex = activeIndexFromPath >= 0 ? activeIndexFromPath : 0;
  const itemWidth = containerWidth > 0 ? containerWidth / navItems.length : 0;

  const indicatorTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (itemWidth <= 0) {
      return;
    }

    Animated.spring(indicatorTranslateX, {
      toValue: activeIndex * itemWidth,
      useNativeDriver: true,
      speed: 18,
      bounciness: 8,
    }).start();
  }, [activeIndex, itemWidth, indicatorTranslateX]);

  function handleContainerLayout(event: LayoutChangeEvent) {
    const nextWidth = event.nativeEvent.layout.width;

    if (Math.abs(nextWidth - containerWidth) > 1) {
      setContainerWidth(nextWidth);
    }
  }

  const glassEffect =
    Platform.OS === "web"
      ? ({
          backdropFilter: "blur(26px) saturate(180%)",
          WebkitBackdropFilter: "blur(26px) saturate(180%)",
        } as any)
      : null;

  if (!fixed) {
    return <View style={styles.navSpacer} />;
  }

  return (
    <View style={styles.navWrapper} pointerEvents="box-none">
      <View style={[styles.navContainer, glassEffect]} onLayout={handleContainerLayout}>
        {itemWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.activeIndicatorTrack,
              {
                width: itemWidth,
                transform: [{ translateX: indicatorTranslateX }],
              },
            ]}
          >
            <View style={styles.activeIndicator} />
          </Animated.View>
        )}

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          const Icon = item.Icon;

          const navItemStyle = StyleSheet.flatten([
            styles.navItem,
            isActive ? styles.navItemActive : null,
          ]);

          const navLabelStyle = StyleSheet.flatten([
            styles.navLabel,
            isActive ? styles.navLabelActive : null,
          ]);

          return (
            <Link key={item.label} href={item.href} asChild>
              <PressableScale style={navItemStyle} scaleTo={0.9}>
                <Icon
                  size={showLabels ? 20 : 24}
                  color={
                    isActive
                      ? "rgba(255,255,255,0.98)"
                      : "rgba(255,255,255,0.72)"
                  }
                  strokeWidth={isActive ? 2.8 : 2.35}
                />

                {showLabels && <Text style={navLabelStyle}>{item.label}</Text>}
              </PressableScale>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(isMobile: boolean, showLabels: boolean) {
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
      maxWidth: showLabels ? 720 : 410,
      minHeight: showLabels ? 78 : 66,
      borderRadius: 999,
      padding: showLabels ? 8 : 7,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden",
      position: "relative",
      backgroundColor: "rgba(12, 18, 20, 0.74)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.22)",
      boxShadow:
        "0px 18px 45px rgba(0,0,0,0.42), inset 0px 1px 1px rgba(255,255,255,0.22)",
    },
    activeIndicatorTrack: {
      position: "absolute",
      left: 0,
      top: 7,
      bottom: 7,
      zIndex: 0,
      paddingHorizontal: 5,
    },
    activeIndicator: {
      flex: 1,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.26)",
      boxShadow:
        "inset 0px 1px 1px rgba(255,255,255,0.22), 0px 8px 18px rgba(0,0,0,0.20)",
    },
    navItem: {
      flex: 1,
      minHeight: showLabels ? 62 : 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 999,
      paddingHorizontal: showLabels ? 8 : 0,
      paddingVertical: showLabels ? 7 : 0,
      zIndex: 1,
      backgroundColor: "transparent",
    },
    navItemActive: {
      backgroundColor: "transparent",
    },
    navLabel: {
      marginTop: 5,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "800",
      color: "rgba(255,255,255,0.68)",
      textAlign: "center",
    },
    navLabelActive: {
      color: "rgba(255,255,255,0.98)",
      fontWeight: "900",
    },
    navSpacer: {
      height: showLabels ? 120 : 96,
    },
  });
}