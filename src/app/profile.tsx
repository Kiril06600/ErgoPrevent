import React, { useEffect, useState } from "react";
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
  APP_STATS_UPDATED_EVENT,
  AppStats,
  getAppStats,
  saveUserProfile,
  resetAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { ThemeMode, useAppTheme } from "../theme/ThemeContext";
import {
  IconBadge,
  ProfileIcon,
  ProgressIcon,
  PlanIcon,
  RoutineIcon,
  SunIcon,
  MoonIcon,
} from "../components/ErgoIcons";

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

const CHECKINS_UPDATED_EVENT = "ergoprevent_checkins_updated";
const ROUTINE_UPDATED_EVENT = "ergoprevent_routine_updated";

type AppRoute = "/dashboard" | "/routine" | "/personal-plan" | "/export-data";

type QuickAction = {
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

const quickActions: QuickAction[] = [
  {
    label: "Résumé",
    title: "Dashboard",
    text: "Voir vos scores et points.",
    href: "/dashboard",
    Icon: ProgressIcon,
  },
  {
    label: "Aujourd’hui",
    title: "Routine",
    text: "Retourner aux actions du jour.",
    href: "/routine",
    Icon: RoutineIcon,
  },
  {
    label: "Objectifs",
    title: "Plan",
    text: "Voir vos priorités personnalisées.",
    href: "/personal-plan",
    Icon: PlanIcon,
  },
  {
    label: "Données",
    title: "Exporter",
    text: "Télécharger vos données locales.",
    href: "/export-data",
    Icon: ProfileIcon,
  },
];

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

  window.dispatchEvent(new Event(CHECKINS_UPDATED_EVENT));
  window.dispatchEvent(new Event(ROUTINE_UPDATED_EVENT));
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
    window.addEventListener(CHECKINS_UPDATED_EVENT, refreshStats);
    window.addEventListener(ROUTINE_UPDATED_EVENT, refreshStats);
    window.addEventListener("focus", refreshStats);
    window.addEventListener("storage", refreshStats);

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", refreshStats);
    }

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshStats);
      window.removeEventListener(CHECKINS_UPDATED_EVENT, refreshStats);
      window.removeEventListener(ROUTINE_UPDATED_EVENT, refreshStats);
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("storage", refreshStats);

      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", refreshStats);
      }
    };
  }, []);

  const questionnaireScore = stats.questionnaireResult?.score;
  const workstationScore = stats.workstationAuditResult?.score;

  const displayName = firstName.trim().length > 0 ? firstName.trim() : "";
  const avatarLetter =
    displayName.length > 0 ? displayName[0].toUpperCase() : "E";

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
    setSavedMessage("Profil sauvegardé");
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
    setSavedMessage("Données réinitialisées");
    setShowData(false);
    setShowResetConfirm(false);
  }

  function handleThemeChange(nextMode: ThemeMode) {
    setThemeMode(nextMode);
    setSavedMessage(
      nextMode === "dark" ? "Mode sombre activé" : "Mode clair activé"
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.pageHeader}>
          <View style={styles.pagePill}>
            <Text style={styles.pagePillText}>Paramètres</Text>
          </View>

          <Text style={styles.pageTitle}>Profil</Text>

          <Text style={styles.subtitle}>
            Personnalisez votre profil, gérez l’apparence de l’application et
            contrôlez vos données locales.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>

            <View style={styles.heroTextContainer}>
              <Text style={styles.heroLabel}>
                {displayName ? "Espace personnel" : "Bienvenue"}
              </Text>

              <Text style={styles.heroTitle}>
                {displayName ? displayName : "Votre espace"}
              </Text>

              <Text style={styles.heroText}>
                {profession
                  ? profession
                  : "Configurez votre profil pour personnaliser votre expérience."}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconBadge
              size={46}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <SunIcon
                size={22}
                color={mode === "light" ? colors.text : colors.textSoft}
              />
            </IconBadge>

            <View style={styles.cardHeaderText}>
              <Text style={styles.sectionTitle}>Apparence</Text>
              <Text style={styles.sectionSubtitle}>
                Choisissez le mode visuel de l’application.
              </Text>
            </View>
          </View>

          <View style={styles.themeOptions}>
            <Pressable
              style={[
                styles.themeChoice,
                mode === "light" ? styles.themeChoiceSelected : null,
              ]}
              onPress={() => handleThemeChange("light")}
            >
              <SunIcon
                size={25}
                color={mode === "light" ? colors.black : colors.text}
              />

              <Text
                style={[
                  styles.themeChoiceText,
                  mode === "light" ? styles.themeChoiceTextSelected : null,
                ]}
              >
                Mode clair
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.themeChoice,
                mode === "dark" ? styles.themeChoiceSelected : null,
              ]}
              onPress={() => handleThemeChange("dark")}
            >
              <MoonIcon
                size={27}
                color={mode === "dark" ? colors.black : colors.text}
              />

              <Text
                style={[
                  styles.themeChoiceText,
                  mode === "dark" ? styles.themeChoiceTextSelected : null,
                ]}
              >
                Mode sombre
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <IconBadge
              size={46}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <ProfileIcon size={22} color={colors.text} />
            </IconBadge>

            <View style={styles.cardHeaderText}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              <Text style={styles.sectionSubtitle}>
                Ces informations restent sauvegardées localement.
              </Text>
            </View>
          </View>

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
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.primaryButton} onPress={handleSaveProfile}>
            <Text style={styles.primaryButtonText}>Sauvegarder mon profil</Text>
            <Text style={styles.primaryButtonArrow}>→</Text>
          </Pressable>

          {savedMessage.length > 0 && (
            <View style={styles.messageBox}>
              <Text style={styles.savedMessage}>{savedMessage}</Text>
            </View>
          )}
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <IconBadge
              size={46}
              backgroundColor={colors.turquoiseSoft}
              borderColor={colors.border}
            >
              <ProgressIcon size={22} color={colors.text} />
            </IconBadge>

            <View style={styles.cardHeaderText}>
              <Text style={styles.sectionTitle}>
                {displayName ? `Résumé de ${displayName}` : "Résumé"}
              </Text>
              <Text style={styles.sectionSubtitle}>
                Aperçu de votre progression locale.
              </Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryMiniCard}>
              <Text style={styles.summaryMiniNumber}>
                {questionnaireScore !== undefined ? questionnaireScore : "--"}
              </Text>
              <Text style={styles.summaryMiniLabel}>Score TMS</Text>
            </View>

            <View style={styles.summaryMiniCard}>
              <Text style={styles.summaryMiniNumber}>
                {workstationScore !== undefined ? workstationScore : "--"}
              </Text>
              <Text style={styles.summaryMiniLabel}>Score poste</Text>
            </View>

            <View style={styles.summaryMiniCard}>
              <Text style={styles.summaryMiniNumber}>{stats.points}</Text>
              <Text style={styles.summaryMiniLabel}>Points</Text>
            </View>
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
          <View style={styles.cardHeader}>
            <IconBadge
              size={46}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <ProfileIcon size={22} color={colors.text} />
            </IconBadge>

            <View style={styles.cardHeaderText}>
              <Text style={styles.sectionTitle}>Données locales</Text>
              <Text style={styles.sectionSubtitle}>
                Vos données restent dans ce navigateur.
              </Text>
            </View>
          </View>

          <Text style={styles.dataText}>
            Vos données sont sauvegardées uniquement dans ce navigateur, sur cet
            appareil. Elles ne sont pas envoyées vers une base de données externe.
          </Text>

          <Pressable
            style={styles.secondaryButtonInside}
            onPress={() => setShowData(!showData)}
          >
            <Text style={styles.secondaryButtonText}>
              {showData ? "Masquer mes données" : "Afficher mes données"}
            </Text>
          </Pressable>

          {showData && (
            <View style={styles.dataBox}>
              <ScrollView
                style={styles.dataScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <Text selectable style={styles.dataCode}>
                    {exportedData}
                  </Text>
                </ScrollView>
              </ScrollView>
            </View>
          )}
        </View>

        <Link href="/export-data" asChild>
          <Pressable style={styles.primaryButtonOutside}>
            <Text style={styles.primaryButtonText}>Exporter mes données</Text>
            <Text style={styles.primaryButtonArrow}>→</Text>
          </Pressable>
        </Link>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>Réinitialisation</Text>
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

            <Pressable style={styles.dangerButtonInside} onPress={handleResetData}>
              <Text style={styles.dangerButtonText}>
                Oui, tout réinitialiser
              </Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButtonInside}
              onPress={() => setShowResetConfirm(false)}
            >
              <Text style={styles.secondaryButtonText}>Annuler</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitleLarge}>Actions rapides</Text>
            <Text style={styles.sectionSubtitle}>
              Accédez rapidement à vos pages principales.
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
      minHeight: 210,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      position: "relative",
      justifyContent: "center",
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      zIndex: 2,
    },
    avatarCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    avatarText: {
      fontSize: 30,
      fontWeight: "900",
      color: colors.black,
      lineHeight: 34,
    },
    heroTextContainer: {
      flex: 1,
    },
    heroLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    heroTitle: {
      fontFamily: "Georgia",
      fontSize: 34,
      lineHeight: 41,
      color: colors.primary,
      letterSpacing: -0.7,
      marginBottom: 6,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      maxWidth: 440,
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
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
    },
    cardHeaderText: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 24,
      lineHeight: 30,
      color: colors.primary,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    sectionTitleLarge: {
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
    },
    optionTextSelected: {
      color: colors.black,
    },
    themeOptions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 4,
    },
    themeChoice: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      paddingVertical: 18,
      paddingHorizontal: 14,
      alignItems: "center",
      gap: 9,
    },
    themeChoiceSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    themeChoiceText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      textAlign: "center",
    },
    themeChoiceTextSelected: {
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
    primaryButtonOutside: {
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
      marginBottom: 16,
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
    savedMessage: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    summaryCard: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
    },
    summaryGrid: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 14,
    },
    summaryMiniCard: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    summaryMiniNumber: {
      fontSize: 24,
      fontWeight: "900",
      color: colors.primary,
      lineHeight: 28,
    },
    summaryMiniLabel: {
      marginTop: 5,
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
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
      fontSize: 14,
      fontWeight: "900",
      color: colors.textSoft,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
    },
    summaryValueSmall: {
      flex: 1,
      textAlign: "right",
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
    },
    healthBox: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 24,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    healthTitle: {
      fontFamily: "Georgia",
      fontSize: 20,
      lineHeight: 26,
      color: colors.primary,
      marginBottom: 8,
    },
    healthText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSoft,
      fontWeight: "700",
    },
    dataText: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSoft,
      marginBottom: 14,
    },
    dataBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 18,
      padding: 14,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
      height: 320,
      overflow: "hidden",
    },
    dataScroll: {
      maxHeight: 292,
    },
    dataCode: {
      fontSize: 12,
      lineHeight: 18,
      color: colors.text,
    },
    secondaryButtonInside: {
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
    warningBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 14,
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
    dangerButton: {
      marginHorizontal: 24,
      backgroundColor: colors.danger,
      paddingVertical: 15,
      borderRadius: 999,
      alignItems: "center",
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
    },
    dangerButtonInside: {
      backgroundColor: colors.danger,
      paddingVertical: 15,
      borderRadius: 999,
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
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
    },
    confirmTitle: {
      fontFamily: "Georgia",
      fontSize: 21,
      lineHeight: 27,
      color: colors.primary,
      marginBottom: 8,
    },
    confirmText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
      marginBottom: 14,
    },
    sectionHeaderRow: {
      paddingHorizontal: 24,
      marginBottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 16,
    },
    sectionAction: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 4,
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
  });
}