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
import { colors } from "../theme/colors";

export default function HomeScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
  }, []);

  const profile = stats?.profile ?? null;
  const questionnaireResult = stats?.questionnaireResult ?? null;
  const workstationAuditResult = stats?.workstationAuditResult ?? null;

  const firstName = profile?.firstName;
  const points = stats?.points ?? 0;
  const completedBreaks = stats?.completedBreaks ?? 0;
  const completedExercises = stats?.completedExercises ?? 0;
  const completedCapsules = stats?.completedCapsules ?? 0;

  function getNextAction() {
    if (!profile) {
      return {
        eyebrow: "Commencer",
        title: "Créer votre profil",
        text: "Personnalisez l’application selon votre situation, votre domaine et votre objectif principal.",
        href: "/profile",
        button: "Créer mon profil",
      };
    }

    if (!questionnaireResult) {
      return {
        eyebrow: "Évaluation",
        title: "Évaluer votre risque TMS",
        text: "Complétez le questionnaire pour obtenir votre premier score musculo-squelettique.",
        href: "/questionnaire",
        button: "Faire le questionnaire",
      };
    }

    if (!workstationAuditResult) {
      return {
        eyebrow: "Ergonomie",
        title: "Analyser votre poste",
        text: "Identifiez les ajustements prioritaires de votre environnement de travail.",
        href: "/workstation-audit",
        button: "Faire l’audit du poste",
      };
    }

    if (completedBreaks === 0) {
      return {
        eyebrow: "Routine",
        title: "Commencer une pause active",
        text: "Lancez une courte pause pour intégrer plus de mouvement dans votre journée.",
        href: "/timer",
        button: "Démarrer la minuterie",
      };
    }

    if (completedExercises === 0) {
      return {
        eyebrow: "Mouvement",
        title: "Faire un premier exercice",
        text: "Essayez un exercice simple pour le cou, le dos, les épaules ou les poignets.",
        href: "/exercises",
        button: "Voir les exercices",
      };
    }

    if (completedCapsules === 0) {
      return {
        eyebrow: "Comprendre",
        title: "Lire une capsule éducative",
        text: "Découvrez une notion courte pour mieux comprendre la prévention des TMS.",
        href: "/education",
        button: "Lire une capsule",
      };
    }

    return {
      eyebrow: "Progression",
      title: "Continuer votre suivi",
      text: "Gardez vos habitudes actives avec votre routine, vos check-ins et votre plan personnalisé.",
      href: "/routine",
      button: "Voir ma routine",
    };
  }

  const nextAction = getNextAction();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.logo}>ErgoPrevent</Text>
            <Text style={styles.tagline}>Prévention et confort au quotidien</Text>
          </View>

          <View style={styles.pointsBadge}>
            <Text style={styles.pointsNumber}>{points}</Text>
            <Text style={styles.pointsLabel}>pts</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroDecoration}>
            <Text style={styles.heroIcon}>🌿</Text>
          </View>

          <Text style={styles.greeting}>
            {firstName ? `Bonjour ${firstName}` : "Bienvenue"}
          </Text>

          <Text style={styles.title}>
            Prenez soin de votre posture, de vos pauses et de votre confort.
          </Text>

          <Text style={styles.subtitle}>
            Une application simple pour suivre vos habitudes, vos douleurs et vos
            priorités ergonomiques.
          </Text>

          <Link href="/routine" asChild>
            <Pressable style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Commencer ma routine</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Score TMS</Text>
            <Text style={styles.statNumber}>
              {questionnaireResult ? questionnaireResult.score : "--"}
            </Text>
            <Text style={styles.statSmall}>/100</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Poste</Text>
            <Text style={styles.statNumber}>
              {workstationAuditResult ? workstationAuditResult.score : "--"}
            </Text>
            <Text style={styles.statSmall}>/100</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Check-ins</Text>
            <Text style={styles.statNumber}>📝</Text>
            <Text style={styles.statSmall}>suivi</Text>
          </View>
        </View>

        <View style={styles.nextActionCard}>
          <Text style={styles.nextActionLabel}>{nextAction.eyebrow}</Text>
          <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
          <Text style={styles.nextActionText}>{nextAction.text}</Text>

          <Link href={nextAction.href} asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{nextAction.button}</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          <Text style={styles.sectionSubtitle}>
            Les fonctions principales de votre espace.
          </Text>
        </View>

        <View style={styles.quickGrid}>
          <Link href="/routine" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>✅</Text>
              <Text style={styles.quickTitle}>Routine</Text>
              <Text style={styles.quickText}>Actions du jour</Text>
            </Pressable>
          </Link>

          <Link href="/daily-checkin" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>📝</Text>
              <Text style={styles.quickTitle}>Check-in</Text>
              <Text style={styles.quickText}>Suivi du moment</Text>
            </Pressable>
          </Link>

          <Link href="/progress" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>📈</Text>
              <Text style={styles.quickTitle}>Évolution</Text>
              <Text style={styles.quickText}>Voir les tendances</Text>
            </Pressable>
          </Link>

          <Link href="/personal-plan" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>🧭</Text>
              <Text style={styles.quickTitle}>Plan</Text>
              <Text style={styles.quickText}>Actions adaptées</Text>
            </Pressable>
          </Link>

          <Link href="/questionnaire" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>🧠</Text>
              <Text style={styles.quickTitle}>Questionnaire</Text>
              <Text style={styles.quickText}>Évaluer les TMS</Text>
            </Pressable>
          </Link>

          <Link href="/workstation-audit" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>🖥️</Text>
              <Text style={styles.quickTitle}>Audit</Text>
              <Text style={styles.quickText}>Analyser le poste</Text>
            </Pressable>
          </Link>

          <Link href="/timer" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>⏱️</Text>
              <Text style={styles.quickTitle}>Minuterie</Text>
              <Text style={styles.quickText}>Pause active 25/2</Text>
            </Pressable>
          </Link>

          <Link href="/exercises" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>💪</Text>
              <Text style={styles.quickTitle}>Exercices</Text>
              <Text style={styles.quickText}>Bouger simplement</Text>
            </Pressable>
          </Link>

          <Link href="/education" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>🎓</Text>
              <Text style={styles.quickTitle}>Formation</Text>
              <Text style={styles.quickText}>Capsules courtes</Text>
            </Pressable>
          </Link>

          <Link href="/dashboard" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickIcon}>📊</Text>
              <Text style={styles.quickTitle}>Dashboard</Text>
              <Text style={styles.quickText}>Progression</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>À retenir</Text>
          <Text style={styles.infoText}>
            ErgoPrevent est un outil d’éducation et de prévention. Il ne remplace
            pas une consultation avec un professionnel de la santé.
          </Text>
        </View>

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  topHeader: {
    marginTop: 18,
    marginBottom: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 31,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  tagline: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textSoft,
  },
  pointsBadge: {
    backgroundColor: colors.cardWarm,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointsNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
  },
  pointsLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.textMuted,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 32,
    padding: 26,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroDecoration: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.turquoiseSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  heroIcon: {
    fontSize: 34,
  },
  greeting: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.turquoise,
    marginBottom: 10,
  },
  title: {
    fontSize: 31,
    lineHeight: 39,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSoft,
    marginBottom: 20,
  },
