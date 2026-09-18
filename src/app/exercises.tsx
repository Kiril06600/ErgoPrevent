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
  addCompletedExercise,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import AnimatedScreen from "../components/AnimatedScreen";
import PressableScale from "../components/PressableScale";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import { CONTEXT_EVIDENCE_LABEL } from "../lib/evidenceContent";
import {
  IconBadge,
  BreakIcon,
  RoutineIcon,
  ProgressIcon,
  PlanIcon,
} from "../components/ErgoIcons";

type BodyCategory = "Cou" | "Dos" | "Épaules" | "Poignets" | "Jambes";
type ExerciseCategory = "Tous" | BodyCategory;

type Exercise = {
  id: string;
  category: BodyCategory;
  title: string;
  duration: string;
  level: string;
  description: string;
  steps: string[];
};

type BodyIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type BodyIcon = React.ComponentType<BodyIconProps>;

type AppRoute = "/routine" | "/timer" | "/progress" | "/dashboard";

type QuickAction = {
  label: string;
  title: string;
  text: string;
  href: AppRoute;
  Icon: React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;
};

const categories: ExerciseCategory[] = [
  "Tous",
  "Cou",
  "Dos",
  "Épaules",
  "Poignets",
  "Jambes",
];

const quickActions: QuickAction[] = [
  {
    label: "Aujourd’hui",
    title: "Routine",
    text: "Retourner aux actions du jour.",
    href: "/routine",
    Icon: RoutineIcon,
  },
  {
    label: "Pause",
    title: "Minuterie",
    text: "Démarrer une pause active.",
    href: "/timer",
    Icon: BreakIcon,
  },
  {
    label: "Suivi",
    title: "Évolution",
    text: "Voir vos exercices complétés.",
    href: "/progress",
    Icon: ProgressIcon,
  },
  {
    label: "Résumé",
    title: "Dashboard",
    text: "Consulter vos points.",
    href: "/dashboard",
    Icon: PlanIcon,
  },
];

