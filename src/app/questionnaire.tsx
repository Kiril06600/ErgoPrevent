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
  saveQuestionnaireResult,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import AnimatedScreen from "../components/AnimatedScreen";
import PressableScale from "../components/PressableScale";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  IconBadge,
  ProgressIcon,
  PlanIcon,
  PostureIcon,
} from "../components/ErgoIcons";

type Priority =
  | "Cou"
  | "Dos"
  | "Épaules"
  | "Poignets"
  | "Jambes"
  | "Habitudes";

type Question = {
  id: string;
  category: Priority;
  title: string;
  text: string;
};

type BodyIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type BodyIcon = React.ComponentType<BodyIconProps>;

const questions: Question[] = [
  {
    id: "neck-pain",
    category: "Cou",
    title: "Cou",
    text: "Je ressens des tensions ou douleurs au cou après une période de travail.",
  },
  {
    id: "neck-position",
    category: "Cou",
    title: "Position de la tête",
    text: "J’ai tendance à avancer la tête vers l’écran ou à regarder vers le bas longtemps.",
  },
  {
    id: "back-pain",
    category: "Dos",
    title: "Dos",
    text: "Je ressens des douleurs ou raideurs au dos pendant ou après ma journée.",
  },
  {
    id: "sitting-long",
    category: "Dos",
    title: "Position assise",
    text: "Je reste assis longtemps sans changer de position.",
  },
  {
    id: "shoulder-tension",
    category: "Épaules",
    title: "Épaules",
    text: "Je ressens souvent des tensions dans les épaules ou les trapèzes.",
  },
  {
    id: "mouse-far",
    category: "Épaules",
    title: "Souris et bras",
    text: "Ma souris ou mes objets de travail sont parfois placés trop loin de moi.",
  },
  {
    id: "wrist-pain",
    category: "Poignets",
    title: "Poignets",
    text: "Je ressens des tensions aux poignets, aux mains ou aux avant-bras.",
  },
  {
    id: "keyboard-mouse",
    category: "Poignets",
    title: "Clavier et souris",
    text: "J’utilise beaucoup le clavier ou la souris sans pauses régulières.",
  },
  {
    id: "legs-discomfort",
    category: "Jambes",
    title: "Jambes",
    text: "Je ressens de l’inconfort, de la lourdeur ou de la fatigue dans les jambes.",
  },
  {
    id: "movement-low",
    category: "Habitudes",
    title: "Mouvement",
    text: "Je bouge peu pendant ma journée de travail ou d’étude.",
  },
];

const answerOptions = [
  { label: "Jamais", value: 0 },
  { label: "Parfois", value: 1 },
  { label: "Souvent", value: 2 },
  { label: "Très souvent", value: 3 },
];

function calculateScore(answers: Record<string, number>) {
  const total = questions.reduce((sum, question) => {
    return sum + (answers[question.id] ?? 0);
  }, 0);

  const maxScore = questions.length * 3;

  return Math.round((total / maxScore) * 100);
}

function getRiskLevel(score: number) {
  if (score < 30) {
    return "Risque faible";
  }

  if (score < 60) {
    return "Risque modéré";
  }

  return "Risque élevé";
}

function getRiskMessage(score: number) {
  if (score < 30) {
    return "Votre risque semble plutôt faible. Continuez à maintenir de bonnes habitudes et à varier vos positions.";
  }

  if (score < 60) {
    return "Votre risque semble modéré. Des ajustements simples, des pauses et des exercices réguliers peuvent être utiles.";
  }

  return "Votre risque semble élevé. Il serait pertinent de prioriser les pauses, les ajustements du poste et de consulter un professionnel si les douleurs persistent.";
}

function getPriorities(answers: Record<string, number>) {
  const categoryScores: Record<Priority, number> = {
    Cou: 0,
    Dos: 0,
    Épaules: 0,
    Poignets: 0,
    Jambes: 0,
    Habitudes: 0,
  };

  questions.forEach((question) => {
    categoryScores[question.category] += answers[question.id] ?? 0;
  });

  return Object.entries(categoryScores)
    .filter(([, score]) => score >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category as Priority);
}

function NeckIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.08,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.37,
          width: strokeWidth,
          height: size * 0.18,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.54,
          top: size * 0.37,
          width: strokeWidth,
          height: size * 0.18,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.24,
          top: size * 0.58,
          width: size * 0.52,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function HeadPositionIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          right: size * 0.1,
          top: size * 0.16,
          width: size * 0.18,
          height: size * 0.46,
          borderRadius: 4,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.18,
          top: size * 0.12,
          width: size * 0.27,
          height: size * 0.27,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.37,
          top: size * 0.36,
          width: strokeWidth,
          height: size * 0.2,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "25deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.3,
          top: size * 0.57,
          width: size * 0.24,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.5,
          top: size * 0.28,
          width: size * 0.18,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function BackIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.39,
          top: size * 0.06,
          width: size * 0.22,
          height: size * 0.22,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.22,
          top: size * 0.32,
          width: size * 0.56,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.49,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.44,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.42,
          width: strokeWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "16deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          right: size * 0.34,
          top: size * 0.42,
          width: strokeWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-16deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.32,
          top: size * 0.78,
          width: size * 0.36,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function SittingIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.14,
          top: size * 0.16,
          width: strokeWidth,
          height: size * 0.54,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.14,
          top: size * 0.62,
          width: size * 0.24,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.12,
          width: size * 0.18,
          height: size * 0.18,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.5,
          top: size * 0.28,
          width: strokeWidth,
          height: size * 0.19,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.49,
          top: size * 0.45,
          width: size * 0.22,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.67,
          top: size * 0.45,
          width: strokeWidth,
          height: size * 0.2,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function ShoulderIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.36,
          top: size * 0.1,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.47,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.12,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.16,
          top: size * 0.5,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-18deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          right: size * 0.16,
          top: size * 0.5,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "18deg" }],
        }}
      />
    </View>
  );
}

function MouseArmIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.14,
          top: size * 0.42,
          width: size * 0.26,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.36,
          top: size * 0.39,
          width: size * 0.24,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "28deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          right: size * 0.08,
          top: size * 0.34,
          width: size * 0.18,
          height: size * 0.26,
          borderRadius: 999,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
    </View>
  );
}

function WristIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.18,
          top: size * 0.44,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.38,
          width: strokeWidth,
          height: size * 0.16,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.48,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.12,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-22deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.54,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.12,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-6deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.6,
          top: size * 0.36,
          width: strokeWidth,
          height: size * 0.1,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "10deg" }],
        }}
      />
    </View>
  );
}

function KeyboardMouseIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.08,
          bottom: size * 0.22,
          width: size * 0.52,
          height: size * 0.18,
          borderRadius: 4,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          right: size * 0.12,
          bottom: size * 0.2,
          width: size * 0.18,
          height: size * 0.26,
          borderRadius: 999,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.22,
          top: size * 0.14,
          width: size * 0.18,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "18deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.37,
          top: size * 0.22,
          width: strokeWidth,
          height: size * 0.12,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function LegsIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.36,
          top: size * 0.12,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.4,
          top: size * 0.18,
          width: strokeWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.56,
          top: size * 0.18,
          width: strokeWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.44,
          width: size * 0.16,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "30deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.52,
          top: size * 0.44,
          width: size * 0.16,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-30deg" }],
        }}
      />
    </View>
  );
}

function MovementIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: BodyIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.38,
          top: size * 0.08,
          width: size * 0.22,
          height: size * 0.22,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.48,
          top: size * 0.28,
          width: strokeWidth,
          height: size * 0.18,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.33,
          top: size * 0.42,
          width: size * 0.16,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-25deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.5,
          top: size * 0.42,
          width: size * 0.16,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "25deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.5,
          width: size * 0.12,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "28deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.52,
          top: size * 0.5,
          width: size * 0.12,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-28deg" }],
        }}
      />
    </View>
  );
}

function getQuestionIcon(questionId: string): BodyIcon {
  switch (questionId) {
    case "neck-pain":
      return NeckIcon;
    case "neck-position":
      return HeadPositionIcon;
    case "back-pain":
      return BackIcon;
    case "sitting-long":
      return SittingIcon;
    case "shoulder-tension":
      return ShoulderIcon;
    case "mouse-far":
      return MouseArmIcon;
    case "wrist-pain":
      return WristIcon;
    case "keyboard-mouse":
      return KeyboardMouseIcon;
    case "legs-discomfort":
      return LegsIcon;
    case "movement-low":
      return MovementIcon;
    default:
      return PostureIcon;
  }
}

function getPriorityIcon(priority: Priority): BodyIcon {
  switch (priority) {
    case "Cou":
      return NeckIcon;
    case "Dos":
      return BackIcon;
    case "Épaules":
      return ShoulderIcon;
    case "Poignets":
      return WristIcon;
    case "Jambes":
      return LegsIcon;
    case "Habitudes":
      return MovementIcon;
    default:
      return PostureIcon;
  }
}

