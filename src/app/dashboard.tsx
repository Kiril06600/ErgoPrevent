import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import {
  APP_STATS_UPDATED_EVENT,
  AppStats,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import AnimatedScreen from "../components/AnimatedScreen";
import PressableScale from "../components/PressableScale";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  IconBadge,
  RoutineIcon,
  ProgressIcon,
  PlanIcon,
  BreakIcon,
  EducationIcon,
  PostureIcon,
  ExerciseIcon,
  ProfileIcon,
} from "../components/ErgoIcons";

type AppRoute =
  | "/routine"
  | "/daily-checkin"
  | "/progress"
  | "/personal-plan"
  | "/questionnaire"
  | "/workstation-audit"
  | "/timer"
  | "/exercises"
  | "/education"
  | "/profile";

type DashboardIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type DashboardIcon = React.ComponentType<DashboardIconProps>;

type QuickAction = {
  label: string;
  title: string;
  text: string;
  href: AppRoute;
  Icon: DashboardIcon;
};

type BadgeItem = {
  title: string;
  text: string;
  Icon: DashboardIcon;
  isUnlocked: boolean;
};

const quickActions: QuickAction[] = [
  {
    label: "Aujourd’hui",
    title: "Routine",
    text: "Voir les actions du jour.",
    href: "/routine",
    Icon: RoutineIcon,
  },
  {
    label: "Suivi",
    title: "Check-in",
    text: "Ajouter une mesure rapide.",
    href: "/daily-checkin",
    Icon: ProgressIcon,
  },
  {
    label: "Objectifs",
    title: "Plan",
    text: "Consulter les priorités.",
    href: "/personal-plan",
    Icon: PlanIcon,
  },
  {
    label: "Évaluer",
    title: "Questionnaire",
    text: "Mettre à jour le score TMS.",
    href: "/questionnaire",
    Icon: EducationIcon,
  },
  {
    label: "Poste",
    title: "Audit",
    text: "Réviser l’environnement.",
    href: "/workstation-audit",
    Icon: PostureIcon,
  },
  {
    label: "Pause",
    title: "Minuterie",
    text: "Démarrer une pause active.",
    href: "/timer",
    Icon: BreakIcon,
  },
  {
    label: "Bouger",
    title: "Exercices",
    text: "Faire un mouvement court.",
    href: "/exercises",
    Icon: ExerciseIcon,
  },
  {
    label: "Profil",
    title: "Profil",
    text: "Modifier vos informations.",
    href: "/profile",
    Icon: ProfileIcon,
  },
];

