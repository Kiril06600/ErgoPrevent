import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import BottomNav from "../components/BottomNav";
import PressableScale from "../components/PressableScale";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  DominantEye,
  DominantHand,
  ErgonomicProfile,
  ProgressiveLenses,
  getErgonomicProfile,
  getReferenceSettings,
  saveErgonomicProfile,
} from "../lib/ergonomicSystem";

const dominantHandOptions: DominantHand[] = ["Droite", "Gauche", "Ambidextre"];

const dominantEyeOptions: DominantEye[] = [
  "Droit",
  "Gauche",
  "Je ne sais pas",
];

const progressiveLensesOptions: ProgressiveLenses[] = [
  "Oui",
  "Non",
  "Je ne sais pas",
];

export default function ErgonomicProfileScreen() {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const savedProfile = getErgonomicProfile();

  const [heightCm, setHeightCm] = useState(savedProfile?.heightCm ?? "");
  const [poplitealHeightCm, setPoplitealHeightCm] = useState(
    savedProfile?.poplitealHeightCm ?? ""
  );
  const [seatedElbowHeightCm, setSeatedElbowHeightCm] = useState(
    savedProfile?.seatedElbowHeightCm ?? ""
  );
  const [dominantHand, setDominantHand] = useState<DominantHand>(
    savedProfile?.dominantHand ?? ""
  );
  const [dominantEye, setDominantEye] = useState<DominantEye>(
    savedProfile?.dominantEye ?? ""
  );
  const [progressiveLenses, setProgressiveLenses] =
    useState<ProgressiveLenses>(savedProfile?.progressiveLenses ?? "");

  const [message, setMessage] = useState("");

  const currentProfile: ErgonomicProfile = {
    heightCm,
    poplitealHeightCm,
    seatedElbowHeightCm,
    dominantHand,
    dominantEye,
    progressiveLenses,
    updatedAt: new Date().toISOString(),
  };

  const references = getReferenceSettings(currentProfile);

  const profileFields = [
    {
      label: "Taille",
      value: heightCm,
    },
    {
      label: "Hauteur poplitée",
      value: poplitealHeightCm,
    },
    {
      label: "Coudes assis",
      value: seatedElbowHeightCm,
    },
    {
      label: "Main dominante",
      value: dominantHand,
    },
    {
      label: "Œil dominant",
      value: dominantEye,
    },
    {
      label: "Verres progressifs",
      value: progressiveLenses,
    },
  ];

  const completedFieldsCount = profileFields.filter(
    (field) => field.value.trim().length > 0
  ).length;

  const completionText = `${completedFieldsCount}/${profileFields.length} informations`;

  const profileStatus =
    completedFieldsCount === profileFields.length
      ? "Profil complet"
      : "Profil à compléter";

  const profileStatusText =
    completedFieldsCount === profileFields.length
      ? "Vos données principales sont prêtes à être utilisées dans les réglages de référence et les autres outils ergonomiques."
      : "Ajoutez les informations manquantes pour rendre les réglages de référence plus utiles.";

  function handleSaveProfile() {
    saveErgonomicProfile(currentProfile);
    setMessage("Profil ergonomique sauvegardé");
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Profil ergonomique</Text>
            </View>

            <Text style={styles.pageTitle}>Mon profil ergonomique</Text>

            <Text style={styles.subtitle}>
              Entrez vos mesures une seule fois. ErgoPrevent les garde en
              mémoire pour guider les réglages, l’installation des postes et les
              vérifications ergonomiques.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroLabel}>Base de l’application</Text>
                <Text style={styles.heroTitle}>
                  Votre profil devient la référence de départ.
                </Text>
              </View>

              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeNumber}>{completedFieldsCount}</Text>
                <Text style={styles.heroBadgeText}>sur 6</Text>
              </View>
            </View>

            <Text style={styles.heroText}>
              Ces informations ne servent pas à poser un diagnostic. Elles
              servent à personnaliser les consignes simples : hauteur d’assise,
              hauteur du bureau, accoudoirs, distance de l’écran et confort
              visuel.
            </Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusHeaderRow}>
              <View>
                <Text style={styles.statusLabel}>État du profil</Text>
                <Text style={styles.statusTitle}>{profileStatus}</Text>
              </View>

              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{completionText}</Text>
              </View>
            </View>

            <View style={styles.completionDotsRow}>
              {profileFields.map((field, index) => (
                <View
                  key={field.label}
                  style={[
                    styles.completionDot,
                    index < completedFieldsCount
                      ? styles.completionDotDone
                      : null,
                  ]}
                />
              ))}
            </View>

            <Text style={styles.statusText}>{profileStatusText}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mensurations</Text>

            <Text style={styles.sectionText}>
              Ces mesures sont entrées manuellement. Elles n’ont pas besoin
              d’être parfaites au millimètre : l’objectif est d’avoir une bonne
              référence pratique.
            </Text>

            <Text style={styles.label}>Taille</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. 178"
              placeholderTextColor={colors.textMuted}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
            />

            <Text style={styles.helpText}>
              Votre taille générale. Elle sert surtout à garder une fiche
              personnelle complète.
            </Text>

            <Text style={styles.label}>Hauteur poplitée</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. 45"
              placeholderTextColor={colors.textMuted}
              value={poplitealHeightCm}
              onChangeText={setPoplitealHeightCm}
              keyboardType="numeric"
            />

            <Text style={styles.helpText}>
              C’est la hauteur approximative du sol jusqu’à l’arrière du genou
              en position assise. Elle aide à proposer une plage de hauteur
              d’assise.
            </Text>

            <Text style={styles.label}>Hauteur des coudes assis</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. 69"
              placeholderTextColor={colors.textMuted}
              value={seatedElbowHeightCm}
              onChangeText={setSeatedElbowHeightCm}
              keyboardType="numeric"
            />

            <Text style={styles.helpText}>
              C’est la hauteur approximative du sol jusqu’au coude lorsque vous
              êtes assis confortablement. Elle aide à proposer une référence
              pour le bureau et les accoudoirs.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Caractéristiques personnelles</Text>

            <Text style={styles.sectionText}>
              Ces informations permettent d’adapter certaines consignes sans
              ajouter de questions inutiles plus tard.
            </Text>

            <Text style={styles.label}>Main dominante</Text>
            <View style={styles.optionsContainer}>
              {dominantHandOptions.map((item) => {
                const selected = dominantHand === item;

                return (
                  <PressableScale
                    key={item}
                    style={[
                      styles.optionButton,
                      selected ? styles.optionButtonSelected : null,
                    ]}
                    onPress={() => setDominantHand(item)}
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

            <Text style={styles.label}>Œil dominant</Text>
            <View style={styles.optionsContainer}>
              {dominantEyeOptions.map((item) => {
                const selected = dominantEye === item;

                return (
                  <PressableScale
                    key={item}
                    style={[
                      styles.optionButton,
                      selected ? styles.optionButtonSelected : null,
                    ]}
                    onPress={() => setDominantEye(item)}
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

            <Text style={styles.label}>Verres à foyers progressifs</Text>
            <View style={styles.optionsContainer}>
              {progressiveLensesOptions.map((item) => {
                const selected = progressiveLenses === item;

                return (
                  <PressableScale
                    key={item}
                    style={[
                      styles.optionButton,
                      selected ? styles.optionButtonSelected : null,
                    ]}
                    onPress={() => setProgressiveLenses(item)}
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

            <PressableScale style={styles.primaryButton} onPress={handleSaveProfile}>
              <Text style={styles.primaryButtonText}>Sauvegarder mon profil</Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </PressableScale>

            {message.length > 0 && (
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{message}</Text>
              </View>
            )}
          </View>

          <View style={styles.referenceCard}>
            <Text style={styles.sectionTitle}>Réglages de référence</Text>

            <Text style={styles.sectionText}>
              Ces valeurs ne sont pas des règles médicales. Elles servent de
              repères de départ pour installer ou revérifier un poste.
            </Text>

            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Assise</Text>
              <Text style={styles.referenceValue}>
                {references.seatHeightRange}
              </Text>
            </View>

            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Bureau</Text>
              <Text style={styles.referenceValue}>
                {references.deskHeightRange}
              </Text>
            </View>

            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Accoudoirs</Text>
              <Text style={styles.referenceValue}>
                {references.armrestReference}
              </Text>
            </View>

            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Écran</Text>
              <Text style={styles.referenceValue}>
                {references.screenDistanceRange}
              </Text>
            </View>

            <Text style={styles.referenceAdvice}>
              {references.screenHeightAdvice}
            </Text>
          </View>

          <View style={styles.connectedCard}>
            <Text style={styles.sectionTitle}>Ce profil servira ensuite à</Text>

            <View style={styles.connectedList}>
              <Link href="/install-workstation" asChild>
                <PressableScale style={styles.connectedRow}>
                  <View style={styles.connectedNumber}>
                    <Text style={styles.connectedNumberText}>1</Text>
                  </View>

                  <View style={styles.connectedTextBlock}>
                    <Text style={styles.connectedTitle}>Installer un poste</Text>
                    <Text style={styles.connectedText}>
                      Utiliser vos mesures comme repères pendant l’intervention
                      guidée.
                    </Text>
                  </View>

                  <Text style={styles.connectedArrow}>→</Text>
                </PressableScale>
              </Link>

              <Link href="/workstations" asChild>
                <PressableScale style={styles.connectedRow}>
                  <View style={styles.connectedNumber}>
                    <Text style={styles.connectedNumberText}>2</Text>
                  </View>

                  <View style={styles.connectedTextBlock}>
                    <Text style={styles.connectedTitle}>Mémoriser vos postes</Text>
                    <Text style={styles.connectedText}>
                      Garder les réglages de chaque espace : travail, maison,
                      université ou autre.
                    </Text>
                  </View>

                  <Text style={styles.connectedArrow}>→</Text>
                </PressableScale>
              </Link>

              <Link href="/ergonomic-reset" asChild>
                <PressableScale style={styles.connectedRow}>
                  <View style={styles.connectedNumber}>
                    <Text style={styles.connectedNumberText}>3</Text>
                  </View>

                  <View style={styles.connectedTextBlock}>
                    <Text style={styles.connectedTitle}>Faire un reset</Text>
                    <Text style={styles.connectedText}>
                      Repartir d’une posture plus confortable pendant la journée.
                    </Text>
                  </View>

                  <Text style={styles.connectedArrow}>→</Text>
                </PressableScale>
              </Link>

              <Link href="/adjust-discomfort" asChild>
                <PressableScale style={styles.connectedRow}>
                  <View style={styles.connectedNumber}>
                    <Text style={styles.connectedNumberText}>4</Text>
                  </View>

                  <View style={styles.connectedTextBlock}>
                    <Text style={styles.connectedTitle}>Ajuster un inconfort</Text>
                    <Text style={styles.connectedText}>
                      Vérifier seulement les éléments pertinents quand quelque
                      chose gêne.
                    </Text>
                  </View>

                  <Text style={styles.connectedArrow}>→</Text>
                </PressableScale>
              </Link>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Important</Text>
            <Text style={styles.infoText}>
              Les mesures sont entrées ou vérifiées par l’utilisateur.
              ErgoPrevent n’utilise pas la caméra, l’AR, le gyroscope,
              l’inclinomètre ou le téléphone comme outil de mesure.
            </Text>
          </View>

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
      maxWidth: 620,
    },
    heroCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 34,
      padding: 22,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 16,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 8,
    },
    heroTitle: {
      fontFamily: "Georgia",
      fontSize: 31,
      lineHeight: 38,
      color: colors.primary,
      letterSpacing: -0.6,
    },
    heroText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: "700",
    },
    heroBadge: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.turquoiseSoft,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    heroBadgeNumber: {
      color: colors.primary,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
    },
    heroBadgeText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
    },
    statusCard: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 28,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statusHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    statusLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 5,
    },
    statusTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 24,
      lineHeight: 30,
    },
    statusPill: {
      backgroundColor: colors.card,
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
    completionDotsRow: {
      flexDirection: "row",
      gap: 7,
      marginBottom: 13,
    },
    completionDot: {
      flex: 1,
      height: 8,
      borderRadius: 999,
      backgroundColor: colors.cardWarm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    completionDotDone: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    statusText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
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
    referenceCard: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    connectedCard: {
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
      fontSize: 25,
      lineHeight: 31,
      color: colors.primary,
      marginBottom: 10,
    },
    sectionText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 12,
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
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.cardWarm,
      marginBottom: 8,
    },
    helpText: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
      marginBottom: 8,
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
    primaryButton: {
      marginTop: 8,
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
    messageBox: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 14,
    },
    messageText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    referenceRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 13,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    referenceLabel: {
      color: colors.textSoft,
      fontSize: 14,
      fontWeight: "900",
    },
    referenceValue: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "right",
    },
    referenceAdvice: {
      marginTop: 10,
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    connectedList: {
      gap: 10,
    },
    connectedRow: {
      backgroundColor: colors.cardWarm,
      borderRadius: 22,
      paddingVertical: 13,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    connectedNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
    },
    connectedNumberText: {
      color: colors.black,
      fontSize: 14,
      fontWeight: "900",
    },
    connectedTextBlock: {
      flex: 1,
    },
    connectedTitle: {
      color: colors.primary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "900",
      marginBottom: 3,
    },
    connectedText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
    },
    connectedArrow: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "900",
      lineHeight: 22,
    },
    infoBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 16,
    },
    infoTitle: {
      fontFamily: "Georgia",
      fontSize: 20,
      lineHeight: 26,
      color: colors.warningText,
      marginBottom: 8,
    },
    infoText: {
      color: colors.warningText,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
  });
}
