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
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  IconBadge,
  RoutineIcon,
  PlanIcon,
  BreakIcon,
  EducationIcon,
  PostureIcon,
  ExerciseIcon,
} from "../components/ErgoIcons";

type AppRoute =
  | "/workstation-audit"
  | "/exercises"
  | "/education"
  | "/timer"
  | "/dashboard"
  | "/questionnaire";

type PlanIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type PlanIconType = React.ComponentType<PlanIconProps>;

type Recommendation = {
  title: string;
  text: string;
  href: AppRoute;
  buttonText: string;
};

type QuickAction = {
  label: string;
  title: string;
  text: string;
  href: AppRoute;
  Icon: PlanIconType;
};

function getPriorityIcon(priority: string): PlanIconType {
  if (priority.includes("Cou") || priority.includes("Écran")) {
    return PostureIcon;
  }

  if (
    priority.includes("Dos") ||
    priority.includes("Jambes") ||
    priority.includes("Mouvement")
  ) {
    return BreakIcon;
  }

  if (
    priority.includes("Épaules") ||
    priority.includes("Poignets") ||
    priority.includes("Souris") ||
    priority.includes("Clavier")
  ) {
    return ExerciseIcon;
  }

  if (priority.includes("Habitudes")) {
    return RoutineIcon;
  }

  if (priority.includes("Chaise") || priority.includes("Ordinateur")) {
    return PostureIcon;
  }

  return PlanIcon;
}

