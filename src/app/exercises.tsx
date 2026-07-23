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
  addCompletedExercise,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";

type ExerciseCategory = "Tous" | "Cou" | "Dos" | "Épaules" | "Poignets" | "Jambes";

type Exercise = {
  id: string;
  category: ExerciseCategory;
  icon: string;
  title: string;
  duration: string;
  level: string;
  description: string;
  steps: string[];
};

const categories: ExerciseCategory[] = [
  "Tous",
  "Cou",
  "Dos",
  "Épaules",
  "Poignets",
  "Jambes",
];

const exercises: Exercise[] = [
  {
    id: "neck-mobility",
    category: "Cou",
    icon: "🌿",
    title: "Mobilité douce du cou",
    duration: "1 min",
    level: "Facile",
    description:
      "Un mouvement simple pour relâcher la tension cervicale après une période assise.",
    steps: [
      "Asseyez-vous droit, épaules détendues.",
      "Inclinez doucement la tête vers la droite, puis vers la gauche.",
      "Gardez le mouvement lent, sans forcer.",
      "Répétez 5 fois de chaque côté.",
    ],
  },
  {
    id: "chin-tuck",
    category: "Cou",
    icon: "🧘",
    title: "Rétraction cervicale",
    duration: "1 min",
    level: "Facile",
    description:
      "Un exercice utile pour contrebalancer la posture tête avancée devant l’écran.",
    steps: [
      "Regardez droit devant vous.",
      "Rentrez doucement le menton vers l’arrière.",
      "Gardez la nuque longue, sans baisser la tête.",
      "Maintenez 3 secondes, puis relâchez.",
    ],
  },
  {
    id: "thoracic-extension",
    category: "Dos",
    icon: "🪑",
    title: "Extension du haut du dos",
    duration: "2 min",
    level: "Facile",
    description:
      "Un exercice pour ouvrir le haut du dos et réduire la raideur liée à la position assise.",
    steps: [
      "Asseyez-vous au bord de votre chaise.",
      "Placez les mains derrière la tête.",
      "Ouvrez doucement la poitrine vers le haut.",
      "Revenez lentement et répétez 6 à 8 fois.",
    ],
  },
  {
    id: "standing-reset",
    category: "Dos",
    icon: "🚶",
    title: "Reset debout",
    duration: "2 min",
    level: "Très facile",
    description:
      "Une mini-pause pour quitter la position assise et relancer le mouvement.",
    steps: [
      "Levez-vous doucement.",
      "Marchez sur place ou dans la pièce.",
      "Relâchez les épaules.",
      "Respirez lentement pendant 30 secondes.",
    ],
  },
  {
    id: "shoulder-rolls",
    category: "Épaules",
    icon: "💫",
    title: "Cercles d’épaules",
    duration: "1 min",
    level: "Facile",
    description:
      "Un exercice rapide pour relâcher les trapèzes et les épaules.",
    steps: [
      "Gardez les bras détendus le long du corps.",
      "Faites 8 cercles d’épaules vers l’arrière.",
      "Faites ensuite 8 cercles vers l’avant.",
      "Gardez le mouvement lent et confortable.",
    ],
  },
  {
    id: "scapular-squeeze",
    category: "Épaules",
    icon: "🤲",
    title: "Rétraction des omoplates",
    duration: "1 min",
    level: "Facile",
    description:
      "Un exercice simple pour activer le haut du dos et relâcher la posture arrondie.",
    steps: [
      "Asseyez-vous ou tenez-vous debout.",
      "Rapprochez doucement les omoplates.",
      "Gardez les épaules basses.",
      "Maintenez 3 secondes, puis relâchez.",
    ],
  },
  {
    id: "wrist-mobility",
    category: "Poignets",
    icon: "✋",
    title: "Mobilité des poignets",
    duration: "1 min",
    level: "Facile",
    description:
      "Une courte routine pour relâcher les poignets après clavier ou souris.",
    steps: [
      "Tendez les bras devant vous.",
      "Faites des cercles lents avec les poignets.",
      "Changez de direction après 10 secondes.",
      "Secouez doucement les mains pour relâcher.",
    ],
  },
  {
    id: "finger-stretch",
    category: "Poignets",
    icon: "🖐️",
    title: "Étirement des doigts",
    duration: "1 min",
    level: "Facile",
    description:
      "Un exercice très simple pour réduire la tension dans les mains et les doigts.",
    steps: [
      "Ouvrez les mains largement.",
      "Écartez doucement les doigts.",
      "Fermez les mains sans serrer fort.",
      "Répétez 8 à 10 fois.",
    ],
  },
  {
    id: "calf-raises",
    category: "Jambes",
    icon: "🦵",
    title: "Montées sur pointes",
    duration: "1 min",
    level: "Facile",
    description:
      "Un mouvement debout pour stimuler les jambes pendant une pause courte.",
    steps: [
      "Tenez-vous debout près d’un support si besoin.",
      "Montez doucement sur la pointe des pieds.",
      "Redescendez lentement.",
      "Répétez 10 à 15 fois.",
    ],
  },
  {
    id: "seated-leg-extension",
    category: "Jambes",
    icon: "🪑",
    title: "Extension des jambes assis",
    duration: "1 min",
    level: "Facile",
    description:
      "Un exercice discret à faire assis pour bouger les jambes.",
    steps: [
      "Asseyez-vous avec les pieds au sol.",
      "Tendez une jambe devant vous.",
      "Maintenez 2 secondes.",
      "Alternez avec l’autre jambe.",
    ],
  },
];

