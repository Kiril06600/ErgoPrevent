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
import { saveWorkstationAuditResult } from "../lib/storage";
import BottomNav from "../components/BottomNav";

const questions = [
  {
    id: 1,
    category: "Écran",
    text: "Votre écran est-il environ à la hauteur des yeux ?",
  },
  {
    id: 2,
    category: "Écran",
    text: "Votre écran est-il placé directement devant vous ?",
  },
  {
    id: 3,
    category: "Chaise",
    text: "Vos pieds touchent-ils bien le sol ou un repose-pieds ?",
  },
  {
    id: 4,
    category: "Chaise",
    text: "Votre dos est-il soutenu lorsque vous travaillez ?",
  },
  {
    id: 5,
    category: "Souris",
    text: "Votre souris est-elle proche de votre corps ?",
  },
  {
    id: 6,
    category: "Clavier",
    text: "Votre clavier est-il proche de vous et facile à atteindre ?",
  },
  {
    id: 7,
    category: "Ordinateur portable",
    text: "Si vous utilisez un ordinateur portable longtemps, est-il surélevé avec un support ?",
  },
  {
    id: 8,
    category: "Mouvement",
    text: "Changez-vous régulièrement de position pendant votre journée ?",
  },
  {
    id: 9,
    category: "Mouvement",
    text: "Vous levez-vous au moins toutes les 25 à 60 minutes ?",
  },
];

const options = [
  { label: "Oui", value: 0 },
  { label: "Partiellement", value: 2 },
  { label: "Non", value: 4 },
];

export default function WorkstationAuditScreen() {
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

  function getLevel(score: number) {
    if (score >= 80) return "Poste bien ajusté";
    if (score >= 50) return "Poste à améliorer";
    return "Poste à risque élevé";
  }

  function getMessage(score: number) {
    if (score >= 80) {
      return "Votre poste semble globalement bien organisé. Continuez à varier vos positions et à faire des pauses.";
    }

    if (score >= 50) {
      return "Votre poste présente quelques éléments à améliorer. De petits ajustements peuvent déjà réduire certaines contraintes.";
    }

    return "Votre poste présente plusieurs facteurs de risque. Priorisez les ajustements simples : écran, souris, clavier, chaise et pauses.";
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
      .filter(([, value]) => value > 0)
      .slice(0, 3)
      .map(([category]) => category);
  }

  const score = calculateScore();
  const level = getLevel(score);
  const message = getMessage(score);
  const priorities = getPriorities();

  if (showResults) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.pageTitle}>Résultat de l’audit</Text>

          <View style={styles.resultCard}>
            <Text style={styles.score}>{score}/100</Text>
            <Text style={styles.level}>{level}</Text>
            <Text style={styles.resultMessage}>{message}</Text>
          </View>

          <Text style={styles.sectionTitle}>Priorités du poste</Text>

          {priorities.length > 0 ? (
            priorities.map((priority, index) => (
              <View key={priority} style={styles.priorityCard}>
                <Text style={styles.priorityNumber}>{index + 1}</Text>
                <Text style={styles.priorityText}>{priority}</Text>
              </View>
            ))
          ) : (
            <View style={styles.priorityCard}>
              <Text style={styles.priorityText}>
                Aucune priorité majeure détectée.
              </Text>
            </View>
          )}

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>
              Recommandation simple
            </Text>
            <Text style={styles.recommendationText}>
              Commencez par modifier un seul élément aujourd’hui. Par exemple :
              surélever l’écran, rapprocher la souris ou planifier une pause
              active.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Cet audit est un outil d’éducation et de prévention. Il ne remplace
              pas une évaluation ergonomique complète.
            </Text>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              setAnswers({});
              setShowResults(false);
            }}
          >
            <Text style={styles.primaryButtonText}>Refaire l’audit</Text>
          </Pressable>

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Audit du poste</Text>

        <Text style={styles.subtitle}>
          Répondez à quelques questions pour obtenir un premier score ergonomique
          de votre poste de travail.
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
            saveWorkstationAuditResult({
              score,
              level,
              priorities,
              completedAt: new Date().toISOString(),
            });

            setShowResults(true);
          }}
        >
          <Text style={styles.primaryButtonText}>Voir mon score du poste</Text>
        </Pressable>

        <Link href="/" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Retour à l’accueil</Text>
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
    backgroundColor: "#FFFFFF",
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
    textAlign: "center",
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
  recommendationBox: {
    backgroundColor: "#EAF7F1",
    borderRadius: 20,
    padding: 18,
    marginTop: 10,
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
  },
  warningBox: {
    marginTop: 8,
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