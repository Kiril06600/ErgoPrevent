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
  addCompletedCapsule,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";

type CapsuleCategory =
  | "Toutes"
  | "Posture"
  | "Pauses"
  | "Écran"
  | "Douleur"
  | "Habitudes";

type Capsule = {
  id: string;
  category: CapsuleCategory;
  icon: string;
  title: string;
  readingTime: string;
  intro: string;
  keyPoints: string[];
  practicalTip: string;
};

const categories: CapsuleCategory[] = [
  "Toutes",
  "Posture",
  "Pauses",
  "Écran",
  "Douleur",
  "Habitudes",
];

const capsules: Capsule[] = [
  {
    id: "posture-perfect",
    category: "Posture",
    icon: "🪑",
    title: "La posture parfaite n’existe pas",
    readingTime: "2 min",
    intro:
      "En ergonomie, l’objectif n’est pas de rester dans une posture parfaite toute la journée. Le plus important est de varier les positions.",
    keyPoints: [
      "Une posture peut devenir inconfortable si elle est maintenue trop longtemps.",
      "Changer de position régulièrement réduit les contraintes répétées.",
      "Le confort dépend aussi du poste, des pauses, de la fatigue et des habitudes.",
    ],
    practicalTip:
      "Au lieu de chercher une posture parfaite, essayez de changer légèrement de position toutes les 20 à 30 minutes.",
  },
  {
    id: "microbreaks",
    category: "Pauses",
    icon: "⏱️",
    title: "Les micro-pauses sont utiles",
    readingTime: "2 min",
    intro:
      "Une pause n’a pas besoin d’être longue pour être utile. Même une pause de 1 à 2 minutes peut aider à relâcher les tensions.",
    keyPoints: [
      "Les micro-pauses interrompent l’immobilité prolongée.",
      "Elles peuvent être utilisées pour marcher, respirer ou mobiliser doucement une zone.",
      "Elles sont plus faciles à intégrer qu’une longue pause occasionnelle.",
    ],
    practicalTip:
      "Essayez la règle 25/2 : 25 minutes de travail, puis 2 minutes de pause active.",
  },
  {
    id: "screen-height",
    category: "Écran",
    icon: "🖥️",
    title: "La hauteur de l’écran compte",
    readingTime: "2 min",
    intro:
      "Un écran trop bas peut favoriser une flexion prolongée du cou, surtout lors des longues périodes de travail.",
    keyPoints: [
      "L’écran devrait être placé devant vous, pas trop décalé sur le côté.",
      "Un écran trop bas peut augmenter les contraintes au cou.",
      "Avec un ordinateur portable, un support peut être utile pour les longues sessions.",
    ],
    practicalTip:
      "Si vous travaillez longtemps sur portable, utilisez idéalement un support, un clavier externe et une souris externe.",
  },
  {
    id: "pain-signal",
    category: "Douleur",
    icon: "🌡️",
    title: "La douleur est un signal à écouter",
    readingTime: "2 min",
    intro:
      "Une douleur légère et temporaire peut arriver, mais une douleur persistante, forte ou inhabituelle doit être prise au sérieux.",
    keyPoints: [
      "Le suivi de la douleur aide à repérer les tendances.",
      "Une augmentation progressive mérite d’être surveillée.",
      "Il faut éviter de forcer un mouvement douloureux.",
    ],
    practicalTip:
      "Utilisez le check-in pour noter la douleur, la fatigue et la zone concernée. Consultez un professionnel si la douleur vous inquiète.",
  },
  {
    id: "mouse-position",
    category: "Posture",
    icon: "🖱️",
    title: "La souris doit rester proche",
    readingTime: "1 min",
    intro:
      "Une souris placée trop loin peut augmenter la tension dans l’épaule, le bras et le haut du dos.",
    keyPoints: [
      "Gardez le coude près du corps autant que possible.",
      "Évitez de travailler longtemps avec le bras tendu.",
      "Rapprocher la souris peut réduire les tensions à l’épaule.",
    ],
    practicalTip:
      "Placez la souris à côté du clavier, proche de vous, et relâchez régulièrement l’épaule.",
  },
  {
    id: "habits-small",
    category: "Habitudes",
    icon: "🌱",
    title: "Commencer petit fonctionne mieux",
    readingTime: "2 min",
    intro:
      "Les changements durables commencent souvent par de petites actions faciles à répéter.",
    keyPoints: [
      "Une routine trop ambitieuse est difficile à maintenir.",
      "Deux ou trois petites actions par jour peuvent déjà aider.",
      "La régularité compte plus que la perfection.",
    ],
    practicalTip:
      "Choisissez une seule action simple aujourd’hui : un check-in, une pause ou un exercice court.",
  },
  {
    id: "movement-variety",
    category: "Habitudes",
    icon: "🚶",
    title: "Le mouvement est une stratégie clé",
    readingTime: "2 min",
    intro:
      "Le corps tolère mieux les efforts lorsqu’il peut alterner entre différentes positions et mouvements.",
    keyPoints: [
      "Rester immobile longtemps peut favoriser l’inconfort.",
      "Bouger régulièrement aide à varier les contraintes.",
      "La marche, les étirements doux et les changements de posture sont utiles.",
    ],
    practicalTip:
      "Programmez une courte pause active dans votre journée, même si elle ne dure que 2 minutes.",
  },
  {
    id: "fatigue-role",
    category: "Douleur",
    icon: "🧠",
    title: "La fatigue influence les tensions",
    readingTime: "2 min",
    intro:
      "La fatigue peut modifier la posture, réduire l’attention portée au confort et augmenter la perception des tensions.",
    keyPoints: [
      "Une journée fatiguante peut augmenter les inconforts.",
      "Le stress et le manque de sommeil peuvent aussi jouer un rôle.",
      "Suivre la fatigue aide à mieux comprendre les variations de douleur.",
    ],
    practicalTip:
      "Dans votre check-in, notez aussi la fatigue. Cela peut aider à repérer des liens avec les douleurs.",
  },
];

