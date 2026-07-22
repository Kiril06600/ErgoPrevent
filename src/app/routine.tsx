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

type RoutineTask = {
  id: string;
  icon: string;
  title: string;
  text: string;
  href: string;
  buttonText: string;
};

const ROUTINE_STORAGE_KEY = "ergoprevent_daily_routine";

const routineTasks: RoutineTask[] = [
  {
    id: "checkin",
    icon: "📝",
    title: "Faire mon check-in",
    text: "Notez rapidement votre douleur, votre fatigue et la zone principale du jour.",
    href: "/daily-checkin",
    buttonText: "Faire le check-in",
  },
  {
    id: "pause",
    icon: "⏱️",
    title: "Faire une pause active",
    text: "Prenez 2 minutes pour bouger, marcher ou changer de position.",
    href: "/timer",
    buttonText: "Démarrer la minuterie",
  },
  {
    id: "exercise",
    icon: "💪",
    title: "Faire un exercice",
    text: "Choisissez un exercice court pour le cou, le dos, les épaules ou les poignets.",
    href: "/exercises",
    buttonText: "Voir les exercices",
  },
  {
    id: "education",
    icon: "🎓",
    title: "Lire une capsule",
    text: "Apprenez une notion simple d’ergonomie ou de prévention.",
    href: "/education",
    buttonText: "Lire une capsule",
  },
  {
    id: "plan",
    icon: "🧭",
    title: "Consulter mon plan personnalisé",
    text: "Regardez vos priorités et les actions recommandées selon vos scores.",
    href: "/personal-plan",
    buttonText: "Voir mon plan",
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

  const parsedData = JSON.parse(savedData);

  return parsedData[todayKey] ?? [];
}

function saveCompletedTasksForToday(taskIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const todayKey = getTodayKey();
  const savedData = window.localStorage.getItem(ROUTINE_STORAGE_KEY);
  const parsedData = savedData ? JSON.parse(savedData) : {};

  const updatedData = {
    ...parsedData,
    [todayKey]: taskIds,
  };

  window.localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(updatedData));
}

export default function RoutineScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  useEffect(() => {
    const savedStats = getAppStats();
    const savedCompletedTasks = getCompletedTasksForToday();

    setStats(savedStats);
    setCompletedTaskIds(savedCompletedTasks);
  }, []);

  const profile = stats?.profile ?? null;
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Routine du jour</Text>

        <Text style={styles.subtitle}>
          Un petit plan quotidien pour garder vos habitudes de prévention actives.
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroGreeting}>
            {profile?.firstName
              ? `Bonjour ${profile.firstName}`
              : "Objectif du jour"}
          </Text>

          <Text style={styles.heroTitle}>
            {completedCount === totalTasks
              ? "Routine complétée 🎉"
              : "Avancez une petite action à la fois"}
          </Text>

          <Text style={styles.heroText}>
            {completedCount === totalTasks
              ? "Vous avez complété toutes les actions prévues aujourd’hui."
              : "L’objectif n’est pas d’être parfait, mais de bouger et de répéter des gestes simples."}
          </Text>
        </View>

        <View style={styles.progressCard}>
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

          <Text style={styles.progressText}>
            {completedCount}/{totalTasks} actions complétées aujourd’hui
          </Text>
        </View>

        {nextTask && (
          <View style={styles.nextCard}>
            <Text style={styles.nextLabel}>Prochaine action recommandée</Text>
            <Text style={styles.nextTitle}>
              {nextTask.icon} {nextTask.title}
            </Text>
            <Text style={styles.nextText}>{nextTask.text}</Text>

            <Link href={nextTask.href} asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  {nextTask.buttonText}
                </Text>
              </Pressable>
            </Link>
          </View>
        )}

        <Text style={styles.sectionTitle}>Checklist du jour</Text>

        {routineTasks.map((task) => {
          const isCompleted = completedTaskIds.includes(task.id);

          return (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskIcon}>{task.icon}</Text>

                <View style={styles.taskTextContainer}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  <Text style={styles.taskText}>{task.text}</Text>
                </View>
              </View>

              <View style={styles.taskActions}>
                <Pressable
                  style={[
                    styles.checkButton,
                    isCompleted && styles.checkButtonCompleted,
                  ]}
                  onPress={() => toggleTask(task.id)}
                >
                  <Text
                    style={[
                      styles.checkButtonText,
                      isCompleted && styles.checkButtonTextCompleted,
                    ]}
                  >
                    {isCompleted ? "Complété ✓" : "Marquer comme fait"}
                  </Text>
                </Pressable>

                <Link href={task.href} asChild>
                  <Pressable style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      {task.buttonText}
                    </Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          );
        })}

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Conseil</Text>
          <Text style={styles.tipText}>
            Même si vous ne complétez qu’une seule action aujourd’hui, c’est déjà
            utile. La régularité compte plus que la perfection.
          </Text>
        </View>

<Link href="/progress" asChild>
  <Pressable style={styles.secondaryButton}>
    <Text style={styles.secondaryButtonText}>Voir mon évolution</Text>
  </Pressable>
</Link>

        <Link href="/dashboard" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              Voir mon tableau de bord
            </Text>
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
    fontWeight: "900",
    color: "#183642",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    marginBottom: 24,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  heroGreeting: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1E8A6A",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 10,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
  },
  progressCard: {
    backgroundColor: "#EAF7F1",
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#183642",
  },
  progressValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1E8A6A",
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: "#D4EADF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#1E8A6A",
    borderRadius: 20,
  },
  progressText: {
    fontSize: 14,
    color: "#536B78",
    fontWeight: "700",
  },
  nextCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DCE9EF",
  },
  nextLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#1E8A6A",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  nextTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 8,
  },
  nextText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 14,
  },
  taskCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  taskIcon: {
    fontSize: 30,
    marginRight: 14,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 6,
  },
  taskText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#536B78",
  },
  taskActions: {
    gap: 10,
  },
  checkButton: {
    backgroundColor: "#EAF7F1",
    paddingVertical: 13,
    borderRadius: 15,
    alignItems: "center",
  },
  checkButtonCompleted: {
    backgroundColor: "#1E8A6A",
  },
  checkButtonText: {
    color: "#1E8A6A",
    fontSize: 15,
    fontWeight: "900",
  },
  checkButtonTextCompleted: {
    color: "#FFFFFF",
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
    paddingVertical: 13,
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "800",
  },
  tipBox: {
    backgroundColor: "#FFF7E6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3D28B",
    marginTop: 8,
    marginBottom: 18,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#725A20",
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#725A20",
  },
});