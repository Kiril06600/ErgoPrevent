import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";
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
    text: "Relâchez le dossier et repositionnez-vous confortablement.",
  },
  {
    title: "Regard",
    text: "Regardez au loin pendant quelques secondes pour relâcher vos yeux.",
  },
  {
    title: "Épaules",
    text: "Relâchez les épaules et réalisez 3 mouvements lents.",
  },
  {
    title: "Poignets",
    text: "Relâchez les mains, ouvrez et fermez doucement les doigts.",
  },
  {
    title: "Bougez",
    text: "Levez-vous quelques instants ou changez simplement d’appui.",
  },
];

export default function ErgonomicResetScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentStep = resetSteps[step];
  const currentWorkstation = getCurrentWorkstation();

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
              Pour bouger, relâcher les tensions et reprendre votre travail dans
              une position plus confortable.
            </Text>
          </View>

          {!completed ? (
            <View style={styles.card}>
              <Text style={styles.stepLabel}>
                {step + 1}/{resetSteps.length}
              </Text>

              <Text style={styles.sectionTitle}>{currentStep.title}</Text>
              <Text style={styles.sectionText}>{currentStep.text}</Text>

              <PressableScale style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>
                  {step < resetSteps.length - 1 ? "Continuer" : "Terminer le reset"}
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Reset terminé</Text>
              <Text style={styles.sectionText}>
                Reprenez votre travail. Ce reset a été ajouté à votre historique
                ergonomique.
              </Text>

              <PressableScale style={styles.primaryButton} onPress={handleRestart}>
                <Text style={styles.primaryButtonText}>Refaire un reset</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>
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
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSoft,
      maxWidth: 560,
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
    stepLabel: {
      color: colors.textMuted,
      fontSize: 13,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 10,
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
  });
}