export default function EducationScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CapsuleCategory>("Toutes");

  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
  }, []);

  const completedCapsuleIds = stats?.completedCapsuleIds ?? [];
  const completedCapsules = stats?.completedCapsules ?? 0;
  const points = stats?.points ?? 0;

  const filteredCapsules =
    selectedCategory === "Toutes"
      ? capsules
      : capsules.filter((capsule) => capsule.category === selectedCategory);

  function handleCompleteCapsule(capsuleId: string) {
    const updatedStats = addCompletedCapsule(capsuleId);
    setStats(updatedStats);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Formation</Text>

        <Text style={styles.subtitle}>
          Des capsules courtes pour mieux comprendre la prévention, l’ergonomie
          et les habitudes protectrices.
        </Text>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Apprendre</Text>
            <Text style={styles.heroTitle}>Comprendre pour mieux prévenir.</Text>
            <Text style={styles.heroText}>
              L’objectif n’est pas de tout lire d’un coup, mais d’intégrer une
              notion simple à la fois.
            </Text>
          </View>

          <View style={styles.pointsCircle}>
            <Text style={styles.pointsNumber}>{points}</Text>
            <Text style={styles.pointsLabel}>points</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCapsules}</Text>
            <Text style={styles.statLabel}>capsules lues</Text>
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

        <Text style={styles.sectionTitle}>Capsules</Text>

        {filteredCapsules.map((capsule) => {
          const completed = completedCapsuleIds.includes(capsule.id);

          return (
            <View key={capsule.id} style={styles.capsuleCard}>
              <View style={styles.capsuleHeader}>
                <View style={styles.capsuleIconBox}>
                  <Text style={styles.capsuleIcon}>{capsule.icon}</Text>
                </View>

                <View style={styles.capsuleHeaderText}>
                  <Text style={styles.capsuleCategory}>
                    {capsule.category} · {capsule.readingTime}
                  </Text>
                  <Text style={styles.capsuleTitle}>{capsule.title}</Text>
                </View>
              </View>

              <Text style={styles.capsuleIntro}>{capsule.intro}</Text>

              <View style={styles.keyPointsBox}>
                <Text style={styles.keyPointsTitle}>Points clés</Text>

                {capsule.keyPoints.map((point, index) => (
                  <View key={`${capsule.id}-${index}`} style={styles.pointRow}>
                    <View style={styles.pointDot} />
                    <Text style={styles.pointText}>{point}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.tipBoxSmall}>
                <Text style={styles.tipSmallTitle}>Astuce pratique</Text>
                <Text style={styles.tipSmallText}>{capsule.practicalTip}</Text>
              </View>

              {!completed ? (
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => handleCompleteCapsule(capsule.id)}
                >
                  <Text style={styles.primaryButtonText}>
                    Marquer comme lu
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.completedBox}>
                  <Text style={styles.completedText}>Capsule lue ✓</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Ces capsules sont éducatives. Elles ne remplacent pas une évaluation
            personnalisée par un professionnel de la santé ou de l’ergonomie.
          </Text>
        </View>

        <Link href="/routine" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir ma routine du jour</Text>
          </Pressable>
        </Link>

        <Link href="/personal-plan" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Voir mon plan personnalisé
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
    capsuleCard: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    capsuleHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 14,
    },
    capsuleIconBox: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: colors.secondaryLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    capsuleIcon: {
      fontSize: 28,
    },
    capsuleHeaderText: {
      flex: 1,
    },
    capsuleCategory: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    capsuleTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: colors.text,
    },
    capsuleIntro: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      marginBottom: 16,
    },
    keyPointsBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 18,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    keyPointsTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 10,
    },
    pointRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
      gap: 10,
    },
    pointDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 6,
    },
    pointText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      fontWeight: "700",
    },
    tipBoxSmall: {
      backgroundColor: colors.warning,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 16,
    },
    tipSmallTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.warningText,
      marginBottom: 6,
    },
    tipSmallText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.warningText,
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