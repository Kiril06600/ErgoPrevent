import React, { useEffect, useState } from "react";
import { subscribeAppEvent, subscribeAppRefreshSignals } from "../lib/appRuntime";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Link, type Href } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import AppLogo from "../components/AppLogo";
import BottomNav from "../components/BottomNav";
import PressableScale from "../components/PressableScale";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  ERGONOMIC_SYSTEM_UPDATED_EVENT,
  getCurrentWorkstation,
  getWorkstationErgonomicInsight,
  getErgonomicEvents,
  getErgonomicProfile,
  getReferenceSettings,
  getWorkstations,
} from "../lib/ergonomicSystem";

type MainAction = {
  title: string;
  text: string;
  href: Href;
};

const mainActions: MainAction[] = [
  {
    title: "Reset",
    text: "Repartir confortablement en 2 min",
    href: "/ergonomic-reset",
  },
  {
    title: "Ajuster",
    text: "Vérifier un inconfort ou un changement",
    href: "/adjust-discomfort",
  },
  {
    title: "Installer",
    text: "Configurer ou revérifier un poste",
    href: "/install-workstation",
  },
];

const secondaryActions: MainAction[] = [
  {
    title: "Mes postes",
    text: "Voir la mémoire de vos espaces de travail.",
    href: "/workstations",
  },
  {
    title: "Profil ergonomique",
    text: "Mensurations et réglages de référence.",
    href: "/ergonomic-profile",
  },
  {
    title: "Exercices",
    text: "Voir des exemples de mouvements pour varier les positions.",
    href: "/exercises",
  },
  {
    title: "Progression",
    text: "Voir votre historique et vos points.",
    href: "/progress",
  },
  {
    title: "Questionnaire",
    text: "Repérer vos symptômes et habitudes.",
    href: "/questionnaire",
  },
];

