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
  ExerciseIcon,
} from "../components/ErgoIcons";

type AppRoute =
  | "/timer"
  | "/exercises"
  | "/education"
  | "/personal-plan"
  | "/daily-checkin"
  | "/progress"
  | "/dashboard";

type RoutineIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type RoutineIconType = React.ComponentType<RoutineIconProps>;

type RoutineTask = {
  id: string;
  label: string;
  title: string;
  text: string;
  href: AppRoute;
  buttonText: string;
  Icon: RoutineIconType;
};

type QuickCard = {
  label: string;
  title: string;
  text: string;
  href: AppRoute;
  Icon: RoutineIconType;
};

const ROUTINE_STORAGE_KEY = "ergoprevent_daily_routine";
const ROUTINE_UPDATED_EVENT = "ergoprevent_routine_updated";

const routineTasks: RoutineTask[] = [
  {
    id: "checkin",
    label: "Suivi",
    title: "Faire mon check-in",
    text: "Notez rapidement votre douleur, votre fatigue et la zone principale du moment.",
    href: "/daily-checkin",
    buttonText: "Faire le check-in",
    Icon: RoutineIcon,
  },
  {
    id: "pause",
    label: "Pause",
    title: "Faire une pause active",
    text: "Prenez 2 minutes pour bouger, marcher ou changer de position.",
    href: "/timer",
    buttonText: "Démarrer",
    Icon: BreakIcon,
  },
  {
    id: "exercise",
    label: "Bouger",
    title: "Faire un exercice",
    text: "Choisissez un exercice court pour le cou, le dos, les épaules ou les poignets.",
    href: "/exercises",
    buttonText: "Voir les exercices",
    Icon: ExerciseIcon,
  },
  {
    id: "education",
    label: "Apprendre",
    title: "Lire une capsule",
    text: "Apprenez une notion simple d’ergonomie ou de prévention.",
    href: "/education",
    buttonText: "Lire une capsule",
    Icon: EducationIcon,
  },
  {
    id: "plan",
    label: "Plan",
    title: "Consulter mon plan personnalisé",
    text: "Regardez vos priorités et les actions recommandées selon vos scores.",
    href: "/personal-plan",
    buttonText: "Voir mon plan",
    Icon: PlanIcon,
  },
];

const quickCards: QuickCard[] = [
  {
    label: "Objectifs",
    title: "Plan personnalisé",
    text: "Vos priorités selon vos résultats.",
    href: "/personal-plan",
    Icon: PlanIcon,
  },
  {
    label: "Tendances",
    title: "Évolution",
    text: "Suivez vos habitudes dans le temps.",
    href: "/progress",
    Icon: ProgressIcon,
  },
  {
    label: "Vue globale",
    title: "Dashboard",
    text: "Consultez votre résumé complet.",
    href: "/dashboard",
    Icon: ProgressIcon,
  },
];

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getCompletedTasksForToday() {
  if (typeof window === "undefined") {
    return [];
  }

  const todayKey = getTodayKey();
  const savedData = window.localStorage.getItem(ROUTINE_STORAGE_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);
    return parsedData[todayKey] ?? [];
  } catch {
    return [];
  }
}

function saveCompletedTasksForToday(taskIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const todayKey = getTodayKey();
  const savedData = window.localStorage.getItem(ROUTINE_STORAGE_KEY);

  let parsedData = {};

  try {
    parsedData = savedData ? JSON.parse(savedData) : {};
  } catch {
    parsedData = {};
  }

  const updatedData = {
    ...parsedData,
    [todayKey]: taskIds,
  };

  window.localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(updatedData));
  window.dispatchEvent(new Event(ROUTINE_UPDATED_EVENT));
}

