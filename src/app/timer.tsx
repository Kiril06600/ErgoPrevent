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
  AppStats,
  addCompletedBreak,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
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
  const [stats, setStats] = useState<AppStats | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<TimerMode>("work");
  const [message, setMessage] = useState("");

  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
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

  const completedBreaks = stats?.completedBreaks ?? 0;
  const points = stats?.points ?? 0;

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
          <View style={styles.heroShapeLarge} />
          <View style={styles.heroShapeSmall} />

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
            <Pressable
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
            </Pressable>

            <Pressable
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
            </Pressable>
          </View>

          <View style={styles.timerCircle}>
            <View style={styles.timerInnerCircle}>
              <IconBadge
                size={50}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <BreakIcon size={24} color={colors.text} />
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
            <Pressable style={styles.primaryButton} onPress={handleStartPause}>
              <Text style={styles.primaryButtonText}>
                {isRunning ? "Mettre en pause" : "Démarrer"}
              </Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleReset}>
              <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.secondaryButtonFull}
            onPress={handleManualBreakCompleted}
          >
            <Text style={styles.secondaryButtonText}>
              Marquer une pause comme complétée
            </Text>
          </Pressable>

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
            Vous n’avez pas besoin d’une longue pause pour créer un effet utile.
            Deux minutes peuvent suffire pour changer de position, relâcher les
            épaules et réactiver le mouvement.
          </Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
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

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, mode: "light" | "dark") {
  const isDark = mode === "dark";

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
      fontSize: 38,
      lineHeight: 43,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -1,
      marginBottom: 10,
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
      minHeight: 245,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      position: "relative",
      justifyContent: "space-between",
    },
    heroShapeLarge: {
      position: "absolute",
      width: 210,
      height: 210,
      borderRadius: 105,
      right: -70,
      top: -42,
      backgroundColor: isDark
        ? "rgba(95,159,149,0.16)"
        : "rgba(216,196,182,0.26)",
    },
    heroShapeSmall: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      left: -28,
      bottom: -28,
      backgroundColor: isDark
        ? "rgba(245,238,223,0.08)"
        : "rgba(95,159,149,0.12)",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      zIndex: 2,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroLabel: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    heroTitle: {
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.7,
      maxWidth: 360,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 23,
      color: colors.textSoft,
      maxWidth: 460,
      zIndex: 2,
      marginTop: 22,
    },
    pointsCircle: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    pointsNumber: {
      fontSize: 23,
      fontWeight: "900",
      color: colors.black,
      lineHeight: 27,
    },
    pointsLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.black,
    },
    timerCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 34,
      padding: 22,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeSwitch: {
      flexDirection: "row",
      backgroundColor: colors.cardWarm,
      borderRadius: 999,
      padding: 6,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 999,
      alignItems: "center",
    },
    modeButtonActive: {
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    modeButtonText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.textSoft,
    },
    modeButtonTextActive: {
      color: colors.black,
    },
    timerCircle: {
      width: 250,
      height: 250,
      borderRadius: 125,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 22,
      backgroundColor: isDark
        ? "rgba(255,255,255,0.035)"
        : "rgba(255,255,255,0.25)",
      borderWidth: 1,
      borderColor: colors.border,
    },
    timerInnerCircle: {
      width: 218,
      height: 218,
      borderRadius: 109,
      borderWidth: 12,
      borderColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardWarm,
    },
    timerLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginTop: 12,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    timerText: {
      fontSize: 52,
      lineHeight: 58,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -1,
    },
    timerSmallText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textSoft,
      marginTop: 6,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
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
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 12,
    },
    primaryButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 15,
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
      fontSize: 15,
      fontWeight: "900",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 19,
      fontWeight: "900",
      lineHeight: 19,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 15,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    secondaryButtonFull: {
      paddingVertical: 14,
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
      fontSize: 14,
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
      marginHorizontal: 24,
      marginBottom: 18,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 16,
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
      height: 38,
      backgroundColor: colors.border,
    },
    statNumber: {
      fontSize: 23,
      fontWeight: "900",
      color: colors.text,
      lineHeight: 27,
    },
    statLabel: {
      marginTop: 4,
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    tipBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 26,
    },
    tipTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.warningText,
      marginBottom: 5,
    },
    tipText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
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
      fontSize: 24,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.4,
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
    quickActionsRow: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 12,
      marginBottom: 24,
    },
    quickCard: {
      width: 165,
      minHeight: 200,
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
      fontSize: 18,
      lineHeight: 23,
      fontWeight: "900",
      color: colors.text,
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
  });
}