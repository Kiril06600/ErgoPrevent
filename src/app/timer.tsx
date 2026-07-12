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
import { addCompletedBreak, getAppStats } from "../lib/storage";
import BottomNav from "../components/BottomNav";

const WORK_TIME = 25 * 60;
const BREAK_TIME = 2 * 60;

export default function TimerScreen() {
  const savedStats = getAppStats();

  const [secondsLeft, setSecondsLeft] = useState(WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [completedBreaks, setCompletedBreaks] = useState(
    savedStats.completedBreaks
  );
  const [points, setPoints] = useState(savedStats.points);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((previousSeconds) => {
        if (previousSeconds <= 1) {
          if (mode === "work") {
            setMode("break");
            return BREAK_TIME;
          } else {
            setMode("work");
            recordCompletedBreak();
            setIsRunning(false);
            return WORK_TIME;
          }
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, mode]);
  
function recordCompletedBreak() {
  const updatedStats = addCompletedBreak();

  setCompletedBreaks(updatedStats.completedBreaks);
  setPoints(updatedStats.points);
}
  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function startTimer() {
    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer() {
    setIsRunning(false);
    setMode("work");
    setSecondsLeft(WORK_TIME);
  }

  function skipToBreak() {
    setMode("break");
    setSecondsLeft(BREAK_TIME);
    setIsRunning(true);
  }

  function completeBreakNow() {
  setMode("work");
  setSecondsLeft(WORK_TIME);
  setIsRunning(false);
  recordCompletedBreak();
}

  const isWorkMode = mode === "work";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Minuterie active</Text>

        <Text style={styles.subtitle}>
          Travaillez pendant 25 minutes, puis prenez une pause active de 2 minutes.
        </Text>

        <View style={styles.timerCard}>
          <Text style={styles.modeText}>
            {isWorkMode ? "Temps de travail" : "Pause active"}
          </Text>

          <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>

          <Text style={styles.instructionText}>
            {isWorkMode
              ? "Concentrez-vous. Une pause vous sera proposée à la fin."
              : "Levez-vous, marchez un peu et changez de position."}
          </Text>

          <View style={styles.buttonsRow}>
            {!isRunning ? (
              <Pressable style={styles.primaryButton} onPress={startTimer}>
                <Text style={styles.primaryButtonText}>Démarrer</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.secondaryButton} onPress={pauseTimer}>
                <Text style={styles.secondaryButtonText}>Pause</Text>
              </Pressable>
            )}

            <Pressable style={styles.secondaryButton} onPress={resetTimer}>
              <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
            </Pressable>
          </View>

          {isWorkMode ? (
            <Pressable style={styles.linkButton} onPress={skipToBreak}>
              <Text style={styles.linkButtonText}>Passer directement à la pause</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.linkButton} onPress={completeBreakNow}>
              <Text style={styles.linkButtonText}>J’ai terminé ma pause</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedBreaks}</Text>
            <Text style={styles.statLabel}>pauses complétées</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>points gagnés</Text>
          </View>
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Conseil de pause</Text>
          <Text style={styles.tipText}>
            Pendant votre pause, évitez seulement de rester assis sur votre téléphone.
            L’objectif est de changer de position et de bouger doucement.
          </Text>
        </View>

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
    marginBottom: 26,
  },
  timerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    marginBottom: 22,
  },
  modeText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E8A6A",
    marginBottom: 16,
  },
  timerText: {
    fontSize: 72,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 14,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonsRow: {
    width: "100%",
    gap: 12,
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
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
  },
  secondaryButtonText: {
    color: "#1E5B7A",
    fontSize: 16,
    fontWeight: "800",
  },
  linkButton: {
    marginTop: 18,
  },
  linkButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
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
  tipBox: {
    backgroundColor: "#EAF7F1",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
  },
  backButton: {
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