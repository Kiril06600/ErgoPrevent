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
import { AppStats, getAppStats } from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  IconBadge,
  RoutineIcon,
  ProgressIcon,
  PlanIcon,
  BreakIcon,
  EducationIcon,
  PostureIcon,
  ExerciseIcon,
  SunIcon,
  MoonIcon,
} from "../components/ErgoIcons";

type AppRoute =
  | "/"
  | "/profile"
  | "/questionnaire"
  | "/workstation-audit"
  | "/timer"
  | "/exercises"
  | "/education"
  | "/routine"
  | "/daily-checkin"
  | "/progress"
  | "/personal-plan"
  | "/dashboard";

type HomeIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type HomeIcon = React.ComponentType<HomeIconProps>;

function RoutineHomeIcon({
  size = 24,
  color = "#FFFFFF",
  strokeWidth = 2.2,
}: HomeIconProps) {
  const scale = size / 24;

  function line(
    x: number,
    y: number,
    width: number,
    height: number,
    rotate = 0
  ) {
    return {
      position: "absolute",
      left: x,
      top: y,
      width,
      height,
      borderRadius: 999,
      backgroundColor: color,
      transform: [{ rotate: `${rotate}deg` }],
    } as any;
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          position: "relative",
          transform: [{ scale }],
        }}
      >
        <View style={line(4.5, 6.6, 4.2, strokeWidth, 42)} />
        <View style={line(7.2, 5.7, 6.4, strokeWidth, -45)} />
        <View style={line(14, 6.7, 6.5, strokeWidth)} />

        <View style={line(4.5, 12, 4.2, strokeWidth, 42)} />
        <View style={line(7.2, 11.1, 6.4, strokeWidth, -45)} />
        <View style={line(14, 12.1, 6.5, strokeWidth)} />

        <View style={line(4.5, 17.4, 4.2, strokeWidth, 42)} />
        <View style={line(7.2, 16.5, 6.4, strokeWidth, -45)} />
        <View style={line(14, 17.5, 6.5, strokeWidth)} />
      </View>
    </View>
  );
}

type NextAction = {
  eyebrow: string;
  title: string;
  text: string;
  href: AppRoute;
  button: string;
  Icon: HomeIcon;
};

type HomeCard = {
  eyebrow: string;
  title: string;
  text: string;
  meta: string;
  href: AppRoute;
  Icon: HomeIcon;
  featured?: boolean;
};

