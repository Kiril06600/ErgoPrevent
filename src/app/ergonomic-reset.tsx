import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import BottomNav from "../components/BottomNav";
import PressableScale from "../components/PressableScale";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  getCurrentWorkstation,
  recordReset,
} from "../lib/ergonomicSystem";

const resetSteps = [
  {
    title: "Changez de position",
    time: "20 sec",
    text: "Relâchez le dossier, bougez légèrement le bassin et repositionnez-vous confortablement.",
    detail:
      "Le but n’est pas d’obtenir une posture parfaite. Le but est de sortir d’une position figée.",
  },
  {
    title: "Regard",
    time: "20 sec",
    text: "Regardez au loin pour relâcher vos yeux.",
    detail:
      "Fixez un point éloigné, sans forcer. Gardez la tête droite et laissez les yeux se reposer.",
  },
  {
    title: "Épaules",
    time: "20 sec",
    text: "Relâchez les épaules et réalisez 3 mouvements lents.",
    detail:
      "Montez légèrement les épaules, relâchez-les, puis faites quelques cercles doux.",
  },
  {
    title: "Poignets",
    time: "20 sec",
    text: "Relâchez les mains, ouvrez et fermez doucement les doigts.",
    detail:
      "Laissez les poignets revenir dans une position neutre, sans tension volontaire.",
  },
  {
    title: "Bougez",
    time: "20 sec",
    text: "Levez-vous quelques instants ou changez simplement d’appui.",
    detail:
      "Quelques pas, un changement d’appui ou une courte pause debout suffisent.",
  },
];

