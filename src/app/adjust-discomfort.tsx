import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import BottomNav from "../components/BottomNav";
import PressableScale from "../components/PressableScale";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  addErgonomicEvent,
  getCurrentWorkstation,
  getErgonomicProfile,
  getTargetedChecksForZone,
} from "../lib/ergonomicSystem";

const zones = [
  "Cou",
  "Maux de tête",
  "Dos",
  "Épaules",
  "Bras",
  "Coude",
  "Poignets",
  "Doigts",
  "Bassin",
  "Jambes",
  "Pieds",
];

const activities = [
  "Ordinateur",
  "Téléphone",
  "Debout",
  "Manutention",
  "Conduite",
  "Études / lecture",
  "Autre",
];

const answerOptions = ["Oui", "Non", "Je ne sais pas"];

export default function AdjustDiscomfortScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const profile = getErgonomicProfile();
  const currentWorkstation = getCurrentWorkstation();

  const [step, setStep] = useState(0);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [selectedActivity, setSelectedActivity] = useState("Ordinateur");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const targetedChecks = getCombinedTargetedChecks(selectedZones);
  const selectedZonesText =
    selectedZones.length > 0 ? selectedZones.join(", ") : "Non précisé";
  const progressPercent = `${((step + 1) / 4) * 100}%` as `${number}%`;

  const canContinueFromZone = selectedZones.length > 0;

  function handleToggleZone(zone: string) {
    setSelectedZones((currentZones) => {
      if (currentZones.includes(zone)) {
        return currentZones.filter((currentZone) => currentZone !== zone);
      }

      return [...currentZones, zone];
    });
  }

  function handleSelectAnswer(check: string, answer: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [check]: answer,
    }));
  }

  function handleNext() {
    setStep((currentStep) => Math.min(currentStep + 1, 3));
  }

  function handleBack() {
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  }

  function handleSaveAdjustment() {
    const answersText = targetedChecks
      .map((check) => `${check} : ${answers[check] ?? "Non répondu"}`)
      .join(" · ");

    selectedZones.forEach((zone) => {
      addErgonomicEvent({
        type: "discomfort",
        workstationId: currentWorkstation?.id ?? "",
        workstationName: currentWorkstation?.name ?? "Poste non défini",
        zone,
        activity: selectedActivity,
        action: `Inconfort signalé : ${zone}`,
        note: `Activité : ${selectedActivity} · Vérifications : ${answersText}`,
      });
    });

    addErgonomicEvent({
      type: "adjustment",
      workstationId: currentWorkstation?.id ?? "",
      workstationName: currentWorkstation?.name ?? "Poste non défini",
      zone: selectedZonesText,
      activity: selectedActivity,
      action: `Ajustement guidé pour ${selectedZonesText}`,
      note: `Activité : ${selectedActivity} · Vérifications ciblées : ${targetedChecks.join(
        ", "
      )}`,
    });

    setCompleted(true);
  }

  function handleRestart() {
    setStep(0);
    setSelectedZones([]);
    setSelectedActivity("Ordinateur");
    setAnswers({});
    setCompleted(false);
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Ajuster</Text>
            </View>

            <Text style={styles.pageTitle}>J’ai un inconfort</Text>

            <Text style={styles.subtitle}>
              ErgoPrevent vous guide avec quelques vérifications ciblées selon
              les zones ressenties, votre poste et votre profil ergonomique.
            </Text>
          </View>

          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Poste utilisé</Text>
            <Text style={styles.contextTitle}>
              {currentWorkstation?.name ?? "Aucun poste enregistré"}
            </Text>

            <Text style={styles.contextText}>
              {currentWorkstation
                ? "Les vérifications seront enregistrées dans la mémoire de ce poste."
                : "Vous pouvez quand même faire un ajustement. Il sera enregistré comme poste non défini."}
            </Text>

            <View style={styles.contextPillsRow}>
              <View style={styles.contextPill}>
                <Text style={styles.contextPillText}>
                  {profile ? "Profil ergonomique ✓" : "Profil à compléter"}
                </Text>
              </View>

              <View style={styles.contextPill}>
                <Text style={styles.contextPillText}>
                  {currentWorkstation ? "Poste ✓" : "Poste non défini"}
                </Text>
              </View>
            </View>
          </View>

          {!completed && (
            <View style={styles.progressBox}>
              <Text style={styles.progressLabel}>Étape {step + 1}/4</Text>
              <Text style={styles.progressTitle}>
                {step === 0
                  ? "Zones d’inconfort"
                  : step === 1
                    ? "Activité"
                    : step === 2
                      ? "Vérifications ciblées"
                      : "Action immédiate"}
              </Text>

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
          )}

          {!completed && step === 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Où ressentez-vous un inconfort ?
              </Text>

              <Text style={styles.sectionText}>
                Choisissez une ou plusieurs zones. L’application ne pose pas de
                diagnostic : elle vous aide seulement à vérifier les causes
                ergonomiques simples.
              </Text>

              <View style={styles.optionsContainer}>
                {zones.map((zone) => {
                  const selected = selectedZones.includes(zone);

                  return (
                    <PressableScale
                      key={zone}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => handleToggleZone(zone)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {zone}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <View style={styles.selectedZonesBox}>
                <Text style={styles.selectedZonesText}>
                  {selectedZones.length === 0
                    ? "Aucune zone sélectionnée"
                    : `${selectedZones.length} zone${
                        selectedZones.length > 1 ? "s" : ""
                      } sélectionnée${
                        selectedZones.length > 1 ? "s" : ""
                      } : ${selectedZonesText}`}
                </Text>
              </View>
            </View>
          )}

          {!completed && step === 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Que faisiez-vous principalement ?
              </Text>

              <Text style={styles.sectionText}>
                Cette information permet de relier l’inconfort à une situation
                de travail précise.
              </Text>

              <View style={styles.optionsContainer}>
                {activities.map((activity) => {
                  const selected = selectedActivity === activity;

                  return (
                    <PressableScale
                      key={activity}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => setSelectedActivity(activity)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {activity}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          )}

          {!completed && step === 2 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                Vérifications simples à faire
              </Text>

              <Text style={styles.sectionText}>
                Pour {selectedZonesText.toLowerCase()}, ErgoPrevent vous
                propose de vérifier seulement les éléments les plus pertinents.
              </Text>

              {targetedChecks.map((check) => (
                <View key={check} style={styles.checkCard}>
                  <Text style={styles.checkTitle}>{check}</Text>

                  <Text style={styles.checkText}>
                    {getCheckInstruction(check, selectedZonesText)}
                  </Text>

                  <View style={styles.answerRow}>
                    {answerOptions.map((answer) => {
                      const selected = answers[check] === answer;

                      return (
                        <PressableScale
                          key={answer}
                          style={[
                            styles.answerButton,
                            selected ? styles.answerButtonSelected : null,
                          ]}
                          onPress={() => handleSelectAnswer(check, answer)}
                        >
                          <Text
                            style={[
                              styles.answerText,
                              selected ? styles.answerTextSelected : null,
                            ]}
                          >
                            {answer}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}

          {!completed && step === 3 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Action immédiate</Text>

              <Text style={styles.sectionText}>
                Commencez par une action courte, sans forcer. Ensuite, vous
                pourrez revérifier le poste si l’inconfort revient souvent.
              </Text>

              <View style={styles.actionBox}>
                <Text style={styles.actionTitle}>
                  {getImmediateActionTitleForZones(selectedZones)}
                </Text>

                <Text style={styles.actionText}>
                  {getImmediateActionTextForZones(selectedZones)}
                </Text>
              </View>

              <View style={styles.recapBox}>
                <Text style={styles.recapTitle}>Résumé</Text>

                <Text style={styles.recapText}>Zones : {selectedZonesText}</Text>
                <Text style={styles.recapText}>
                  Activité : {selectedActivity}
                </Text>
                <Text style={styles.recapText}>
                  Poste : {currentWorkstation?.name ?? "Poste non défini"}
                </Text>
                <Text style={styles.recapText}>
                  Vérifications : {targetedChecks.join(", ")}
                </Text>
              </View>

              <PressableScale
                style={styles.primaryButton}
                onPress={handleSaveAdjustment}
              >
                <Text style={styles.primaryButtonText}>
                  Enregistrer l’ajustement
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>
            </View>
          )}

          {completed && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Ajustement enregistré</Text>

              <Text style={styles.sectionText}>
                L’inconfort, le poste, l’activité et les vérifications ont été
                ajoutés à votre historique ergonomique.
              </Text>

              <View style={styles.successBox}>
                <Text style={styles.successTitle}>Ce qui a été enregistré</Text>
                <Text style={styles.successText}>Zones : {selectedZonesText}</Text>
                <Text style={styles.successText}>
                  Activité : {selectedActivity}
                </Text>
                <Text style={styles.successText}>
                  Poste : {currentWorkstation?.name ?? "Poste non défini"}
                </Text>
              </View>

              <View style={styles.nextActionsList}>
                <PressableScale
                  style={styles.nextActionPrimaryButton}
                  onPress={handleRestart}
                >
                  <Text style={styles.nextActionPrimaryButtonText}>
                    Signaler un autre inconfort
                  </Text>
                  <Text style={styles.nextActionPrimaryArrow}>→</Text>
                </PressableScale>

                <Link href="/ergonomic-reset" asChild>
                  <PressableScale style={styles.nextActionSecondaryButton}>
                    <Text style={styles.nextActionSecondaryButtonText}>
                      Faire un reset
                    </Text>
                    <Text style={styles.nextActionSecondaryArrow}>→</Text>
                  </PressableScale>
                </Link>

                <Link href="/workstations" asChild>
                  <PressableScale style={styles.nextActionSecondaryButton}>
                    <Text style={styles.nextActionSecondaryButtonText}>
                      Voir mes postes
                    </Text>
                    <Text style={styles.nextActionSecondaryArrow}>→</Text>
                  </PressableScale>
                </Link>

                <Link href="/" asChild>
                  <PressableScale style={styles.nextActionGhostButton}>
                    <Text style={styles.nextActionGhostButtonText}>
                      Retour à l’accueil
                    </Text>
                  </PressableScale>
                </Link>
              </View>
            </View>
          )}

          {!completed && (
            <View style={styles.buttonsRow}>
              {step > 0 && (
                <PressableScale
                  style={styles.secondaryButton}
                  onPress={handleBack}
                >
                  <Text style={styles.secondaryButtonText}>Retour</Text>
                </PressableScale>
              )}

              {step < 3 && (
                <PressableScale
                  style={[
                    styles.primaryButton,
                    step === 0 && !canContinueFromZone
                      ? styles.disabledButton
                      : null,
                  ]}
                  onPress={handleNext}
                  disabled={step === 0 && !canContinueFromZone}
                >
                  <Text style={styles.primaryButtonText}>Continuer</Text>
                  <Text style={styles.primaryButtonArrow}>→</Text>
                </PressableScale>
              )}
            </View>
          )}

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Avertissement santé</Text>
            <Text style={styles.warningText}>
              Cette page aide à vérifier des facteurs ergonomiques simples. Elle
              ne remplace pas un professionnel de la santé. Si la douleur est
              forte, persistante, inhabituelle ou inquiétante, consultez.
            </Text>
          </View>

          <BottomNav />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function getCombinedTargetedChecks(selectedZones: string[]) {
  const combinedChecks = selectedZones.flatMap((zone) =>
    getTargetedChecksForZone(zone)
  );

  return Array.from(new Set(combinedChecks));
}

function getImmediateActionTitleForZones(selectedZones: string[]) {
  if (selectedZones.length > 1) {
    return "Reset ciblé des zones sélectionnées";
  }

  return getImmediateActionTitle(selectedZones[0] ?? "");
}

function getImmediateActionTextForZones(selectedZones: string[]) {
  if (selectedZones.length > 1) {
    return "Commencez par relâcher les épaules, changer de position, regarder au loin, puis vérifiez les éléments ciblés pour les zones sélectionnées.";
  }

  return getImmediateActionText(selectedZones[0] ?? "");
}

function getCheckInstruction(check: string, zone: string) {
  if (check === "Écran") {
    return "Vérifiez que l’écran est devant vous, à une hauteur confortable, sans relever le menton.";
  }

  if (check === "Dossier") {
    return "Vérifiez si vous êtes appuyé confortablement et si le dossier ne vous force pas dans une position figée.";
  }

  if (check === "Accoudoirs") {
    return "Vérifiez que les épaules restent relâchées et que les accoudoirs ne les poussent pas vers le haut.";
  }

  if (check === "Distance de travail") {
    return "Vérifiez que vous n’êtes pas trop avancé vers l’écran ou trop éloigné du clavier.";
  }

  if (check === "Souris") {
    return "Vérifiez que la souris reste proche du clavier, sans devoir éloigner le bras.";
  }

  if (check === "Clavier") {
    return "Vérifiez que les poignets restent neutres et que le clavier n’est pas trop loin.";
  }

  if (check === "Appui des avant-bras") {
    return "Vérifiez que les avant-bras peuvent être soutenus sans hausser les épaules.";
  }

  if (check === "Hauteur du bureau") {
    return "Vérifiez si le bureau vous force à lever les épaules ou à casser les poignets.";
  }

  if (check === "Chaise") {
    return "Vérifiez que vous êtes stable, avec les pieds soutenus et les cuisses confortables.";
  }

  if (check === "Support lombaire") {
    return "Vérifiez que le soutien se place dans la région lombaire sans pression excessive.";
  }

  if (check === "Hauteur d’assise") {
    return "Vérifiez que les pieds sont bien soutenus et que l’assise n’est ni trop haute ni trop basse.";
  }

  if (check === "Appui des pieds") {
    return "Vérifiez que les pieds reposent au sol ou sur un appui stable.";
  }

  if (check === "Profondeur d’assise") {
    return "Vérifiez qu’il reste un petit espace confortable derrière les genoux.";
  }

  return `Vérifiez cet élément en lien avec la zone : ${zone}.`;
}

function getImmediateActionTitle(zone: string) {
  if (zone === "Cou" || zone === "Maux de tête") {
    return "Reset cervical de 90 secondes";
  }

  if (zone === "Épaules" || zone === "Bras") {
    return "Relâchement épaules et bras";
  }

  if (zone === "Poignets" || zone === "Doigts" || zone === "Coude") {
    return "Pause mains et poignets";
  }

  if (zone === "Dos" || zone === "Bassin") {
    return "Reset dos et posture";
  }

  if (zone === "Jambes" || zone === "Pieds") {
    return "Pause debout et appuis";
  }

  return "Reset ergonomique court";
}

function getImmediateActionText(zone: string) {
  if (zone === "Cou" || zone === "Maux de tête") {
    return "Relâchez les épaules, rentrez légèrement le menton sans forcer, regardez au loin, puis changez doucement de position.";
  }

  if (zone === "Épaules" || zone === "Bras") {
    return "Relâchez les épaules, faites trois mouvements lents vers l’arrière, puis rapprochez les outils de travail.";
  }

  if (zone === "Poignets" || zone === "Doigts" || zone === "Coude") {
    return "Relâchez les mains, ouvrez et fermez doucement les doigts, puis vérifiez la distance du clavier et de la souris.";
  }

  if (zone === "Dos" || zone === "Bassin") {
    return "Changez d’appui, repositionnez le bassin, vérifiez le dossier et le soutien lombaire.";
  }

  if (zone === "Jambes" || zone === "Pieds") {
    return "Levez-vous quelques instants, vérifiez l’appui des pieds et la hauteur d’assise.";
  }

  return "Changez de position, respirez, relâchez les épaules et bougez quelques instants.";
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
      marginBottom: 20,
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
      color: colors.textSoft,
      fontSize: 16,
      lineHeight: 24,
      maxWidth: 560,
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
      fontSize: 27,
      lineHeight: 33,
      color: colors.primary,
      marginBottom: 8,
    },
    contextText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 14,
    },
    contextPillsRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    contextPill: {
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    contextPillText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "900",
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
    progressLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 4,
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
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 28,
      lineHeight: 35,
      color: colors.primary,
      marginBottom: 8,
    },
    sectionText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: "700",
      marginBottom: 14,
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
    selectedZonesBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 4,
    },
    selectedZonesText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "800",
      textAlign: "center",
    },
    checkCard: {
      backgroundColor: colors.cardWarm,
      borderRadius: 22,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    checkTitle: {
      fontFamily: "Georgia",
      fontSize: 21,
      lineHeight: 27,
      color: colors.primary,
      marginBottom: 6,
    },
    checkText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 12,
    },
    answerRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    answerButton: {
      flexGrow: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: "center",
    },
    answerButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    answerText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center",
    },
    answerTextSelected: {
      color: colors.black,
    },
    actionBox: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    actionTitle: {
      fontFamily: "Georgia",
      fontSize: 22,
      lineHeight: 28,
      color: colors.primary,
      marginBottom: 8,
    },
    actionText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    recapBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
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
    successBox: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    successTitle: {
      fontFamily: "Georgia",
      fontSize: 20,
      lineHeight: 26,
      color: colors.primary,
      marginBottom: 8,
    },
    successText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "800",
    },
    nextActionsList: {
      gap: 10,
    },
    nextActionPrimaryButton: {
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
    nextActionPrimaryButtonText: {
      color: colors.black,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
    },
    nextActionPrimaryArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
    nextActionSecondaryButton: {
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
    nextActionSecondaryButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    nextActionSecondaryArrow: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 18,
    },
    nextActionGhostButton: {
      backgroundColor: "transparent",
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    nextActionGhostButtonText: {
      color: colors.textSoft,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
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
    warningBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 16,
    },
    warningTitle: {
      fontFamily: "Georgia",
      fontSize: 20,
      lineHeight: 26,
      color: colors.warningText,
      marginBottom: 8,
    },
    warningText: {
      color: colors.warningText,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
  });
}