heroButton: {
  backgroundColor: colors.turquoiseLight,
  paddingVertical: 16,
  borderRadius: 18,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.turquoise,
},
heroButtonText: {
  color: colors.text,
  fontSize: 16,
  fontWeight: "900",
},
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardWarm,
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.textMuted,
    marginBottom: 6,
    textAlign: "center",
  },
  statNumber: {
    fontSize: 30,
    fontWeight: "900",
    color: colors.turquoise,
  },
  statSmall: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textSoft,
  },
  nextActionCard: {
    backgroundColor: colors.accentSoft,
    borderRadius: 26,
    padding: 22,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  nextActionLabel: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.primaryDark,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  nextActionTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 8,
  },
  nextActionText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSoft,
    marginBottom: 16,
  },
  primaryButton: {
  backgroundColor: colors.accentSoft,
  paddingVertical: 15,
  borderRadius: 17,
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.primaryLight,
},
primaryButtonText: {
  color: colors.text,
  fontSize: 15,
  fontWeight: "900",
},
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSoft,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 18,
    minHeight: 132,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickIcon: {
    fontSize: 30,
    marginBottom: 12,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 5,
  },
  quickText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSoft,
  },
  infoBox: {
    backgroundColor: colors.warning,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.warningText,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.warningText,
  },
});