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

export default function DashboardScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);

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
          Suivez votre progression et gardez vos habitudes de prévention actives.
        </Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Score musculo-squelettique</Text>

          <Text style={styles.score}>
            {questionnaireResult ? `${score}/100` : "--/100"}
          </Text>

          <Text style={styles.scoreMessage}>
            {questionnaireResult
              ? `Votre niveau actuel est : ${level}.`
              : "Complétez le questionnaire pour obtenir votre premier score."}
          </Text>
        </View>

        {priorities.length > 0 && (
          <View style={styles.levelCard}>
            <Text style={styles.levelTitle}>Vos priorités actuelles</Text>

            {priorities.map((priority, index) => (
              <Text key={priority} style={styles.levelDescription}>
                {index + 1}. {priority}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Score du poste de travail</Text>

          <Text style={styles.score}>
            {workstationAuditResult
              ? `${workstationAuditResult.score}/100`
              : "--/100"}
          </Text>

          <Text style={styles.scoreMessage}>
            {workstationAuditResult
              ? workstationAuditResult.level
              : "Faites l’audit du poste pour obtenir votre score ergonomique."}
          </Text>
        </View>

        {workstationAuditResult &&
          workstationAuditResult.priorities.length > 0 && (
            <View style={styles.levelCard}>
              <Text style={styles.levelTitle}>Priorités du poste</Text>

              {workstationAuditResult.priorities.map((priority, index) => (
                <Text key={priority} style={styles.levelDescription}>
                  {index + 1}. {priority}
                </Text>
              ))}
            </View>
          )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedBreaks}</Text>
            <Text style={styles.statLabel}>pauses complétées</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedExercises}</Text>
            <Text style={styles.statLabel}>exercices complétés</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCapsules}</Text>
            <Text style={styles.statLabel}>capsules lues</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>points</Text>
          </View>
        </View>

        <View style={styles.levelCard}>
          <Text style={styles.levelTitle}>Niveau actuel</Text>
          <Text style={styles.levelText}>{userLevel}</Text>
          <Text style={styles.levelDescription}>
            Continuez vos pauses, exercices, capsules et audits pour progresser.
          </Text>
        </View>

        <View style={styles.badgesSection}>
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

        <Link href="/questionnaire" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Refaire le questionnaire</Text>
          </Pressable>
        </Link>

        <Link href="/personal-plan" asChild>
  <Pressable style={styles.secondaryButton}>
    <Text style={styles.secondaryButtonText}>Voir mon plan personnalisé</Text>
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

        <Link href="/workstation-audit" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Faire l’audit du poste</Text>
          </Pressable>
        </Link>

        <Link href="/profile" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Modifier mon profil</Text>
          </Pressable>
        </Link>

        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>Retour à l’accueil</Text>
          </Pressable>
        </Link>

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
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    marginBottom: 24,
  },
  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    marginBottom: 22,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E5B7A",
    marginBottom: 10,
  },
  score: {
    fontSize: 58,
    fontWeight: "900",
    color: "#1E8A6A",
  },
  scoreMessage: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 34,
    fontWeight: "900",
    color: "#1E8A6A",
  },
  statLabel: {
    marginTop: 6,
    fontSize: 14,
    color: "#536B78",
    textAlign: "center",
  },
  levelCard: {
    backgroundColor: "#EAF7F1",
    borderRadius: 22,
    padding: 20,
    marginBottom: 24,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E8A6A",
    marginBottom: 6,
  },
  levelText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
  },
  badgesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 14,
  },
  badgeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeIcon: {
    fontSize: 26,
    marginRight: 12,
  },
  badgeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    color: "#183642",
  },
  primaryButton: {
    backgroundColor: "#1E8A6A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "800",
  },
  backButton: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
  },
  backButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "700",
  },
});