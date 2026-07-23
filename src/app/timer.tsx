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

const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 2 * 60;

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
  const [timerMode, setTimerMode] = useState<"work" | "break">("work");
  const [message, setMessage] = useState("");

  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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
        setMessage("Pause complétée ✓");
        return WORK_DURATION;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timerMode]);

  const completedBreaks = stats?.completedBreaks ?? 0;
  const points = stats?.points ?? 0;

  const totalDuration = timerMode === "work" ? WORK_DURATION : BREAK_DURATION;
  const progressPercent =
    ((totalDuration - secondsRemaining) / totalDuration) * 100;

  function handleStartPause() {
    setIsRunning(!isRunning);
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
    setMessage("Pause ajoutée à votre progression ✓");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Minuterie</Text>

        <Text style={styles.subtitle}>
          Alternez entre périodes de concentration et pauses actives pour limiter
          l’immobilité prolongée.
        </Text>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>
              {timerMode === "work" ? "Travail" : "Pause active"}
            </Text>

            <Text style={styles.heroTitle}>
              {timerMode === "work"
                ? "Session de concentration"
                : "Temps de bouger"}
            </Text>

            <Text style={styles.heroText}>
              {timerMode === "work"
                ? "Travaillez pendant 25 minutes, puis prenez une courte pause."
                : "Levez-vous, marchez, respirez ou faites un mouvement doux."}
            </Text>
          </View>

          <View style={styles.pointsCircle}>
            <Text style={styles.pointsNumber}>{points}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        <View style={styles.timerCard}>
          <View style={styles.modeSwitch}>
            <Pressable
              style={[
                styles.modeButton,
                timerMode === "work" && styles.modeButtonActive,
              ]}
              onPress={handleSwitchToWork}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  timerMode === "work" && styles.modeButtonTextActive,
                ]}
              >
                Travail
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.modeButton,
                timerMode === "break" && styles.modeButtonActive,
              ]}
              onPress={handleSwitchToBreak}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  timerMode === "break" && styles.modeButtonTextActive,
                ]}
              >
                Pause
              </Text>
            </Pressable>
          </View>

          <View style={styles.timerCircle}>
            <Text style={styles.timerLabel}>
              {timerMode === "work" ? "Focus" : "Pause"}
            </Text>

            <Text style={styles.timerText}>{formatTime(secondsRemaining)}</Text>

            <Text style={styles.timerSmallText}>
              {isRunning ? "Minuterie en cours" : "Prêt à commencer"}
            </Text>
          </View>

          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.primaryButton} onPress={handleStartPause}>
              <Text style={styles.primaryButtonText}>
                {isRunning ? "Mettre en pause" : "Démarrer"}
              </Text>
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
            <Text style={styles.savedMessage}>{message}</Text>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedBreaks}</Text>
            <Text style={styles.statLabel}>pauses complétées</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>points cumulés</Text>
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

        <Link href="/routine" asChild>
          <Pressable style={styles.secondaryButtonFull}>
            <Text style={styles.secondaryButtonText}>Voir ma routine du jour</Text>
          </Pressable>
        </Link>

        <Link href="/exercises" asChild>
          <Pressable style={styles.secondaryButtonFull}>
            <Text style={styles.secondaryButtonText}>Voir les exercices</Text>
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
      fontSize: 27,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 8,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      maxWidth: 520,
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
    timerCard: {
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 24,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeSwitch: {
      flexDirection: "row",
      backgroundColor: colors.cardWarm,
      borderRadius: 18,
      padding: 6,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: "center",
    },
    modeButtonActive: {
      backgroundColor: colors.primary,
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
      width: 240,
      height: 240,
      borderRadius: 120,
      borderWidth: 12,
      borderColor: colors.primary,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      backgroundColor: colors.cardWarm,
    },
    timerLabel: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 8,
    },
    timerText: {
      fontSize: 52,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 8,
    },
    timerSmallText: {
      fontSize: 13,
      fontWeight: "800",
      color: colors.textSoft,
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
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: 16,
      fontWeight: "900",
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    secondaryButtonFull: {
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
    savedMessage: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
      marginTop: 6,
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
      fontSize: 14,
      lineHeight: 19,
      color: colors.textSoft,
      fontWeight: "800",
      textAlign: "center",
      marginTop: 6,
    },
    tipBox: {
      backgroundColor: colors.warning,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 14,
    },
    tipTitle: {
      fontSize: 16,
      fontWeight: "900",
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