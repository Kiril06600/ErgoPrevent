import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import {
  AppStats,
  getAppStats,
  saveUserProfile,
  resetAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { ThemeMode, useAppTheme } from "../theme/ThemeContext";

const statuses = ["Étudiant", "Travailleur", "Télétravailleur", "Autre"];

const goals = [
  "Prévenir les douleurs",
  "Réduire les tensions actuelles",
  "Améliorer mon poste de travail",
  "Faire plus de pauses",
  "Bouger davantage",
];

const CHECKIN_STORAGE_KEY = "ergoprevent_daily_checkins";
const ROUTINE_STORAGE_KEY = "ergoprevent_daily_routine";

function readLocalStorageValue(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function removeExtraLocalData() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CHECKIN_STORAGE_KEY);
  window.localStorage.removeItem(ROUTINE_STORAGE_KEY);
}

export default function ProfileScreen() {
  const initialStats = getAppStats();
  const savedProfile = initialStats.profile;

  const [stats, setStats] = useState<AppStats>(initialStats);
  const [firstName, setFirstName] = useState(savedProfile?.firstName ?? "");
  const [status, setStatus] = useState(savedProfile?.status ?? "Étudiant");
  const [profession, setProfession] = useState(savedProfile?.profession ?? "");
  const [mainGoal, setMainGoal] = useState(
    savedProfile?.mainGoal ?? "Prévenir les douleurs"
  );

  const [savedMessage, setSavedMessage] = useState("");
  const [showData, setShowData] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { colors, mode, setThemeMode } = useAppTheme();
  const styles = createStyles(colors);

  const questionnaireScore = stats.questionnaireResult?.score;
  const workstationScore = stats.workstationAuditResult?.score;

  const exportedData = JSON.stringify(
    {
      appStats: stats,
      checkins: readLocalStorageValue(CHECKIN_STORAGE_KEY),
      routine: readLocalStorageValue(ROUTINE_STORAGE_KEY),
      themeMode: mode,
    },
    null,
    2
  );

  function handleSaveProfile() {
    const updatedStats = saveUserProfile({
      firstName,
      status,
      profession,
      mainGoal,
    });

    setStats(updatedStats);
    setSavedMessage("Profil sauvegardé ✓");
    setShowResetConfirm(false);
  }

  function handleResetData() {
    const resetStats = resetAppStats();

    removeExtraLocalData();

    setStats(resetStats);
    setFirstName("");
    setStatus("Étudiant");
    setProfession("");
    setMainGoal("Prévenir les douleurs");
    setSavedMessage("Données réinitialisées ✓");
    setShowData(false);
    setShowResetConfirm(false);
  }

  function handleThemeChange(nextMode: ThemeMode) {
    setThemeMode(nextMode);
    setSavedMessage(
      nextMode === "dark" ? "Mode sombre activé ✓" : "Mode clair activé ✓"
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Profil et paramètres</Text>

        <Text style={styles.subtitle}>
          Personnalisez votre profil, gérez l’apparence de l’application et
          contrôlez vos données locales.
        </Text>

        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {firstName.length > 0 ? firstName[0].toUpperCase() : "E"}
            </Text>
          </View>

          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              {firstName ? firstName : "Votre espace"}
            </Text>
            <Text style={styles.heroText}>
              {profession
                ? profession
                : "Configurez votre profil pour personnaliser votre expérience."}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Apparence</Text>

          <Text style={styles.dataText}>
            Choisissez le mode visuel de l’application. Le choix est conservé
            dans ce navigateur.
          </Text>

          <View style={styles.themeOptions}>
            <Pressable
              style={[
                styles.themeChoice,
                mode === "light" && styles.themeChoiceSelected,
              ]}
              onPress={() => handleThemeChange("light")}
            >
              <Text style={styles.themeChoiceIcon}>☀️</Text>
              <Text
                style={[
                  styles.themeChoiceText,
                  mode === "light" && styles.themeChoiceTextSelected,
                ]}
              >
                Mode clair
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.themeChoice,
                mode === "dark" && styles.themeChoiceSelected,
              ]}
              onPress={() => handleThemeChange("dark")}
            >
              <Text style={styles.themeChoiceIcon}>🌙</Text>
              <Text
                style={[
                  styles.themeChoiceText,
                  mode === "dark" && styles.themeChoiceTextSelected,
                ]}
              >
                Mode sombre
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

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
                <Pressable
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                  onPress={() => setStatus(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
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

          <Text style={styles.label}>Objectif principal</Text>

          <View style={styles.optionsContainer}>
            {goals.map((item) => {
              const selected = mainGoal === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                  onPress={() => setMainGoal(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.primaryButton} onPress={handleSaveProfile}>
            <Text style={styles.primaryButtonText}>Sauvegarder mon profil</Text>
          </Pressable>

          {savedMessage.length > 0 && (
            <Text style={styles.savedMessage}>{savedMessage}</Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>
            {firstName ? `Résumé de ${firstName}` : "Résumé"}
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Score TMS</Text>
            <Text style={styles.summaryValue}>
              {questionnaireScore !== undefined
                ? `${questionnaireScore}/100`
                : "--/100"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Score du poste</Text>
            <Text style={styles.summaryValue}>
              {workstationScore !== undefined
                ? `${workstationScore}/100`
                : "--/100"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pauses</Text>
            <Text style={styles.summaryValue}>{stats.completedBreaks}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Exercices</Text>
            <Text style={styles.summaryValue}>{stats.completedExercises}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Capsules lues</Text>
            <Text style={styles.summaryValue}>{stats.completedCapsules}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Points</Text>
            <Text style={styles.summaryValue}>{stats.points}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Objectif</Text>
            <Text style={styles.summaryValueSmall}>{mainGoal}</Text>
          </View>
        </View>

        <View style={styles.healthBox}>
          <Text style={styles.healthTitle}>Avertissement santé</Text>
          <Text style={styles.healthText}>
            ErgoPrevent est un outil d’éducation et de prévention. L’application
            ne pose pas de diagnostic, ne remplace pas un ergonome, un
            physiothérapeute, un médecin ou un autre professionnel de la santé.
            Si vous ressentez une douleur importante, persistante, inhabituelle
            ou accompagnée de symptômes inquiétants, consultez un professionnel.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Données locales</Text>

          <Text style={styles.dataText}>
            Vos données sont sauvegardées uniquement dans ce navigateur, sur cet
            appareil. Elles ne sont pas envoyées vers une base de données externe.
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => setShowData(!showData)}
          >
            <Text style={styles.secondaryButtonText}>
              {showData ? "Masquer mes données" : "Afficher mes données"}
            </Text>
          </Pressable>

          {showData && (
            <View style={styles.dataBox}>
              <Text selectable style={styles.dataCode}>
                {exportedData}
              </Text>
            </View>
          )}
        </View>

        <Link href="/export-data" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Exporter mes données</Text>
          </Pressable>
        </Link>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            La réinitialisation supprime le profil, les scores, les pauses, les
            exercices, les capsules, les points, les routines et les check-ins
            sauvegardés sur cet appareil.
          </Text>
        </View>

        {!showResetConfirm ? (
          <Pressable
            style={styles.dangerButton}
            onPress={() => setShowResetConfirm(true)}
          >
            <Text style={styles.dangerButtonText}>
              Réinitialiser mes données
            </Text>
          </Pressable>
        ) : (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Confirmer la réinitialisation</Text>
            <Text style={styles.confirmText}>
              Cette action supprimera toutes les données locales de
              l’application sur cet appareil.
            </Text>

            <Pressable style={styles.dangerButton} onPress={handleResetData}>
              <Text style={styles.dangerButtonText}>
                Oui, tout réinitialiser
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={() => setShowResetConfirm(false)}
            >
              <Text style={styles.secondaryButtonText}>Annuler</Text>
            </Pressable>
          </View>
        )}

        <Link href="/dashboard" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Voir mon tableau de bord
            </Text>
          </Pressable>
        </Link>

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 24,
      paddingBottom: 48,
    },
    pageTitle: {
      fontSize: 32,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSoft,
      marginBottom: 24,
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 22,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    avatarCircle: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: colors.secondaryLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarText: {
      fontSize: 28,
      fontWeight: "900",
      color: colors.primary,
    },
    heroTextContainer: {
      flex: 1,
    },
    heroTitle: {
      fontSize: 23,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 4,
    },
    heroText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 14,
    },
    label: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 8,
      marginTop: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
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
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    optionText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
    optionTextSelected: {
      color: colors.black,
    },
    themeOptions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 10,
    },
    themeChoice: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 16,
      alignItems: "center",
    },
    themeChoiceSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    themeChoiceIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    themeChoiceText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
    },
    themeChoiceTextSelected: {
      color: colors.black,
    },
    primaryButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: 16,
      fontWeight: "900",
    },
    savedMessage: {
      marginTop: 4,
      color: colors.primary,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
    },
    summaryCard: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 22,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
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
      fontSize: 15,
      fontWeight: "800",
      color: colors.textSoft,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
    },
    summaryValueSmall: {
      flex: 1,
      textAlign: "right",
      fontSize: 15,
      fontWeight: "800",
      color: colors.text,
    },
    healthBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 20,
      padding: 18,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    healthTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 8,
    },
    healthText: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSoft,
    },
    dataText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      marginBottom: 14,
    },
    dataBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 16,
      padding: 14,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dataCode: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.text,
    },
    warningBox: {
      backgroundColor: colors.warning,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 12,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
    dangerButton: {
      backgroundColor: colors.danger,
      paddingVertical: 15,
      borderRadius: 16,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
    },
    dangerButtonText: {
      color: colors.white,
      fontSize: 15,
      fontWeight: "900",
    },
    confirmBox: {
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
    },
    confirmTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 8,
    },
    confirmText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
      marginBottom: 14,
    },
    secondaryButton: {
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      marginBottom: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
  });
}