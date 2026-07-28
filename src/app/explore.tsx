import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import BottomNav from "../components/BottomNav";
import AnimatedScreen from "../components/AnimatedScreen";
import PressableScale from "../components/PressableScale";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { useAppTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";
import {
  IconBadge,
  HomeIcon,
  RoutineIcon,
  PlanIcon,
  EducationIcon,
  ProfileIcon,
  PostureIcon,
  ProgressIcon,
  BreakIcon,
  ExerciseIcon,
} from "../components/ErgoIcons";

type AppRoute =
  | "/"
  | "/routine"
  | "/personal-plan"
  | "/daily-checkin"
  | "/questionnaire"
  | "/workstation-audit"
  | "/timer"
  | "/exercises"
  | "/education"
  | "/progress"
  | "/dashboard"
  | "/profile"
  | "/export-data";

type ExploreItem = {
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

type ExploreSection = {
  title: string;
  subtitle: string;
  items: ExploreItem[];
};

const sections: ExploreSection[] = [
  {
    title: "Commencer",
    subtitle: "Les pages principales pour utiliser l’application au quotidien.",
    items: [
      {
        label: "Accueil",
        title: "Vue d’ensemble",
        text: "Retourner à la page principale.",
        href: "/",
        Icon: HomeIcon,
      },
      {
        label: "Routine",
        title: "Actions du jour",
        text: "Voir les recommandations quotidiennes.",
        href: "/routine",
        Icon: RoutineIcon,
      },
      {
        label: "Check-in",
        title: "Suivi rapide",
        text: "Noter douleur, fatigue et zone concernée.",
        href: "/daily-checkin",
        Icon: ProgressIcon,
      },
    ],
  },
  {
    title: "Évaluer",
    subtitle: "Les outils pour mieux comprendre vos priorités ergonomiques.",
    items: [
      {
        label: "TMS",
        title: "Questionnaire",
        text: "Évaluer les zones à surveiller.",
        href: "/questionnaire",
        Icon: PostureIcon,
      },
      {
        label: "Poste",
        title: "Audit du poste",
        text: "Analyser écran, chaise, clavier et souris.",
        href: "/workstation-audit",
        Icon: PostureIcon,
      },
      {
        label: "Plan",
        title: "Plan personnalisé",
        text: "Voir vos priorités et recommandations.",
        href: "/personal-plan",
        Icon: PlanIcon,
      },
    ],
  },
  {
    title: "Agir",
    subtitle: "Les pages pour bouger, apprendre et suivre vos progrès.",
    items: [
      {
        label: "Pause",
        title: "Minuterie",
        text: "Démarrer une pause active.",
        href: "/timer",
        Icon: BreakIcon,
      },
      {
        label: "Mobilité",
        title: "Exercices",
        text: "Faire des mouvements courts.",
        href: "/exercises",
        Icon: ExerciseIcon,
      },
      {
        label: "Formation",
        title: "Capsules",
        text: "Lire des notions simples d’ergonomie.",
        href: "/education",
        Icon: EducationIcon,
      },
    ],
  },
  {
    title: "Suivre",
    subtitle: "Les pages pour visualiser, gérer ou exporter vos données.",
    items: [
      {
        label: "Évolution",
        title: "Progression",
        text: "Voir les tendances de vos check-ins.",
        href: "/progress",
        Icon: ProgressIcon,
      },
      {
        label: "Résumé",
        title: "Dashboard",
        text: "Consulter scores, points et habitudes.",
        href: "/dashboard",
        Icon: PlanIcon,
      },
      {
        label: "Profil",
        title: "Paramètres",
        text: "Gérer votre profil et vos données.",
        href: "/profile",
        Icon: ProfileIcon,
      },
      {
        label: "Export",
        title: "Exporter",
        text: "Télécharger vos données locales.",
        href: "/export-data",
        Icon: ProfileIcon,
      },
    ],
  },
];

export default function ExploreScreen() {
  const { colors, mode } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = createStyles(colors, mode, layout);

  const totalItems = sections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Découverte</Text>
            </View>

            <Text style={styles.pageTitle}>Explorer</Text>

            <Text style={styles.subtitle}>
              Retrouvez rapidement toutes les sections importantes
              d’ErgoPrevent.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroLabel}>Navigation</Text>
                <Text style={styles.heroTitle}>
                  Tout votre espace au même endroit.
                </Text>
              </View>

              <IconBadge
                size={layout.isMobile ? 50 : 58}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <EducationIcon
                  size={layout.isMobile ? 23 : 27}
                  color={colors.text}
                />
              </IconBadge>
            </View>

            <Text style={styles.heroText}>
              Cette page sert de carte de l’application. Elle vous permet de
              retrouver les questionnaires, les exercices, le suivi et les
              paramètres.
            </Text>
          </View>

          <View style={styles.statsPanel}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sections.length}</Text>
              <Text style={styles.statLabel}>sections</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalItems}</Text>
              <Text style={styles.statLabel}>pages</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statLabel}>hub</Text>
            </View>
          </View>

          {sections.map((section) => (
            <View key={section.title}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderTextBlock}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionSubtitle}>
                    {section.subtitle}
                  </Text>
                </View>

                <Text style={styles.sectionAction}>Défilez →</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardsRow}
              >
                {section.items.map((item) => {
                  const ItemIcon = item.Icon;

                  return (
                    <Link key={item.href} href={item.href} asChild>
                      <PressableScale style={styles.exploreCard}>
                        <IconBadge
                          size={layout.isMobile ? 42 : 46}
                          backgroundColor={colors.backgroundSoft}
                          borderColor={colors.border}
                        >
                          <ItemIcon
                            size={layout.isMobile ? 20 : 22}
                            color={colors.text}
                          />
                        </IconBadge>

                        <Text style={styles.cardLabel}>{item.label}</Text>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                        <Text style={styles.cardText}>{item.text}</Text>

                        <View style={styles.cardArrowCircle}>
                          <Text style={styles.cardArrowText}>→</Text>
                        </View>
                      </PressableScale>
                    </Link>
                  );
                })}
              </ScrollView>
            </View>
          ))}

          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>Conseil</Text>
            <Text style={styles.tipText}>
              Pour une utilisation simple, commencez par le questionnaire, puis
              l’audit du poste. Ensuite, utilisez la routine, la minuterie et
              les exercices au quotidien.
            </Text>
          </View>

          <Link href="/" asChild>
            <PressableScale style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Retour à l’accueil</Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </PressableScale>
          </Link>

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
      maxWidth: isMobile ? 235 : 390,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    heroText: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 23,
      color: colors.textSoft,
      maxWidth: 500,
      zIndex: 2,
      marginTop: isMobile ? 18 : 22,
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
      maxWidth: 540,
    },
    sectionAction: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 4,
    },
    cardsRow: {
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      gap: 12,
      marginBottom: isMobile ? 24 : 28,
    },
    exploreCard: {
      width: isSmallMobile ? 160 : isMobile ? 170 : 175,
      minHeight: isMobile ? 195 : 215,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 15 : 17,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
      boxShadow:
        mode === "dark"
          ? "0px 18px 36px rgba(0,0,0,0.12)"
          : "0px 18px 36px rgba(0,0,0,0.08)",
    },
    cardLabel: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginTop: isMobile ? 12 : 14,
      marginBottom: 7,
    },
    cardTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 18 : 20,
      lineHeight: isMobile ? 23 : 25,
      color: colors.primary,
      marginBottom: 6,
    },
    cardText: {
      fontSize: isMobile ? 12 : 13,
      lineHeight: isMobile ? 18 : 19,
      color: colors.textSoft,
      marginBottom: 12,
    },
    cardArrowCircle: {
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
    cardArrowText: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "900",
      lineHeight: 19,
    },
    tipBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 16,
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
    primaryButton: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.primary,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
      marginBottom: 8,
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
  });
}