export default function HomeScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    function refresh() {
      setRefreshKey((currentValue) => currentValue + 1);
    }

    const unsubscribeEvent1 = subscribeAppEvent(
      ERGONOMIC_SYSTEM_UPDATED_EVENT,
      refresh
    );

    const unsubscribeRefreshSignals =
      subscribeAppRefreshSignals(refresh);

    return () => {
      unsubscribeEvent1();
      unsubscribeRefreshSignals();
    };
  }, []);

  const profile = getErgonomicProfile();
  const references = getReferenceSettings(profile);
  const currentWorkstation = getCurrentWorkstation();
  const workstations = getWorkstations();
  const events = getErgonomicEvents();
  const workstationInsight = currentWorkstation
    ? getWorkstationErgonomicInsight(currentWorkstation.id)
    : null;

  const targetedAdjustHref = workstationInsight
    ? (`/adjust-discomfort?zones=${encodeURIComponent(
        workstationInsight.zone
      )}&targeted=true` as Href)
    : null;

  const resetCount = events.filter((event) => event.type === "reset").length;
  const adjustmentCount = events.filter(
    (event) => event.type === "adjustment"
  ).length;

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.logoArea}>
            <AppLogo height={92} />
          </View>

          <View style={styles.workspaceCard}>
            <Text style={styles.workspaceLabel}>Mon espace de travail</Text>

            <Text style={styles.workspaceTitle}>
              {currentWorkstation?.name ?? "Aucun poste enregistré"}
            </Text>

            <Text style={styles.workspaceText}>
              {currentWorkstation
                ? "Configuration enregistrée. Vous pouvez faire un reset, ajuster un inconfort ou revérifier votre poste."
                : "Commencez par créer votre profil ergonomique, puis installez votre premier poste."}
            </Text>

            <View style={styles.statusRow}>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>
                  {profile ? "Profil ✓" : "Profil à compléter"}
                </Text>
              </View>

              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>
                  {currentWorkstation ? "Poste ✓" : "Poste à créer"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Interventions rapides</Text>

            <View style={styles.actionsList}>
              {mainActions.map((action) => (
                <Link key={action.href.toString()} href={action.href} asChild>
                  <PressableScale style={styles.mainActionCard}>
                    <View style={styles.mainActionTextBlock}>
                      <Text style={styles.mainActionTitle}>{action.title}</Text>
                      <Text style={styles.mainActionText}>{action.text}</Text>
                    </View>

                    <View style={styles.arrowCircle}>
                      <Text style={styles.arrowText}>→</Text>
                    </View>
                  </PressableScale>
                </Link>
              ))}
            </View>
          </View>

          <View style={styles.profileCard}>
            <Text style={styles.sectionTitle}>Mon profil ergonomique</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Assise</Text>
              <Text style={styles.summaryValue}>{references.seatHeightRange}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Bureau</Text>
              <Text style={styles.summaryValue}>{references.deskHeightRange}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Main dominante</Text>
              <Text style={styles.summaryValue}>
                {profile?.dominantHand || "À compléter"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Verres progressifs</Text>
              <Text style={styles.summaryValue}>
                {profile?.progressiveLenses || "À compléter"}
              </Text>
            </View>

            <Link href="/ergonomic-profile" asChild>
              <PressableScale style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  Modifier mon profil ergonomique
                </Text>
              </PressableScale>
            </Link>
          </View>

          <View style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Mémoire ErgoPrevent</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{workstations.length}</Text>
                <Text style={styles.statLabel}>postes</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{resetCount}</Text>
                <Text style={styles.statLabel}>resets</Text>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{adjustmentCount}</Text>
                <Text style={styles.statLabel}>ajustements</Text>
              </View>
            </View>

            {workstationInsight && targetedAdjustHref ? (
              <View style={styles.insightBox}>
                <Text style={styles.insightTitle}>
                  {workstationInsight.title}
                </Text>

                <Text style={styles.insightText}>
                  {workstationInsight.message}
                </Text>

                <Text style={styles.insightText}>
                  À revérifier : {workstationInsight.checks.join(", ")}.
                </Text>

                <Text style={styles.insightSource}>
                  Références ergonomiques : CNESST · INRS · IRSST
                </Text>

                <Link href={targetedAdjustHref} asChild>
                  <PressableScale style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      Faire la vérification ciblée
                    </Text>
                  </PressableScale>
                </Link>
              </View>
            ) : (
              <Text style={styles.emptyText}>
                Aucun inconfort enregistré pour ce poste pour le moment.
              </Text>
            )}
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleLarge}>Autres outils</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.secondaryActionsRow}
          >
            {secondaryActions.map((action) => (
              <Link key={action.href.toString()} href={action.href} asChild>
                <PressableScale style={styles.secondaryActionCard}>
                  <Text style={styles.secondaryActionTitle}>{action.title}</Text>
                  <Text style={styles.secondaryActionText}>{action.text}</Text>

                  <View style={styles.smallArrowCircle}>
                    <Text style={styles.smallArrowText}>→</Text>
                  </View>
                </PressableScale>
              </Link>
            ))}
          </ScrollView>

          <BottomNav />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
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
    logoArea: {
      paddingHorizontal: 24,
      marginBottom: 12,
    },
    workspaceCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 34,
      padding: 22,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    workspaceLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 8,
    },
    workspaceTitle: {
      fontFamily: "Georgia",
      fontSize: 30,
      lineHeight: 36,
      color: colors.primary,
      marginBottom: 8,
    },
    workspaceText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: "700",
      marginBottom: 16,
    },
    statusRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    statusPill: {
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusPillText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "900",
    },
    actionsCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionsTitle: {
      fontFamily: "Georgia",
      fontSize: 22,
      lineHeight: 28,
      color: colors.primary,
      marginBottom: 12,
    },
    actionsList: {
      gap: 10,
    },
    mainActionCard: {
      backgroundColor: colors.cardWarm,
      borderRadius: 22,
      paddingVertical: 14,
      paddingHorizontal: 15,
      minHeight: 74,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    },
    mainActionTextBlock: {
      flex: 1,
    },
    mainActionTitle: {
      color: colors.primary,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "900",
      marginBottom: 3,
    },
    mainActionText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
    },
    arrowCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.primaryLight,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    arrowText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 18,
    },
    profileCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyCard: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 30,
      padding: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 24,
      lineHeight: 30,
      color: colors.primary,
      marginBottom: 14,
    },
    sectionTitleLarge: {
      fontFamily: "Georgia",
      fontSize: 28,
      lineHeight: 35,
      color: colors.primary,
    },
    summaryRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    summaryLabel: {
      color: colors.textSoft,
      fontSize: 14,
      fontWeight: "900",
    },
    summaryValue: {
      flex: 1,
      textAlign: "right",
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
    },
    secondaryButton: {
      marginTop: 12,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    statsGrid: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 14,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    statNumber: {
      color: colors.primary,
      fontSize: 25,
      fontWeight: "900",
      lineHeight: 29,
    },
    statLabel: {
      marginTop: 4,
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      textAlign: "center",
    },
    insightBox: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 20,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
    },
    insightTitle: {
      fontFamily: "Georgia",
      fontSize: 19,
      lineHeight: 24,
      color: colors.primary,
      marginBottom: 6,
    },
    insightText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    insightSource: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      fontWeight: "800",
      marginTop: 8,
    },
    emptyText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    sectionHeader: {
      paddingHorizontal: 24,
      marginBottom: 14,
    },
    secondaryActionsRow: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 12,
      marginBottom: 24,
    },
    secondaryActionCard: {
      width: 170,
      minHeight: 190,
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 17,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
    },
    secondaryActionTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 20,
      lineHeight: 25,
      marginBottom: 8,
    },
    secondaryActionText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
      marginBottom: 12,
    },
    smallArrowCircle: {
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
    smallArrowText: {
      color: colors.text,
      fontSize: 19,
      fontWeight: "900",
      lineHeight: 19,
    },
  });
}