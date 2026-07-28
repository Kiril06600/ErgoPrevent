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
import {
  APP_STATS_UPDATED_EVENT,
  AppStats,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
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
  const styles = createStyles(colors, mode);

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
            <View>
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
                size={48}
                backgroundColor={colors.turquoiseSoft}
                borderColor={colors.border}
              >
                <NextTaskIcon size={23} color={colors.text} />
              </IconBadge>

              <View style={styles.nextTextBlock}>
                <Text style={styles.nextLabel}>Prochaine action</Text>
                <Text style={styles.nextTitle}>{nextTask.title}</Text>
              </View>
            </View>

            <Text style={styles.nextText}>{nextTask.text}</Text>

            <Link href={nextTask.href} asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  {nextTask.buttonText}
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </Pressable>
            </Link>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <View>
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
                  size={48}
                  backgroundColor={
                    isCompleted ? colors.primaryLight : colors.backgroundSoft
                  }
                  borderColor={colors.border}
                >
                  <TaskIcon size={23} color={colors.text} />
                </IconBadge>

                <View style={styles.taskTextContainer}>
                  <Text style={styles.taskLabel}>{task.label}</Text>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskText}>{task.text}</Text>
                </View>
              </View>

              <View style={styles.taskActions}>
                <Pressable
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
                </Pressable>

                <Link href={task.href} asChild>
                  <Pressable style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      {task.buttonText}
                    </Text>
                    <Text style={styles.secondaryButtonArrow}>→</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          );
        })}

        <View style={styles.sectionHeaderRow}>
          <View>
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
                <Pressable style={styles.quickCard}>
                  <IconBadge
                    size={44}
                    backgroundColor={colors.backgroundSoft}
                    borderColor={colors.border}
                  >
                    <QuickIcon size={21} color={colors.text} />
                  </IconBadge>

                  <Text style={styles.quickLabel}>{item.label}</Text>
                  <Text style={styles.quickTitle}>{item.title}</Text>
                  <Text style={styles.quickText}>{item.text}</Text>

                  <View style={styles.quickArrowCircle}>
                    <Text style={styles.quickArrowText}>→</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Conseil du jour</Text>
          <Text style={styles.tipText}>
            Même si vous ne complétez qu’une seule action aujourd’hui, c’est déjà
            utile. La régularité compte plus que la perfection.
          </Text>
        </View>

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, _mode: "light" | "dark") {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingTop: 24,
      paddingBottom: 48,
    },
    pageHeader: {
      paddingHorizontal: 24,
      marginTop: 10,
      marginBottom: 22,
    },
    pagePill: {
      alignSelf: "flex-start",
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    pagePillText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    pageTitle: {
      fontFamily: "Georgia",
      fontSize: 38,
      lineHeight: 45,
      color: colors.primary,
      letterSpacing: -0.8,
      marginBottom: 10,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSoft,
      maxWidth: 520,
    },
    heroCard: {
      marginHorizontal: 24,
      marginBottom: 18,
      borderRadius: 36,
      padding: 24,
      minHeight: 275,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      position: "relative",
      justifyContent: "space-between",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      zIndex: 2,
    },
    heroGreeting: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.primary,
      marginBottom: 8,
    },
    heroTitle: {
      fontFamily: "Georgia",
      fontSize: 34,
      lineHeight: 41,
      color: colors.primary,
      letterSpacing: -0.7,
      maxWidth: 300,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    completionBadge: {
      minWidth: 72,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: 10,
    },
    completionNumber: {
      fontSize: 25,
      fontWeight: "900",
      color: colors.black,
    },
    completionText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.black,
      marginTop: 5,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 23,
      color: colors.textSoft,
      maxWidth: 420,
      zIndex: 2,
      marginTop: 18,
      marginBottom: 18,
    },
    progressArea: {
      zIndex: 2,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    progressTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.textSoft,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    progressValue: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.primary,
    },
    progressBarBackground: {
      height: 12,
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
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 30,
      padding: 22,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    nextTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 14,
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
      fontSize: 24,
      lineHeight: 30,
      color: colors.primary,
      letterSpacing: -0.3,
    },
    nextText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      marginBottom: 16,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
      alignSelf: "flex-start",
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: 15,
      fontWeight: "900",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
    sectionHeaderRow: {
      paddingHorizontal: 24,
      marginBottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 16,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 28,
      lineHeight: 35,
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      lineHeight: 20,
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
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    taskCardCompleted: {
      backgroundColor: colors.turquoiseSoft,
    },
    taskHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
      marginBottom: 16,
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
      fontSize: 22,
      lineHeight: 28,
      color: colors.primary,
      marginBottom: 7,
    },
    taskText: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSoft,
    },
    taskActions: {
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
    },
    checkButton: {
      flexDirection: "row",
      alignItems: "center",
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
    },
    checkButtonTextCompleted: {
      color: colors.black,
    },
    secondaryButton: {
      flexDirection: "row",
      alignItems: "center",
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
    },
    secondaryButtonArrow: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "900",
      lineHeight: 17,
    },
    quickCardsRow: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 12,
      marginBottom: 24,
    },
    quickCard: {
      width: 175,
      minHeight: 205,
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 17,
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
      marginTop: 14,
      marginBottom: 7,
    },
    quickTitle: {
      fontFamily: "Georgia",
      fontSize: 19,
      lineHeight: 24,
      color: colors.primary,
      marginBottom: 6,
    },
    quickText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSoft,
      marginBottom: 12,
    },
    quickArrowCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
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
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
    },
    tipTitle: {
      fontFamily: "Georgia",
      fontSize: 18,
      lineHeight: 23,
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