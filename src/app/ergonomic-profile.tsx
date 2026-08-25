import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
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
const dominantEyeOptions: DominantEye[] = ["Droit", "Gauche", "Je ne sais pas"];
const progressiveLensesOptions: ProgressiveLenses[] = ["Oui", "Non", "Je ne sais pas"];

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
              Entrez vos mesures une seule fois. Elles seront ensuite utilisées
              pour installer, ajuster et vérifier vos postes.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mensurations</Text>

            <Text style={styles.label}>Taille</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex. 178"
              placeholderTextColor={colors.textMuted}
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
            />

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
              en position assise.
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
              êtes assis confortablement.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Caractéristiques personnelles</Text>

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
              <Text style={styles.primaryButtonText}>Sauvegarder</Text>
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

            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Assise</Text>
              <Text style={styles.referenceValue}>{references.seatHeightRange}</Text>
            </View>

            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Bureau</Text>
              <Text style={styles.referenceValue}>{references.deskHeightRange}</Text>
            </View>

            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Accoudoirs</Text>
              <Text style={styles.referenceValue}>{references.armrestReference}</Text>
            </View>

            <View style={styles.referenceRow}>
              <Text style={styles.referenceLabel}>Écran</Text>
              <Text style={styles.referenceValue}>
                {references.screenDistanceRange}
              </Text>
            </View>

            <Text style={styles.referenceAdvice}>{references.screenHeightAdvice}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Important</Text>
            <Text style={styles.infoText}>
              Les mesures sont entrées manuellement. ErgoPrevent n’utilise pas la
              caméra, l’AR, le gyroscope, l’inclinomètre ou le téléphone comme
              outil de mesure.
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
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 25,
      lineHeight: 31,
      color: colors.primary,
      marginBottom: 14,
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