export default function ErgonomicResetScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentStep = resetSteps[step];
  const currentWorkstation = getCurrentWorkstation();

  const progressText = `${step + 1}/${resetSteps.length}`;
  const progressPercent = `${((step + 1) / resetSteps.length) * 100}%`;

  function handleNext() {
    if (step < resetSteps.length - 1) {
      setStep(step + 1);
      return;
    }

    recordReset(currentWorkstation);
    setCompleted(true);
  }

  function handleRestart() {
    setStep(0);
    setCompleted(false);
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>RESET — 2 min</Text>
            </View>

            <Text style={styles.pageTitle}>Reset ergonomique</Text>

            <Text style={styles.subtitle}>
              Une intervention très courte pour bouger, relâcher les tensions et
              reprendre le travail dans une position plus confortable.
            </Text>
          </View>

          <View style={styles.contextCard}>
            <View style={styles.contextTopRow}>
              <View style={styles.contextTextBlock}>
                <Text style={styles.contextLabel}>Poste actuel</Text>
                <Text style={styles.contextTitle}>
                  {currentWorkstation?.name ?? "Aucun poste sélectionné"}
                </Text>
              </View>

              <View style={styles.timeBadge}>
                <Text style={styles.timeBadgeNumber}>2</Text>
                <Text style={styles.timeBadgeText}>min</Text>
              </View>
            </View>

            <Text style={styles.contextText}>
              Le reset ne remplace pas l’installation complète du poste. Il sert
              simplement à se remettre en mouvement pendant la journée.
            </Text>

            {!currentWorkstation && (
              <View style={styles.warningMiniBox}>
                <Text style={styles.warningMiniText}>
                  Vous pouvez faire le reset sans poste enregistré, mais il sera
                  plus utile après avoir installé un premier poste.
                </Text>
              </View>
            )}
          </View>

          {!completed ? (
            <>
              <View style={styles.progressBox}>
                <View style={styles.progressTopRow}>
                  <Text style={styles.progressLabel}>Étape {progressText}</Text>
                  <Text style={styles.progressTime}>{currentStep.time}</Text>
                </View>

                <Text style={styles.progressTitle}>{currentStep.title}</Text>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: progressPercent,
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.stepCircle}>
                  <Text style={styles.stepCircleText}>{step + 1}</Text>
                </View>

                <Text style={styles.sectionTitle}>{currentStep.title}</Text>
                <Text style={styles.sectionText}>{currentStep.text}</Text>

                <View style={styles.detailBox}>
                  <Text style={styles.detailTitle}>Repère simple</Text>
                  <Text style={styles.detailText}>{currentStep.detail}</Text>
                </View>

                <PressableScale style={styles.primaryButton} onPress={handleNext}>
                  <Text style={styles.primaryButtonText}>
                    {step < resetSteps.length - 1
                      ? "Continuer"
                      : "Terminer le reset"}
                  </Text>
                  <Text style={styles.primaryButtonArrow}>→</Text>
                </PressableScale>
              </View>

              <View style={styles.levelsCard}>
                <Text style={styles.levelsTitle}>RESET → AJUSTER → INSTALLER</Text>
                <Text style={styles.levelsText}>
                  Reset sert à bouger rapidement. Si un inconfort revient ou si
                  quelque chose ne va pas, utilisez Ajuster. Pour un nouveau
                  poste, utilisez Installer.
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.card}>
              <View style={styles.doneCircle}>
                <Text style={styles.doneCircleText}>✓</Text>
              </View>

              <Text style={styles.sectionTitle}>Reset terminé</Text>

              <Text style={styles.sectionText}>
                Reprenez votre travail. Ce reset a été ajouté à votre historique
                ergonomique.
              </Text>

              <View style={styles.doneInfoBox}>
                <Text style={styles.doneInfoLabel}>Enregistré pour</Text>
                <Text style={styles.doneInfoText}>
                  {currentWorkstation?.name ?? "Poste non défini"}
                </Text>
              </View>

              <View style={styles.nextActionsList}>
                <PressableScale style={styles.primaryButton} onPress={handleRestart}>
                  <Text style={styles.primaryButtonText}>Refaire un reset</Text>
                  <Text style={styles.primaryButtonArrow}>→</Text>
                </PressableScale>

                <Link href="/adjust-discomfort" asChild>
                  <PressableScale style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      Ajuster un inconfort
                    </Text>
                    <Text style={styles.secondaryButtonArrow}>→</Text>
                  </PressableScale>
                </Link>

                <Link href="/workstations" asChild>
                  <PressableScale style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Voir mes postes</Text>
                    <Text style={styles.secondaryButtonArrow}>→</Text>
                  </PressableScale>
                </Link>

                <Link href="/" asChild>
                  <PressableScale style={styles.ghostButton}>
                    <Text style={styles.ghostButtonText}>Retour à l’accueil</Text>
                  </PressableScale>
                </Link>
              </View>
            </View>
          )}

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
    pageHeader: {
      paddingHorizontal: 24,
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
      maxWidth: 580,
    },
    contextCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contextTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 14,
      marginBottom: 12,
    },
    contextTextBlock: {
      flex: 1,
    },
    contextLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 6,
    },
    contextTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 25,
      lineHeight: 31,
    },
    contextText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    timeBadge: {
      width: 66,
      height: 66,
      borderRadius: 33,
      backgroundColor: colors.turquoiseSoft,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    timeBadgeNumber: {
      color: colors.primary,
      fontSize: 25,
      lineHeight: 29,
      fontWeight: "900",
    },
    timeBadgeText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    warningMiniBox: {
      marginTop: 12,
      backgroundColor: colors.warning,
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.warningBorder,
    },
    warningMiniText: {
      color: colors.warningText,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
    },
    progressBox: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    progressTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 4,
    },
    progressLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    progressTime: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "900",
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressTitle: {
      fontFamily: "Georgia",
      fontSize: 24,
      lineHeight: 30,
      color: colors.primary,
      marginBottom: 12,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.cardWarm,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    card: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 22,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    stepCircleText: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 23,
    },
    doneCircle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.turquoiseSoft,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    doneCircleText: {
      color: colors.primary,
      fontSize: 28,
      fontWeight: "900",
      lineHeight: 32,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 30,
      lineHeight: 36,
      color: colors.primary,
      marginBottom: 10,
    },
    sectionText: {
      color: colors.textSoft,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "700",
      marginBottom: 18,
    },
    detailBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 20,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    detailTitle: {
      color: colors.primary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "900",
      marginBottom: 5,
    },
    detailText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    levelsCard: {
      marginHorizontal: 24,
      backgroundColor: colors.backgroundSoft,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    levelsTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 20,
      lineHeight: 26,
      marginBottom: 7,
    },
    levelsText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
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
      textAlign: "center",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
    doneInfoBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    doneInfoLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 5,
    },
    doneInfoText: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "900",
    },
    nextActionsList: {
      gap: 10,
    },
    secondaryButton: {
      backgroundColor: colors.cardWarm,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      gap: 8,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    secondaryButtonArrow: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 18,
    },
    ghostButton: {
      backgroundColor: "transparent",
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    ghostButtonText: {
      color: colors.textSoft,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
  });
}
