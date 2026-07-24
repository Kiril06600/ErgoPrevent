import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link, usePathname } from "expo-router";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  HomeIcon,
  RoutineIcon,
  PlanIcon,
  EducationIcon,
  ProfileIcon,
  IconBadge,
} from "./ErgoIcons";

const navItems = [
  {
    label: "Accueil",
    href: "/",
    Icon: HomeIcon,
  },
  {
    label: "Routine",
    href: "/routine",
    Icon: RoutineIcon,
  },
  {
    label: "Plan",
    href: "/personal-plan",
    Icon: PlanIcon,
  },
  {
    label: "Formation",
    href: "/education",
    Icon: EducationIcon,
  },
  {
    label: "Profil",
    href: "/profile",
    Icon: ProfileIcon,
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  return (
    <View style={styles.navWrapper}>
      <View style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
            <Link key={item.href} href={item.href} asChild>
              <Pressable style={navItemStyle}>
                <IconBadge
                  size={34}
                  backgroundColor={
                    isActive ? colors.primaryLight : colors.backgroundSoft
                  }
                  borderColor={isActive ? colors.border : "transparent"}
                >
                  <Icon
                    size={18}
                    color={isActive ? colors.text : colors.textMuted}
                  />
                </IconBadge>

                <Text style={navLabelStyle}>{item.label}</Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, mode: "light" | "dark") {
  return StyleSheet.create({
    navWrapper: {
      marginTop: 28,
      alignItems: "center",
    },
    navContainer: {
      width: "100%",
      maxWidth: 760,
      backgroundColor: colors.card,
      borderRadius: 34,
      padding: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
      boxShadow:
        mode === "dark"
          ? "0px 18px 38px rgba(0,0,0,0.34)"
          : "0px 18px 38px rgba(30,48,40,0.12)",
    },
    navItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 9,
      paddingHorizontal: 4,
      borderRadius: 24,
    },
    navItemActive: {
      backgroundColor: colors.secondaryLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navLabel: {
      marginTop: 6,
      fontSize: 10,
      fontWeight: "800",
      color: colors.textMuted,
      textAlign: "center",
    },
    navLabelActive: {
      color: colors.text,
    },
  });
}