const exercises: Exercise[] = [
  {
    id: "neck-mobility",
    category: "Cou",
    title: "Mobilité douce du cou",
    duration: "≈ 1 min",
    level: "Facile",
    description:
      "Un exemple de mouvement confortable pour varier doucement la position du cou pendant une pause.",
    steps: [
      "Installez-vous confortablement, épaules relâchées.",
      "Tournez ou inclinez doucement la tête dans une amplitude confortable.",
      "Revenez au centre entre les mouvements.",
      "Arrêtez si le mouvement provoque une douleur ou un symptôme inhabituel.",
    ],
  },
  {
    id: "chin-tuck",
    category: "Cou",
    title: "Mouvement cervical vers l’arrière",
    duration: "≈ 1 min",
    level: "Facile",
    description:
      "Un mouvement volontaire du cou proposé comme variation, sans chercher à imposer ou corriger une posture unique.",
    steps: [
      "Regardez devant vous dans une position confortable.",
      "Reculez très légèrement la tête sans forcer.",
      "Relâchez immédiatement si la position est inconfortable.",
      "Alternez ensuite avec une autre position naturelle.",
    ],
  },
  {
    id: "thoracic-extension",
    category: "Dos",
    title: "Changer la position du haut du dos",
    duration: "≈ 2 min",
    level: "Facile",
    description:
      "Un exemple de variation du haut du dos pour interrompre une position assise statique.",
    steps: [
      "Asseyez-vous de façon stable.",
      "Ouvrez doucement le haut du tronc dans une amplitude confortable.",
      "Revenez lentement à une position naturelle.",
      "Ne forcez pas l’amplitude.",
    ],
  },
  {
    id: "standing-reset",
    category: "Dos",
    title: "Pause debout",
    duration: "≈ 2 min",
    level: "Très facile",
    description:
      "Une courte occasion de quitter la position assise et de varier les appuis.",
    steps: [
      "Levez-vous si votre situation de travail le permet.",
      "Marchez quelques instants ou changez simplement d’appui.",
      "Laissez les épaules et les bras dans une position confortable.",
      "Reprenez ensuite votre activité dans une position qui vous convient.",
    ],
  },
  {
    id: "shoulder-rolls",
    category: "Épaules",
    title: "Mouvements d’épaules",
    duration: "≈ 1 min",
    level: "Facile",
    description:
      "Un exemple de mouvement lent pour varier la position des épaules pendant une pause.",
    steps: [
      "Gardez les bras détendus.",
      "Bougez doucement les épaules dans une direction confortable.",
      "Changez de direction si cela reste confortable.",
      "Évitez tout mouvement forcé.",
    ],
  },
  {
    id: "scapular-squeeze",
    category: "Épaules",
    title: "Mouvement des omoplates",
    duration: "≈ 1 min",
    level: "Facile",
    description:
      "Un mouvement doux du haut du dos proposé comme variation pendant une période statique.",
    steps: [
      "Asseyez-vous ou restez debout confortablement.",
      "Rapprochez légèrement les omoplates sans forcer.",
      "Relâchez les épaules.",
      "Revenez à une position naturelle.",
    ],
  },
  {
    id: "wrist-mobility",
    category: "Poignets",
    title: "Mobilité des poignets",
    duration: "≈ 1 min",
    level: "Facile",
    description:
      "Un exemple de mouvement doux pour changer la position des poignets et des mains.",
    steps: [
      "Relâchez les mains.",
      "Bougez lentement les poignets dans une amplitude confortable.",
      "Changez de direction si cela reste confortable.",
      "Évitez de forcer une position douloureuse.",
    ],
  },
  {
    id: "finger-stretch",
    category: "Poignets",
    title: "Ouvrir et fermer les mains",
    duration: "≈ 1 min",
    level: "Facile",
    description:
      "Une variation simple de la position des mains pendant une pause.",
    steps: [
      "Ouvrez doucement les mains.",
      "Écartez les doigts sans forcer.",
      "Refermez les mains sans serrer fortement.",
      "Gardez le mouvement confortable.",
    ],
  },
  {
    id: "calf-raises",
    category: "Jambes",
    title: "Variation debout",
    duration: "≈ 1 min",
    level: "Facile",
    description:
      "Un exemple de mouvement debout pour varier les appuis lorsque la situation le permet.",
    steps: [
      "Placez-vous près d’un support si nécessaire.",
      "Déplacez doucement le poids du corps ou montez légèrement sur les pointes.",
      "Revenez lentement à un appui stable.",
      "Arrêtez si vous ne vous sentez pas stable.",
    ],
  },
  {
    id: "seated-leg-extension",
    category: "Jambes",
    title: "Bouger les jambes assis",
    duration: "≈ 1 min",
    level: "Facile",
    description:
      "Un exemple de mouvement des jambes pour interrompre une position assise immobile.",
    steps: [
      "Gardez une position assise stable.",
      "Déplacez doucement une jambe dans une amplitude confortable.",
      "Reposez le pied puis changez de côté.",
      "Évitez toute position qui augmente l’inconfort.",
    ],
  },
];

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

function getExerciseIcon(exerciseId: string): BodyIcon {
  switch (exerciseId) {
    case "neck-mobility":
      return NeckIcon;
    case "chin-tuck":
      return HeadPositionIcon;
    case "thoracic-extension":
      return BackIcon;
    case "standing-reset":
      return MovementIcon;
    case "shoulder-rolls":
      return ShoulderIcon;
    case "scapular-squeeze":
      return ShoulderIcon;
    case "wrist-mobility":
      return WristIcon;
    case "finger-stretch":
      return WristIcon;
    case "calf-raises":
      return LegsIcon;
    case "seated-leg-extension":
      return LegsIcon;
    default:
      return MovementIcon;
  }
}