export default function RoutineScreen() {
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() =>
    getCompletedTasksForToday()
  );

  const { colors, mode } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = createStyles(colors, mode, layout);

  useEffect(() => {
    function refreshData() {
      setStats(getAppStats());
      setCompletedTaskIds(getCompletedTasksForToday());
    }

    refreshData();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(APP_STATS_UPDATED_EVENT, refreshData);
    window.addEventListener(ROUTINE_UPDATED_EVENT, refreshData);
    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshData);
      window.removeEventListener(ROUTINE_UPDATED_EVENT, refreshData);
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const profile = stats.profile ?? null;
  const completedCount = completedTaskIds.length;
  const totalTasks = routineTasks.length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  const nextTask =
    routineTasks.find((task) => !completedTaskIds.includes(task.id)) ?? null;

  function toggleTask(taskId: string) {
    let updatedTaskIds: string[];

    if (completedTaskIds.includes(taskId)) {
      updatedTaskIds = completedTaskIds.filter((id) => id !== taskId);
    } else {
      updatedTaskIds = [...completedTaskIds, taskId];
    }

    setCompletedTaskIds(updatedTaskIds);
    saveCompletedTasksForToday(updatedTaskIds);
  }

  const NextTaskIcon = nextTask?.Icon ?? RoutineIcon;

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Routine quotidienne</Text>
            </View>

            <Text style={styles.pageTitle}>Routine du jour</Text>

            <Text style={styles.subtitle}>
              Un petit plan quotidien pour garder vos habitudes de prévention
              actives, sans pression.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTitleBlock}>
                <Text style={styles.heroGreeting}>
                  {profile?.firstName
                    ? `Bonjour ${profile.firstName}`
                    : "Objectif du jour"}
                </Text>

                <Text style={styles.heroTitle}>
                  {completedCount === totalTasks
                    ? "Routine complétée"
                    : "Une action à la fois"}
                </Text>
              </View>

              <View style={styles.completionBadge}>
                <Text style={styles.completionNumber}>{completedCount}</Text>
                <Text style={styles.completionText}>/{totalTasks}</Text>
              </View>
            </View>

            <Text style={styles.heroText}>
              {completedCount === totalTasks
                ? "Vous avez complété toutes les actions prévues aujourd’hui."
                : "L’objectif n’est pas d’être parfait, mais de bouger un peu et de répéter des gestes simples."}
            </Text>

            <View style={styles.progressArea}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Progression</Text>
                <Text style={styles.progressValue}>{progressPercent}%</Text>
              </View>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {nextTask && (
            <View style={styles.nextCard}>
              <View style={styles.nextTopRow}>
                <IconBadge
                  size={layout.isMobile ? 43 : 48}
                  backgroundColor={colors.turquoiseSoft}
                  borderColor={colors.border}
                >
                  <NextTaskIcon
                    size={layout.isMobile ? 20 : 23}
                    color={colors.text}
                  />
                </IconBadge>

                <View style={styles.nextTextBlock}>
                  <Text style={styles.nextLabel}>Prochaine action</Text>
                  <Text style={styles.nextTitle}>{nextTask.title}</Text>
                </View>
              </View>

              <Text style={styles.nextText}>{nextTask.text}</Text>

              <Link href={nextTask.href} asChild>
                <PressableScale style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>
                    {nextTask.buttonText}
                  </Text>
                  <Text style={styles.primaryButtonArrow}>→</Text>
                </PressableScale>
              </Link>
            </View>
          )}

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Checklist du jour</Text>
              <Text style={styles.sectionSubtitle}>
                Cochez les actions que vous avez faites.
              </Text>
            </View>

            <View style={styles.sectionCountPill}>
              <Text style={styles.sectionCountText}>
                {completedCount}/{totalTasks}
              </Text>
            </View>
          </View>

          {routineTasks.map((task) => {
            const isCompleted = completedTaskIds.includes(task.id);
            const TaskIcon = task.Icon;

            return (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  isCompleted ? styles.taskCardCompleted : null,
                ]}
              >
                <View style={styles.taskHeader}>
                  <IconBadge
                    size={layout.isMobile ? 43 : 48}
                    backgroundColor={
                      isCompleted ? colors.primaryLight : colors.backgroundSoft
                    }
                    borderColor={colors.border}
                  >
                    <TaskIcon
                      size={layout.isMobile ? 20 : 23}
                      color={colors.text}
                    />
                  </IconBadge>

                  <View style={styles.taskTextContainer}>
                    <Text style={styles.taskLabel}>{task.label}</Text>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskText}>{task.text}</Text>
                  </View>
                </View>

                <View style={styles.taskActions}>
                  <PressableScale
                    style={[
                      styles.checkButton,
                      isCompleted ? styles.checkButtonCompleted : null,
                    ]}
                    onPress={() => toggleTask(task.id)}
                  >
                    <View
                      style={[
                        styles.checkCircle,
                        isCompleted ? styles.checkCircleCompleted : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.checkSymbol,
                          isCompleted ? styles.checkSymbolCompleted : null,
                        ]}
                      >
                        {isCompleted ? "✓" : ""}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.checkButtonText,
                        isCompleted ? styles.checkButtonTextCompleted : null,
                      ]}
                    >
                      {isCompleted ? "Complété" : "Marquer comme fait"}
                    </Text>
                  </PressableScale>

                  <Link href={task.href} asChild>
                    <PressableScale style={styles.secondaryButton}>
                      <Text style={styles.secondaryButtonText}>
                        {task.buttonText}
                      </Text>
                      <Text style={styles.secondaryButtonArrow}>→</Text>
                    </PressableScale>
                  </Link>
                </View>
              </View>
            );
          })}

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Liens rapides</Text>
              <Text style={styles.sectionSubtitle}>
                Continuez votre suivi quand vous voulez.
              </Text>
            </View>

            <Text style={styles.sectionAction}>Défilez →</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickCardsRow}
          >
            {quickCards.map((item) => {
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

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Conseil du jour</Text>
            <Text style={styles.tipText}>
              Même si vous ne complétez qu’une seule action aujourd’hui, c’est
              déjà utile. La régularité compte plus que la perfection.
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
      minHeight: isMobile ? 260 : 275,
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
    heroTitleBlock: {
      flex: 1,
    },
    heroGreeting: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: "900",
      color: colors.primary,
      marginBottom: isMobile ? 7 : 8,
    },
    heroTitle: {
      fontFamily: "Georgia",
      fontSize: isSmallMobile ? 27 : isMobile ? 30 : 34,
      lineHeight: isSmallMobile ? 33 : isMobile ? 36 : 41,
      color: colors.primary,
      letterSpacing: -0.7,
      maxWidth: isMobile ? 240 : 300,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    completionBadge: {
      minWidth: isMobile ? 62 : 72,
      height: isMobile ? 52 : 58,
      borderRadius: isMobile ? 26 : 29,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: isMobile ? 9 : 10,
    },
    completionNumber: {
      fontSize: isMobile ? 22 : 25,
      fontWeight: "900",
      color: colors.black,
    },
    completionText: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      color: colors.black,
      marginTop: 5,
    },
    heroText: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 23,
      color: colors.textSoft,
      maxWidth: 420,
      zIndex: 2,
      marginTop: isMobile ? 16 : 18,
      marginBottom: isMobile ? 16 : 18,
    },
    progressArea: {
      zIndex: 2,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: isMobile ? 10 : 12,
    },
    progressTitle: {
      fontSize: isMobile ? 12 : 14,
      fontWeight: "900",
      color: colors.textSoft,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    progressValue: {
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      color: colors.primary,
    },
    progressBarBackground: {
      height: isMobile ? 11 : 12,
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    nextCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.secondaryLight,
      borderRadius: isMobile ? 26 : 30,
      padding: isMobile ? 18 : 22,
      marginBottom: isMobile ? 24 : 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nextTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isMobile ? 12 : 14,
      marginBottom: isMobile ? 12 : 14,
    },
    nextTextBlock: {
      flex: 1,
    },
    nextLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 5,
    },
    nextTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 21 : 24,
      lineHeight: isMobile ? 26 : 30,
      color: colors.primary,
      letterSpacing: -0.3,
    },
    nextText: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 22,
      color: colors.textSoft,
      marginBottom: 16,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: isMobile ? 16 : 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
      alignSelf: isMobile ? "stretch" : "flex-start",
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      textAlign: "center",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
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
    taskCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 16 : 18,
      marginBottom: isMobile ? 12 : 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    taskCardCompleted: {
      backgroundColor: colors.turquoiseSoft,
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: isMobile ? 12 : 14,
      marginBottom: isMobile ? 14 : 16,
    },
    taskTextContainer: {
      flex: 1,
    },
    taskLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 5,
    },
    taskTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 19 : 22,
      lineHeight: isMobile ? 24 : 28,
      color: colors.primary,
      marginBottom: 7,
    },
    taskText: {
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 19 : 21,
      color: colors.textSoft,
    },
    taskActions: {
      flexDirection: isMobile ? "column" : "row",
      gap: 10,
      alignItems: isMobile ? "stretch" : "center",
      flexWrap: "wrap",
    },
    checkButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.backgroundSoft,
      paddingVertical: 12,
      paddingHorizontal: 13,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checkButtonCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    checkCircle: {
      width: 19,
      height: 19,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.textMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    checkCircleCompleted: {
      borderColor: colors.black,
      backgroundColor: colors.black,
    },
    checkSymbol: {
      fontSize: 12,
      fontWeight: "900",
      color: "transparent",
      lineHeight: 14,
    },
    checkSymbolCompleted: {
      color: colors.primary,
    },
    checkButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center",
    },
    checkButtonTextCompleted: {
      color: colors.black,
    },
    secondaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center",
    },
    secondaryButtonArrow: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "900",
      lineHeight: 17,
    },
    quickCardsRow: {
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      gap: 12,
      marginBottom: isMobile ? 22 : 24,
    },
    quickCard: {
      width: isSmallMobile ? 155 : isMobile ? 165 : 175,
      minHeight: isMobile ? 188 : 205,
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
    tipBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
    },
    tipTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.warningText,
      marginBottom: 6,
    },
    tipText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
  });
}