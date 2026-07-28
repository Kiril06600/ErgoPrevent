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
  addCompletedCapsule,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import AnimatedScreen from "../components/AnimatedScreen";
import PressableScale from "../components/PressableScale";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
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
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [selectedCategory, setSelectedCategory] =
    useState<CapsuleCategory>("Toutes");

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

  const completedCapsuleIds = stats.completedCapsuleIds ?? [];
  const completedCapsules = stats.completedCapsules ?? 0;
  const points = stats.points ?? 0;

  const filteredCapsules =
    selectedCategory === "Toutes"
      ? capsules
      : capsules.filter((capsule) => capsule.category === selectedCategory);

  function handleCompleteCapsule(capsuleId: string) {
    const updatedStats = addCompletedCapsule(capsuleId);
    setStats(updatedStats);
  }

  return (
    <AnimatedScreen>
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
            <View style={styles.sectionHeaderTextBlock}>
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
                    size={layout.isMobile ? 46 : 52}
                    backgroundColor={colors.backgroundSoft}
                    borderColor={colors.border}
                  >
                    <CapsuleIcon
                      size={layout.isMobile ? 22 : 25}
                      color={colors.text}
                    />
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
                  <PressableScale
                    style={styles.primaryButton}
                    onPress={() => handleCompleteCapsule(capsule.id)}
                  >
                    <Text style={styles.primaryButtonText}>
                      Marquer comme lu
                    </Text>
                    <Text style={styles.primaryButtonArrow}>→</Text>
                  </PressableScale>
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
              Ces capsules sont éducatives. Elles ne remplacent pas une
              évaluation personnalisée par un professionnel de la santé ou de
              l’ergonomie.
            </Text>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
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
    capsuleCard: {
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
    capsuleHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: isMobile ? 13 : 14,
      gap: isMobile ? 12 : 14,
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
      fontFamily: "Georgia",
      fontSize: isMobile ? 21 : 23,
      lineHeight: isMobile ? 26 : 29,
      color: colors.primary,
    },
    capsuleIntro: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 22,
      color: colors.textSoft,
      marginBottom: isMobile ? 14 : 16,
    },
    keyPointsBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 13 : 14,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    keyPointsTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.primary,
      marginBottom: 12,
    },
    pointRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 10,
      gap: 10,
    },
    pointNumber: {
      width: isMobile ? 24 : 26,
      height: isMobile ? 24 : 26,
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
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 19 : 20,
      color: colors.text,
      fontWeight: "700",
    },
    tipBoxSmall: {
      backgroundColor: colors.warning,
      borderRadius: 18,
      padding: isMobile ? 13 : 14,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 16,
    },
    tipSmallTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 16 : 17,
      lineHeight: isMobile ? 21 : 22,
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
    warningBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: isMobile ? 24 : 26,
    },
    warningTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.warningText,
      marginBottom: 5,
    },
    warningText: {
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