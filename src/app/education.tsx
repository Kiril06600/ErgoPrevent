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
import {
  IconBadge,
  BreakIcon,
  EducationIcon,
  PlanIcon,
  PostureIcon,
  ProgressIcon,
  RoutineIcon,
} from "../components/ErgoIcons";

type CapsuleTopic = "Posture" | "Pauses" | "Écran" | "Douleur" | "Habitudes";
type CapsuleCategory = "Toutes" | CapsuleTopic;

type Capsule = {
  id: string;
  category: CapsuleTopic;
  title: string;
  readingTime: string;
  intro: string;
  keyPoints: string[];
  practicalTip: string;
};

type CapsuleIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type CapsuleIcon = React.ComponentType<CapsuleIconProps>;

type AppRoute = "/routine" | "/personal-plan" | "/timer" | "/dashboard";

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

const categories: CapsuleCategory[] = [
  "Toutes",
  "Posture",
  "Pauses",
  "Écran",
  "Douleur",
  "Habitudes",
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
    text: "Faire une pause active.",
    href: "/timer",
    Icon: BreakIcon,
  },
  {
    label: "Objectifs",
    title: "Plan",
    text: "Voir les priorités personnalisées.",
    href: "/personal-plan",
    Icon: PlanIcon,
  },
  {
    label: "Résumé",
    title: "Dashboard",
    text: "Consulter vos points.",
    href: "/dashboard",
    Icon: ProgressIcon,
  },
];

const capsules: Capsule[] = [
  {
    id: "posture-perfect",
    category: "Posture",
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

/* -------------------- Icônes personnalisées -------------------- */

function ScreenIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CapsuleIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.16,
          top: size * 0.16,
          width: size * 0.58,
          height: size * 0.36,
          borderRadius: 4,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.55,
          width: strokeWidth,
          height: size * 0.12,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.3,
          top: size * 0.7,
          width: size * 0.32,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function PainIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CapsuleIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.4,
          top: size * 0.12,
          width: size * 0.2,
          height: size * 0.44,
          borderRadius: 999,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.35,
          top: size * 0.52,
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          right: size * 0.08,
          top: size * 0.18,
          width: size * 0.16,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "35deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          right: size * 0.08,
          top: size * 0.38,
          width: size * 0.16,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-35deg" }],
        }}
      />
    </View>
  );
}

function HabitIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CapsuleIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.47,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.42,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.22,
          top: size * 0.22,
          width: size * 0.28,
          height: size * 0.18,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: "-25deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          right: size * 0.18,
          top: size * 0.14,
          width: size * 0.28,
          height: size * 0.18,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: "25deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.32,
          bottom: size * 0.12,
          width: size * 0.36,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function MouseNearIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CapsuleIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.12,
          top: size * 0.36,
          width: size * 0.36,
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
          top: size * 0.3,
          width: size * 0.2,
          height: size * 0.32,
          borderRadius: 999,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.5,
          top: size * 0.42,
          width: size * 0.12,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function FatigueIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CapsuleIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.24,
          top: size * 0.18,
          width: size * 0.52,
          height: size * 0.36,
          borderRadius: size * 0.18,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.32,
          top: size * 0.33,
          width: size * 0.12,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          right: size * 0.32,
          top: size * 0.33,
          width: size * 0.12,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.66,
          width: size * 0.32,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function getCapsuleIcon(capsuleId: string, category: CapsuleTopic): CapsuleIcon {
  if (capsuleId === "mouse-position") {
    return MouseNearIcon;
  }

  if (capsuleId === "fatigue-role") {
    return FatigueIcon;
  }

  if (category === "Posture") {
    return PostureIcon;
  }

  if (category === "Pauses") {
    return BreakIcon;
  }

  if (category === "Écran") {
    return ScreenIcon;
  }

  if (category === "Douleur") {
    return PainIcon;
  }

  return HabitIcon;
}

export default function EducationScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<CapsuleCategory>("Toutes");

  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

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
        <View style={styles.pageHeader}>
          <View style={styles.pagePill}>
            <Text style={styles.pagePillText}>Apprentissage</Text>
          </View>

          <Text style={styles.pageTitle}>Formation</Text>

          <Text style={styles.subtitle}>
            Des capsules courtes pour mieux comprendre la prévention,
            l’ergonomie et les habitudes protectrices.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroShapeLarge} />
          <View style={styles.heroShapeSmall} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroLabel}>Apprendre</Text>
              <Text style={styles.heroTitle}>
                Comprendre pour mieux prévenir.
              </Text>
            </View>

            <View style={styles.pointsCircle}>
              <Text style={styles.pointsNumber}>{points}</Text>
              <Text style={styles.pointsLabel}>points</Text>
            </View>
          </View>

          <Text style={styles.heroText}>
            L’objectif n’est pas de tout lire d’un coup, mais d’intégrer une
            notion simple à la fois.
          </Text>
        </View>

        <View style={styles.statsPanel}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedCapsules}</Text>
            <Text style={styles.statLabel}>capsules</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>points</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredCapsules.length}</Text>
            <Text style={styles.statLabel}>à lire</Text>
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Catégories</Text>
            <Text style={styles.sectionSubtitle}>
              Filtrez les capsules par thème.
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
            <Text style={styles.sectionTitle}>Capsules</Text>
            <Text style={styles.sectionSubtitle}>
              Lisez une notion courte, puis marquez-la comme lue.
            </Text>
          </View>
        </View>

        {filteredCapsules.map((capsule) => {
          const completed = completedCapsuleIds.includes(capsule.id);
          const CapsuleIcon = getCapsuleIcon(capsule.id, capsule.category);

          return (
            <View key={capsule.id} style={styles.capsuleCard}>
              <View style={styles.capsuleHeader}>
                <IconBadge
                  size={52}
                  backgroundColor={colors.backgroundSoft}
                  borderColor={colors.border}
                >
                  <CapsuleIcon size={25} color={colors.text} />
                </IconBadge>

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
                    <View style={styles.pointNumber}>
                      <Text style={styles.pointNumberText}>{index + 1}</Text>
                    </View>

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
                  <Text style={styles.primaryButtonText}>Marquer comme lu</Text>
                  <Text style={styles.primaryButtonArrow}>→</Text>
                </Pressable>
              ) : (
                <View style={styles.completedBox}>
                  <Text style={styles.completedText}>Capsule lue</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>À retenir</Text>
          <Text style={styles.warningText}>
            Ces capsules sont éducatives. Elles ne remplacent pas une évaluation
            personnalisée par un professionnel de la santé ou de l’ergonomie.
          </Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Actions rapides</Text>
            <Text style={styles.sectionSubtitle}>
              Continuez avec votre routine ou votre plan.
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
      color: colors.text,
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
    capsuleCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    capsuleHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
      gap: 14,
    },
    capsuleHeaderText: {
      flex: 1,
    },
    capsuleCategory: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 5,
    },
    capsuleTitle: {
      fontSize: 21,
      lineHeight: 26,
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
      borderRadius: 22,
      padding: 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    keyPointsTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 12,
    },
    pointRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
      gap: 10,
    },
    pointNumber: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      marginTop: 1,
    },
    pointNumberText: {
      color: colors.black,
      fontWeight: "900",
      fontSize: 11,
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
      borderRadius: 18,
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