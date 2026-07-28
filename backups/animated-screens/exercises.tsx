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
  APP_STATS_UPDATED_EVENT,
  AppStats,
  addCompletedExercise,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
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
    title: "Cercles d’épaules",
    duration: "1 min",
    level: "Facile",
    description: "Un exercice rapide pour relâcher les trapèzes et les épaules.",
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
    title: "Extension des jambes assis",
    duration: "1 min",
    level: "Facile",
    description: "Un exercice discret à faire assis pour bouger les jambes.",
    steps: [
      "Asseyez-vous avec les pieds au sol.",
      "Tendez une jambe devant vous.",
      "Maintenez 2 secondes.",
      "Alternez avec l’autre jambe.",
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
  const styles = createStyles(colors, mode);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.pagePill}>
            <Text style={styles.pagePillText}>Mobilité</Text>
          </View>

          <Text style={styles.pageTitle}>Exercices</Text>

          <Text style={styles.subtitle}>
            Des mouvements courts et simples pour intégrer plus de mobilité dans
            votre journée.
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
          <View>
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
              <Pressable
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
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeaderRow}>
          <View>
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
                  size={52}
                  backgroundColor={colors.backgroundSoft}
                  borderColor={colors.border}
                >
                  <ExerciseIcon size={25} color={colors.text} />
                </IconBadge>

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
                  <Text style={styles.primaryButtonArrow}>→</Text>
                </Pressable>
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
            Les exercices doivent rester confortables. Ne forcez pas un mouvement
            douloureux. En cas de douleur importante ou persistante, consultez un
            professionnel.
          </Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
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
                <Pressable style={styles.quickCard}>
                  <IconBadge
                    size={44}
                    backgroundColor={colors.backgroundSoft}
                    borderColor={colors.border}
                  >
                    <QuickIcon size={21} color={colors.text} />
                  </IconBadge>

                  <Text style={styles.quickLabel}>{item.label}</Text>
                  <Text style={styles.quickTitle}>{item.title}</Text>
                  <Text style={styles.quickText}>{item.text}</Text>

                  <View style={styles.quickArrowCircle}>
                    <Text style={styles.quickArrowText}>→</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors, _mode: "light" | "dark") {
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
      fontFamily: "Georgia",
      fontSize: 38,
      lineHeight: 45,
      color: colors.primary,
      letterSpacing: -0.8,
      marginBottom: 10,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
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
      fontFamily: "Georgia",
      fontSize: 34,
      lineHeight: 41,
      color: colors.primary,
      letterSpacing: -0.7,
      maxWidth: 360,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 23,
      color: colors.textSoft,
      maxWidth: 460,
      zIndex: 2,
      marginTop: 22,
    },
    pointsCircle: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    pointsNumber: {
      fontSize: 23,
      fontWeight: "900",
      color: colors.black,
      lineHeight: 27,
    },
    pointsLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.black,
    },
    statsPanel: {
      marginHorizontal: 24,
      marginBottom: 26,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 16,
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
      height: 38,
      backgroundColor: colors.border,
    },
    statNumber: {
      fontSize: 23,
      fontWeight: "900",
      color: colors.primary,
      lineHeight: 27,
    },
    statLabel: {
      marginTop: 4,
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
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
      fontFamily: "Georgia",
      fontSize: 28,
      lineHeight: 35,
      color: colors.primary,
      letterSpacing: -0.5,
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
    categoryRow: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 10,
      marginBottom: 26,
    },
    categoryButton: {
      paddingVertical: 11,
      paddingHorizontal: 16,
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
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
    },
    categoryButtonTextSelected: {
      color: colors.black,
    },
    exerciseCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 14,
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
      fontSize: 23,
      lineHeight: 29,
      color: colors.primary,
    },
    exerciseDescription: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      marginBottom: 16,
    },
    stepsBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 22,
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
      width: 28,
      height: 28,
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
      paddingHorizontal: 18,
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
      fontSize: 15,
      fontWeight: "900",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
    completedBox: {
      backgroundColor: colors.turquoiseSoft,
      paddingVertical: 14,
      borderRadius: 999,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "900",
    },
    tipBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 26,
    },
    tipTitle: {
      fontFamily: "Georgia",
      fontSize: 18,
      lineHeight: 23,
      color: colors.warningText,
      marginBottom: 5,
    },
    tipText: {
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
      width: 165,
      minHeight: 200,
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
      fontFamily: "Georgia",
      fontSize: 19,
      lineHeight: 24,
      color: colors.primary,
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