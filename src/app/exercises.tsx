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
import { addCompletedExercise, getAppStats } from "../lib/storage";
import BottomNav from "../components/BottomNav";

const exercises = [
  {
    id: "neck-mobility",
    title: "Mobilisation cervicale douce",
    category: "Cou",
    duration: "1 min",
    difficulty: "Facile",
    description:
      "Tournez doucement la tête de gauche à droite pour relâcher les tensions cervicales.",
  },
  {
    id: "trap-stretch",
    title: "Étirement du trapèze",
    category: "Cou",
    duration: "45 sec",
    difficulty: "Facile",
    description:
      "Inclinez doucement la tête sur le côté pour étirer la région du cou et des épaules.",
  },
  {
    id: "thoracic-extension",
    title: "Extension thoracique",
    category: "Dos",
    duration: "1 min",
    difficulty: "Facile",
    description:
      "Ouvrez la poitrine et étendez doucement le haut du dos pour contrer la posture assise.",
  },
  {
    id: "shoulder-circles",
    title: "Cercles d’épaules",
    category: "Épaules",
    duration: "1 min",
    difficulty: "Facile",
    description:
      "Faites des cercles lents avec les épaules pour relâcher les tensions accumulées.",
  },
  {
    id: "scapular-retraction",
    title: "Rétraction scapulaire",
    category: "Épaules",
    duration: "1 min",
    difficulty: "Facile",
    description:
      "Rapprochez doucement les omoplates pour activer les muscles du haut du dos.",
  },
  {
    id: "wrist-stretch",
    title: "Étirement des poignets",
    category: "Poignets",
    duration: "45 sec",
    difficulty: "Facile",
    description:
      "Étirez doucement les poignets pour réduire les tensions liées au clavier et à la souris.",
  },
  {
    id: "walk-break",
    title: "Marche active",
    category: "Pause active",
    duration: "2 min",
    difficulty: "Facile",
    description:
      "Levez-vous et marchez quelques pas pour changer de position et activer la circulation.",
  },
];

export default function ExercisesScreen() {
  const savedStats = getAppStats();

  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [completedExercises, setCompletedExercises] = useState<string[]>(
    savedStats.completedExerciseIds
  );
  const [points, setPoints] = useState(savedStats.points);

  const categories = ["Tous", "Cou", "Dos", "Épaules", "Poignets", "Pause active"];

  const filteredExercises =
    selectedCategory === "Tous"
      ? exercises
      : exercises.filter((exercise) => exercise.category === selectedCategory);

  function completeExercise(id: string) {
    const updatedStats = addCompletedExercise(id);

    setCompletedExercises(updatedStats.completedExerciseIds);
    setPoints(updatedStats.points);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Exercices</Text>

        <Text style={styles.subtitle}>
          Faites des exercices simples et rapides pour bouger régulièrement
          pendant vos journées de travail ou d’étude.
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedExercises.length}</Text>
            <Text style={styles.statLabel}>exercices complétés</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>points gagnés</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((category) => {
            const selected = selectedCategory === category;

            return (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  selected && styles.categoryButtonSelected,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selected && styles.categoryButtonTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {filteredExercises.map((exercise) => {
          const completed = completedExercises.includes(exercise.id);

          return (
            <View key={exercise.id} style={styles.exerciseCard}>
              <Text style={styles.exerciseCategory}>{exercise.category}</Text>
              <Text style={styles.exerciseTitle}>{exercise.title}</Text>

              <View style={styles.exerciseInfoRow}>
                <Text style={styles.exerciseInfo}>{exercise.duration}</Text>
                <Text style={styles.exerciseInfo}>{exercise.difficulty}</Text>
              </View>

              <Text style={styles.exerciseDescription}>
                {exercise.description}
              </Text>

              <Pressable
                style={[
                  styles.primaryButton,
                  completed && styles.completedButton,
                ]}
                onPress={() => completeExercise(exercise.id)}
              >
                <Text style={styles.primaryButtonText}>
                  {completed ? "Exercice complété ✓" : "Marquer comme terminé"}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Conseil</Text>
          <Text style={styles.tipText}>
            L’objectif n’est pas de faire des exercices difficiles. Le plus
            important est de bouger souvent, doucement et régulièrement.
          </Text>
        </View>

        <Link href="/dashboard" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir mon tableau de bord</Text>
          </Pressable>
        </Link>

        <Link href="/timer" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Retour à la minuterie</Text>
          </Pressable>
        </Link>

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
    marginBottom: 24,
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
  categoriesScroll: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#C7D7DF",
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  categoryButtonSelected: {
    backgroundColor: "#1E8A6A",
    borderColor: "#1E8A6A",
  },
  categoryButtonText: {
    color: "#1E5B7A",
    fontSize: 14,
    fontWeight: "800",
  },
  categoryButtonTextSelected: {
    color: "#FFFFFF",
  },
  exerciseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  exerciseCategory: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E8A6A",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  exerciseTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 10,
  },
  exerciseInfoRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  exerciseInfo: {
    backgroundColor: "#EAF7F1",
    color: "#1E5B7A",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "800",
  },
  exerciseDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#1E8A6A",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  completedButton: {
    backgroundColor: "#7AAFA0",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 8,
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
    fontWeight: "800",
  },
  backButton: {
    marginTop: 12,
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
  tipBox: {
    backgroundColor: "#EAF7F1",
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
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
});