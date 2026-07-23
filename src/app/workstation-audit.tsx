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
  saveWorkstationAuditResult,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";

type Priority =
  | "Écran"
  | "Chaise"
  | "Souris"
  | "Clavier"
  | "Ordinateur portable"
  | "Mouvement";

type AuditQuestion = {
  id: string;
  category: Priority;
  title: string;
  text: string;
};

const questions: AuditQuestion[] = [
  {
    id: "screen-height",
    category: "Écran",
    title: "Hauteur de l’écran",
    text: "Le haut de mon écran est proche de la hauteur de mes yeux.",
  },
  {
    id: "screen-position",
    category: "Écran",
    title: "Position de l’écran",
    text: "Mon écran est placé devant moi, sans rotation prolongée du cou.",
  },
  {
    id: "chair-feet",
    category: "Chaise",
    title: "Appui des pieds",
    text: "Mes pieds touchent le sol ou un repose-pieds de façon confortable.",
  },
  {
    id: "chair-back",
    category: "Chaise",
    title: "Support du dos",
    text: "Mon dos est soutenu de façon confortable lorsque je travaille assis.",
  },
  {
    id: "mouse-close",
    category: "Souris",
    title: "Souris proche",
    text: "Ma souris est proche de mon corps et facile à atteindre.",
  },
  {
    id: "mouse-shoulder",
    category: "Souris",
    title: "Épaule détendue",
    text: "Je peux utiliser ma souris sans garder l’épaule élevée ou le bras tendu.",
  },
  {
    id: "keyboard-close",
    category: "Clavier",
    title: "Clavier proche",
    text: "Mon clavier est placé assez près pour éviter de tendre les bras.",
  },
  {
    id: "keyboard-wrists",
    category: "Clavier",
    title: "Poignets neutres",
    text: "Mes poignets restent relativement droits lorsque j’utilise le clavier.",
  },
  {
    id: "laptop-setup",
    category: "Ordinateur portable",
    title: "Portable bien installé",
    text: "Si j’utilise un ordinateur portable longtemps, j’utilise un support, un clavier externe ou une souris externe.",
  },
  {
    id: "movement-breaks",
    category: "Mouvement",
    title: "Pauses régulières",
    text: "Je prends de courtes pauses pour changer de position ou bouger.",
  },
];

const answerOptions = [
  {
    label: "Non",
    value: 0,
  },
  {
    label: "Partiellement",
    value: 1,
  },
  {
    label: "Oui",
    value: 2,
  },
];

function calculateScore(answers: Record<string, number>) {
  const total = questions.reduce((sum, question) => {
    return sum + (answers[question.id] ?? 0);
  }, 0);

  const maxScore = questions.length * 2;

  return Math.round((total / maxScore) * 100);
}

function getLevel(score: number) {
  if (score >= 80) {
    return "Poste bien ajusté";
  }

  if (score >= 60) {
    return "Ajustements légers recommandés";
  }

  return "Ajustements prioritaires recommandés";
}

function getMessage(score: number) {
  if (score >= 80) {
    return "Votre poste semble globalement bien ajusté. Continuez à varier vos positions et à prendre des pauses.";
  }

  if (score >= 60) {
    return "Votre poste semble acceptable, mais certains ajustements pourraient améliorer votre confort.";
  }

  return "Plusieurs éléments du poste pourraient être améliorés. Priorisez les ajustements simples : écran, appuis, souris, clavier et pauses.";
}

function getPriorities(answers: Record<string, number>) {
  const categoryTotals: Record<Priority, { score: number; count: number }> = {
    Écran: { score: 0, count: 0 },
    Chaise: { score: 0, count: 0 },
    Souris: { score: 0, count: 0 },
    Clavier: { score: 0, count: 0 },
    "Ordinateur portable": { score: 0, count: 0 },
    Mouvement: { score: 0, count: 0 },
  };

  questions.forEach((question) => {
    categoryTotals[question.category].score += answers[question.id] ?? 0;
    categoryTotals[question.category].count += 1;
  });

  return Object.entries(categoryTotals)
    .map(([category, result]) => {
      return {
        category,
        average: result.score / result.count,
      };
    })
    .filter((item) => item.average < 1.5)
    .sort((a, b) => a.average - b.average)
    .map((item) => item.category);
}

