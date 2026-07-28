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
  addCompletedBreak,
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
  BreakIcon,
  ExerciseIcon,
  RoutineIcon,
  ProgressIcon,
  PlanIcon,
} from "../components/ErgoIcons";

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 2 * 60;

type TimerMode = "work" | "break";

type AppRoute = "/routine" | "/exercises" | "/progress" | "/dashboard";

type QuickAction = {
  label: string;
  title: string;
  text: string;
  href: AppRoute;
  Icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
};

const quickActions: QuickAction[] = [
  {
    label: "Aujourd’hui",
    title: "Routine",
    text: "Retourner aux actions du jour.",
    href: "/routine",
    Icon: RoutineIcon,
  },
  {
    label: "Mouvement",
    title: "Exercices",
    text: "Faire un exercice rapide.",
    href: "/exercises",
    Icon: ExerciseIcon,
  },
  {
    label: "Suivi",
    title: "Évolution",
    text: "Voir les pauses complétées.",
    href: "/progress",
    Icon: ProgressIcon,
  },
  {
    label: "Résumé",
    title: "Dashboard",
    text: "Consulter vos points.",
    href: "/dashboard",
    Icon: PlanIcon,
  },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

export default function TimerScreen() {
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [secondsRemaining, setSecondsRemaining] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("work");
  const [message, setMessage] = useState("");

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

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", refreshStats);
    }

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshStats);
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("storage", refreshStats);

      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", refreshStats);
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((currentSeconds) => {
        if (currentSeconds > 1) {
          return currentSeconds - 1;
        }

        if (timerMode === "work") {
          setTimerMode("break");
          setMessage("Temps de pause. Prenez 2 minutes pour bouger.");
          return BREAK_DURATION;
        }

        const updatedStats = addCompletedBreak();

        setStats(updatedStats);
        setTimerMode("work");
        setIsRunning(false);
        setMessage("Pause complétée");

        return WORK_DURATION;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timerMode]);

  const completedBreaks = stats.completedBreaks ?? 0;
  const points = stats.points ?? 0;

  const totalDuration = timerMode === "work" ? WORK_DURATION : BREAK_DURATION;
  const progressPercent = Math.round(
    ((totalDuration - secondsRemaining) / totalDuration) * 100
  );

  const modeLabel = timerMode === "work" ? "Travail" : "Pause active";

  const modeTitle =
    timerMode === "work" ? "Session de concentration" : "Temps de bouger";

  const modeText =
    timerMode === "work"
      ? "Travaillez pendant 25 minutes, puis prenez une courte pause."
      : "Levez-vous, marchez, respirez ou faites un mouvement doux.";

  function handleStartPause() {
    setIsRunning((currentValue) => !currentValue);
    setMessage("");
  }

  function handleReset() {
    setIsRunning(false);
    setTimerMode("work");
    setSecondsRemaining(WORK_DURATION);
    setMessage("");
  }

  function handleSwitchToWork() {
    setIsRunning(false);
    setTimerMode("work");
    setSecondsRemaining(WORK_DURATION);
    setMessage("");
  }

  function handleSwitchToBreak() {
    setIsRunning(false);
    setTimerMode("break");
    setSecondsRemaining(BREAK_DURATION);
    setMessage("");
  }

  function handleManualBreakCompleted() {
    const updatedStats = addCompletedBreak();

    setStats(updatedStats);
    setIsRunning(false);
    setTimerMode("work");
    setSecondsRemaining(WORK_DURATION);
    setMessage("Pause ajoutée à votre progression");
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Pause active</Text>
            </View>

            <Text style={styles.pageTitle}>Minuterie</Text>

            <Text style={styles.subtitle}>
              Alternez entre périodes de concentration et pauses actives pour
              limiter l’immobilité prolongée.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroLabel}>{modeLabel}</Text>
                <Text style={styles.heroTitle}>{modeTitle}</Text>
              </View>

              <View style={styles.pointsCircle}>
                <Text style={styles.pointsNumber}>{points}</Text>
                <Text style={styles.pointsLabel}>points</Text>
              </View>
            </View>

            <Text style={styles.heroText}>{modeText}</Text>
          </View>

          <View style={styles.timerCard}>
            <View style={styles.modeSwitch}>
              <PressableScale
                style={[
                  styles.modeButton,
                  timerMode === "work" ? styles.modeButtonActive : null,
                ]}
                onPress={handleSwitchToWork}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    timerMode === "work" ? styles.modeButtonTextActive : null,
                  ]}
                >
                  Travail
                </Text>
              </PressableScale>

              <PressableScale
                style={[
                  styles.modeButton,
                  timerMode === "break" ? styles.modeButtonActive : null,
                ]}
                onPress={handleSwitchToBreak}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    timerMode === "break" ? styles.modeButtonTextActive : null,
                  ]}
                >
                  Pause
                </Text>
              </PressableScale>
            </View>

            <View style={styles.timerCircle}>
              <View style={styles.timerInnerCircle}>
                <IconBadge
                  size={layout.isMobile ? 44 : 50}
                  backgroundColor={colors.backgroundSoft}
                  borderColor={colors.border}
                >
                  <BreakIcon
                    size={layout.isMobile ? 21 : 24}
                    color={colors.text}
                  />
                </IconBadge>

                <Text style={styles.timerLabel}>
                  {timerMode === "work" ? "Focus" : "Pause"}
                </Text>

                <Text style={styles.timerText}>
                  {formatTime(secondsRemaining)}
                </Text>

                <Text style={styles.timerSmallText}>
                  {isRunning ? "Minuterie en cours" : "Prêt à commencer"}
                </Text>
              </View>
            </View>

            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progression</Text>
              <Text style={styles.progressValue}>{progressPercent}%</Text>
            </View>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent}%`,
                  },
                ]}
              />
            </View>

            <View style={styles.buttonRow}>
              <PressableScale
                style={styles.primaryButton}
                onPress={handleStartPause}
              >
                <Text style={styles.primaryButtonText}>
                  {isRunning ? "Mettre en pause" : "Démarrer"}
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>

              <PressableScale style={styles.secondaryButton} onPress={handleReset}>
                <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
              </PressableScale>
            </View>

            <PressableScale
              style={styles.secondaryButtonFull}
              onPress={handleManualBreakCompleted}
            >
              <Text style={styles.secondaryButtonText}>
                Marquer une pause comme complétée
              </Text>
            </PressableScale>

            {message.length > 0 && (
              <View style={styles.messageBox}>
                <Text style={styles.savedMessage}>{message}</Text>
              </View>
            )}
          </View>

          <View style={styles.statsPanel}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedBreaks}</Text>
              <Text style={styles.statLabel}>pauses</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{points}</Text>
              <Text style={styles.statLabel}>points</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {completedBreaks > 0 ? "Oui" : "—"}
              </Text>
              <Text style={styles.statLabel}>routine</Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Conseil</Text>
            <Text style={styles.tipText}>
              Vous n’avez pas besoin d’une longue pause pour créer un effet
              utile. Deux minutes peuvent suffire pour changer de position,
              relâcher les épaules et réactiver le mouvement.
            </Text>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
              <Text style={styles.sectionSubtitle}>
                Continuez votre routine après la minuterie.
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
    timerCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 28 : 34,
      padding: isMobile ? 17 : 22,
      marginBottom: isMobile ? 16 : 18,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow:
        mode === "dark"
          ? "0px 18px 36px rgba(0,0,0,0.12)"
          : "0px 18px 36px rgba(0,0,0,0.08)",
    },
    modeSwitch: {
      flexDirection: "row",
      backgroundColor: colors.cardWarm,
      borderRadius: 999,
      padding: isMobile ? 5 : 6,
      marginBottom: isMobile ? 20 : 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeButton: {
      flex: 1,
      paddingVertical: isMobile ? 11 : 12,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    modeButtonActive: {
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    modeButtonText: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      color: colors.textSoft,
      textAlign: "center",
    },
    modeButtonTextActive: {
      color: colors.black,
    },
    timerCircle: {
      width: isSmallMobile ? 215 : isMobile ? 235 : 250,
      height: isSmallMobile ? 215 : isMobile ? 235 : 250,
      borderRadius: isSmallMobile ? 108 : isMobile ? 118 : 125,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: isMobile ? 20 : 22,
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timerInnerCircle: {
      width: isSmallMobile ? 187 : isMobile ? 205 : 218,
      height: isSmallMobile ? 187 : isMobile ? 205 : 218,
      borderRadius: isSmallMobile ? 94 : isMobile ? 103 : 109,
      borderWidth: isMobile ? 10 : 12,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardWarm,
    },
    timerLabel: {
      fontSize: isMobile ? 11 : 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginTop: isMobile ? 10 : 12,
      marginBottom: isMobile ? 5 : 6,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    timerText: {
      fontFamily: "Georgia",
      fontSize: isSmallMobile ? 44 : isMobile ? 49 : 54,
      lineHeight: isSmallMobile ? 50 : isMobile ? 55 : 60,
      color: colors.primary,
      letterSpacing: -1,
    },
    timerSmallText: {
      fontSize: isMobile ? 12 : 13,
      fontWeight: "800",
      color: colors.textSoft,
      marginTop: 6,
      textAlign: "center",
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
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
      marginBottom: isMobile ? 16 : 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    buttonRow: {
      flexDirection: isMobile ? "column" : "row",
      gap: 12,
      marginBottom: 12,
    },
    primaryButton: {
      flex: isMobile ? undefined : 1,
      backgroundColor: colors.primary,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 8,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      textAlign: "center",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 19,
      fontWeight: "900",
      lineHeight: 19,
    },
    secondaryButton: {
      flex: isMobile ? undefined : 1,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    secondaryButtonFull: {
      paddingVertical: isMobile ? 13 : 14,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      marginBottom: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      textAlign: "center",
    },
    messageBox: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 4,
    },
    savedMessage: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    statsPanel: {
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 16 : 18,
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
      color: colors.primary,
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
    tipBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: isMobile ? 24 : 26,
    },
    tipTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.warningText,
      marginBottom: 5,
    },
    tipText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
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
  });
}