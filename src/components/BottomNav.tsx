import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link, usePathname } from "expo-router";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";

const navItems = [
  {
    label: "Accueil",
    icon: "🏠",
    href: "/",
  },
  {
    label: "Routine",
    icon: "✅",
    href: "/routine",
  },
  {
    label: "Plan",
    icon: "🧭",
    href: "/personal-plan",
  },
  {
    label: "Formation",
    icon: "🎓",
    href: "/education",
  },
  {
    label: "Profil",
    icon: "👤",
    href: "/profile",
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.navContainer}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;

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
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={navLabelStyle}>{item.label}</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    navContainer: {
      marginTop: 28,
      backgroundColor: colors.cardWarm,
      borderRadius: 28,
      padding: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
      boxShadow: "0px 10px 24px rgba(0,0,0,0.12)",
    },
    navItem: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 11,
      paddingHorizontal: 4,
      borderRadius: 18,
    },
    navItemActive: {
      backgroundColor: colors.secondaryLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navIcon: {
      fontSize: 18,
      marginBottom: 4,
    },
    navLabel: {
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