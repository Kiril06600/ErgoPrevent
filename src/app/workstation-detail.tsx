import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import BottomNav from "../components/BottomNav";
import PressableScale from "../components/PressableScale";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  ERGONOMIC_SYSTEM_UPDATED_EVENT,
  getCurrentWorkstation,
  getDiscomfortCountsByZone,
  getErgonomicEvents,
  getTargetedChecksForZone,
} from "../lib/ergonomicSystem";

export default function WorkstationDetailScreen() {
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const [, setRefreshKey] = useState(0);

  useEffect(() => {
    function refresh() {
      setRefreshKey((currentValue) => currentValue + 1);
    }

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(ERGONOMIC_SYSTEM_UPDATED_EVENT, refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(ERGONOMIC_SYSTEM_UPDATED_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const workstation = getCurrentWorkstation();
  const events = getErgonomicEvents();

  const workstationEvents = workstation
    ? events.filter((event) => event.workstationId === workstation.id)
    : [];

  const discomfortCounts = workstation
    ? getDiscomfortCountsByZone(workstation.id)
    : {};

  const resetCount = workstationEvents.filter(
    (event) => event.type === "reset"
  ).length;

  const installationCount = workstationEvents.filter(
    (event) => event.type === "installation"
  ).length;

  const adjustmentCount = workstationEvents.filter(
    (event) => event.type === "adjustment" || event.type === "discomfort"
  ).length;

  const mostFrequentZone = Object.entries(discomfortCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  function goToInstall() {
    router.push("/install-workstation" as any);
  }

  function goToAdjust() {
    router.push("/adjust-discomfort" as any);
  }

  function goToWorkstations() {
    router.push("/workstations" as any);
  }

  if (!workstation) {
    return (
      <AnimatedScreen>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.pageHeader}>
              <View style={styles.pagePill}>
                <Text style={styles.pagePillText}>Fiche poste</Text>
              </View>

              <Text style={styles.pageTitle}>Aucun poste sélectionné</Text>

              <Text style={styles.subtitle}>
                Créez ou sélectionnez un poste pour voir sa fiche ergonomique.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Mémoire vide</Text>

              <Text style={styles.sectionText}>
                Aucun poste n’est actuellement enregistré comme poste actif.
              </Text>

              <PressableScale style={styles.primaryButton} onPress={goToInstall}>
                <Text style={styles.primaryButtonText}>Installer un poste</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>
            </View>

            <BottomNav />
          </ScrollView>
        </SafeAreaView>
      </AnimatedScreen>
    );
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Fiche poste</Text>
            </View>

            <Text style={styles.pageTitle}>{workstation.name}</Text>

            <Text style={styles.subtitle}>
              Retrouvez les réglages, inconforts et interventions liés à ce
              poste.
            </Text>
          </View>

          <View style={styles.identityCard}>
            <Text style={styles.identityLabel}>{workstation.type}</Text>
            <Text style={styles.identityTitle}>{workstation.name}</Text>

            <Text style={styles.identityText}>
              Dernière modification : {formatDate(workstation.updatedAt)}
            </Text>

            <View style={styles.quickButtonsRow}>
              <PressableScale style={styles.secondaryButton} onPress={goToAdjust}>
                <Text style={styles.secondaryButtonText}>Ajuster un inconfort</Text>
              </PressableScale>

              <PressableScale style={styles.secondaryButton} onPress={goToInstall}>
                <Text style={styles.secondaryButtonText}>
                  Revérifier / modifier
                </Text>
              </PressableScale>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{installationCount}</Text>
              <Text style={styles.statLabel}>installations</Text>
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

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Spécificités du poste</Text>

            <SettingRow
              label="Hauteur d’assise"
              value={
                workstation.chairHeightCm
                  ? `${workstation.chairHeightCm} cm`
                  : "Non renseigné"
              }
              styles={styles}
            />

            <SettingRow
              label="Profondeur d’assise"
              value={workstation.seatDepthStatus || "Non renseigné"}
              styles={styles}
            />

            <SettingRow
              label="Dossier"
              value={workstation.backrestSetting || "Non renseigné"}
              styles={styles}
            />

            <SettingRow
              label="Support lombaire"
              value={workstation.lumbarSupport || "Non renseigné"}
              styles={styles}
            />

            <SettingRow
              label="Accoudoirs"
              value={workstation.armrestSetting || "Non renseigné"}
              styles={styles}
            />

            <SettingRow
              label="Hauteur du bureau"
              value={
                workstation.deskHeightCm
                  ? `${workstation.deskHeightCm} cm`
                  : "Non renseigné"
              }
              styles={styles}
            />

            <SettingRow
              label="Clavier / souris"
              value={workstation.keyboardMouseSetup || "Non renseigné"}
              styles={styles}
            />

            <SettingRow
              label="Écran"
              value={workstation.screenSetup || "Non renseigné"}
              styles={styles}
            />

            <SettingRow
              label="Notes matériel"
              value={workstation.equipmentNotes || "Aucune note"}
              styles={styles}
            />
          </View>

          <View style={styles.cardSoft}>
            <Text style={styles.sectionTitle}>Inconforts sur ce poste</Text>

            {Object.keys(discomfortCounts).length > 0 ? (
              Object.entries(discomfortCounts).map(([zone, count]) => (
                <View key={zone} style={styles.settingRow}>
                  <Text style={styles.settingLabel}>{zone}</Text>
                  <Text style={styles.settingValue}>{count} fois</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Aucun inconfort enregistré pour ce poste pour le moment.
              </Text>
            )}
          </View>

          {mostFrequentZone && (
            <View style={styles.insightBox}>
              <Text style={styles.insightTitle}>Vérification ciblée</Text>

              <Text style={styles.insightText}>
                Vous avez signalé {mostFrequentZone[0]} {mostFrequentZone[1]}{" "}
                fois sur ce poste.
              </Text>

              <Text style={styles.insightText}>
                À revérifier en priorité :{" "}
                {getTargetedChecksForZone(mostFrequentZone[0]).join(", ")}.
              </Text>

              <PressableScale style={styles.primaryButton} onPress={goToAdjust}>
                <Text style={styles.primaryButtonText}>
                  Lancer l’ajustement ciblé
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Historique du poste</Text>

            {workstationEvents.length > 0 ? (
              workstationEvents.slice(0, 10).map((event) => (
                <View key={event.id} style={styles.historyRow}>
                  <View style={styles.historyDot} />

                  <View style={styles.historyTextBlock}>
                    <Text style={styles.historyTitle}>
                      {getEventLabel(event.type)}
                    </Text>

                    <Text style={styles.historyText}>
                      {event.action || "Action enregistrée"}
                      {event.zone ? ` · ${event.zone}` : ""}
                      {event.activity ? ` · ${event.activity}` : ""}
                    </Text>

                    {event.note ? (
                      <Text style={styles.historyNote}>{event.note}</Text>
                    ) : null}

                    <Text style={styles.historyDate}>
                      {formatDate(event.createdAt)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                Aucun événement enregistré pour ce poste.
              </Text>
            )}
          </View>

          <PressableScale style={styles.outlineButton} onPress={goToWorkstations}>
            <Text style={styles.outlineButtonText}>Retour à mes postes</Text>
          </PressableScale>

          <BottomNav />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function SettingRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

function getEventLabel(type: string) {
  if (type === "reset") {
    return "Reset ergonomique";
  }

  if (type === "installation") {
    return "Installation du poste";
  }

  if (type === "adjustment") {
    return "Ajustement";
  }

  if (type === "discomfort") {
    return "Inconfort signalé";
  }

  return "Événement";
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date inconnue";
  }

  return parsedDate.toLocaleDateString("fr-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
    identityCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 34,
      padding: 22,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    identityLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 8,
    },
    identityTitle: {
      fontFamily: "Georgia",
      fontSize: 30,
      lineHeight: 36,
      color: colors.primary,
      marginBottom: 8,
    },
    identityText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 14,
    },
    quickButtonsRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    statsGrid: {
      marginHorizontal: 24,
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    statNumber: {
      color: colors.primary,
      fontSize: 26,
      lineHeight: 30,
      fontWeight: "900",
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
    card: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardSoft: {
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
      fontSize: 26,
      lineHeight: 32,
      color: colors.primary,
      marginBottom: 12,
    },
    sectionText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: "700",
      marginBottom: 16,
    },
    settingRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    settingLabel: {
      color: colors.textSoft,
      fontSize: 14,
      fontWeight: "900",
    },
    settingValue: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "900",
      textAlign: "right",
    },
    insightBox: {
      marginHorizontal: 24,
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 26,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    insightTitle: {
      fontFamily: "Georgia",
      fontSize: 23,
      lineHeight: 29,
      color: colors.primary,
      marginBottom: 8,
    },
    insightText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 8,
    },
    historyRow: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    historyDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
      marginTop: 6,
    },
    historyTextBlock: {
      flex: 1,
    },
    historyTitle: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "900",
      marginBottom: 2,
    },
    historyText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
      marginBottom: 2,
    },
    historyNote: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "700",
      marginTop: 2,
      marginBottom: 2,
    },
    historyDate: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "800",
    },
    primaryButton: {
      marginTop: 10,
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
    secondaryButton: {
      flexGrow: 1,
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
    outlineButton: {
      marginHorizontal: 24,
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      marginBottom: 16,
    },
    outlineButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
    },
    emptyText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
  });
}