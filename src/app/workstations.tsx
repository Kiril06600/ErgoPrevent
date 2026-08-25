import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Link, useRouter } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import BottomNav from "../components/BottomNav";
import PressableScale from "../components/PressableScale";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  ERGONOMIC_SYSTEM_UPDATED_EVENT,
  getCurrentWorkstationId,
  getDiscomfortCountsByZone,
  getErgonomicEvents,
  getPrimaryWorkstationId,
  getTargetedChecksForZone,
  getWorkstations,
  setCurrentWorkstationId,
  setPrimaryWorkstationId,
} from "../lib/ergonomicSystem";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WorkstationsScreen() {
  const router = useRouter();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const [, setRefreshKey] = useState(0);

  const [expandedWorkstationIds, setExpandedWorkstationIds] = useState<
    string[]
  >([]);

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

  const workstations = getWorkstations();
  const currentWorkstationId = getCurrentWorkstationId();
  const primaryWorkstationId = getPrimaryWorkstationId();
  const events = getErgonomicEvents();

  function handleToggleWorkstation(id: string) {
    LayoutAnimation.configureNext({
      duration: 250,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });

    setExpandedWorkstationIds((currentIds) => {
      if (currentIds.includes(id)) {
        return currentIds.filter((currentId) => currentId !== id);
      }

      return [...currentIds, id];
    });
  }

  function handleSetCurrentWorkstation(id: string) {
    setCurrentWorkstationId(id);
    setRefreshKey((currentValue) => currentValue + 1);
  }

  function handleSetPrimaryWorkstation(id: string) {
    setPrimaryWorkstationId(id);
    setRefreshKey((currentValue) => currentValue + 1);
  }

  function handleOpenWorkstationDetail(id: string) {
    setCurrentWorkstationId(id);
    setRefreshKey((currentValue) => currentValue + 1);
    router.push("/workstation-detail" as any);
  }

  function getEventsForWorkstation(workstationId: string) {
    return events.filter((event) => event.workstationId === workstationId);
  }

  function getLastInstallation(workstationId: string) {
    return events.find(
      (event) =>
        event.workstationId === workstationId &&
        event.type === "installation"
    );
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Mémoire du poste</Text>
            </View>

            <Text style={styles.pageTitle}>Mes postes</Text>

            <Text style={styles.subtitle}>
              Retrouvez tous vos espaces de travail et ouvrez leur fiche pour
              consulter les réglages, inconforts et interventions enregistrés.
            </Text>
          </View>

          {workstations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.sectionTitle}>Aucun poste enregistré</Text>

              <Text style={styles.sectionText}>
                Installez votre premier poste pour créer sa mémoire ergonomique.
              </Text>

              <Link href="/install-workstation?new=true" asChild>
                <PressableScale style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>
                    Installer mon premier poste
                  </Text>

                  <Text style={styles.primaryButtonArrow}>→</Text>
                </PressableScale>
              </Link>
            </View>
          ) : (
            <>
              <View style={styles.workstationsList}>
                {workstations.map((workstation) => {
                  const isExpanded = expandedWorkstationIds.includes(
                    workstation.id
                  );

                  const isCurrent =
                    currentWorkstationId === workstation.id ||
                    (!currentWorkstationId &&
                      workstations[0]?.id === workstation.id);

                  const isPrimary = primaryWorkstationId === workstation.id;

                  const workstationEvents = getEventsForWorkstation(
                    workstation.id
                  );

                  const discomfortCounts = getDiscomfortCountsByZone(
                    workstation.id
                  );

                  const lastInstallation = getLastInstallation(workstation.id);

                  const resetCount = workstationEvents.filter(
                    (event) => event.type === "reset"
                  ).length;

                  const adjustmentCount = workstationEvents.filter(
                    (event) =>
                      event.type === "adjustment" ||
                      event.type === "discomfort"
                  ).length;

                  const discomfortTotal = Object.values(
                    discomfortCounts
                  ).reduce((total, count) => total + count, 0);

                  const mostFrequentZone = Object.entries(
                    discomfortCounts
                  ).sort((a, b) => b[1] - a[1])[0];

                  return (
                    <View
                      key={workstation.id}
                      style={[
                        styles.workstationCard,
                        isExpanded
                          ? styles.workstationCardExpanded
                          : styles.workstationCardCollapsed,
                      ]}
                    >
                      <PressableScale
                        style={styles.workstationHeader}
                        onPress={() =>
                          handleToggleWorkstation(workstation.id)
                        }
                        scaleTo={0.985}
                      >
                        <View style={styles.workstationHeaderText}>
                          <View style={styles.closedHeaderRow}>
                            <Text style={styles.workstationType}>
                              {workstation.type}
                            </Text>

                            {isPrimary && (
                              <View style={styles.primaryMiniPill}>
                                <Text style={styles.primaryMiniPillText}>
                                  Principal
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text style={styles.workstationTitle}>
                            {workstation.name}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.expandCircle,
                            isExpanded
                              ? styles.expandCircleOpened
                              : null,
                          ]}
                        >
                          <Text
                            style={[
                              styles.expandArrow,
                              isExpanded
                                ? styles.expandArrowOpened
                                : null,
                            ]}
                          >
                            {isExpanded ? "⌃" : "⌄"}
                          </Text>
                        </View>
                      </PressableScale>

                      {isExpanded && (
                        <View style={styles.expandedContent}>
                          <View style={styles.separator} />

                          <View style={styles.expandedTopRow}>
                            <Text style={styles.lastText}>
                              Dernière installation :{" "}
                              {lastInstallation
                                ? formatDate(lastInstallation.createdAt)
                                : "Non enregistrée"}
                            </Text>

                            <View style={styles.pillsRow}>
                              {isPrimary && (
                                <View style={styles.primaryPill}>
                                  <Text style={styles.primaryPillText}>
                                    Principal
                                  </Text>
                                </View>
                              )}

                              {isCurrent && (
                                <View style={styles.currentPill}>
                                  <Text style={styles.currentPillText}>
                                    Poste actuel
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>

                          <View style={styles.statsGrid}>
                            <View style={styles.statBox}>
                              <Text style={styles.statNumber}>
                                {resetCount}
                              </Text>

                              <Text style={styles.statLabel}>resets</Text>
                            </View>

                            <View style={styles.statBox}>
                              <Text style={styles.statNumber}>
                                {adjustmentCount}
                              </Text>

                              <Text style={styles.statLabel}>
                                ajustements
                              </Text>
                            </View>

                            <View style={styles.statBox}>
                              <Text style={styles.statNumber}>
                                {discomfortTotal}
                              </Text>

                              <Text style={styles.statLabel}>inconforts</Text>
                            </View>
                          </View>

                          <View style={styles.settingsBox}>
                            <Text style={styles.boxTitle}>Mes réglages</Text>

                            <SettingRow
                              label="Assise"
                              value={
                                workstation.chairHeightCm
                                  ? `${workstation.chairHeightCm} cm`
                                  : "Non renseigné"
                              }
                              styles={styles}
                            />

                            <SettingRow
                              label="Profondeur"
                              value={
                                workstation.seatDepthStatus ||
                                "Non renseigné"
                              }
                              styles={styles}
                            />

                            <SettingRow
                              label="Dossier"
                              value={
                                workstation.backrestSetting ||
                                "Non renseigné"
                              }
                              styles={styles}
                            />

                            <SettingRow
                              label="Support lombaire"
                              value={
                                workstation.lumbarSupport ||
                                "Non renseigné"
                              }
                              styles={styles}
                            />

                            <SettingRow
                              label="Accoudoirs"
                              value={
                                workstation.armrestSetting ||
                                "Non renseigné"
                              }
                              styles={styles}
                            />

                            <SettingRow
                              label="Bureau"
                              value={
                                workstation.deskHeightCm
                                  ? `${workstation.deskHeightCm} cm`
                                  : "Non renseigné"
                              }
                              styles={styles}
                            />

                            <SettingRow
                              label="Clavier / souris"
                              value={
                                workstation.keyboardMouseSetup ||
                                "Non renseigné"
                              }
                              styles={styles}
                            />

                            <SettingRow
                              label="Écran"
                              value={
                                workstation.screenSetup ||
                                "Non renseigné"
                              }
                              styles={styles}
                            />

                            <SettingRow
                              label="Matériel"
                              value={
                                workstation.equipmentNotes ||
                                "Aucune note"
                              }
                              styles={styles}
                            />
                          </View>

                          <View style={styles.discomfortBox}>
                            <Text style={styles.boxTitle}>
                              Inconforts signalés
                            </Text>

                            {Object.keys(discomfortCounts).length > 0 ? (
                              Object.entries(discomfortCounts).map(
                                ([zone, count]) => (
                                  <View
                                    key={zone}
                                    style={styles.discomfortRow}
                                  >
                                    <Text style={styles.discomfortZone}>
                                      {zone}
                                    </Text>

                                    <Text style={styles.discomfortCount}>
                                      {count} fois
                                    </Text>
                                  </View>
                                )
                              )
                            ) : (
                              <Text style={styles.emptyText}>
                                Aucun inconfort enregistré pour ce poste.
                              </Text>
                            )}
                          </View>

                          {mostFrequentZone && (
                            <View style={styles.insightBox}>
                              <Text style={styles.insightTitle}>
                                Vérification ciblée
                              </Text>

                              <Text style={styles.insightText}>
                                Vous avez signalé {mostFrequentZone[0]}{" "}
                                {mostFrequentZone[1]} fois sur ce poste.
                              </Text>

                              <Text style={styles.insightText}>
                                À revérifier :{" "}
                                {getTargetedChecksForZone(
                                  mostFrequentZone[0]
                                ).join(", ")}
                                .
                              </Text>
                            </View>
                          )}

                          <View style={styles.cardButtonsRow}>
                            <PressableScale
                              style={styles.primarySmallButton}
                              onPress={() =>
                                handleOpenWorkstationDetail(
                                  workstation.id
                                )
                              }
                            >
                              <Text style={styles.primarySmallButtonText}>
                                Voir la fiche complète
                              </Text>

                              <Text style={styles.primarySmallButtonArrow}>
                                →
                              </Text>
                            </PressableScale>

                            {isPrimary ? (
                              <View style={styles.primaryStatusButton}>
                                <Text style={styles.primaryStatusButtonText}>
                                  Poste principal
                                </Text>
                              </View>
                            ) : (
                              <PressableScale
                                style={styles.secondaryButton}
                                onPress={() =>
                                  handleSetPrimaryWorkstation(workstation.id)
                                }
                              >
                                <Text style={styles.secondaryButtonText}>
                                  Ajouter ce poste comme principal
                                </Text>
                              </PressableScale>
                            )}

                            {!isCurrent && (
                              <PressableScale
                                style={styles.secondaryButton}
                                onPress={() =>
                                  handleSetCurrentWorkstation(
                                    workstation.id
                                  )
                                }
                              >
                                <Text style={styles.secondaryButtonText}>
                                  Utiliser ce poste
                                </Text>
                              </PressableScale>
                            )}

                            <PressableScale
                              style={styles.secondaryButton}
                              onPress={() => {
                                setCurrentWorkstationId(workstation.id);
                                router.push(
                                  "/install-workstation" as any
                                );
                              }}
                            >
                              <Text style={styles.secondaryButtonText}>
                                Revérifier / modifier
                              </Text>
                            </PressableScale>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <Link href="/install-workstation?new=true" asChild>
                <PressableScale style={styles.primaryButtonOutside}>
                  <Text style={styles.primaryButtonText}>
                    Ajouter un nouveau poste
                  </Text>

                  <Text style={styles.primaryButtonArrow}>→</Text>
                </PressableScale>
              </Link>
            </>
          )}

          {events.length > 0 && (
            <View style={styles.historyCard}>
              <Text style={styles.sectionTitle}>Historique récent</Text>

              {events.slice(0, 8).map((event) => (
                <View key={event.id} style={styles.historyRow}>
                  <View style={styles.historyDot} />

                  <View style={styles.historyTextBlock}>
                    <Text style={styles.historyTitle}>
                      {getEventLabel(event.type)}
                    </Text>

                    <Text style={styles.historyText}>
                      {event.workstationName}
                      {event.zone ? ` · ${event.zone}` : ""}
                      {event.activity ? ` · ${event.activity}` : ""}
                    </Text>

                    <Text style={styles.historyDate}>
                      {formatDate(event.createdAt)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

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
    workstationsList: {
      gap: 12,
      marginBottom: 16,
    },
    emptyCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    workstationCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    workstationCardCollapsed: {
      borderRadius: 24,
    },
    workstationCardExpanded: {
      borderRadius: 32,
    },
    workstationHeader: {
      minHeight: 88,
      paddingVertical: 16,
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    },
    workstationHeaderText: {
      flex: 1,
    },
    closedHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 5,
    },
    workstationType: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    workstationTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 23,
      lineHeight: 29,
    },
    primaryMiniPill: {
      backgroundColor: colors.primaryLight,
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    primaryMiniPillText: {
      color: colors.primary,
      fontSize: 10,
      fontWeight: "900",
    },
    expandCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    expandCircleOpened: {
      backgroundColor: colors.primaryLight,
    },
    expandArrow: {
      color: colors.text,
      fontSize: 22,
      lineHeight: 22,
      fontWeight: "700",
      marginTop: -2,
    },
    expandArrowOpened: {
      color: colors.primary,
      marginTop: 3,
    },
    expandedContent: {
      paddingHorizontal: 18,
      paddingBottom: 18,
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginBottom: 16,
    },
    expandedTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 14,
    },
    lastText: {
      flex: 1,
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
    },
    pillsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexWrap: "wrap",
    },
    primaryPill: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    primaryPillText: {
      color: colors.black,
      fontSize: 11,
      fontWeight: "900",
    },
    currentPill: {
      backgroundColor: colors.primaryLight,
      borderRadius: 999,
      paddingVertical: 7,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currentPillText: {
      color: colors.primary,
      fontSize: 11,
      fontWeight: "900",
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
      paddingVertical: 13,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    statNumber: {
      color: colors.primary,
      fontSize: 24,
      fontWeight: "900",
      lineHeight: 28,
    },
    statLabel: {
      marginTop: 4,
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.3,
      textAlign: "center",
    },
    settingsBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    discomfortBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    boxTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 21,
      lineHeight: 27,
      marginBottom: 10,
    },
    settingRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 11,
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
    discomfortRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 11,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    discomfortZone: {
      color: colors.textSoft,
      fontSize: 14,
      fontWeight: "900",
    },
    discomfortCount: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "right",
    },
    insightBox: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    insightTitle: {
      fontFamily: "Georgia",
      fontSize: 21,
      lineHeight: 27,
      color: colors.primary,
      marginBottom: 7,
    },
    insightText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 4,
    },
    cardButtonsRow: {
      gap: 9,
    },
    primarySmallButton: {
      backgroundColor: colors.primary,
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 8,
    },
    primarySmallButtonText: {
      color: colors.black,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    primarySmallButtonArrow: {
      color: colors.black,
      fontSize: 18,
      fontWeight: "900",
    },
    primaryStatusButton: {
      paddingVertical: 13,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      backgroundColor: colors.primary,
    },
    primaryStatusButtonText: {
      color: colors.black,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
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
      textAlign: "center",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
    secondaryButton: {
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
    emptyText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 26,
      lineHeight: 32,
      color: colors.primary,
      marginBottom: 10,
    },
    sectionText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: "700",
      marginBottom: 16,
    },
    historyCard: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
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
    historyDate: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "800",
    },
  });
}