export default function ExercisesScreen() {
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [selectedCategory, setSelectedCategory] =
    useState<ExerciseCategory>("Tous");

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

  const completedExerciseIds = stats.completedExerciseIds ?? [];
  const completedExercises = stats.completedExercises ?? 0;
  const points = stats.points ?? 0;

  const filteredExercises =
    selectedCategory === "Tous"
      ? exercises
      : exercises.filter((exercise) => exercise.category === selectedCategory);

  function handleCompleteExercise(exerciseId: string) {
    const updatedStats = addCompletedExercise(exerciseId);
    setStats(updatedStats);
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Mobilité</Text>
            </View>

            <Text style={styles.pageTitle}>Exercices</Text>

            <Text style={styles.subtitle}>
              Des mouvements courts et simples pour intégrer plus de mobilité
              dans votre journée.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroLabel}>Mouvement</Text>
                <Text style={styles.heroTitle}>Bouger un peu, souvent.</Text>
              </View>

              <View style={styles.pointsCircle}>
                <Text style={styles.pointsNumber}>{points}</Text>
                <Text style={styles.pointsLabel}>points</Text>
              </View>
            </View>

            <Text style={styles.heroText}>
              Choisissez un exercice court selon la zone que vous souhaitez
              mobiliser. L’objectif est la régularité, pas la performance.
            </Text>
          </View>

          <View style={styles.statsPanel}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedExercises}</Text>
              <Text style={styles.statLabel}>exercices</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{points}</Text>
              <Text style={styles.statLabel}>points</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredExercises.length}</Text>
              <Text style={styles.statLabel}>proposés</Text>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Catégories</Text>
              <Text style={styles.sectionSubtitle}>
                Filtrez les exercices par zone.
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {categories.map((category) => {
              const selected = selectedCategory === category;

              return (
                <PressableScale
                  key={category}
                  style={[
                    styles.categoryButton,
                    selected ? styles.categoryButtonSelected : null,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selected ? styles.categoryButtonTextSelected : null,
                    ]}
                  >
                    {category}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Exercices proposés</Text>
              <Text style={styles.sectionSubtitle}>
                Suivez les étapes lentement et sans douleur.
              </Text>
            </View>
          </View>

          {filteredExercises.map((exercise) => {
            const completed = completedExerciseIds.includes(exercise.id);
            const ExerciseIcon = getExerciseIcon(exercise.id);

            return (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <IconBadge
                    size={layout.isMobile ? 46 : 52}
                    backgroundColor={colors.backgroundSoft}
                    borderColor={colors.border}
                  >
                    <ExerciseIcon
                      size={layout.isMobile ? 22 : 25}
                      color={colors.text}
                    />
                  </IconBadge>

                  <View style={styles.exerciseHeaderText}>
                    <Text style={styles.exerciseCategory}>
                      {exercise.category} · {exercise.duration} ·{" "}
                      {exercise.level}
                    </Text>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  </View>
                </View>

                <Text style={styles.exerciseDescription}>
                  {exercise.description}
                </Text>

                <View style={styles.stepsBox}>
                  {exercise.steps.map((step, index) => (
                    <View
                      key={`${exercise.id}-${index}`}
                      style={styles.stepRow}
                    >
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>

                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                {!completed ? (
                  <PressableScale
                    style={styles.primaryButton}
                    onPress={() => handleCompleteExercise(exercise.id)}
                  >
                    <Text style={styles.primaryButtonText}>
                      Marquer comme complété
                    </Text>
                    <Text style={styles.primaryButtonArrow}>→</Text>
                  </PressableScale>
                ) : (
                  <View style={styles.completedBox}>
                    <Text style={styles.completedText}>Complété</Text>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Conseil</Text>
            <Text style={styles.tipText}>
              Ces mouvements sont des exemples de variation pendant une pause,
              pas des traitements d’une douleur. Les sources CNESST, INRS et
              IRSST soutiennent surtout le mouvement régulier, la variation des
              postures et l’alternance des tâches. Arrêtez un mouvement qui
              augmente la douleur ou provoque un symptôme inhabituel. Références :
              {CONTEXT_EVIDENCE_LABEL}.
            </Text>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
              <Text style={styles.sectionSubtitle}>
                Continuez avec une pause ou votre routine.
              </Text>
            </View>

            <Text style={styles.sectionAction}>Défilez →</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsRow}
          >
            {quickActions.map((item) => {
              const QuickIcon = item.Icon;

              return (
                <Link key={item.href} href={item.href} asChild>
                  <PressableScale style={styles.quickCard}>
                    <IconBadge
                      size={layout.isMobile ? 40 : 44}
                      backgroundColor={colors.backgroundSoft}
                      borderColor={colors.border}
                    >
                      <QuickIcon
                        size={layout.isMobile ? 19 : 21}
                        color={colors.text}
                      />
                    </IconBadge>

                    <Text style={styles.quickLabel}>{item.label}</Text>
                    <Text style={styles.quickTitle}>{item.title}</Text>
                    <Text style={styles.quickText}>{item.text}</Text>

                    <View style={styles.quickArrowCircle}>
                      <Text style={styles.quickArrowText}>→</Text>
                    </View>
                  </PressableScale>
                </Link>
              );
            })}
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
    pointsCircle: {
      width: isMobile ? 64 : 74,
      height: isMobile ? 64 : 74,
      borderRadius: isMobile ? 32 : 37,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    pointsNumber: {
      fontSize: isMobile ? 20 : 23,
      fontWeight: "900",
      color: colors.black,
      lineHeight: isMobile ? 24 : 27,
    },
    pointsLabel: {
      fontSize: isMobile ? 10 : 11,
      fontWeight: "900",
      color: colors.black,
    },
    statsPanel: {
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 24 : 26,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 22 : 26,
      padding: isMobile ? 13 : 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statDivider: {
      width: 1,
      height: isMobile ? 34 : 38,
      backgroundColor: colors.border,
    },
    statNumber: {
      fontSize: isMobile ? 19 : 23,
      fontWeight: "900",
      color: colors.primary,
      lineHeight: isMobile ? 23 : 27,
    },
    statLabel: {
      marginTop: 4,
      fontSize: isMobile ? 8 : 10,
      color: colors.textMuted,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
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
    categoryRow: {
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      gap: isMobile ? 8 : 10,
      marginBottom: isMobile ? 22 : 26,
    },
    categoryButton: {
      paddingVertical: isMobile ? 10 : 11,
      paddingHorizontal: isMobile ? 14 : 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    categoryButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    categoryButtonText: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      color: colors.text,
    },
    categoryButtonTextSelected: {
      color: colors.black,
    },
    exerciseCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 26 : 30,
      padding: isMobile ? 17 : 20,
      marginBottom: isMobile ? 14 : 16,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow:
        mode === "dark"
          ? "0px 18px 36px rgba(0,0,0,0.12)"
          : "0px 18px 36px rgba(0,0,0,0.08)",
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isMobile ? 13 : 14,
      gap: isMobile ? 12 : 14,
    },
    exerciseHeaderText: {
      flex: 1,
    },
    exerciseCategory: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 5,
    },
    exerciseTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 21 : 23,
      lineHeight: isMobile ? 26 : 29,
      color: colors.primary,
    },
    exerciseDescription: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 22,
      color: colors.textSoft,
      marginBottom: isMobile ? 14 : 16,
    },
    stepsBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 13 : 14,
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
      width: isMobile ? 25 : 28,
      height: isMobile ? 25 : 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      marginTop: 1,
    },
    stepNumberText: {
      color: colors.black,
      fontWeight: "900",
      fontSize: isMobile ? 11 : 12,
    },
    stepText: {
      flex: 1,
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 19 : 20,
      color: colors.text,
      fontWeight: "700",
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: isMobile ? 16 : 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
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
    completedBox: {
      backgroundColor: colors.turquoiseSoft,
      paddingVertical: isMobile ? 13 : 14,
      borderRadius: 999,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedText: {
      color: colors.text,
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
    },
    tipBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: isMobile ? 24 : 26,
    },
    tipTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.warningText,
      marginBottom: 5,
    },
    tipText: {
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
      width: isSmallMobile ? 155 : isMobile ? 165 : 165,
      minHeight: isMobile ? 185 : 200,
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