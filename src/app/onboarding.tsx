import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import PressableScale from "../components/PressableScale";
import AppLogo from "../components/AppLogo";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import { getAppStats, saveUserProfile } from "../lib/storage";
import {
  completeOnboarding,
  getOnboardingData,
  OnboardingData,
} from "../lib/onboarding";

const statuses = ["Étudiant", "Travailleur", "Télétravailleur", "Autre"];

const goals = [
  "Prévenir les douleurs",
  "Réduire les tensions actuelles",
  "Améliorer mon poste de travail",
  "Faire plus de pauses",
  "Bouger davantage",
];

const workContexts = [
  "Bureau",
  "Télétravail",
  "Hybride",
  "Études",
  "Travail physique",
  "Autre",
];

const priorities = [
  "Douleurs au cou ou au dos",
  "Tensions aux épaules",
  "Poignets ou mains",
  "Fatigue visuelle",
  "Manque de pauses",
  "Je ne sais pas encore",
];

function getInitialPriorities(savedPriority?: string) {
  if (!savedPriority) {
    return ["Je ne sais pas encore"];
  }

  const parsedPriorities = savedPriority
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (parsedPriorities.length === 0) {
    return ["Je ne sais pas encore"];
  }

  return parsedPriorities;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const stats = getAppStats();
  const savedProfile = stats.profile;
  const savedOnboarding = getOnboardingData();

  const [step, setStep] = useState(1);

  const [firstName, setFirstName] = useState(
    savedProfile?.firstName ?? savedOnboarding?.firstName ?? ""
  );
  const [status, setStatus] = useState(
    savedProfile?.status ?? savedOnboarding?.status ?? "Étudiant"
  );
  const [profession, setProfession] = useState(
    savedProfile?.profession ?? savedOnboarding?.profession ?? ""
  );
  const [mainGoal, setMainGoal] = useState(
    savedProfile?.mainGoal ??
      savedOnboarding?.mainGoal ??
      "Prévenir les douleurs"
  );
  const [workContext, setWorkContext] = useState(
    savedOnboarding?.workContext ?? "Bureau"
  );
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(
    getInitialPriorities(savedOnboarding?.priority)
  );

  const trimmedFirstName = firstName.trim();
  const canContinueStepOne = trimmedFirstName.length > 0;
  const selectedPrioritiesText = selectedPriorities.join(", ");

  function handleNextStep() {
    if (step === 1 && !canContinueStepOne) {
      return;
    }

    setStep((currentStep) => Math.min(currentStep + 1, 3));
  }

  function handlePreviousStep() {
    setStep((currentStep) => Math.max(currentStep - 1, 1));
  }

  function handleTogglePriority(priority: string) {
    if (priority === "Je ne sais pas encore") {
      setSelectedPriorities(["Je ne sais pas encore"]);
      return;
    }

    setSelectedPriorities((currentPriorities) => {
      const prioritiesWithoutUnknown = currentPriorities.filter(
        (item) => item !== "Je ne sais pas encore"
      );

      const alreadySelected = prioritiesWithoutUnknown.includes(priority);

      if (alreadySelected) {
        const updatedPriorities = prioritiesWithoutUnknown.filter(
          (item) => item !== priority
        );

        return updatedPriorities.length > 0
          ? updatedPriorities
          : ["Je ne sais pas encore"];
      }

      return [...prioritiesWithoutUnknown, priority];
    });
  }

  function handleFinishOnboarding() {
    const onboardingData: OnboardingData = {
      firstName: trimmedFirstName,
      status,
      profession,
      mainGoal,
      workContext,
      priority: selectedPrioritiesText,
      createdAt: new Date().toISOString(),
    };

    saveUserProfile({
      firstName: trimmedFirstName,
      status,
      profession,
      mainGoal,
    });

    completeOnboarding(onboardingData);
    router.replace("/explore");
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.logoArea}>
            <AppLogo height={82} />
          </View>

          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Bienvenue</Text>
            </View>

            <Text style={styles.pageTitle}>
              Créons votre espace ErgoPrevent.
            </Text>

            <Text style={styles.subtitle}>
              Répondez à quelques questions simples pour démarrer. Les questions
              plus détaillées resteront disponibles plus tard dans votre profil.
            </Text>
          </View>

          <View style={styles.progressRow}>
            {[1, 2, 3].map((item) => (
              <View
                key={item}
                style={[
                  styles.progressDot,
                  step >= item ? styles.progressDotActive : null,
                ]}
              />
            ))}
          </View>

          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.stepLabel}>Étape 1 sur 3</Text>
              <Text style={styles.sectionTitle}>Compte local</Text>
              <Text style={styles.sectionSubtitle}>
                Ce compte reste seulement sur cet appareil. Aucune donnée n’est
                envoyée vers une base externe.
              </Text>

              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. Cyril"
                placeholderTextColor={colors.textMuted}
                value={firstName}
                onChangeText={setFirstName}
              />

              <Text style={styles.label}>Statut</Text>
              <View style={styles.optionsContainer}>
                {statuses.map((item) => {
                  const selected = status === item;

                  return (
                    <PressableScale
                      key={item}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => setStatus(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <Text style={styles.label}>Profession ou domaine</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. médecine, ergonomie, bureau, informatique..."
                placeholderTextColor={colors.textMuted}
                value={profession}
                onChangeText={setProfession}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.stepLabel}>Étape 2 sur 3</Text>
              <Text style={styles.sectionTitle}>Questions de base</Text>
              <Text style={styles.sectionSubtitle}>
                Ces questions servent à personnaliser le premier parcours.
              </Text>

              <Text style={styles.label}>Contexte principal</Text>
              <View style={styles.optionsContainer}>
                {workContexts.map((item) => {
                  const selected = workContext === item;

                  return (
                    <PressableScale
                      key={item}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => setWorkContext(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <Text style={styles.label}>Priorités actuelles</Text>
              <Text style={styles.helperText}>
                Plusieurs choix sont possibles. Touchez une priorité pour
                l’ajouter ou la retirer.
              </Text>

              <View style={styles.selectedCountBox}>
                <Text style={styles.selectedCountText}>
                  {selectedPriorities.includes("Je ne sais pas encore")
                    ? "Aucune priorité précise sélectionnée"
                    : `${selectedPriorities.length} priorité${
                        selectedPriorities.length > 1 ? "s" : ""
                      } sélectionnée${
                        selectedPriorities.length > 1 ? "s" : ""
                      }`}
                </Text>
              </View>

              <View style={styles.optionsContainer}>
                {priorities.map((item) => {
                  const selected = selectedPriorities.includes(item);

                  return (
                    <PressableScale
                      key={item}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => handleTogglePriority(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {selected ? "✓ " : ""}
                        {item}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.stepLabel}>Étape 3 sur 3</Text>
              <Text style={styles.sectionTitle}>Objectif principal</Text>
              <Text style={styles.sectionSubtitle}>
                Choisissez ce que l’application doit vous aider à améliorer en
                premier.
              </Text>

              <Text style={styles.label}>Objectif</Text>
              <View style={styles.optionsContainer}>
                {goals.map((item) => {
                  const selected = mainGoal === item;

                  return (
                    <PressableScale
                      key={item}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => setMainGoal(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <View style={styles.recapBox}>
                <Text style={styles.recapTitle}>Votre départ</Text>

                <Text style={styles.recapText}>
                  {trimmedFirstName || "Utilisateur"} · {status}
                </Text>

                <Text style={styles.recapText}>Contexte : {workContext}</Text>

                <Text style={styles.recapText}>
                  Priorités : {selectedPrioritiesText}
                </Text>

                <Text style={styles.recapText}>Objectif : {mainGoal}</Text>
              </View>
            </View>
          )}

          <View style={styles.buttonsRow}>
            {step > 1 && (
              <PressableScale
                style={styles.secondaryButton}
                onPress={handlePreviousStep}
              >
                <Text style={styles.secondaryButtonText}>Retour</Text>
              </PressableScale>
            )}

            {step < 3 ? (
              <PressableScale
                style={[
                  styles.primaryButton,
                  step === 1 && !canContinueStepOne
                    ? styles.disabledButton
                    : null,
                ]}
                onPress={handleNextStep}
                disabled={step === 1 && !canContinueStepOne}
              >
                <Text style={styles.primaryButtonText}>Continuer</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>
            ) : (
              <PressableScale
                style={styles.primaryButton}
                onPress={handleFinishOnboarding}
              >
                <Text style={styles.primaryButtonText}>
                  Commencer à explorer
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>
            )}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Après cette étape</Text>
            <Text style={styles.infoText}>
              Vous arriverez sur la page Explorer. Ensuite, vous pourrez faire le
              questionnaire complet dans votre profil quand vous serez prêt.
            </Text>
          </View>
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
      paddingTop: 22,
      paddingBottom: 40,
    },
    logoArea: {
      paddingHorizontal: 24,
      marginBottom: 10,
    },
    pageHeader: {
      paddingHorizontal: 24,
      marginBottom: 18,
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
      maxWidth: 560,
    },
    progressRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 24,
      marginBottom: 18,
    },
    progressDot: {
      flex: 1,
      height: 7,
      borderRadius: 999,
      backgroundColor: colors.cardWarm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressDotActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    card: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 8,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 28,
      lineHeight: 35,
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 6,
    },
    sectionSubtitle: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSoft,
      marginBottom: 14,
      fontWeight: "600",
    },
    label: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.textSoft,
      marginBottom: 8,
      marginTop: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    helperText: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
      marginTop: -2,
      marginBottom: 10,
    },
    selectedCountBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 18,
      paddingVertical: 11,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    selectedCountText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "900",
      textAlign: "center",
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.cardWarm,
      marginBottom: 10,
    },
    optionsContainer: {
      gap: 8,
      marginBottom: 10,
    },
    optionButton: {
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      alignItems: "center",
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    optionText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    optionTextSelected: {
      color: colors.black,
    },
    recapBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 10,
    },
    recapTitle: {
      fontFamily: "Georgia",
      fontSize: 20,
      lineHeight: 26,
      color: colors.primary,
      marginBottom: 8,
    },
    recapText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "800",
    },
    buttonsRow: {
      paddingHorizontal: 24,
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    primaryButton: {
      flex: 1,
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
    disabledButton: {
      opacity: 0.45,
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
    secondaryButton: {
      flex: 1,
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
    },
    infoBox: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoTitle: {
      fontFamily: "Georgia",
      fontSize: 20,
      lineHeight: 26,
      color: colors.primary,
      marginBottom: 8,
    },
    infoText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
  });
}