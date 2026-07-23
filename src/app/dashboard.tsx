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
import { AppStats, getAppStats } from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";

export default function DashboardScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);

  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
  }, []);

  const profile = stats?.profile ?? null;
  const questionnaireResult = stats?.questionnaireResult ?? null;
  const workstationAuditResult = stats?.workstationAuditResult ?? null;

  const score = questionnaireResult?.score ?? 0;
  const level = questionnaireResult?.level ?? "Questionnaire non complété";
  const priorities = questionnaireResult?.priorities ?? [];

  const completedBreaks = stats?.completedBreaks ?? 0;
  const completedExercises = stats?.completedExercises ?? 0;
  const completedCapsules = stats?.completedCapsules ?? 0;
  const points = stats?.points ?? 0;

  const userLevel = points >= 100 ? "Ergonaute niveau 2" : "Débutant";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>
          {profile?.firstName
            ? `Bonjour ${profile.firstName}`
            : "Tableau de bord"}
        </Text>

        <Text style={styles.subtitle}>
          Suivez votre progression, vos scores et vos habitudes de prévention.
        </Text>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Niveau actuel</Text>
            <Text style={styles.heroTitle}>{userLevel}</Text>
            <Text style={styles.heroText}>
              Continuez vos pauses, exercices, capsules et check-ins pour
              progresser.
            </Text>
          </View>

          <View style={styles.pointsCircle}>
            <Text style={styles.pointsNumber}>{points}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        <View style={styles.scoreGrid}>
          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Score TMS</Text>
            <Text style={styles.score}>
              {questionnaireResult ? `${score}` : "--"}
            </Text>
            <Text style={styles.scoreSmall}>/100</Text>
            <Text style={styles.scoreMessage}>
              {questionnaireResult ? level : "Questionnaire à compléter"}
            </Text>
          </View>

          <View style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>Score poste</Text>
            <Text style={styles.score}>
              {workstationAuditResult
                ? `${workstationAuditResult.score}`
                : "--"}
            </Text>
            <Text style={styles.scoreSmall}>/100</Text>
            <Text style={styles.scoreMessage}>
              {workstationAuditResult
                ? workstationAuditResult.level
                : "Audit à compléter"}
            </Text>
          </View>
        </View>

        {priorities.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Priorités TMS</Text>

            {priorities.map((priority, index) => (
              <View key={priority} style={styles.priorityRow}>
                <View style={styles.priorityNumber}>
                  <Text style={styles.priorityNumberText}>{index + 1}</Text>
                </View>

                <Text style={styles.priorityText}>{priority}</Text>
              </View>
            ))}
          </View>
        )}

        {workstationAuditResult &&
          workstationAuditResult.priorities.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Priorités du poste</Text>

              {workstationAuditResult.priorities.map((priority, index) => (
                <View key={priority} style={styles.priorityRow}>
                  <View style={styles.priorityNumber}>
                    <Text style={styles.priorityNumberText}>{index + 1}</Text>
                  </View>

                  <Text style={styles.priorityText}>{priority}</Text>
                </View>
              ))}
            </View>
          )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedBreaks}</Text>
            <Text style={styles.statLabel}>pauses</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedExercises}</Text>
            <Text style={styles.statLabel}>exercices</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCapsules}</Text>
            <Text style={styles.statLabel}>capsules</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>points</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Badges obtenus</Text>

          {completedBreaks > 0 && (
            <View style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>🏆</Text>
              <Text style={styles.badgeText}>Première pause complétée</Text>
            </View>
          )}

          {completedExercises > 0 && (
            <View style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>💪</Text>
              <Text style={styles.badgeText}>Premier exercice complété</Text>
            </View>
          )}

          {completedCapsules > 0 && (
            <View style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>🎓</Text>
              <Text style={styles.badgeText}>Première capsule lue</Text>
            </View>
          )}

          {workstationAuditResult && (
            <View style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>🖥️</Text>
              <Text style={styles.badgeText}>Premier audit du poste</Text>
            </View>
          )}

          {points >= 100 && (
            <View style={styles.badgeCard}>
              <Text style={styles.badgeIcon}>🔥</Text>
              <Text style={styles.badgeText}>100 points obtenus</Text>
            </View>
          )}

          {completedBreaks === 0 &&
            completedExercises === 0 &&
            completedCapsules === 0 &&
            !workstationAuditResult &&
            points === 0 && (
              <View style={styles.badgeCard}>
                <Text style={styles.badgeIcon}>🌱</Text>
                <Text style={styles.badgeText}>
                  Commencez une action pour obtenir votre premier badge.
                </Text>
              </View>
            )}
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>

        <Link href="/routine" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Voir ma routine du jour</Text>
          </Pressable>
        </Link>

        <Link href="/daily-checkin" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Faire mon check-in quotidien
            </Text>
          </Pressable>
        </Link>

        <Link href="/progress" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir mon évolution</Text>
          </Pressable>
        </Link>

        <Link href="/personal-plan" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Voir mon plan personnalisé
            </Text>
          </Pressable>
        </Link>

        <Link href="/questionnaire" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Refaire le questionnaire</Text>
          </Pressable>
        </Link>

        <Link href="/workstation-audit" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Faire l’audit du poste</Text>
          </Pressable>
        </Link>

        <Link href="/timer" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Démarrer une pause</Text>
          </Pressable>
        </Link>

        <Link href="/exercises" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Faire un exercice</Text>
          </Pressable>
        </Link>

        <Link href="/education" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Lire une capsule</Text>
          </Pressable>
        </Link>

        <Link href="/profile" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Modifier mon profil</Text>
          </Pressable>
        </Link>

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 24,
      paddingBottom: 48,
    },
    pageTitle: {
      fontSize: 32,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSoft,
      marginBottom: 24,
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 24,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 18,
    },
    heroLabel: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    heroTitle: {
      fontSize: 25,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 8,
    },
    heroText: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSoft,
      maxWidth: 420,
    },
    pointsCircle: {
      width: 78,
      height: 78,
      borderRadius: 39,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    pointsNumber: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.black,
    },
    pointsLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.black,
    },
    scoreGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 18,
    },
    scoreCard: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderRadius: 24,
      padding: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    scoreLabel: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 8,
      textAlign: "center",
    },
    score: {
      fontSize: 42,
      fontWeight: "900",
      color: colors.primary,
    },
    scoreSmall: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textSoft,
      marginBottom: 8,
    },
    scoreMessage: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSoft,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 14,
    },
    priorityRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      backgroundColor: colors.cardWarm,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    priorityNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    priorityNumberText: {
      color: colors.black,
      fontWeight: "900",
      fontSize: 14,
    },
    priorityText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 22,
    },
    statCard: {
      width: "48%",
      backgroundColor: colors.cardWarm,
      borderRadius: 22,
      padding: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 34,
      fontWeight: "900",
      color: colors.primary,
    },
    statLabel: {
      marginTop: 6,
      fontSize: 14,
      color: colors.textSoft,
      fontWeight: "800",
      textAlign: "center",
    },
    badgeCard: {
      backgroundColor: colors.cardWarm,
      borderRadius: 18,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    badgeIcon: {
      fontSize: 26,
      marginRight: 12,
    },
    badgeText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "800",
      color: colors.text,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: 16,
      fontWeight: "900",
    },
    secondaryButton: {
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      marginBottom: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
  });
}