function getRecommendations(priority: string): Recommendation[] {
  const recommendationsByPriority: Record<string, Recommendation[]> = {
    Cou: [
      {
        title: "Surélever l’écran",
        text: "Placez l’écran plus près de la hauteur des yeux pour limiter la flexion prolongée du cou.",
        href: "/workstation-audit",
        buttonText: "Revoir l’audit",
      },
      {
        title: "Faire une pause cervicale",
        text: "Ajoutez une mobilisation douce du cou pendant vos pauses actives.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
      {
        title: "Limiter le portable seul",
        text: "Pour une longue période de travail, utilisez idéalement un support, un clavier et une souris externes.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
    ],
    Dos: [
      {
        title: "Varier les positions",
        text: "Le plus important n’est pas une posture parfaite, mais d’éviter de rester immobile trop longtemps.",
        href: "/timer",
        buttonText: "Démarrer",
      },
      {
        title: "Ajouter une pause active",
        text: "Levez-vous régulièrement, marchez un peu et changez de position pendant la journée.",
        href: "/timer",
        buttonText: "Faire une pause",
      },
      {
        title: "Mobiliser le haut du dos",
        text: "Essayez des extensions thoraciques douces pour contrebalancer la posture assise prolongée.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    Épaules: [
      {
        title: "Rapprocher la souris",
        text: "Gardez la souris proche de votre corps pour éviter de maintenir l’épaule en tension.",
        href: "/workstation-audit",
        buttonText: "Faire l’audit",
      },
      {
        title: "Relâcher les épaules",
        text: "Pendant vos pauses, faites quelques cercles d’épaules ou relâchez volontairement les trapèzes.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
      {
        title: "Ajuster la zone de travail",
        text: "Placez les objets utilisés souvent à portée confortable pour limiter les mouvements répétitifs éloignés.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
    ],
    Poignets: [
      {
        title: "Réduire les appuis prolongés",
        text: "Évitez de garder les poignets appuyés longtemps sur une surface dure pendant l’utilisation du clavier ou de la souris.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
      {
        title: "Garder clavier et souris proches",
        text: "Un clavier et une souris proches permettent souvent de réduire les tensions dans les avant-bras et les poignets.",
        href: "/workstation-audit",
        buttonText: "Faire l’audit",
      },
      {
        title: "Mobiliser les mains",
        text: "Ajoutez une courte mobilité des doigts et des poignets dans votre routine.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    Jambes: [
      {
        title: "Se lever régulièrement",
        text: "Évitez les longues périodes assises sans interruption. Une courte marche peut déjà aider.",
        href: "/timer",
        buttonText: "Démarrer",
      },
      {
        title: "Vérifier l’appui des pieds",
        text: "Assurez-vous que vos pieds touchent le sol ou un repose-pieds pour améliorer le confort en position assise.",
        href: "/workstation-audit",
        buttonText: "Faire l’audit",
      },
      {
        title: "Ajouter une marche active",
        text: "Une marche de 2 minutes est une pause simple et efficace à intégrer dans la journée.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    Habitudes: [
      {
        title: "Installer une routine 25/2",
        text: "Travaillez 25 minutes, puis prenez 2 minutes pour bouger ou changer de position.",
        href: "/timer",
        buttonText: "Démarrer",
      },
      {
        title: "Commencer petit",
        text: "Visez d’abord 2 ou 3 pauses actives par jour. L’objectif est de créer une habitude réaliste.",
        href: "/dashboard",
        buttonText: "Voir ma progression",
      },
      {
        title: "Lire une capsule par jour",
        text: "Une courte capsule peut vous aider à comprendre pourquoi une habitude est utile.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
    ],
    Écran: [
      {
        title: "Ajuster la hauteur de l’écran",
        text: "Un écran trop bas peut favoriser une flexion prolongée du cou. Essayez de le rapprocher de la hauteur des yeux.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
      {
        title: "Placer l’écran devant vous",
        text: "Évitez de travailler longtemps avec l’écran décalé sur le côté.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
    ],
    Chaise: [
      {
        title: "Stabiliser les appuis",
        text: "Les pieds devraient idéalement être bien appuyés au sol ou sur un repose-pieds.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
      {
        title: "Changer de posture",
        text: "Même une bonne chaise ne remplace pas le mouvement. Variez régulièrement votre position.",
        href: "/timer",
        buttonText: "Démarrer une pause",
      },
    ],
    Souris: [
      {
        title: "Rapprocher la souris",
        text: "Gardez la souris près du corps pour limiter la tension dans l’épaule et le bras.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
      {
        title: "Relâcher l’épaule",
        text: "Ajoutez des cercles d’épaules ou une rétraction scapulaire douce dans vos pauses.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    Clavier: [
      {
        title: "Rapprocher le clavier",
        text: "Un clavier trop éloigné peut augmenter les contraintes aux épaules, bras et poignets.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
      {
        title: "Réduire les tensions des poignets",
        text: "Essayez une courte mobilité des poignets et des doigts pendant les pauses.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    "Ordinateur portable": [
      {
        title: "Éviter le portable seul longtemps",
        text: "Pour de longues périodes, un support, un clavier externe et une souris externe sont souvent préférables.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
      {
        title: "Surélever l’écran",
        text: "Surélever le portable peut aider à réduire la flexion du cou, surtout pendant les longues sessions.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
    ],
    Mouvement: [
      {
        title: "Utiliser la minuterie 25/2",
        text: "La meilleure action immédiate est d’intégrer de courtes pauses actives dans votre journée.",
        href: "/timer",
        buttonText: "Démarrer",
      },
      {
        title: "Faire une marche active",
        text: "Une marche de 2 minutes suffit pour changer de position et relancer le mouvement.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
  };

  return (
    recommendationsByPriority[priority] ?? [
      {
        title: "Bouger régulièrement",
        text: "Commencez par intégrer de petites pauses actives dans votre journée.",
        href: "/timer",
        buttonText: "Démarrer",
      },
      {
        title: "Faire un exercice simple",
        text: "Choisissez un exercice facile et court pour créer une première habitude.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ]
  );
}

const quickActions: QuickAction[] = [
  {
    label: "Poste",
    title: "Audit du poste",
    text: "Réévaluez votre environnement.",
    href: "/workstation-audit",
    Icon: PostureIcon,
  },
  {
    label: "Pause",
    title: "Minuterie",
    text: "Installez une routine 25/2.",
    href: "/timer",
    Icon: BreakIcon,
  },
  {
    label: "Bouger",
    title: "Exercices",
    text: "Choisissez un mouvement court.",
    href: "/exercises",
    Icon: ExerciseIcon,
  },
  {
    label: "Apprendre",
    title: "Capsules",
    text: "Comprenez les bons gestes.",
    href: "/education",
    Icon: EducationIcon,
  },
];

export default function PersonalPlanScreen() {
  const [stats, setStats] = useState<AppStats>(() => getAppStats());

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

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshStats);
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("storage", refreshStats);
    };
  }, []);

  const profile = stats.profile ?? null;
  const questionnaireResult = stats.questionnaireResult ?? null;
  const workstationAuditResult = stats.workstationAuditResult ?? null;

  const tmsPriorities = questionnaireResult?.priorities ?? [];
  const workstationPriorities = workstationAuditResult?.priorities ?? [];

  const mainPriorities = Array.from(
    new Set([...tmsPriorities, ...workstationPriorities])
  ).slice(0, 4);

  const hasEnoughData = Boolean(questionnaireResult || workstationAuditResult);
  const firstPriority = mainPriorities[0] ?? "Habitudes";
  const FirstPriorityIcon = getPriorityIcon(firstPriority);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.pagePill}>
            <Text style={styles.pagePillText}>Plan personnalisé</Text>
          </View>

          <Text style={styles.pageTitle}>Votre plan</Text>

          <Text style={styles.subtitle}>
            Transformez vos scores en actions simples à appliquer dès
            aujourd’hui.
          </Text>
        </View>

        {!hasEnoughData && (
          <>
            <View style={styles.emptyCard}>
              <IconBadge
                size={58}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <PlanIcon size={27} color={colors.text} />
              </IconBadge>

              <Text style={styles.emptyTitle}>
                Votre plan n’est pas encore prêt
              </Text>

              <Text style={styles.emptyText}>
                Complétez d’abord le questionnaire TMS ou l’audit du poste pour
                recevoir des recommandations personnalisées.
              </Text>

              <View style={styles.emptyActions}>
                <Link href="/questionnaire" asChild>
                  <Pressable style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>
                      Faire le questionnaire
                    </Text>
                    <Text style={styles.primaryButtonArrow}>→</Text>
                  </Pressable>
                </Link>

                <Link href="/workstation-audit" asChild>
                  <Pressable style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      Faire l’audit du poste
                    </Text>
                    <Text style={styles.secondaryButtonArrow}>→</Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Pourquoi commencer par là?</Text>
              <Text style={styles.tipText}>
                Le plan personnalisé dépend de vos réponses. Plus vos données
                sont complètes, plus les recommandations seront utiles.
              </Text>
            </View>
          </>
        )}

        {hasEnoughData && (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.heroTextBlock}>
                  <Text style={styles.heroLabel}>
                    {profile?.firstName
                      ? `Plan de ${profile.firstName}`
                      : "Votre plan"}
                  </Text>

                  <Text style={styles.heroTitle}>
                    Prioriser les gestes simples.
                  </Text>
                </View>

                <View style={styles.heroIconBubble}>
                  <FirstPriorityIcon size={25} color={colors.text} />
                </View>
              </View>

              <Text style={styles.heroText}>
                Commencez par les actions les plus utiles et les plus faciles à
                intégrer selon vos priorités actuelles.
              </Text>
            </View>

            <View style={styles.scoreRow}>
              <View style={styles.scoreMiniCard}>
                <Text style={styles.scoreLabel}>Score TMS</Text>
                <Text style={styles.scoreValue}>
                  {questionnaireResult ? questionnaireResult.score : "--"}
                </Text>
                <Text style={styles.scoreSmall}>/100</Text>
              </View>

              <View style={styles.scoreMiniCard}>
                <Text style={styles.scoreLabel}>Score poste</Text>
                <Text style={styles.scoreValue}>
                  {workstationAuditResult ? workstationAuditResult.score : "--"}
                </Text>
                <Text style={styles.scoreSmall}>/100</Text>
              </View>
            </View>

            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Priorités détectées</Text>
                <Text style={styles.sectionSubtitle}>
                  Les zones à travailler en premier.
                </Text>
              </View>

              <View style={styles.sectionCountPill}>
                <Text style={styles.sectionCountText}>
                  {mainPriorities.length}
                </Text>
              </View>
            </View>

            {mainPriorities.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.priorityRow}
              >
                {mainPriorities.map((priority, index) => {
                  const PriorityIcon = getPriorityIcon(priority);

                  return (
                    <View key={`${priority}-${index}`} style={styles.priorityCard}>
                      <View style={styles.priorityTopRow}>
                        <IconBadge
                          size={44}
                          backgroundColor={colors.backgroundSoft}
                          borderColor={colors.border}
                        >
                          <PriorityIcon size={21} color={colors.text} />
                        </IconBadge>

                        <View style={styles.priorityNumber}>
                          <Text style={styles.priorityNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.priorityText}>{priority}</Text>
                      <Text style={styles.priorityCaption}>
                        Priorité à intégrer dans votre routine.
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.noPriorityCard}>
                <Text style={styles.noPriorityTitle}>Aucune priorité majeure</Text>
                <Text style={styles.noPriorityText}>
                  Continuez vos bonnes habitudes : pauses régulières, mouvement
                  et ajustements du poste au besoin.
                </Text>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Actions recommandées</Text>
                <Text style={styles.sectionSubtitle}>
                  Des gestes concrets selon vos priorités.
                </Text>
              </View>
            </View>

            {mainPriorities.length > 0 ? (
              mainPriorities.map((priority) => {
                const PriorityIcon = getPriorityIcon(priority);

                return (
                  <View key={priority} style={styles.planSection}>
                    <View style={styles.planSectionHeader}>
                      <IconBadge
                        size={42}
                        backgroundColor={colors.turquoiseSoft}
                        borderColor={colors.border}
                      >
                        <PriorityIcon size={20} color={colors.text} />
                      </IconBadge>

                      <View>
                        <Text style={styles.planSectionLabel}>Priorité</Text>
                        <Text style={styles.planSectionTitle}>{priority}</Text>
                      </View>
                    </View>

                    {getRecommendations(priority).map((recommendation) => (
                      <View
                        key={`${priority}-${recommendation.title}`}
                        style={styles.recommendationCard}
                      >
                        <Text style={styles.recommendationTitle}>
                          {recommendation.title}
                        </Text>

                        <Text style={styles.recommendationText}>
                          {recommendation.text}
                        </Text>

                        <Link href={recommendation.href} asChild>
                          <Pressable style={styles.smallButton}>
                            <Text style={styles.smallButtonText}>
                              {recommendation.buttonText}
                            </Text>
                            <Text style={styles.smallButtonArrow}>→</Text>
                          </Pressable>
                        </Link>
                      </View>
                    ))}
                  </View>
                );
              })
            ) : (
              <View style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>
                  Continuer vos habitudes
                </Text>

                <Text style={styles.recommendationText}>
                  Gardez une routine simple : pauses régulières, mouvement,
                  exercices doux et ajustements du poste au besoin.
                </Text>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Outils utiles</Text>
                <Text style={styles.sectionSubtitle}>
                  Accès rapide aux actions de votre plan.
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

            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>À retenir</Text>
              <Text style={styles.warningText}>
                Ce plan est un outil d’éducation et de prévention. Il ne
                remplace pas une évaluation personnalisée par un professionnel.
              </Text>
            </View>

            <Link href="/dashboard" asChild>
              <Pressable style={styles.primaryButtonFull}>
                <Text style={styles.primaryButtonText}>
                  Voir mon tableau de bord
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </Pressable>
            </Link>
          </>
        )}

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
    emptyCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 34,
      padding: 24,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
    },
    emptyTitle: {
      fontFamily: "Georgia",
      fontSize: 27,
      lineHeight: 34,
      color: colors.primary,
      textAlign: "center",
      marginTop: 18,
      marginBottom: 10,
      zIndex: 2,
      textShadowColor: "rgba(0,0,0,0.18)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    emptyText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      textAlign: "center",
      marginBottom: 18,
      maxWidth: 430,
      zIndex: 2,
    },
    emptyActions: {
      alignItems: "center",
      gap: 10,
      zIndex: 2,
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
    heroIconBubble: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    scoreRow: {
      flexDirection: "row",
      gap: 12,
      marginHorizontal: 24,
      marginBottom: 26,
    },
    scoreMiniCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 18,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    scoreLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    scoreValue: {
      fontSize: 36,
      fontWeight: "900",
      color: colors.primary,
      lineHeight: 40,
    },
    scoreSmall: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textSoft,
      marginTop: 2,
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
    sectionCountPill: {
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 4,
    },
    sectionCountText: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textSoft,
    },
    priorityRow: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 12,
      marginBottom: 28,
    },
    priorityCard: {
      width: 175,
      minHeight: 180,
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 17,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
    },
    priorityTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 8,
    },
    priorityNumber: {
      width: 31,
      height: 31,
      borderRadius: 16,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    priorityNumberText: {
      color: colors.black,
      fontWeight: "900",
      fontSize: 13,
    },
    priorityText: {
      fontFamily: "Georgia",
      fontSize: 22,
      lineHeight: 27,
      color: colors.primary,
      letterSpacing: -0.3,
      marginTop: 20,
    },
    priorityCaption: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSoft,
      marginTop: 8,
    },
    noPriorityCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 26,
    },
    noPriorityTitle: {
      fontFamily: "Georgia",
      fontSize: 22,
      lineHeight: 28,
      color: colors.primary,
      marginBottom: 8,
    },
    noPriorityText: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSoft,
    },
    planSection: {
      marginHorizontal: 24,
      marginBottom: 26,
      backgroundColor: colors.secondaryLight,
      borderRadius: 30,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    planSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 13,
      marginBottom: 16,
    },
    planSectionLabel: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 4,
    },
    planSectionTitle: {
      fontFamily: "Georgia",
      fontSize: 24,
      lineHeight: 30,
      color: colors.primary,
      letterSpacing: -0.3,
    },
    recommendationCard: {
      backgroundColor: colors.card,
      borderRadius: 23,
      padding: 17,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    recommendationTitle: {
      fontFamily: "Georgia",
      fontSize: 21,
      lineHeight: 27,
      color: colors.primary,
      marginBottom: 8,
    },
    recommendationText: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSoft,
      marginBottom: 14,
    },
    smallButton: {
      alignSelf: "flex-start",
      backgroundColor: colors.backgroundSoft,
      paddingVertical: 11,
      paddingHorizontal: 13,
      borderRadius: 999,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      gap: 8,
    },
    smallButtonText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
    },
    smallButtonArrow: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "900",
      lineHeight: 17,
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
    warningBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 16,
    },
    warningTitle: {
      fontFamily: "Georgia",
      fontSize: 18,
      lineHeight: 23,
      color: colors.warningText,
      marginBottom: 5,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
    tipBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 22,
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
      alignSelf: "center",
    },
    primaryButtonFull: {
      marginHorizontal: 24,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
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
    secondaryButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      alignSelf: "center",
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
    },
    secondaryButtonArrow: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "900",
      lineHeight: 17,
    },
  });
}