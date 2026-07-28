import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import BottomNav from "../components/BottomNav";
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
  const styles = createStyles(colors, mode);

  const totalItems = sections.reduce(
    (total, section) => total + section.items.length,
    0
  );

  return (
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
              size={58}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <EducationIcon size={27} color={colors.text} />
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
              <View>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              </View>
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
                    <Pressable style={styles.exploreCard}>
                      <IconBadge
                        size={46}
                        backgroundColor={colors.backgroundSoft}
                        borderColor={colors.border}
                      >
                        <ItemIcon size={22} color={colors.text} />
                      </IconBadge>

                      <Text style={styles.cardLabel}>{item.label}</Text>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardText}>{item.text}</Text>

                      <View style={styles.cardArrowCircle}>
                        <Text style={styles.cardArrowText}>→</Text>
                      </View>
                    </Pressable>
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
            l’audit du poste. Ensuite, utilisez la routine, la minuterie et les
            exercices au quotidien.
          </Text>
        </View>

        <Link href="/" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Retour à l’accueil</Text>
            <Text style={styles.primaryButtonArrow}>→</Text>
          </Pressable>
        </Link>

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
      maxWidth: 390,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 23,
      color: colors.textSoft,
      maxWidth: 500,
      zIndex: 2,
      marginTop: 22,
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
      maxWidth: 540,
    },
    cardsRow: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 12,
      marginBottom: 28,
    },
    exploreCard: {
      width: 175,
      minHeight: 215,
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 17,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
    },
    cardLabel: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginTop: 14,
      marginBottom: 7,
    },
    cardTitle: {
      fontFamily: "Georgia",
      fontSize: 20,
      lineHeight: 25,
      color: colors.primary,
      marginBottom: 6,
    },
    cardText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSoft,
      marginBottom: 12,
    },
    cardArrowCircle: {
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
    cardArrowText: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "900",
      lineHeight: 19,
    },
    tipBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 16,
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
    primaryButton: {
      marginHorizontal: 24,
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
      marginBottom: 8,
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
  });
}