export default function HomeScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const { colors, mode, toggleTheme } = useAppTheme();
  const styles = createStyles(colors, mode);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
  }, []);

  const profile = stats?.profile ?? null;
  const questionnaireResult = stats?.questionnaireResult ?? null;
  const workstationAuditResult = stats?.workstationAuditResult ?? null;

  const firstName = profile?.firstName;
  const points = stats?.points ?? 0;
  const completedBreaks = stats?.completedBreaks ?? 0;
  const completedExercises = stats?.completedExercises ?? 0;
  const completedCapsules = stats?.completedCapsules ?? 0;

  function getNextAction(): NextAction {
    if (!profile) {
      return {
        eyebrow: "Première étape",
        title: "Créer votre profil",
        text: "Personnalisez ErgoPrevent selon votre situation, votre travail et vos objectifs.",
        href: "/profile",
        button: "Créer mon profil",
        Icon: PlanIcon,
      };
    }

    if (!questionnaireResult) {
      return {
        eyebrow: "Évaluation",
        title: "Évaluer votre risque TMS",
        text: "Complétez le questionnaire pour obtenir votre premier score de prévention.",
        href: "/questionnaire",
        button: "Faire le questionnaire",
        Icon: EducationIcon,
      };
    }

    if (!workstationAuditResult) {
      return {
        eyebrow: "Poste de travail",
        title: "Analyser votre poste",
        text: "Identifiez les ajustements prioritaires pour améliorer votre confort.",
        href: "/workstation-audit",
        button: "Faire l’audit",
        Icon: PostureIcon,
      };
    }

    if (completedBreaks === 0) {
      return {
        eyebrow: "Pause active",
        title: "Lancer votre première pause",
        text: "Une courte pause guidée pour bouger, respirer et relâcher les tensions.",
        href: "/timer",
        button: "Démarrer",
        Icon: BreakIcon,
      };
    }

    if (completedExercises === 0) {
      return {
        eyebrow: "Mouvement",
        title: "Faire un exercice simple",
        text: "Choisissez un exercice rapide pour le cou, le dos, les épaules ou les poignets.",
        href: "/exercises",
        button: "Voir les exercices",
        Icon: ExerciseIcon,
      };
    }

    if (completedCapsules === 0) {
      return {
        eyebrow: "Comprendre",
        title: "Lire une capsule éducative",
        text: "Apprenez une notion courte pour mieux prévenir les douleurs au quotidien.",
        href: "/education",
        button: "Lire une capsule",
        Icon: EducationIcon,
      };
    }

    return {
      eyebrow: "Aujourd’hui",
      title: "Continuer votre routine",
      text: "Gardez vos habitudes actives avec votre routine, vos check-ins et votre plan personnalisé.",
      href: "/routine",
      button: "Voir ma routine",
      Icon: BreakIcon,
    };
  }

  const nextAction = getNextAction();
  const NextActionIcon = nextAction.Icon;

  const essentialCards: HomeCard[] = [
    {
      eyebrow: "Aujourd’hui",
      title: "Routine",
      text: "Vos habitudes prioritaires pour rester actif et confortable.",
      meta: "2–5 min",
      href: "/routine",
      Icon: RoutineHomeIcon,
      featured: true,
    },
    {
      eyebrow: "Suivi rapide",
      title: "Check-in",
      text: "Notez votre confort, vos douleurs et votre énergie.",
      meta: "1 min",
      href: "/daily-checkin",
      Icon: RoutineIcon,
    },
    {
      eyebrow: "Objectifs",
      title: "Plan personnalisé",
      text: "Des recommandations adaptées à vos besoins.",
      meta: "Adapté",
      href: "/personal-plan",
      Icon: PlanIcon,
    },
    {
      eyebrow: "Tendances",
      title: "Évolution",
      text: "Visualisez vos progrès et vos habitudes.",
      meta: "Stats",
      href: "/progress",
      Icon: ProgressIcon,
    },
  ];

  const toolCards: HomeCard[] = [
    {
      eyebrow: "Évaluer",
      title: "Questionnaire",
      text: "Identifiez vos risques TMS.",
      meta: "5–7 min",
      href: "/questionnaire",
      Icon: EducationIcon,
    },
    {
      eyebrow: "Poste",
      title: "Audit du poste",
      text: "Analysez votre environnement.",
      meta: "10 min",
      href: "/workstation-audit",
      Icon: PostureIcon,
    },
    {
      eyebrow: "Pause",
      title: "Minuterie",
      text: "Rappels et pauses actives.",
      meta: "25/2",
      href: "/timer",
      Icon: BreakIcon,
    },
    {
      eyebrow: "Bouger",
      title: "Exercices",
      text: "Mouvements simples au quotidien.",
      meta: "5 min",
      href: "/exercises",
      Icon: ExerciseIcon,
    },
    {
      eyebrow: "Apprendre",
      title: "Formation",
      text: "Capsules courtes et utiles.",
      meta: "Modules",
      href: "/education",
      Icon: EducationIcon,
    },
    {
      eyebrow: "Vue globale",
      title: "Dashboard",
      text: "Pilotez votre progression.",
      meta: "Résumé",
      href: "/dashboard",
      Icon: ProgressIcon,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topHeader}>
          <View style={styles.brandBlock}>
            <Text style={styles.logo}>ErgoPrevent</Text>
            <Text style={styles.tagline}>Prévention et confort au quotidien</Text>
          </View>

          <Pressable style={styles.themeButton} onPress={toggleTheme}>
            {mode === "dark" ? (
              <SunIcon size={20} color={colors.text} />
            ) : (
              <MoonIcon size={22} color={colors.text} />
            )}

            <Text style={styles.themeText}>
              {mode === "dark" ? "Clair" : "Sombre"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroVisual}>
            <View style={styles.heroShapeLarge} />
            <View style={styles.heroShapeMedium} />
            <View style={styles.heroShapeSmall} />

            <View style={styles.heroHeader}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>Espace personnel</Text>
              </View>

              <View style={styles.pointsBadge}>
                <Text style={styles.pointsNumber}>{points}</Text>
                <Text style={styles.pointsLabel}>points</Text>
              </View>
            </View>

            <Text style={styles.greeting}>
              {firstName ? `Bonjour ${firstName}` : "Bienvenue"}
            </Text>

            <Text style={styles.title}>Prenez soin de votre posture.</Text>

            <Text style={styles.subtitle}>
              De petites actions chaque jour pour prévenir les tensions et créer
              une routine durable.
            </Text>

            <Link href={nextAction.href} asChild>
              <Pressable style={styles.heroButton}>
                <Text style={styles.heroButtonText}>{nextAction.button}</Text>
                <Text style={styles.heroButtonArrow}>→</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={styles.recommendationCard}>
          <View style={styles.recommendationTop}>
            <IconBadge
              size={46}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <NextActionIcon size={23} color={colors.text} />
            </IconBadge>

            <View style={styles.recommendationTextBlock}>
              <Text style={styles.nextActionLabel}>{nextAction.eyebrow}</Text>
              <Text style={styles.nextActionTitle}>{nextAction.title}</Text>
            </View>
          </View>

          <Text style={styles.nextActionText}>{nextAction.text}</Text>
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Vos essentiels</Text>
            <Text style={styles.sectionSubtitle}>
              Les actions les plus utiles au quotidien.
            </Text>
          </View>

          <Text style={styles.sectionAction}>Défilez →</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalCards}
        >
          {essentialCards.map((item) => {
            const Icon = item.Icon;
            const cardStyle = item.featured
              ? styles.essentialCardFeatured
              : styles.essentialCard;

            const titleStyle = item.featured
              ? styles.essentialTitleFeatured
              : styles.essentialTitle;

            const textStyle = item.featured
              ? styles.essentialTextFeatured
              : styles.essentialText;

            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable style={cardStyle}>
                  <View style={styles.cardTopLine}>
                    {item.featured ? (
  <View style={styles.featuredTopIconBubble}>
    <View style={styles.routineMiniIcon}>
      <View style={styles.routineMiniRow}>
        <View style={styles.routineMiniDot} />
        <View style={styles.routineMiniLine} />
      </View>

      <View style={styles.routineMiniRow}>
        <View style={styles.routineMiniDot} />
        <View style={styles.routineMiniLine} />
      </View>

      <View style={styles.routineMiniRow}>
        <View style={styles.routineMiniDot} />
        <View style={styles.routineMiniLineShort} />
      </View>
    </View>
  </View>
) : (
  <IconBadge
    size={44}
    backgroundColor={colors.backgroundSoft}
    borderColor={colors.border}
  >
    <Icon size={22} color={colors.text} />
  </IconBadge>
)}

                    <Text
                      style={
                        item.featured
                          ? styles.cardEyebrowFeatured
                          : styles.cardEyebrow
                      }
                    >
                      {item.eyebrow}
                    </Text>
                  </View>

                  <View>
                    <Text style={titleStyle}>{item.title}</Text>
                    <Text style={textStyle}>{item.text}</Text>
                  </View>

                  <View style={styles.cardBottomLine}>
                    <View
                      style={
                        item.featured
                          ? styles.metaPillFeatured
                          : styles.metaPill
                      }
                    >
                      <Text
                        style={
                          item.featured
                            ? styles.metaTextFeatured
                            : styles.metaText
                        }
                      >
                        {item.meta}
                      </Text>
                    </View>

                    <View
                      style={
                        item.featured
                          ? styles.arrowCircleFeatured
                          : styles.arrowCircle
                      }
                    >
                      <Text
                        style={
                          item.featured
                            ? styles.arrowTextFeatured
                            : styles.arrowText
                        }
                      >
                        →
                      </Text>
                    </View>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>

        <View style={styles.dotsRow}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Outils</Text>
            <Text style={styles.sectionSubtitle}>
              Accédez rapidement aux fonctions de prévention.
            </Text>
          </View>

          <Text style={styles.sectionAction}>Défilez →</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalTools}
        >
          {toolCards.map((item) => {
            const Icon = item.Icon;

            return (
              <Link key={item.href} href={item.href} asChild>
                <Pressable style={styles.toolCard}>
                  <IconBadge
                    size={44}
                    backgroundColor={colors.turquoiseSoft}
                    borderColor={colors.border}
                  >
                    <Icon size={21} color={colors.text} />
                  </IconBadge>

                  <Text style={styles.toolTitle}>{item.title}</Text>
                  <Text style={styles.toolText}>{item.text}</Text>

                  <View style={styles.toolMetaPill}>
                    <Text style={styles.toolMetaText}>{item.meta}</Text>
                  </View>
                </Pressable>
              </Link>
            );
          })}
        </ScrollView>

        <View style={styles.dotsRow}>
          <View style={styles.dotActive} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <View style={styles.metricsPanel}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Score TMS</Text>
            <Text style={styles.metricValue}>
              {questionnaireResult ? questionnaireResult.score : "--"}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Poste</Text>
            <Text style={styles.metricValue}>
              {workstationAuditResult ? workstationAuditResult.score : "--"}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Pauses</Text>
            <Text style={styles.metricValue}>{completedBreaks}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>À retenir</Text>
          <Text style={styles.infoText}>
            ErgoPrevent est un outil d’éducation et de prévention. Il ne remplace
            pas une consultation avec un professionnel de la santé.
          </Text>
        </View>

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
    topHeader: {
      paddingHorizontal: 24,
      marginTop: 10,
      marginBottom: 22,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 14,
    },
    brandBlock: {
      flex: 1,
    },
    logo: {
      fontSize: 31,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.6,
    },
    tagline: {
      marginTop: 4,
      fontSize: 14,
      color: colors.textSoft,
    },
    themeButton: {
      backgroundColor: "transparent",
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 12,
      alignItems: "center",
      borderWidth: 0,
      borderColor: "transparent",
      minWidth: 72,
    },
    themeText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: "900",
      marginTop: 4,
    },
    heroCard: {
      marginHorizontal: 24,
      marginBottom: 18,
      borderRadius: 38,
      overflow: "hidden",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroVisual: {
      minHeight: 340,
      padding: 24,
      position: "relative",
      overflow: "hidden",
    },
    heroShapeLarge: {
      position: "absolute",
      width: 230,
      height: 230,
      borderRadius: 115,
      right: -62,
      top: 62,
      backgroundColor: isDark
        ? "rgba(95, 159, 149, 0.18)"
        : "rgba(216, 196, 182, 0.28)",
    },
    heroShapeMedium: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 80,
      right: 46,
      top: 112,
      backgroundColor: isDark
        ? "rgba(245, 238, 223, 0.08)"
        : "rgba(95, 159, 149, 0.15)",
    },
    heroShapeSmall: {
      position: "absolute",
      width: 96,
      height: 96,
      borderRadius: 48,
      left: -24,
      bottom: 40,
      backgroundColor: isDark
        ? "rgba(216, 196, 182, 0.12)"
        : "rgba(255, 255, 255, 0.30)",
    },
    heroHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      marginBottom: 34,
      zIndex: 2,
    },
    heroPill: {
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroPillText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    pointsBadge: {
      backgroundColor: colors.primary,
      borderRadius: 26,
      minWidth: 70,
      height: 52,
      paddingHorizontal: 12,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    pointsNumber: {
      fontSize: 19,
      fontWeight: "900",
      color: colors.black,
    },
    pointsLabel: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.black,
    },
    greeting: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.primary,
      marginBottom: 10,
      zIndex: 2,
    },
    title: {
      maxWidth: 290,
      fontSize: 36,
      lineHeight: 42,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 14,
      letterSpacing: -0.9,
      zIndex: 2,
    },
    subtitle: {
      maxWidth: 320,
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSoft,
      marginBottom: 20,
      zIndex: 2,
    },
    heroButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      alignSelf: "flex-start",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 12,
      zIndex: 2,
    },
    heroButtonText: {
      color: colors.black,
      fontSize: 15,
      fontWeight: "900",
    },
    heroButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
    recommendationCard: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 30,
      padding: 22,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recommendationTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 14,
    },
    recommendationTextBlock: {
      flex: 1,
    },
    nextActionLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 5,
    },
    nextActionTitle: {
      fontSize: 23,
      lineHeight: 29,
      fontWeight: "900",
      color: colors.text,
    },
    nextActionText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
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
      fontSize: 23,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 4,
      letterSpacing: -0.3,
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
    horizontalCards: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 12,
    },
    essentialCard: {
      width: 178,
      minHeight: 235,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
    },
    essentialCardFeatured: {
      width: 245,
      minHeight: 235,
      backgroundColor: colors.secondary,
      borderRadius: 30,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
      overflow: "hidden",
    },
    cardTopLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 8,
    },
    featuredIconOnly: {
  width: 44,
  height: 44,
  alignItems: "center",
  justifyContent: "center",
},
featuredTopIconBubble: {
  width: 44,
  height: 44,
  borderRadius: 22,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
},
routineMiniIcon: {
  width: 13,
  gap: 2.5,
},
routineMiniRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 3,
},
routineMiniDot: {
  width: 2.2,
  height: 2.2,
  borderRadius: 2,
  backgroundColor: "rgba(255,255,255,0.95)",
},
routineMiniLine: {
  width: 8,
  height: 1.8,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.95)",
},
routineMiniLineShort: {
  width: 6,
  height: 1.8,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.95)",
},
    cardEyebrow: {
      flex: 1,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "900",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      textAlign: "right",
    },
    cardEyebrowFeatured: {
      flex: 1,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "900",
      color: "rgba(255,255,255,0.72)",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      textAlign: "right",
    },
    essentialTitle: {
      fontSize: 21,
      lineHeight: 25,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    essentialTitleFeatured: {
      fontSize: 25,
      lineHeight: 29,
      fontWeight: "900",
      color: "#FFFFFF",
      marginBottom: 8,
      letterSpacing: -0.4,
    },
    essentialText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSoft,
    },
    essentialTextFeatured: {
      fontSize: 13,
      lineHeight: 19,
      color: "rgba(255,255,255,0.78)",
    },
    cardBottomLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    metaPill: {
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metaPillFeatured: {
      backgroundColor: "rgba(255,255,255,0.16)",
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.20)",
    },
    metaText: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.textMuted,
    },
    metaTextFeatured: {
      fontSize: 11,
      fontWeight: "900",
      color: "rgba(255,255,255,0.82)",
    },
    arrowCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    arrowCircleFeatured: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    arrowText: {
      color: colors.text,
      fontSize: 21,
      fontWeight: "900",
      lineHeight: 21,
    },
    arrowTextFeatured: {
      color: colors.black,
      fontSize: 21,
      fontWeight: "900",
      lineHeight: 21,
    },
    horizontalTools: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 12,
    },
    toolCard: {
      width: 142,
      minHeight: 190,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toolTitle: {
      fontSize: 15,
      lineHeight: 19,
      fontWeight: "900",
      color: colors.text,
      marginTop: 14,
      marginBottom: 6,
    },
    toolText: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.textSoft,
      marginBottom: 14,
    },
    toolMetaPill: {
      alignSelf: "flex-start",
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 9,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: "auto",
    },
    toolMetaText: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.textMuted,
    },
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 7,
      marginTop: 14,
      marginBottom: 26,
    },
    dotActive: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.text,
      opacity: 0.7,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.text,
      opacity: 0.18,
    },
    metricsPanel: {
      marginHorizontal: 24,
      marginBottom: 24,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    metricItem: {
      flex: 1,
      alignItems: "center",
    },
    metricDivider: {
      width: 1,
      height: 38,
      backgroundColor: colors.border,
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 5,
      textAlign: "center",
    },
    metricValue: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
    },
    infoBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
    },
    infoTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.warningText,
      marginBottom: 5,
    },
    infoText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
  });
}