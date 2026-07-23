import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { AppStats, getAppStats } from "../lib/storage";
import BottomNav from "../components/BottomNav";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";

type DailyCheckin = {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  painLevel: number;
  fatigueLevel: string;
  mainZone: string;
  note: string;
};

type AppRoute = "/daily-checkin" | "/routine" | "/dashboard";

const CHECKIN_STORAGE_KEY = "ergoprevent_daily_checkins";

function normalizeCheckin(checkin: any, index: number): DailyCheckin {
  const date = checkin.date ?? "Date inconnue";
  const time = checkin.time ?? "00:00";

  return {
    id: checkin.id ?? `${date}-${time}-${index}`,
    createdAt: checkin.createdAt ?? `${date}T${time}:00`,
    date,
    time,
    painLevel: checkin.painLevel ?? 0,
    fatigueLevel: checkin.fatigueLevel ?? "Moyenne",
    mainZone: checkin.mainZone ?? "Aucune zone",
    note: checkin.note ?? "",
  };
}

function getSavedCheckins(): DailyCheckin[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedData = window.localStorage.getItem(CHECKIN_STORAGE_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);

    if (Array.isArray(parsedData)) {
      return parsedData
        .map((checkin, index) => normalizeCheckin(checkin, index))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return Object.values(parsedData)
      .map((checkin, index) => normalizeCheckin(checkin, index))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

function saveCheckins(checkins: DailyCheckin[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(checkins));
}

function getAveragePain(checkins: DailyCheckin[]) {
  if (checkins.length === 0) {
    return 0;
  }

  const total = checkins.reduce((sum, checkin) => sum + checkin.painLevel, 0);

  return Math.round((total / checkins.length) * 10) / 10;
}

function getMostFrequentZone(checkins: DailyCheckin[]) {
  const zoneCounts: Record<string, number> = {};

  checkins.forEach((checkin) => {
    if (checkin.mainZone === "Aucune zone") {
      return;
    }

    zoneCounts[checkin.mainZone] = (zoneCounts[checkin.mainZone] ?? 0) + 1;
  });

  const sortedZones = Object.entries(zoneCounts).sort((a, b) => b[1] - a[1]);

  if (sortedZones.length === 0) {
    return "Aucune zone dominante";
  }

  return sortedZones[0][0];
}

function getAverageFatigue(checkins: DailyCheckin[]) {
  if (checkins.length === 0) {
    return "Non disponible";
  }

  const fatigueScores: Record<string, number> = {
    Faible: 1,
    Moyenne: 2,
    Élevée: 3,
  };

  const total = checkins.reduce((sum, checkin) => {
    return sum + (fatigueScores[checkin.fatigueLevel] ?? 2);
  }, 0);

  const average = total / checkins.length;

  if (average < 1.5) {
    return "Faible";
  }

  if (average < 2.5) {
    return "Moyenne";
  }

  return "Élevée";
}

function getTrendMessage(checkins: DailyCheckin[]) {
  if (checkins.length < 3) {
    return {
      title: "Pas encore assez de données",
      text: "Ajoutez quelques check-ins pour voir une tendance plus fiable.",
      icon: "🌱",
    };
  }

  const sortedCheckins = [...checkins].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  const middleIndex = Math.ceil(sortedCheckins.length / 2);
  const olderCheckins = sortedCheckins.slice(0, middleIndex);
  const recentCheckins = sortedCheckins.slice(middleIndex);

  const olderAverage = getAveragePain(olderCheckins);
  const recentAverage = getAveragePain(recentCheckins);

  if (recentAverage < olderAverage) {
    return {
      title: "Tendance favorable",
      text: "Votre douleur moyenne récente semble plus basse que dans les premiers check-ins.",
      icon: "📉",
    };
  }

  if (recentAverage > olderAverage) {
    return {
      title: "Tendance à surveiller",
      text: "Votre douleur moyenne récente semble plus élevée. Essayez de renforcer les pauses, les ajustements et les exercices doux.",
      icon: "📈",
    };
  }

  return {
    title: "Tendance stable",
    text: "Votre douleur moyenne semble relativement stable pour le moment.",
    icon: "➖",
  };
}

function getCheckinsToday(checkins: DailyCheckin[]) {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const todayKey = `${year}-${month}-${day}`;

  return checkins.filter((checkin) => checkin.date === todayKey);
}

export default function ProgressScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  useEffect(() => {
    const savedStats = getAppStats();
    const savedCheckins = getSavedCheckins();

    setStats(savedStats);
    setCheckins(savedCheckins);
  }, []);

  const profile = stats?.profile ?? null;

  const hasCheckins = checkins.length > 0;
  const latestCheckin = checkins[0] ?? null;

  const averagePain = getAveragePain(checkins);
  const averageFatigue = getAverageFatigue(checkins);
  const mostFrequentZone = getMostFrequentZone(checkins);
  const trend = getTrendMessage(checkins);
  const todayCheckins = getCheckinsToday(checkins);

  const lastTenCheckins = checkins.slice(0, 10);

  const latestPainPercent = latestCheckin
    ? Math.round((latestCheckin.painLevel / 10) * 100)
    : 0;

  function handleDeleteCheckin(checkinId: string) {
    const updatedCheckins = checkins.filter((checkin) => checkin.id !== checkinId);

    setCheckins(updatedCheckins);
    saveCheckins(updatedCheckins);
    setDeleteConfirmId(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Évolution</Text>

        <Text style={styles.subtitle}>
          Suivez vos check-ins pour comprendre l’évolution de votre douleur, de
          votre fatigue et des zones sensibles.
        </Text>

        {!hasCheckins && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>Aucun check-in pour l’instant</Text>
            <Text style={styles.emptyText}>
              Faites votre premier check-in pour commencer à suivre votre
              évolution.
            </Text>

            <Link href="/daily-checkin" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  Faire mon premier check-in
                </Text>
              </Pressable>
            </Link>
          </View>
        )}

        {hasCheckins && (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroGreeting}>
                {profile?.firstName
                  ? `Suivi de ${profile.firstName}`
                  : "Votre suivi"}
              </Text>

              <Text style={styles.heroTitle}>
                {trend.icon} {trend.title}
              </Text>

              <Text style={styles.heroText}>{trend.text}</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Check-ins</Text>
                <Text style={styles.statNumber}>{checkins.length}</Text>
                <Text style={styles.statSmall}>total</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Aujourd’hui</Text>
                <Text style={styles.statNumber}>{todayCheckins.length}</Text>
                <Text style={styles.statSmall}>check-ins</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Douleur moyenne</Text>
                <Text style={styles.statNumber}>{averagePain}</Text>
                <Text style={styles.statSmall}>/10</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Dernier check-in</Text>

              <Text style={styles.dateText}>
                {latestCheckin?.date} à {latestCheckin?.time}
              </Text>

              <View style={styles.painHeader}>
                <Text style={styles.painLabel}>Douleur</Text>
                <Text style={styles.painValue}>
                  {latestCheckin?.painLevel}/10
                </Text>
              </View>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${latestPainPercent}%` },
                  ]}
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fatigue</Text>
                <Text style={styles.detailValue}>
                  {latestCheckin?.fatigueLevel}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Zone principale</Text>
                <Text style={styles.detailValue}>{latestCheckin?.mainZone}</Text>
              </View>

              {latestCheckin?.note && latestCheckin.note.length > 0 && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteTitle}>Note</Text>
                  <Text style={styles.noteText}>{latestCheckin.note}</Text>
                </View>
              )}
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Résumé global</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nombre total de check-ins</Text>
                <Text style={styles.detailValue}>{checkins.length}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Douleur moyenne</Text>
                <Text style={styles.detailValue}>{averagePain}/10</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fatigue moyenne</Text>
                <Text style={styles.detailValue}>{averageFatigue}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Zone la plus fréquente</Text>
                <Text style={styles.detailValue}>{mostFrequentZone}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tendance</Text>
                <Text style={styles.detailValue}>{trend.title}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Derniers check-ins</Text>

              {lastTenCheckins.map((checkin) => {
                const painPercent = Math.round((checkin.painLevel / 10) * 100);
                const isConfirmingDelete = deleteConfirmId === checkin.id;

                return (
                  <View key={checkin.id} style={styles.historyCard}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyDate}>
                        {checkin.date} à {checkin.time}
                      </Text>

                      <Text style={styles.historyPain}>
                        {checkin.painLevel}/10
                      </Text>
                    </View>

                    <View style={styles.miniBarBackground}>
                      <View
                        style={[
                          styles.miniBarFill,
                          { width: `${painPercent}%` },
                        ]}
                      />
                    </View>

                    <Text style={styles.historyText}>
                      Fatigue : {checkin.fatigueLevel} · Zone :{" "}
                      {checkin.mainZone}
                    </Text>

                    {checkin.note.length > 0 && (
                      <Text style={styles.historyNote}>{checkin.note}</Text>
                    )}

                    {!isConfirmingDelete ? (
                      <Pressable
                        style={styles.deleteButton}
                        onPress={() => setDeleteConfirmId(checkin.id)}
                      >
                        <Text style={styles.deleteButtonText}>
                          Supprimer ce check-in
                        </Text>
                      </Pressable>
                    ) : (
                      <View style={styles.deleteConfirmBox}>
                        <Text style={styles.deleteConfirmText}>
                          Confirmer la suppression ?
                        </Text>

                        <Pressable
                          style={styles.confirmDeleteButton}
                          onPress={() => handleDeleteCheckin(checkin.id)}
                        >
                          <Text style={styles.confirmDeleteButtonText}>
                            Oui, supprimer
                          </Text>
                        </Pressable>

                        <Pressable
                          style={styles.cancelDeleteButton}
                          onPress={() => setDeleteConfirmId(null)}
                        >
                          <Text style={styles.cancelDeleteButtonText}>
                            Annuler
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={styles.tipBox}>
              <Text style={styles.tipTitle}>Interprétation</Text>

              <Text style={styles.tipText}>
                Comme vous pouvez ajouter plusieurs check-ins par jour, regardez
                surtout les tendances générales : douleur moyenne, fatigue et
                zones qui reviennent souvent. Une seule mesure isolée ne suffit
                pas toujours à conclure.
              </Text>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Ce suivi est un outil personnel d’éducation et de prévention. Il
                ne remplace pas une consultation médicale. Si une douleur est
                forte, persistante, inhabituelle ou inquiétante, consultez un
                professionnel de la santé.
              </Text>
            </View>

            <Link href="/daily-checkin" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  Ajouter un check-in
                </Text>
              </Pressable>
            </Link>
          </>
        )}

        <Link href="/routine" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir ma routine du jour</Text>
          </Pressable>
        </Link>

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
    emptyCard: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 24,
      marginBottom: 24,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyIcon: {
      fontSize: 44,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 23,
      fontWeight: "900",
      color: colors.text,
      textAlign: "center",
      marginBottom: 10,
    },
    emptyText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      textAlign: "center",
      marginBottom: 18,
    },
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 24,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroGreeting: {
      fontSize: 17,
      fontWeight: "900",
      color: colors.primary,
      marginBottom: 8,
    },
    heroTitle: {
      fontSize: 27,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 10,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 18,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      padding: 15,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 6,
      textAlign: "center",
    },
    statNumber: {
      fontSize: 29,
      fontWeight: "900",
      color: colors.primary,
    },
    statSmall: {
      fontSize: 12,
      fontWeight: "800",
      color: colors.textSoft,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryCard: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 22,
      padding: 20,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 21,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 14,
    },
    dateText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.primary,
      marginBottom: 14,
    },
    painHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    painLabel: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
    },
    painValue: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.primary,
    },
    progressBarBackground: {
      height: 14,
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    detailRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    detailLabel: {
      fontSize: 15,
      fontWeight: "800",
      color: colors.textSoft,
      flex: 1,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
      flex: 1,
    },
    noteBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 16,
      padding: 14,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    noteTitle: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 6,
    },
    noteText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
    },
    historyCard: {
      backgroundColor: colors.cardWarm,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
      gap: 12,
    },
    historyDate: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      flex: 1,
    },
    historyPain: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.primary,
    },
    miniBarBackground: {
      height: 8,
      backgroundColor: colors.card,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    miniBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    historyText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.text,
      fontWeight: "700",
    },
    historyNote: {
      marginTop: 6,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSoft,
    },
    deleteButton: {
      marginTop: 12,
      paddingVertical: 11,
      borderRadius: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerSoft,
    },
    deleteButtonText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: "900",
    },
    deleteConfirmBox: {
      marginTop: 12,
      backgroundColor: colors.dangerSoft,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
    },
    deleteConfirmText: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 10,
      textAlign: "center",
    },
    confirmDeleteButton: {
      backgroundColor: colors.danger,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: "center",
      marginBottom: 8,
    },
    confirmDeleteButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "900",
    },
    cancelDeleteButton: {
      backgroundColor: colors.card,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelDeleteButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
    },
    tipBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 18,
      padding: 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 6,
    },
    tipText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSoft,
    },
    warningBox: {
      backgroundColor: colors.warning,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 14,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
    primaryButton: {
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