export default function ExercisesScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<ExerciseCategory>("Tous");

  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
  }, []);

  const completedExerciseIds = stats?.completedExerciseIds ?? [];
  const completedExercises = stats?.completedExercises ?? 0;
  const points = stats?.points ?? 0;

  const filteredExercises =
    selectedCategory === "Tous"
      ? exercises
      : exercises.filter((exercise) => exercise.category === selectedCategory);

  function handleCompleteExercise(exerciseId: string) {
    const updatedStats = addCompletedExercise(exerciseId);
    setStats(updatedStats);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Exercices</Text>

        <Text style={styles.subtitle}>
          Des mouvements courts et simples pour intégrer plus de mobilité dans
          votre journée.
        </Text>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Mouvement</Text>
            <Text style={styles.heroTitle}>Bouger un peu, souvent.</Text>
            <Text style={styles.heroText}>
              Choisissez un exercice court selon la zone que vous souhaitez
              mobiliser. L’objectif est la régularité, pas la performance.
            </Text>
          </View>

          <View style={styles.pointsCircle}>
            <Text style={styles.pointsNumber}>{points}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedExercises}</Text>
            <Text style={styles.statLabel}>exercices complétés</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>points cumulés</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Catégories</Text>

        <View style={styles.categoryGrid}>
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
        </View>

        <Text style={styles.sectionTitle}>Exercices proposés</Text>

        {filteredExercises.map((exercise) => {
          const completed = completedExerciseIds.includes(exercise.id);

          return (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseIconBox}>
                  <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                </View>

                <View style={styles.exerciseHeaderText}>
                  <Text style={styles.exerciseCategory}>
                    {exercise.category} · {exercise.duration} · {exercise.level}
                  </Text>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                </View>
              </View>

              <Text style={styles.exerciseDescription}>
                {exercise.description}
              </Text>

              <View style={styles.stepsBox}>
                {exercise.steps.map((step, index) => (
                  <View key={`${exercise.id}-${index}`} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>

                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {!completed ? (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => handleCompleteExercise(exercise.id)}
                >
                  <Text style={styles.primaryButtonText}>
                    Marquer comme complété
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.completedBox}>
                  <Text style={styles.completedText}>Complété ✓</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Conseil</Text>
          <Text style={styles.tipText}>
            Les exercices doivent rester confortables. Ne forcez pas un mouvement
            douloureux. En cas de douleur importante ou persistante, consultez un
            professionnel.
          </Text>
        </View>

        <Link href="/routine" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir ma routine du jour</Text>
          </Pressable>
        </Link>

        <Link href="/timer" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Démarrer une pause</Text>
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
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 22,
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
    sectionTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 14,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 24,
    },
    categoryButton: {
      paddingVertical: 11,
      paddingHorizontal: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    categoryButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
    },
    categoryButtonTextSelected: {
      color: colors.black,
    },
    exerciseCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 14,
    },
    exerciseIconBox: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.secondaryLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseIcon: {
      fontSize: 28,
    },
    exerciseHeaderText: {
      flex: 1,
    },
    exerciseCategory: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    exerciseTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: colors.text,
    },
    exerciseDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      marginBottom: 16,
    },
    stepsBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 18,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
      gap: 10,
    },
    stepNumber: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    stepNumberText: {
      color: colors.black,
      fontWeight: "900",
      fontSize: 12,
    },
    stepText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      fontWeight: "700",
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: 15,
      fontWeight: "900",
    },
    completedBox: {
      backgroundColor: colors.secondaryLight,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedText: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "900",
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
  });
}