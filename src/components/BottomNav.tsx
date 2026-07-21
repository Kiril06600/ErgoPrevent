import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Link, usePathname } from "expo-router";

const navItems = [
  {
    label: "Accueil",
    icon: "🏠",
    href: "/",
  },
  {
    label: "Plan",
    icon: "🧭",
    href: "/personal-plan",
  },
  {
    label: "Minuterie",
    icon: "⏱️",
    href: "/timer",
  },
  {
    label: "Exercices",
    icon: "💪",
    href: "/exercises",
  },
  {
    label: "Dashboard",
    icon: "📊",
    href: "/dashboard",
  },
  {
    label: "Profil",
    icon: "👤",
    href: "/profile",
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

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

const styles = StyleSheet.create({
  navContainer: {
    marginTop: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DCE9EF",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 18,
  },
  navItemActive: {
    backgroundColor: "#EAF7F1",
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#536B78",
    textAlign: "center",
  },
  navLabelActive: {
    color: "#1E8A6A",
  },
});