function LockIcon({
  size = 16,
  color = "#F5EEDF",
  strokeWidth = 1.7,
}: {
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: size * 0.18,
          width: size * 0.48,
          height: size * 0.42,
          borderWidth: strokeWidth,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: size * 0.24,
          borderTopRightRadius: size * 0.24,
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: size * 0.14,
          width: size * 0.68,
          height: size * 0.52,
          borderRadius: size * 0.16,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          bottom: size * 0.31,
          width: size * 0.12,
          height: size * 0.16,
          borderRadius: size * 0.08,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

export default function DashboardScreen() {
  const [stats, setStats] = useState<AppStats>(() => getAppStats());

  const { colors, mode } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = createStyles(colors, mode, layout);

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

  const profile = stats.profile ?? null;
  const questionnaireResult = stats.questionnaireResult ?? null;
  const workstationAuditResult = stats.workstationAuditResult ?? null;

  const score = questionnaireResult?.score ?? 0;
  const level = questionnaireResult?.level ?? "Questionnaire non complété";
  const priorities = questionnaireResult?.priorities ?? [];

  const workstationScore = workstationAuditResult?.score ?? 0;
  const workstationLevel = workstationAuditResult?.level ?? "Audit non complété";
  const workstationPriorities = workstationAuditResult?.priorities ?? [];

  const completedBreaks = stats.completedBreaks ?? 0;
  const completedExercises = stats.completedExercises ?? 0;
  const completedCapsules = stats.completedCapsules ?? 0;
  const points = stats.points ?? 0;

  const userLevel = points >= 100 ? "Ergonaute niveau 2" : "Débutant";
  const totalActions = completedBreaks + completedExercises + completedCapsules;

  const badgeItems: BadgeItem[] = [
    {
      title: "Première pause",
      text: "Une pause active complétée.",
      Icon: BreakIcon,
      isUnlocked: completedBreaks > 0,
    },
    {
      title: "Premier exercice",
      text: "Un exercice terminé.",
      Icon: ExerciseIcon,
      isUnlocked: completedExercises > 0,
    },
    {
      title: "Première capsule",
      text: "Une capsule éducative lue.",
      Icon: EducationIcon,
      isUnlocked: completedCapsules > 0,
    },
    {
      title: "Audit du poste",
      text: "Un audit ergonomique complété.",
      Icon: PostureIcon,
      isUnlocked: Boolean(workstationAuditResult),
    },
    {
      title: "100 points",
      text: "Un premier palier atteint.",
      Icon: ProgressIcon,
      isUnlocked: points >= 100,
    },
  ];

  const unlockedBadges = badgeItems.filter((badge) => badge.isUnlocked);
  const hasAnyPriority =
    priorities.length > 0 || workstationPriorities.length > 0;

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Vue globale</Text>
            </View>

            <Text style={styles.pageTitle}>
              {profile?.firstName
                ? `Bonjour ${profile.firstName}`
                : "Tableau de bord"}
            </Text>

            <Text style={styles.subtitle}>
              Suivez votre progression, vos scores et vos habitudes de
              prévention.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroLabel}>Niveau actuel</Text>
                <Text style={styles.heroTitle}>{userLevel}</Text>
              </View>

              <View style={styles.pointsCircle}>
                <Text style={styles.pointsNumber}>{points}</Text>
                <Text style={styles.pointsLabel}>points</Text>
              </View>
            </View>

            <Text style={styles.heroText}>
              Continuez vos pauses, exercices, capsules et check-ins pour
              progresser régulièrement.
            </Text>
          </View>

          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Score TMS</Text>
              <Text style={styles.score}>
                {questionnaireResult ? score : "--"}
              </Text>
              <Text style={styles.scoreSmall}>/100</Text>
              <Text style={styles.scoreMessage}>
                {questionnaireResult ? level : "Questionnaire à compléter"}
              </Text>
            </View>

            <View style={styles.scoreCard}>
              <Text style={styles.scoreLabel}>Score poste</Text>
              <Text style={styles.score}>
                {workstationAuditResult ? workstationScore : "--"}
              </Text>
              <Text style={styles.scoreSmall}>/100</Text>
              <Text style={styles.scoreMessage}>
                {workstationAuditResult ? workstationLevel : "Audit à compléter"}
              </Text>
            </View>
          </View>

          <View style={styles.statsPanel}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedBreaks}</Text>
              <Text style={styles.statLabel}>pauses</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedExercises}</Text>
              <Text style={styles.statLabel}>exercices</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedCapsules}</Text>
              <Text style={styles.statLabel}>capsules</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalActions}</Text>
              <Text style={styles.statLabel}>actions</Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Priorités</Text>
              <Text style={styles.sectionSubtitle}>
                Les points principaux à suivre.
              </Text>
            </View>
          </View>

          {hasAnyPriority ? (
            <>
              {priorities.length > 0 && (
                <View style={styles.prioritySection}>
                  <View style={styles.priorityHeader}>
                    <IconBadge
                      size={layout.isMobile ? 39 : 42}
                      backgroundColor={colors.turquoiseSoft}
                      borderColor={colors.border}
                    >
                      <EducationIcon
                        size={layout.isMobile ? 18 : 20}
                        color={colors.text}
                      />
                    </IconBadge>

                    <View style={styles.priorityHeaderTextBlock}>
                      <Text style={styles.priorityLabel}>Questionnaire</Text>
                      <Text style={styles.priorityTitle}>Priorités TMS</Text>
                    </View>
                  </View>

                  {priorities.map((priority, index) => (
                    <View key={priority} style={styles.priorityRow}>
                      <View style={styles.priorityNumber}>
                        <Text style={styles.priorityNumberText}>
                          {index + 1}
                        </Text>
                      </View>

                      <Text style={styles.priorityText}>{priority}</Text>
                    </View>
                  ))}
                </View>
              )}

              {workstationPriorities.length > 0 && (
                <View style={styles.prioritySection}>
                  <View style={styles.priorityHeader}>
                    <IconBadge
                      size={layout.isMobile ? 39 : 42}
                      backgroundColor={colors.turquoiseSoft}
                      borderColor={colors.border}
                    >
                      <PostureIcon
                        size={layout.isMobile ? 18 : 20}
                        color={colors.text}
                      />
                    </IconBadge>

                    <View style={styles.priorityHeaderTextBlock}>
                      <Text style={styles.priorityLabel}>Poste</Text>
                      <Text style={styles.priorityTitle}>
                        Priorités du poste
                      </Text>
                    </View>
                  </View>

                  {workstationPriorities.map((priority, index) => (
                    <View key={priority} style={styles.priorityRow}>
                      <View style={styles.priorityNumber}>
                        <Text style={styles.priorityNumberText}>
                          {index + 1}
                        </Text>
                      </View>

                      <Text style={styles.priorityText}>{priority}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyPriorityCard}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <PlanIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <Text style={styles.emptyPriorityTitle}>
                Aucune priorité détectée pour l’instant
              </Text>

              <Text style={styles.emptyPriorityText}>
                Complétez le questionnaire ou l’audit du poste pour obtenir des
                priorités personnalisées.
              </Text>
            </View>
          )}

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Badges</Text>
              <Text style={styles.sectionSubtitle}>
                Vos étapes de progression.
              </Text>
            </View>

            <View style={styles.sectionCountPill}>
              <Text style={styles.sectionCountText}>
                {unlockedBadges.length}/{badgeItems.length}
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesRow}
          >
            {badgeItems.map((badge) => {
              const BadgeIcon = badge.Icon;

              return (
                <View
                  key={badge.title}
                  style={[
                    styles.badgeCard,
                    badge.isUnlocked
                      ? styles.badgeCardUnlocked
                      : styles.badgeCardLocked,
                  ]}
                >
                  {!badge.isUnlocked && (
                    <View style={styles.lockPill}>
                      <LockIcon size={14} color={colors.primary} />
                      <Text style={styles.lockText}>Verrouillé</Text>
                    </View>
                  )}

                  <IconBadge
                    size={layout.isMobile ? 42 : 46}
                    backgroundColor={
                      badge.isUnlocked
                        ? colors.primaryLight
                        : colors.backgroundSoft
                    }
                    borderColor={colors.border}
                  >
                    <BadgeIcon
                      size={layout.isMobile ? 20 : 22}
                      color={badge.isUnlocked ? colors.text : colors.textMuted}
                    />
                  </IconBadge>

                  <Text
                    style={[
                      styles.badgeTitle,
                      !badge.isUnlocked ? styles.badgeTitleLocked : null,
                    ]}
                  >
                    {badge.title}
                  </Text>

                  <Text style={styles.badgeText}>
                    {badge.isUnlocked ? badge.text : "À débloquer"}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
              <Text style={styles.sectionSubtitle}>
                Accédez aux fonctions principales.
              </Text>
            </View>

            <Text style={styles.sectionAction}>Défilez →</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsRow}
          >
            {quickActions.map((item) => {
              const QuickIcon = item.Icon;

              return (
                <Link key={item.href} href={item.href} asChild>
                  <PressableScale style={styles.quickCard}>
                    <IconBadge
                      size={layout.isMobile ? 40 : 44}
                      backgroundColor={colors.backgroundSoft}
                      borderColor={colors.border}
                    >
                      <QuickIcon
                        size={layout.isMobile ? 19 : 21}
                        color={colors.text}
                      />
                    </IconBadge>

                    <Text style={styles.quickLabel}>{item.label}</Text>
                    <Text style={styles.quickTitle}>{item.title}</Text>
                    <Text style={styles.quickText}>{item.text}</Text>

                    <View style={styles.quickArrowCircle}>
                      <Text style={styles.quickArrowText}>→</Text>
                    </View>
                  </PressableScale>
                </Link>
              );
            })}
          </ScrollView>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>À retenir</Text>
            <Text style={styles.infoText}>
              Le tableau de bord résume vos données de prévention. Il sert à
              suivre vos habitudes, mais ne remplace pas un avis professionnel.
            </Text>
          </View>

          <BottomNav />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function createStyles(
  colors: ThemeColors,
  mode: "light" | "dark",
  layout: ReturnType<typeof useResponsiveLayout>
) {
  const isMobile = layout.isMobile;
  const isSmallMobile = layout.isSmallMobile;
  const horizontalPadding = layout.horizontalPadding;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingTop: isMobile ? 18 : 24,
      paddingBottom: isMobile ? 38 : 48,
    },
    pageHeader: {
      paddingHorizontal: horizontalPadding,
      marginTop: isMobile ? 6 : 10,
      marginBottom: isMobile ? 18 : 22,
    },
    pagePill: {
      alignSelf: "flex-start",
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: isMobile ? 7 : 8,
      paddingHorizontal: isMobile ? 11 : 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: isMobile ? 12 : 14,
    },
    pagePillText: {
      color: colors.textSoft,
      fontSize: isMobile ? 11 : 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    pageTitle: {
      fontFamily: "Georgia",
      fontSize: isSmallMobile ? 31 : isMobile ? 34 : 38,
      lineHeight: isSmallMobile ? 38 : isMobile ? 41 : 45,
      color: colors.primary,
      letterSpacing: -0.8,
      marginBottom: isMobile ? 8 : 10,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    subtitle: {
      fontSize: isMobile ? 14 : 16,
      lineHeight: isMobile ? 21 : 24,
      color: colors.textSoft,
      maxWidth: 520,
    },
    heroCard: {
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 16 : 18,
      borderRadius: isMobile ? 28 : 36,
      padding: isMobile ? 20 : 24,
      minHeight: isMobile ? 220 : 245,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      position: "relative",
      justifyContent: "space-between",
      boxShadow:
        mode === "dark"
          ? "0px 20px 42px rgba(0,0,0,0.16)"
          : "0px 20px 42px rgba(0,0,0,0.10)",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: isMobile ? 12 : 16,
      zIndex: 2,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroLabel: {
      fontSize: isMobile ? 12 : 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    heroTitle: {
      fontFamily: "Georgia",
      fontSize: isSmallMobile ? 27 : isMobile ? 30 : 34,
      lineHeight: isSmallMobile ? 33 : isMobile ? 36 : 41,
      color: colors.primary,
      letterSpacing: -0.7,
      maxWidth: isMobile ? 235 : 360,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    heroText: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 23,
      color: colors.textSoft,
      maxWidth: 460,
      zIndex: 2,
      marginTop: isMobile ? 18 : 22,
    },
    pointsCircle: {
      width: isMobile ? 64 : 74,
      height: isMobile ? 64 : 74,
      borderRadius: isMobile ? 32 : 37,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    pointsNumber: {
      fontSize: isMobile ? 20 : 23,
      fontWeight: "900",
      color: colors.black,
      lineHeight: isMobile ? 24 : 27,
    },
    pointsLabel: {
      fontSize: isMobile ? 10 : 11,
      fontWeight: "900",
      color: colors.black,
    },
    scoreGrid: {
      flexDirection: "row",
      gap: isMobile ? 10 : 12,
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 16 : 18,
    },
    scoreCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 22 : 26,
      padding: isMobile ? 15 : 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    scoreLabel: {
      fontSize: isMobile ? 10 : 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 7,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    score: {
      fontSize: isMobile ? 30 : 38,
      lineHeight: isMobile ? 34 : 42,
      fontWeight: "900",
      color: colors.primary,
    },
    scoreSmall: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textSoft,
      marginBottom: 8,
    },
    scoreMessage: {
      fontSize: isMobile ? 11 : 12,
      lineHeight: isMobile ? 16 : 17,
      color: colors.textSoft,
      textAlign: "center",
    },
    statsPanel: {
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 24 : 28,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 22 : 26,
      padding: isMobile ? 13 : 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statDivider: {
      width: 1,
      height: isMobile ? 34 : 38,
      backgroundColor: colors.border,
    },
    statNumber: {
      fontSize: isMobile ? 19 : 23,
      fontWeight: "900",
      color: colors.text,
      lineHeight: isMobile ? 23 : 27,
    },
    statLabel: {
      marginTop: 4,
      fontSize: isMobile ? 8 : 10,
      color: colors.textMuted,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    sectionHeaderRow: {
      paddingHorizontal: horizontalPadding,
      marginBottom: isMobile ? 12 : 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 16,
    },
    sectionHeaderTextBlock: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 24 : 28,
      lineHeight: isMobile ? 30 : 35,
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 19 : 20,
      color: colors.textSoft,
    },
    sectionAction: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 4,
    },
    sectionCountPill: {
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 4,
    },
    sectionCountText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textSoft,
    },
    prioritySection: {
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 16 : 18,
      backgroundColor: colors.secondaryLight,
      borderRadius: isMobile ? 26 : 30,
      padding: isMobile ? 16 : 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    priorityHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: isMobile ? 11 : 13,
      marginBottom: 16,
    },
    priorityHeaderTextBlock: {
      flex: 1,
    },
    priorityLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 4,
    },
    priorityTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 21 : 23,
      lineHeight: isMobile ? 26 : 29,
      color: colors.primary,
      letterSpacing: -0.3,
    },
    priorityRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 16 : 18,
      padding: isMobile ? 12 : 13,
      borderWidth: 1,
      borderColor: colors.border,
    },
    priorityNumber: {
      width: isMobile ? 29 : 31,
      height: isMobile ? 29 : 31,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    priorityNumberText: {
      color: colors.black,
      fontWeight: "900",
      fontSize: 13,
    },
    priorityText: {
      flex: 1,
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 19 : 20,
      fontWeight: "800",
      color: colors.text,
    },
    emptyPriorityCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 18 : 20,
      marginBottom: isMobile ? 24 : 26,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    emptyPriorityTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 20 : 22,
      lineHeight: isMobile ? 25 : 28,
      color: colors.primary,
      textAlign: "center",
      marginTop: 15,
      marginBottom: 8,
    },
    emptyPriorityText: {
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 20 : 21,
      color: colors.textSoft,
      textAlign: "center",
      maxWidth: 430,
    },
    badgesRow: {
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      gap: 12,
      marginBottom: isMobile ? 24 : 28,
    },
    badgeCard: {
      width: isSmallMobile ? 148 : isMobile ? 158 : 160,
      minHeight: isMobile ? 160 : 170,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 15 : 17,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
      opacity: 0.72,
      position: "relative",
    },
    badgeCardUnlocked: {
      opacity: 1,
      backgroundColor: colors.card,
    },
    badgeCardLocked: {
      opacity: 0.62,
      backgroundColor: colors.cardWarm,
    },
    lockPill: {
      position: "absolute",
      top: 12,
      right: 12,
      zIndex: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(0, 30, 24, 0.42)",
      borderWidth: 1,
      borderColor: "rgba(245, 238, 223, 0.16)",
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 8,
    },
    lockText: {
      color: colors.primary,
      fontSize: 9,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    badgeTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.primary,
      marginTop: isMobile ? 12 : 14,
      marginBottom: 6,
    },
    badgeTitleLocked: {
      color: colors.textMuted,
    },
    badgeText: {
      fontSize: isMobile ? 12 : 13,
      lineHeight: isMobile ? 17 : 18,
      color: colors.textSoft,
    },
    quickActionsRow: {
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      gap: 12,
      marginBottom: isMobile ? 22 : 24,
    },
    quickCard: {
      width: isSmallMobile ? 155 : isMobile ? 165 : 165,
      minHeight: isMobile ? 185 : 200,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 15 : 17,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
    },
    quickLabel: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginTop: isMobile ? 12 : 14,
      marginBottom: 7,
    },
    quickTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 19,
      lineHeight: isMobile ? 22 : 24,
      color: colors.primary,
      marginBottom: 6,
    },
    quickText: {
      fontSize: isMobile ? 12 : 13,
      lineHeight: isMobile ? 18 : 19,
      color: colors.textSoft,
      marginBottom: 12,
    },
    quickArrowCircle: {
      width: isMobile ? 34 : 38,
      height: isMobile ? 34 : 38,
      borderRadius: isMobile ? 17 : 19,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-end",
    },
    quickArrowText: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "900",
      lineHeight: 19,
    },
    infoBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
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
}