export default function WorkstationAuditScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
  }, []);

  const completedQuestions = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const allQuestionsCompleted = completedQuestions === totalQuestions;

  const score = calculateScore(answers);
  const level = getLevel(score);
  const priorities = getPriorities(answers);

  const previousResult = stats?.workstationAuditResult ?? null;

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

    const updatedStats = saveWorkstationAuditResult(result);

    setStats(updatedStats);
    setShowResult(true);
    setSavedMessage("Audit sauvegardé ✓");
  }

  function handleResetAudit() {
    setAnswers({});
    setShowResult(false);
    setSavedMessage("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Audit du poste</Text>

        <Text style={styles.subtitle}>
          Analysez rapidement votre environnement de travail pour repérer les
          ajustements ergonomiques prioritaires.
        </Text>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Ergonomie</Text>
            <Text style={styles.heroTitle}>Observer votre poste simplement.</Text>
            <Text style={styles.heroText}>
              Cet audit aide à identifier les éléments qui peuvent influencer le
              confort : écran, chaise, clavier, souris et mouvement.
            </Text>
          </View>

          <View style={styles.progressCircle}>
            <Text style={styles.progressNumber}>{completedQuestions}</Text>
            <Text style={styles.progressLabel}>/{totalQuestions}</Text>
          </View>
        </View>

        {previousResult && !showResult && (
          <View style={styles.previousCard}>
            <Text style={styles.sectionTitle}>Dernier audit</Text>

            <View style={styles.previousScoreRow}>
              <Text style={styles.previousScore}>
                {previousResult.score}/100
              </Text>
              <Text style={styles.previousLevel}>{previousResult.level}</Text>
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
                  width: `${Math.round(
                    (completedQuestions / totalQuestions) * 100
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        {questions.map((question, index) => {
          const selectedAnswer = answers[question.id];

          return (
            <View key={question.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.questionTitleContainer}>
                  <Text style={styles.questionCategory}>
                    {question.category}
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
                        selected && styles.optionButtonSelected,
                      ]}
                      onPress={() => handleAnswer(question.id, option.value)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
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
            <Text style={styles.infoText}>
              Répondez à toutes les questions pour calculer votre score de poste.
            </Text>
          </View>
        )}

        <Pressable
          style={[
            styles.primaryButton,
            !allQuestionsCompleted && styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={!allQuestionsCompleted}
        >
          <Text style={styles.primaryButtonText}>Calculer mon audit</Text>
        </Pressable>

        {showResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Résultat</Text>

            <Text style={styles.resultScore}>{score}/100</Text>

            <Text style={styles.resultLevel}>{level}</Text>

            <Text style={styles.resultText}>{getMessage(score)}</Text>

            {priorities.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Priorités détectées</Text>

                {priorities.map((priority, index) => (
                  <View key={priority} style={styles.priorityRow}>
                    <View style={styles.priorityNumber}>
                      <Text style={styles.priorityNumberText}>{index + 1}</Text>
                    </View>

                    <Text style={styles.priorityText}>{priority}</Text>
                  </View>
                ))}
              </>
            ) : (
              <Text style={styles.resultText}>
                Aucun ajustement majeur détecté pour le moment.
              </Text>
            )}

            {savedMessage.length > 0 && (
              <Text style={styles.savedMessage}>{savedMessage}</Text>
            )}

            <Link href="/personal-plan" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  Voir mon plan personnalisé
                </Text>
              </Pressable>
            </Link>
          </View>
        )}

        <Pressable style={styles.secondaryButton} onPress={handleResetAudit}>
          <Text style={styles.secondaryButtonText}>Recommencer l’audit</Text>
        </Pressable>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Cet audit est un outil éducatif. Il ne remplace pas une évaluation
            ergonomique complète par un professionnel.
          </Text>
        </View>

        <Link href="/questionnaire" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Faire le questionnaire TMS</Text>
          </Pressable>
        </Link>

        <Link href="/dashboard" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Voir mon tableau de bord
            </Text>
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
    progressCircle: {
      width: 78,
      height: 78,
      borderRadius: 39,
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
    },
    progressLabel: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.black,
    },
    previousCard: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 22,
      padding: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previousScoreRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
    },
    previousScore: {
      fontSize: 30,
      fontWeight: "900",
      color: colors.primary,
    },
    previousLevel: {
      flex: 1,
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
    },
    previousText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
    },
    progressCard: {
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      padding: 16,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    progressTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
    },
    progressValue: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.primary,
    },
    progressBarBackground: {
      height: 12,
      backgroundColor: colors.card,
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
    questionCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    questionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 12,
    },
    questionNumber: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    questionNumberText: {
      color: colors.black,
      fontSize: 15,
      fontWeight: "900",
    },
    questionTitleContainer: {
      flex: 1,
    },
    questionCategory: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 3,
    },
    questionTitle: {
      fontSize: 20,
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
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    optionText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
    optionTextSelected: {
      color: colors.black,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: 16,
      fontWeight: "900",
    },
    disabledButton: {
      opacity: 0.45,
    },
    secondaryButton: {
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
    infoBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    infoText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
      textAlign: "center",
      fontWeight: "800",
    },
    resultCard: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 24,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    resultLabel: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    resultScore: {
      fontSize: 54,
      fontWeight: "900",
      color: colors.primary,
    },
    resultLevel: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 12,
      textAlign: "center",
    },
    resultText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      textAlign: "center",
      marginBottom: 18,
    },
    sectionTitle: {
      fontSize: 21,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 14,
      alignSelf: "stretch",
    },
    priorityRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardWarm,
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignSelf: "stretch",
    },
    priorityNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    priorityNumberText: {
      color: colors.black,
      fontWeight: "900",
      fontSize: 14,
    },
    priorityText: {
      flex: 1,
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },
    savedMessage: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 14,
    },
    warningBox: {
      backgroundColor: colors.warning,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 14,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
  });
}