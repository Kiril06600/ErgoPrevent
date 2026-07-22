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
        title: "Créer votre profil",
        text: "Commencez par personnaliser votre profil pour adapter l’application à votre situation.",
        href: "/profile",
        button: "Créer mon profil",
      };
    }

    if (!questionnaireResult) {
      return {
        title: "Évaluer votre risque TMS",
        text: "Complétez le questionnaire pour obtenir votre premier score musculo-squelettique.",
        href: "/questionnaire",
        button: "Faire le questionnaire",
      };
    }

    if (!workstationAuditResult) {
      return {
        title: "Analyser votre poste",
        text: "Faites l’audit de votre poste de travail pour identifier vos priorités ergonomiques.",
        href: "/workstation-audit",
        button: "Faire l’audit du poste",
      };
    }

    if (completedBreaks === 0) {
      return {
        title: "Commencer une pause active",
        text: "Lancez la minuterie 25/2 pour intégrer le mouvement dans votre journée.",
        href: "/timer",
        button: "Démarrer la minuterie",
      };
    }

    if (completedExercises === 0) {
      return {
        title: "Faire un premier exercice",
        text: "Essayez un exercice simple pour le cou, le dos, les épaules ou les poignets.",
        href: "/exercises",
        button: "Voir les exercices",
      };
    }

    if (completedCapsules === 0) {
      return {
        title: "Lire une capsule éducative",
        text: "Apprenez une notion simple d’ergonomie en moins de 2 minutes.",
        href: "/education",
        button: "Lire une capsule",
      };
    }

    return {
      title: "Continuer votre progression",
      text: "Continuez vos pauses, exercices et capsules pour renforcer vos habitudes.",
      href: "/dashboard",
      button: "Voir mon tableau de bord",
    };
  }

  const nextAction = getNextAction();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ErgoPrevent</Text>
          <Text style={styles.tagline}>Prévention musculo-squelettique</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.greeting}>
            {firstName ? `Bonjour ${firstName}` : "Bienvenue"}
          </Text>

          <Text style={styles.title}>
            Prévenez vos douleurs avant qu’elles n’apparaissent.
          </Text>

          <Text style={styles.subtitle}>
            Suivez vos scores, bougez régulièrement et adoptez de meilleures
            habitudes au quotidien.
          </Text>
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
            <Text style={styles.statLabel}>Points</Text>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statSmall}>total</Text>
          </View>
        </View>

        <View style={styles.nextActionCard}>
          <Text style={styles.nextActionLabel}>Prochaine étape</Text>
          <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
          <Text style={styles.nextActionText}>{nextAction.text}</Text>

          <Link href={nextAction.href} asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{nextAction.button}</Text>
            </Pressable>
          </Link>
        </View>

        <Text style={styles.sectionTitle}>Accès rapide</Text>

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
    <Text style={styles.quickText}>Suivi du jour</Text>
  </Pressable>
</Link>

<Link href="/progress" asChild>
  <Pressable style={styles.quickCard}>
    <Text style={styles.quickIcon}>📈</Text>
    <Text style={styles.quickTitle}>Évolution</Text>
    <Text style={styles.quickText}>Suivre les tendances</Text>
  </Pressable>
</Link>

  <Link href="/questionnaire" asChild>
    <Pressable style={styles.quickCard}>
      <Text style={styles.quickIcon}>🧠</Text>
      <Text style={styles.quickTitle}>Questionnaire</Text>
      <Text style={styles.quickText}>Évaluer le risque TMS</Text>
    </Pressable>
  </Link>

  <Link href="/workstation-audit" asChild>
    <Pressable style={styles.quickCard}>
      <Text style={styles.quickIcon}>🖥️</Text>
      <Text style={styles.quickTitle}>Audit du poste</Text>
      <Text style={styles.quickText}>Analyser l’environnement</Text>
    </Pressable>
  </Link>

  <Link href="/personal-plan" asChild>
    <Pressable style={styles.quickCard}>
      <Text style={styles.quickIcon}>🧭</Text>
      <Text style={styles.quickTitle}>Plan</Text>
      <Text style={styles.quickText}>Actions personnalisées</Text>
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
      <Text style={styles.quickText}>Voir la progression</Text>
    </Pressable>
  </Link>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ErgoPrevent est un outil d’éducation et de prévention. Il ne remplace
            pas une consultation avec un professionnel de la santé, un ergonome,
            un physiothérapeute ou un médecin.
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
    backgroundColor: "#F4F8FB",
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "900",
    color: "#1E5B7A",
  },
  tagline: {
    marginTop: 6,
    fontSize: 15,
    color: "#5D7684",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 26,
    marginBottom: 18,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E8A6A",
    textAlign: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "900",
    color: "#183642",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#536B78",
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: "900",
    color: "#1E8A6A",
  },
  statSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: "#536B78",
  },
  nextActionCard: {
    backgroundColor: "#EAF7F1",
    borderRadius: 24,
    padding: 22,
    marginBottom: 28,
  },
  nextActionLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1E8A6A",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  nextActionTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 8,
  },
  nextActionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#1E8A6A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  quickCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
  },
  quickIcon: {
    fontSize: 28,
    marginBottom: 10,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 4,
  },
  quickText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#536B78",
  },
  warningBox: {
    marginTop: 4,
    backgroundColor: "#FFF7E6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3D28B",
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#725A20",
  },
});