export default function QuestionnaireScreen() {
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

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

  const completedQuestions = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const allQuestionsCompleted = completedQuestions === totalQuestions;

  const score = calculateScore(answers);
  const level = getRiskLevel(score);
  const priorities = getPriorities(answers);

  const previousResult = stats.questionnaireResult ?? null;
  const progressPercent = Math.round(
    (completedQuestions / totalQuestions) * 100
  );

  function handleAnswer(questionId: string, value: number) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));

    setSavedMessage("");
  }

  function handleSubmit() {
    const result = {
      score,
      level,
      priorities,
      completedAt: new Date().toISOString(),
    };

    const updatedStats = saveQuestionnaireResult(result);

    setStats(updatedStats);
    setShowResult(true);
    setSavedMessage("Questionnaire sauvegardé");
  }

  function handleResetQuestionnaire() {
    setAnswers({});
    setShowResult(false);
    setSavedMessage("");
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Évaluation TMS</Text>
            </View>

            <Text style={styles.pageTitle}>Questionnaire</Text>

            <Text style={styles.subtitle}>
              Évaluez rapidement vos symptômes et habitudes pour repérer les
              zones à prioriser.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroLabel}>Évaluation</Text>
                <Text style={styles.heroTitle}>
                  Repérer les signaux importants.
                </Text>
              </View>

              <View style={styles.progressCircle}>
                <Text style={styles.progressNumber}>{completedQuestions}</Text>
                <Text style={styles.progressLabel}>/{totalQuestions}</Text>
              </View>
            </View>

            <Text style={styles.heroText}>
              Ce questionnaire ne pose pas de diagnostic. Il sert à orienter vos
              prochaines actions de prévention.
            </Text>
          </View>

          {previousResult && !showResult && (
            <View style={styles.previousCard}>
              <View style={styles.previousTopRow}>
                <IconBadge
                  size={layout.isMobile ? 43 : 48}
                  backgroundColor={colors.turquoiseSoft}
                  borderColor={colors.border}
                >
                  <ProgressIcon
                    size={layout.isMobile ? 20 : 23}
                    color={colors.text}
                  />
                </IconBadge>

                <View style={styles.previousTextBlock}>
                  <Text style={styles.previousLabel}>Dernier résultat</Text>
                  <Text style={styles.previousLevel}>
                    {previousResult.level}
                  </Text>
                </View>

                <View style={styles.previousScoreBadge}>
                  <Text style={styles.previousScore}>
                    {previousResult.score}
                  </Text>
                  <Text style={styles.previousScoreSmall}>/100</Text>
                </View>
              </View>

              {previousResult.priorities.length > 0 ? (
                <Text style={styles.previousText}>
                  Priorités : {previousResult.priorities.join(", ")}
                </Text>
              ) : (
                <Text style={styles.previousText}>
                  Aucune priorité majeure détectée.
                </Text>
              )}
            </View>
          )}

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Progression</Text>
              <Text style={styles.progressValue}>
                {completedQuestions}/{totalQuestions}
              </Text>
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
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Questions</Text>
              <Text style={styles.sectionSubtitle}>
                Choisissez la réponse qui correspond le mieux à votre situation.
              </Text>
            </View>
          </View>

          {questions.map((question, index) => {
            const selectedAnswer = answers[question.id];
            const QuestionIcon = getQuestionIcon(question.id);

            return (
              <View key={question.id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <IconBadge
                    size={layout.isMobile ? 43 : 48}
                    backgroundColor={colors.backgroundSoft}
                    borderColor={colors.border}
                  >
                    <QuestionIcon
                      size={layout.isMobile ? 20 : 23}
                      color={colors.text}
                    />
                  </IconBadge>

                  <View style={styles.questionTitleContainer}>
                    <Text style={styles.questionCategory}>
                      Question {index + 1} · {question.category}
                    </Text>
                    <Text style={styles.questionTitle}>{question.title}</Text>
                  </View>
                </View>

                <Text style={styles.questionText}>{question.text}</Text>

                <View style={styles.optionsContainer}>
                  {answerOptions.map((option) => {
                    const selected = selectedAnswer === option.value;

                    return (
                      <PressableScale
                        key={`${question.id}-${option.value}`}
                        style={[
                          styles.optionButton,
                          selected ? styles.optionButtonSelected : null,
                        ]}
                        onPress={() => handleAnswer(question.id, option.value)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selected ? styles.optionTextSelected : null,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>
            );
          })}

          {!allQuestionsCompleted && (
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>À compléter</Text>
              <Text style={styles.infoText}>
                Répondez à toutes les questions pour calculer votre score.
              </Text>
            </View>
          )}

          <PressableScale
            style={[
              styles.primaryButton,
              !allQuestionsCompleted ? styles.disabledButton : null,
            ]}
            onPress={handleSubmit}
            disabled={!allQuestionsCompleted}
          >
            <Text style={styles.primaryButtonText}>Calculer mon résultat</Text>
            <Text style={styles.primaryButtonArrow}>→</Text>
          </PressableScale>

          {showResult && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Résultat</Text>

              <Text style={styles.resultScore}>{score}</Text>
              <Text style={styles.resultScoreSmall}>/100</Text>

              <Text style={styles.resultLevel}>{level}</Text>

              <Text style={styles.resultText}>{getRiskMessage(score)}</Text>

              {priorities.length > 0 ? (
                <>
                  <Text style={styles.resultSectionTitle}>
                    Priorités détectées
                  </Text>

                  {priorities.map((priority, index) => {
                    const PriorityIcon = getPriorityIcon(priority);

                    return (
                      <View key={priority} style={styles.priorityRow}>
                        <IconBadge
                          size={layout.isMobile ? 38 : 40}
                          backgroundColor={colors.backgroundSoft}
                          borderColor={colors.border}
                        >
                          <PriorityIcon
                            size={layout.isMobile ? 18 : 19}
                            color={colors.text}
                          />
                        </IconBadge>

                        <View style={styles.priorityNumber}>
                          <Text style={styles.priorityNumberText}>
                            {index + 1}
                          </Text>
                        </View>

                        <Text style={styles.priorityText}>{priority}</Text>
                      </View>
                    );
                  })}
                </>
              ) : (
                <Text style={styles.resultText}>
                  Aucune priorité majeure détectée pour le moment.
                </Text>
              )}

              {savedMessage.length > 0 && (
                <Text style={styles.savedMessage}>{savedMessage}</Text>
              )}

              <Link href="/personal-plan" asChild>
                <PressableScale style={styles.primaryButtonCompact}>
                  <Text style={styles.primaryButtonText}>
                    Voir mon plan personnalisé
                  </Text>
                  <Text style={styles.primaryButtonArrow}>→</Text>
                </PressableScale>
              </Link>
            </View>
          )}

          <PressableScale
            style={styles.secondaryButton}
            onPress={handleResetQuestionnaire}
          >
            <Text style={styles.secondaryButtonText}>
              Recommencer le questionnaire
            </Text>
          </PressableScale>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>À retenir</Text>
            <Text style={styles.warningText}>
              Ce questionnaire est un outil éducatif. Il ne remplace pas une
              consultation médicale ou une évaluation ergonomique personnalisée.
            </Text>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Étapes suivantes</Text>
              <Text style={styles.sectionSubtitle}>
                Continuez avec votre poste ou votre tableau de bord.
              </Text>
            </View>

            <Text style={styles.sectionAction}>Défilez →</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsRow}
          >
            <Link href="/workstation-audit" asChild>
              <PressableScale style={styles.quickCard}>
                <IconBadge
                  size={layout.isMobile ? 40 : 44}
                  backgroundColor={colors.backgroundSoft}
                  borderColor={colors.border}
                >
                  <PostureIcon
                    size={layout.isMobile ? 19 : 21}
                    color={colors.text}
                  />
                </IconBadge>

                <Text style={styles.quickLabel}>Poste</Text>
                <Text style={styles.quickTitle}>Audit du poste</Text>
                <Text style={styles.quickText}>
                  Analysez votre environnement de travail.
                </Text>

                <View style={styles.quickArrowCircle}>
                  <Text style={styles.quickArrowText}>→</Text>
                </View>
              </PressableScale>
            </Link>

            <Link href="/dashboard" asChild>
              <PressableScale style={styles.quickCard}>
                <IconBadge
                  size={layout.isMobile ? 40 : 44}
                  backgroundColor={colors.backgroundSoft}
                  borderColor={colors.border}
                >
                  <PlanIcon
                    size={layout.isMobile ? 19 : 21}
                    color={colors.text}
                  />
                </IconBadge>

                <Text style={styles.quickLabel}>Résumé</Text>
                <Text style={styles.quickTitle}>Dashboard</Text>
                <Text style={styles.quickText}>
                  Consultez vos scores et votre progression.
                </Text>

                <View style={styles.quickArrowCircle}>
                  <Text style={styles.quickArrowText}>→</Text>
                </View>
              </PressableScale>
            </Link>
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
    progressCircle: {
      width: isMobile ? 64 : 74,
      height: isMobile ? 64 : 74,
      borderRadius: isMobile ? 32 : 37,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    progressNumber: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 24 : 26,
      lineHeight: isMobile ? 28 : 30,
      color: colors.black,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.black,
    },
    previousCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.secondaryLight,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 16 : 20,
      marginBottom: isMobile ? 16 : 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previousTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: isMobile ? 12 : 14,
      marginBottom: 14,
    },
    previousTextBlock: {
      flex: 1,
    },
    previousLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 4,
    },
    previousLevel: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 20 : 22,
      lineHeight: isMobile ? 26 : 28,
      color: colors.primary,
    },
    previousScoreBadge: {
      minWidth: isMobile ? 56 : 62,
      height: isMobile ? 44 : 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: 9,
    },
    previousScore: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 19 : 21,
      color: colors.black,
    },
    previousScoreSmall: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.black,
      marginTop: 5,
    },
    previousText: {
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 19 : 20,
      color: colors.textSoft,
    },
    progressCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 22 : 24,
      padding: isMobile ? 15 : 16,
      marginBottom: isMobile ? 24 : 26,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 20,
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
    questionCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 17 : 20,
      marginBottom: isMobile ? 12 : 14,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow:
        mode === "dark"
          ? "0px 18px 36px rgba(0,0,0,0.12)"
          : "0px 18px 36px rgba(0,0,0,0.08)",
    },
    questionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isMobile ? 13 : 14,
      gap: isMobile ? 12 : 14,
    },
    questionTitleContainer: {
      flex: 1,
    },
    questionCategory: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 5,
    },
    questionTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 21 : 23,
      lineHeight: isMobile ? 26 : 29,
      color: colors.primary,
    },
    questionText: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 22,
      color: colors.textSoft,
      marginBottom: isMobile ? 14 : 16,
    },
    optionsContainer: {
      gap: 8,
    },
    optionButton: {
      paddingVertical: isMobile ? 12 : 13,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      alignItems: "center",
      justifyContent: "center",
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    optionText: {
      color: colors.text,
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      textAlign: "center",
    },
    optionTextSelected: {
      color: colors.black,
    },
    infoBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.secondaryLight,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    infoTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.primary,
      marginBottom: 5,
    },
    infoText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSoft,
    },
    primaryButton: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.primary,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
    },
    primaryButtonCompact: {
      backgroundColor: colors.primary,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
      marginTop: 4,
      alignSelf: "stretch",
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
    disabledButton: {
      opacity: 0.45,
    },
    secondaryButton: {
      marginHorizontal: horizontalPadding,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: isMobile ? 12 : 13,
      paddingHorizontal: 16,
      borderRadius: 999,
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
    resultCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 28 : 34,
      padding: isMobile ? 20 : 24,
      marginBottom: isMobile ? 16 : 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
      boxShadow:
        mode === "dark"
          ? "0px 20px 42px rgba(0,0,0,0.16)"
          : "0px 20px 42px rgba(0,0,0,0.10)",
    },
    resultLabel: {
      fontSize: isMobile ? 12 : 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
      zIndex: 2,
    },
    resultScore: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 54 : 62,
      lineHeight: isMobile ? 60 : 68,
      color: colors.primary,
      zIndex: 2,
    },
    resultScoreSmall: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.textSoft,
      marginBottom: 10,
      zIndex: 2,
    },
    resultLevel: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 24 : 28,
      lineHeight: isMobile ? 30 : 34,
      color: colors.primary,
      marginBottom: 12,
      textAlign: "center",
      zIndex: 2,
    },
    resultText: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 22,
      color: colors.textSoft,
      textAlign: "center",
      marginBottom: 18,
      maxWidth: 460,
      zIndex: 2,
    },
    resultSectionTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 21 : 24,
      lineHeight: isMobile ? 26 : 30,
      color: colors.primary,
      marginBottom: 14,
      alignSelf: "stretch",
      zIndex: 2,
    },
    priorityRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardWarm,
      borderRadius: isMobile ? 18 : 20,
      padding: isMobile ? 11 : 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "stretch",
      gap: 10,
      zIndex: 2,
    },
    priorityNumber: {
      width: isMobile ? 29 : 31,
      height: isMobile ? 29 : 31,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
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
      fontWeight: "900",
      color: colors.text,
    },
    savedMessage: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 14,
      zIndex: 2,
    },
    warningBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: isMobile ? 24 : 26,
    },
    warningTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.warningText,
      marginBottom: 5,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
    quickActionsRow: {
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      gap: 12,
      marginBottom: isMobile ? 22 : 24,
    },
    quickCard: {
      width: isSmallMobile ? 160 : isMobile ? 170 : 175,
      minHeight: isMobile ? 190 : 205,
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