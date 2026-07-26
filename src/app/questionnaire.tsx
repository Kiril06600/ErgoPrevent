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
  getAppStats,
  saveQuestionnaireResult,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
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

/* -------------------- Icônes corps créées pour le questionnaire -------------------- */

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
      {/* tête */}
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

      {/* épaules */}
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

      {/* colonne vertébrale */}
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

      {/* courbe du dos gauche */}
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

      {/* courbe du dos droite */}
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

      {/* bassin */}
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

/* -------------------- Écran -------------------- */

export default function QuestionnaireScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
  }, []);

  const completedQuestions = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const allQuestionsCompleted = completedQuestions === totalQuestions;

  const score = calculateScore(answers);
  const level = getRiskLevel(score);
  const priorities = getPriorities(answers);

  const previousResult = stats?.questionnaireResult ?? null;
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

    saveQuestionnaireResult(result);

    const updatedStats = getAppStats();

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.pagePill}>
            <Text style={styles.pagePillText}>Évaluation TMS</Text>
          </View>

          <Text style={styles.pageTitle}>Questionnaire</Text>

          <Text style={styles.subtitle}>
            Évaluez rapidement vos symptômes et habitudes pour repérer les zones
            à prioriser.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroShapeLarge} />
          <View style={styles.heroShapeSmall} />

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
                size={48}
                backgroundColor={colors.turquoiseSoft}
                borderColor={colors.border}
              >
                <ProgressIcon size={23} color={colors.text} />
              </IconBadge>

              <View style={styles.previousTextBlock}>
                <Text style={styles.previousLabel}>Dernier résultat</Text>
                <Text style={styles.previousLevel}>{previousResult.level}</Text>
              </View>

              <View style={styles.previousScoreBadge}>
                <Text style={styles.previousScore}>{previousResult.score}</Text>
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
          <View>
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
                  size={48}
                  backgroundColor={colors.backgroundSoft}
                  borderColor={colors.border}
                >
                  <QuestionIcon size={23} color={colors.text} />
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
                    <Pressable
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
                    </Pressable>
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

        <Pressable
          style={[
            styles.primaryButton,
            !allQuestionsCompleted ? styles.disabledButton : null,
          ]}
          onPress={handleSubmit}
          disabled={!allQuestionsCompleted}
        >
          <Text style={styles.primaryButtonText}>Calculer mon résultat</Text>
          <Text style={styles.primaryButtonArrow}>→</Text>
        </Pressable>

        {showResult && (
          <View style={styles.resultCard}>
            <View style={styles.resultShapeLarge} />
            <View style={styles.resultShapeSmall} />

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
                        size={40}
                        backgroundColor={colors.backgroundSoft}
                        borderColor={colors.border}
                      >
                        <PriorityIcon size={19} color={colors.text} />
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
              <Pressable style={styles.primaryButtonCompact}>
                <Text style={styles.primaryButtonText}>
                  Voir mon plan personnalisé
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </Pressable>
            </Link>
          </View>
        )}

        <Pressable
          style={styles.secondaryButton}
          onPress={handleResetQuestionnaire}
        >
          <Text style={styles.secondaryButtonText}>
            Recommencer le questionnaire
          </Text>
        </Pressable>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>À retenir</Text>
          <Text style={styles.warningText}>
            Ce questionnaire est un outil éducatif. Il ne remplace pas une
            consultation médicale ou une évaluation ergonomique personnalisée.
          </Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
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
            <Pressable style={styles.quickCard}>
              <IconBadge
                size={44}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <PostureIcon size={21} color={colors.text} />
              </IconBadge>

              <Text style={styles.quickLabel}>Poste</Text>
              <Text style={styles.quickTitle}>Audit du poste</Text>
              <Text style={styles.quickText}>
                Analysez votre environnement de travail.
              </Text>

              <View style={styles.quickArrowCircle}>
                <Text style={styles.quickArrowText}>→</Text>
              </View>
            </Pressable>
          </Link>

          <Link href="/dashboard" asChild>
            <Pressable style={styles.quickCard}>
              <IconBadge
                size={44}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <PlanIcon size={21} color={colors.text} />
              </IconBadge>

              <Text style={styles.quickLabel}>Résumé</Text>
              <Text style={styles.quickTitle}>Dashboard</Text>
              <Text style={styles.quickText}>
                Consultez vos scores et votre progression.
              </Text>

              <View style={styles.quickArrowCircle}>
                <Text style={styles.quickArrowText}>→</Text>
              </View>
            </Pressable>
          </Link>
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
    progressCircle: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    progressNumber: {
      fontSize: 24,
      fontWeight: "900",
      color: colors.black,
      lineHeight: 28,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.black,
    },
    previousCard: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 28,
      padding: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previousTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
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
      fontSize: 20,
      lineHeight: 25,
      fontWeight: "900",
      color: colors.text,
    },
    previousScoreBadge: {
      minWidth: 62,
      height: 48,
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
      fontSize: 20,
      fontWeight: "900",
      color: colors.black,
    },
    previousScoreSmall: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.black,
      marginTop: 5,
    },
    previousText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
    },
    progressCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 16,
      marginBottom: 26,
      borderWidth: 1,
      borderColor: colors.border,
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
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 20,
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
    questionCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 20,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    questionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 14,
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
      fontSize: 21,
      lineHeight: 26,
      fontWeight: "900",
      color: colors.text,
    },
    questionText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      marginBottom: 16,
    },
    optionsContainer: {
      gap: 8,
    },
    optionButton: {
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      alignItems: "center",
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    optionText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
    },
    optionTextSelected: {
      color: colors.black,
    },
    infoBox: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 5,
    },
    infoText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSoft,
    },
    primaryButton: {
      marginHorizontal: 24,
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
      marginBottom: 12,
    },
    primaryButtonCompact: {
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
      marginTop: 4,
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
    disabledButton: {
      opacity: 0.45,
    },
    secondaryButton: {
      marginHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      marginBottom: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
    },
    resultCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 34,
      padding: 24,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
    },
    resultShapeLarge: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 90,
      right: -60,
      top: -50,
      backgroundColor: isDark
        ? "rgba(95,159,149,0.15)"
        : "rgba(216,196,182,0.25)",
    },
    resultShapeSmall: {
      position: "absolute",
      width: 90,
      height: 90,
      borderRadius: 45,
      left: -24,
      bottom: -20,
      backgroundColor: isDark
        ? "rgba(245,238,223,0.08)"
        : "rgba(95,159,149,0.12)",
    },
    resultLabel: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
      zIndex: 2,
    },
    resultScore: {
      fontSize: 58,
      lineHeight: 62,
      fontWeight: "900",
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
      fontSize: 24,
      lineHeight: 29,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 12,
      textAlign: "center",
      zIndex: 2,
    },
    resultText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      textAlign: "center",
      marginBottom: 18,
      maxWidth: 460,
      zIndex: 2,
    },
    resultSectionTitle: {
      fontSize: 21,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 14,
      alignSelf: "stretch",
      zIndex: 2,
    },
    priorityRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "stretch",
      gap: 10,
      zIndex: 2,
    },
    priorityNumber: {
      width: 31,
      height: 31,
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
      fontSize: 15,
      lineHeight: 20,
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
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 26,
    },
    warningTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.warningText,
      marginBottom: 5,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
    quickActionsRow: {
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