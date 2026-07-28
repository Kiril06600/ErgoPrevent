import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import BottomNav from "../components/BottomNav";
import AppLogo from "../components/AppLogo";
import { useAppTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";
import {
  APP_STATS_UPDATED_EVENT,
  getAppStats,
} from "../lib/storage";
import {
  IconBadge,
  RoutineIcon,
  PlanIcon,
  EducationIcon,
  ProfileIcon,
  ProgressIcon,
  BreakIcon,
  ExerciseIcon,
} from "../components/ErgoIcons";

const essentialItems = [
  {
    title: "Bilan du jour",
    text: "Suivez comment votre corps va.",
    href: "/daily-checkin",
    Icon: ProgressIcon,
  },
  {
    title: "Posture",
    text: "Analysez votre poste de travail.",
    href: "/workstation-audit",
    Icon: PlanIcon,
  },
  {
    title: "Rappels Pauses",
    text: "Restez actif et bougez souvent.",
    href: "/timer",
    Icon: BreakIcon,
  },
  {
    title: "Objectifs",
    text: "Consultez votre plan personnalisé.",
    href: "/personal-plan",
    Icon: RoutineIcon,
  },
] as const;

const toolItems = [
  {
    title: "Étirements",
    text: "Exercices guidés pour chaque besoin.",
    href: "/exercises",
    Icon: ExerciseIcon,
  },
  {
    title: "Progression",
    text: "Suivez vos progrès dans le temps.",
    href: "/progress",
    Icon: ProgressIcon,
  },
  {
    title: "Formation",
    text: "Conseils et astuces pour votre bien-être.",
    href: "/education",
    Icon: EducationIcon,
  },
  {
    title: "Profil",
    text: "Gérez vos données et préférences.",
    href: "/profile",
    Icon: ProfileIcon,
  },
] as const;

export default function HomeScreen() {
  const [stats, setStats] = useState(() => getAppStats());

useEffect(() => {
  function refreshStats() {
    setStats(getAppStats());
  }

  refreshStats();

  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener(APP_STATS_UPDATED_EVENT, refreshStats);
  window.addEventListener("focus", refreshStats);
  window.addEventListener("storage", refreshStats);

  return () => {
    window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshStats);
    window.removeEventListener("focus", refreshStats);
    window.removeEventListener("storage", refreshStats);
  };
}, []);

const firstName = stats.profile?.firstName?.trim() || "Alex";
const points = stats.points;
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <AppLogo height={100} />

          <View style={styles.notificationButton}>
            <Text style={styles.notificationIcon}>⌾</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.greeting}>Bonjour, {firstName}</Text>

              <Text style={styles.heroTitle}>
                De petits pas aujourd’hui,{"\n"}plus fort demain.
              </Text>

              <Text style={styles.heroSubtitle}>
                Restez constant, restez sans douleur.
              </Text>
            </View>

            <View style={styles.pointsBadge}>
              <Text style={styles.pointsNumber}>{points}</Text>
              <Text style={styles.pointsText}>points</Text>
            </View>
          </View>

          <Link href="/daily-checkin" asChild>
            <Pressable style={styles.heroButton}>
              <Text style={styles.heroButtonText}>
                Commencer le bilan du jour
              </Text>
              <Text style={styles.heroButtonArrow}>›</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vos essentiels</Text>

          <Link href="/explore" asChild>
            <Pressable style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Voir tout</Text>
              <Text style={styles.viewAllArrow}>›</Text>
            </Pressable>
          </Link>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          {essentialItems.map((item) => {
            const ItemIcon = item.Icon;

            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable style={styles.featureCard}>
                  <IconBadge
                    size={70}
                    backgroundColor="rgba(0, 48, 38, 0.26)"
                    borderColor="rgba(245, 238, 223, 0.18)"
                  >
                    <ItemIcon size={32} color={colors.primary} />
                  </IconBadge>

                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureText}>{item.text}</Text>

                  <View style={styles.arrowCircle}>
                    <Text style={styles.arrowText}>›</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Outils</Text>

          <Link href="/explore" asChild>
            <Pressable style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Voir tout</Text>
              <Text style={styles.viewAllArrow}>›</Text>
            </Pressable>
          </Link>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsRow}
        >
          {toolItems.map((item) => {
            const ItemIcon = item.Icon;

            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable style={styles.featureCard}>
                  <IconBadge
                    size={70}
                    backgroundColor="rgba(0, 48, 38, 0.26)"
                    borderColor="rgba(245, 238, 223, 0.18)"
                  >
                    <ItemIcon size={32} color={colors.primary} />
                  </IconBadge>

                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureText}>{item.text}</Text>

                  <View style={styles.arrowCircle}>
                    <Text style={styles.arrowText}>›</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, mode: "light" | "dark") {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingTop: 28,
      paddingBottom: 42,
    },
    topBar: {
      paddingHorizontal: 24,
      marginBottom: 28,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    notificationButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationIcon: {
      color: colors.primary,
      fontSize: 34,
      fontWeight: "300",
      lineHeight: 34,
    },
    heroCard: {
      marginHorizontal: 24,
      marginBottom: 28,
      minHeight: 320,
      borderRadius: 36,
      padding: 28,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
      overflow: "hidden",
      boxShadow:
        mode === "dark"
          ? "0px 26px 52px rgba(0,0,0,0.18)"
          : "0px 26px 52px rgba(0,0,0,0.14)",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
    },
    heroTextBlock: {
      flex: 1,
      paddingTop: 8,
    },
    greeting: {
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSoft,
      marginBottom: 24,
      fontWeight: "500",
    },
    heroTitle: {
      fontFamily: "Georgia",
      fontSize: 39,
      lineHeight: 48,
      color: colors.primary,
      letterSpacing: -1,
      marginBottom: 18,
      textShadowColor: "rgba(0,0,0,0.22)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    heroSubtitle: {
      fontSize: 18,
      lineHeight: 27,
      color: colors.textSoft,
      fontWeight: "400",
    },
    pointsBadge: {
      width: 112,
      minHeight: 82,
      borderRadius: 38,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      boxShadow: "0px 12px 26px rgba(0,0,0,0.16)",
    },
    pointsNumber: {
      fontSize: 34,
      lineHeight: 37,
      fontWeight: "900",
      color: colors.black,
      letterSpacing: -1,
    },
    pointsText: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
      color: colors.black,
    },
    heroButton: {
      alignSelf: "flex-start",
      minWidth: 300,
      borderRadius: 999,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      paddingVertical: 16,
      paddingHorizontal: 25,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      marginTop: 30,
    },
    heroButtonText: {
      color: colors.black,
      fontSize: 17,
      fontWeight: "900",
    },
    heroButtonArrow: {
      color: colors.black,
      fontSize: 34,
      fontWeight: "600",
      lineHeight: 28,
      marginTop: -2,
    },
    sectionHeader: {
      paddingHorizontal: 24,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 31,
      lineHeight: 38,
      color: colors.primary,
      letterSpacing: -0.5,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    viewAllText: {
      color: colors.textSoft,
      fontSize: 17,
      fontWeight: "500",
    },
    viewAllArrow: {
      color: colors.primary,
      fontSize: 32,
      lineHeight: 30,
      fontWeight: "500",
    },
    cardsRow: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 14,
      marginBottom: 30,
    },
    featureCard: {
      width: 205,
      minHeight: 205,
      borderRadius: 24,
      padding: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
      overflow: "hidden",
    },
    featureTitle: {
      color: colors.text,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "900",
      marginTop: 18,
    },
    featureText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 8,
      paddingRight: 10,
    },
    arrowCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.11)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-end",
      marginTop: 8,
    },
    arrowText: {
      color: colors.primary,
      fontSize: 30,
      lineHeight: 28,
      fontWeight: "500",
      marginTop: -2,
    },
  });
}