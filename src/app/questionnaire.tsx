import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { saveQuestionnaireResult } from "../lib/storage";

const questions = [
  {
    id: 1,
    category: "Cou",
    text: "Ressentez-vous des tensions au cou après une journée de travail ou d’étude ?",
  },
  {
    id: 2,
    category: "Cou",
    text: "Travaillez-vous souvent avec un ordinateur portable sans support ?",
  },
  {
    id: 3,
    category: "Dos",
    text: "Restez-vous assis plus de 6 heures par jour ?",
  },
  {
    id: 4,
    category: "Dos",
    text: "Changez-vous rarement de position pendant la journée ?",
  },
  {
    id: 5,
    category: "Épaules",
    text: "Gardez-vous les épaules contractées lorsque vous travaillez ?",
  },
  {
    id: 6,
    category: "Poignets",
    text: "Utilisez-vous un clavier ou une souris plus de 4 heures par jour ?",
  },
  {
    id: 7,
    category: "Jambes",
    text: "Restez-vous assis longtemps sans vous lever ?",
  },
  {
    id: 8,
    category: "Habitudes",
    text: "Faites-vous une pause au moins toutes les 30 à 60 minutes ?",
  },
];

const options = [
  { label: "Jamais", value: 0 },
  { label: "Rarement", value: 1 },
  { label: "Parfois", value: 2 },
  { label: "Souvent", value: 3 },
  { label: "Très souvent", value: 4 },
];

export default function QuestionnaireScreen() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const progress = Math.round((answeredCount / questions.length) * 100);

  function selectAnswer(questionId: number, value: number) {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  }

  function calculateScore() {
    const totalRisk = Object.values(answers).reduce((total, value) => {
      return total + value;
    }, 0);

    const maxRisk = questions.length * 4;
    const riskPercentage = totalRisk / maxRisk;
    return Math.round(100 - riskPercentage * 100);
  }

  function getRiskLevel(score: number) {
    if (score >= 80) return "Risque faible";
    if (score >= 50) return "Risque modéré";
    return "Risque élevé";
  }

  function getResultMessage(score: number) {
    if (score >= 80) {
      return "Votre profil montre peu de facteurs de risque. Continuez à bouger régulièrement et à varier vos positions.";
    }

    if (score >= 50) {
      return "Votre profil montre certains facteurs de risque. Quelques habitudes simples peuvent déjà faire une grande différence.";
    }

    return "Votre profil montre plusieurs facteurs de risque. Il serait utile de prioriser les pauses, le mouvement et l’ajustement de votre poste.";
  }

  function getPriorities() {
    const categoryRisk: Record<string, number> = {};

    questions.forEach((question) => {
      const answer = answers[question.id] ?? 0;
      categoryRisk[question.category] =
        (categoryRisk[question.category] || 0) + answer;
    });

    return Object.entries(categoryRisk)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  const score = calculateScore();
  const level = getRiskLevel(score);
  const message = getResultMessage(score);
  const priorities = getPriorities();

  if (showResults) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Vos résultats</Text>

          <View style={styles.resultCard}>
            <Text style={styles.score}>{score}/100</Text>
            <Text style={styles.level}>{level}</Text>
            <Text style={styles.resultMessage}>{message}</Text>
          </View>

          <Text style={styles.sectionTitle}>Vos priorités</Text>

          {priorities.map((priority, index) => (
            <View key={priority} style={styles.priorityCard}>
              <Text style={styles.priorityNumber}>{index + 1}</Text>
              <Text style={styles.priorityText}>{priority}</Text>
            </View>
          ))}

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Ce score est un outil de prévention et d’éducation. Il ne constitue
              pas un diagnostic médical.
            </Text>
          </View>
<Link href="/timer" asChild>
  <Pressable style={styles.primaryButton}>
    <Text style={styles.primaryButtonText}>Démarrer ma première pause active</Text>
  </Pressable>
</Link>
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              setAnswers({});
              setShowResults(false);
            }}
          >
            <Text style={styles.primaryButtonText}>Recommencer</Text>
          </Pressable>

          <Link href="/" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Retour à l’accueil</Text>
            </Pressable>
          </Link>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Questionnaire TMS</Text>

        <Text style={styles.subtitle}>
          Répondez aux questions pour obtenir un premier score de prévention
          musculo-squelettique.
        </Text>

        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>

        <Text style={styles.progressText}>{progress}% complété</Text>

        {questions.map((question) => (
          <View key={question.id} style={styles.questionCard}>
            <Text style={styles.category}>{question.category}</Text>
            <Text style={styles.questionText}>{question.text}</Text>

            {options.map((option) => {
              const selected = answers[question.id] === option.value;

              return (
                <Pressable
                  key={option.label}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                  onPress={() => selectAnswer(question.id, option.value)}
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
        ))}

<Pressable
  style={[
    styles.primaryButton,
    answeredCount < questions.length && styles.disabledButton,
  ]}
  disabled={answeredCount < questions.length}
  onPress={() => {
    saveQuestionnaireResult({
      score,
      level,
      priorities,
      completedAt: new Date().toISOString(),
    });

    setShowResults(true);
  }}
>
  <Text style={styles.primaryButtonText}>Voir mes résultats</Text>
</Pressable>

        <Link href="/" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Retour à l’accueil</Text>
          </Pressable>
        </Link>
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
    marginBottom: 24,
  },
  progressContainer: {
    height: 12,
    backgroundColor: "#DCE9EF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#1E8A6A",
  },
  progressText: {
    fontSize: 14,
    color: "#536B78",
    marginBottom: 24,
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  category: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E8A6A",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  questionText: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    color: "#183642",
    marginBottom: 14,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: "#1E8A6A",
    borderColor: "#1E8A6A",
  },
  optionText: {
    color: "#183642",
    fontSize: 15,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#1E8A6A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#A9BBC4",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
  },
  secondaryButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "700",
  },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 28,
  },
  score: {
    fontSize: 56,
    fontWeight: "900",
    color: "#1E8A6A",
  },
  level: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: "#183642",
  },
  resultMessage: {
    marginTop: 14,
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 14,
  },
  priorityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  priorityNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DFF4EC",
    color: "#1E8A6A",
    textAlign: "center",
    lineHeight: 34,
    fontWeight: "900",
    marginRight: 12,
  },
  priorityText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#183642",
  },
  warningBox: {
    marginTop: 24,
    backgroundColor: "#FFF7E6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3D28B",
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#725A20",
  },
});