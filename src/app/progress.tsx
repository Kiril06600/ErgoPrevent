import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import {
  APP_STATS_UPDATED_EVENT,
  AppStats,
  getAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";
import AnimatedScreen from "../components/AnimatedScreen";
import PressableScale from "../components/PressableScale";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  IconBadge,
  ProgressIcon,
  RoutineIcon,
  BreakIcon,
  PlanIcon,
} from "../components/ErgoIcons";

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

type TrendKind = "empty" | "good" | "watch" | "stable";

type TrendMessage = {
  title: string;
  text: string;
  kind: TrendKind;
};

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

const CHECKIN_STORAGE_KEY = "ergoprevent_daily_checkins";

const CHECKINS_UPDATED_EVENT = "ergoprevent_checkins_updated";

const quickActions: QuickAction[] = [
  {
    label: "Aujourd’hui",
    title: "Ajouter un check-in",
    text: "Notez douleur, fatigue et zone sensible.",
    href: "/daily-checkin",
    Icon: RoutineIcon,
  },
  {
    label: "Habitude",
    title: "Routine du jour",
    text: "Continuez vos actions quotidiennes.",
    href: "/routine",
    Icon: BreakIcon,
  },
  {
    label: "Vue globale",
    title: "Dashboard",
    text: "Consultez votre résumé complet.",
    href: "/dashboard",
    Icon: PlanIcon,
  },
];

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
  window.dispatchEvent(new Event(CHECKINS_UPDATED_EVENT));
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

function getTrendMessage(checkins: DailyCheckin[]): TrendMessage {
  if (checkins.length < 3) {
    return {
      title: "Pas encore assez de données",
      text: "Ajoutez quelques check-ins pour voir une tendance plus fiable.",
      kind: "empty",
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
      kind: "good",
    };
  }

  if (recentAverage > olderAverage) {
    return {
      title: "Tendance à surveiller",
      text: "Votre douleur moyenne récente semble plus élevée. Essayez de renforcer les pauses, les ajustements et les exercices doux.",
      kind: "watch",
    };
  }

  return {
    title: "Tendance stable",
    text: "Votre douleur moyenne semble relativement stable pour le moment.",
    kind: "stable",
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
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [checkins, setCheckins] = useState<DailyCheckin[]>(() =>
    getSavedCheckins()
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { colors, mode } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = createStyles(colors, mode, layout);

  useEffect(() => {
    function refreshData() {
      setStats(getAppStats());
      setCheckins(getSavedCheckins());
    }

    refreshData();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(APP_STATS_UPDATED_EVENT, refreshData);
    window.addEventListener(CHECKINS_UPDATED_EVENT, refreshData);
    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshData);
      window.removeEventListener(CHECKINS_UPDATED_EVENT, refreshData);
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  const profile = stats.profile ?? null;

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
    const updatedCheckins = checkins.filter(
      (checkin) => checkin.id !== checkinId
    );

    setCheckins(updatedCheckins);
    saveCheckins(updatedCheckins);
    setDeleteConfirmId(null);
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Suivi personnel</Text>
            </View>

            <Text style={styles.pageTitle}>Évolution</Text>

            <Text style={styles.subtitle}>
              Suivez vos check-ins pour comprendre l’évolution de votre douleur,
              de votre fatigue et des zones sensibles.
            </Text>
          </View>

          {!hasCheckins && (
            <>
              <View style={styles.emptyCard}>
                <IconBadge
                  size={layout.isMobile ? 52 : 58}
                  backgroundColor={colors.backgroundSoft}
                  borderColor={colors.border}
                >
                  <ProgressIcon
                    size={layout.isMobile ? 24 : 27}
                    color={colors.text}
                  />
                </IconBadge>

                <Text style={styles.emptyTitle}>
                  Aucun check-in pour l’instant
                </Text>

                <Text style={styles.emptyText}>
                  Faites votre premier check-in pour commencer à suivre votre
                  évolution.
                </Text>

                <Link href="/daily-checkin" asChild>
                  <PressableScale style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>
                      Faire mon premier check-in
                    </Text>
                    <Text style={styles.primaryButtonArrow}>→</Text>
                  </PressableScale>
                </Link>
              </View>

              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>Pourquoi suivre l’évolution?</Text>
                <Text style={styles.tipText}>
                  Les check-ins aident à repérer les tendances : douleur
                  moyenne, fatigue et zones qui reviennent souvent.
                </Text>
              </View>
            </>
          )}

          {hasCheckins && (
            <>
              <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroTextBlock}>
                    <Text style={styles.heroGreeting}>
                      {profile?.firstName
                        ? `Suivi de ${profile.firstName}`
                        : "Votre suivi"}
                    </Text>

                    <Text style={styles.heroTitle}>{trend.title}</Text>
                  </View>

                  <View style={styles.trendBadge}>
                    <TrendMiniIcon kind={trend.kind} color={colors.text} />
                  </View>
                </View>

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
                  <Text style={styles.statLabel}>Douleur</Text>
                  <Text style={styles.statNumber}>{averagePain}</Text>
                  <Text style={styles.statSmall}>/10 moyenne</Text>
                </View>
              </View>

              <View style={styles.latestCard}>
                <View style={styles.latestSectionIntro}>
                  <Text style={styles.sectionTitle}>Dernier check-in</Text>
                  <Text style={styles.sectionSubtitle}>
                    Votre mesure la plus récente
                  </Text>
                </View>

                <View style={styles.latestHeader}>
                  <IconBadge
                    size={layout.isMobile ? 43 : 48}
                    backgroundColor={colors.turquoiseSoft}
                    borderColor={colors.border}
                  >
                    <RoutineIcon
                      size={layout.isMobile ? 20 : 23}
                      color={colors.text}
                    />
                  </IconBadge>

                  <View style={styles.latestHeaderText}>
                    <Text style={styles.dateText}>
                      {latestCheckin?.date} à {latestCheckin?.time}
                    </Text>
                    <Text style={styles.latestTitle}>État enregistré</Text>
                  </View>
                </View>

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
                  <Text style={styles.detailValue}>
                    {latestCheckin?.mainZone}
                  </Text>
                </View>

                {latestCheckin?.note && latestCheckin.note.length > 0 && (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteTitle}>Note</Text>
                    <Text style={styles.noteText}>{latestCheckin.note}</Text>
                  </View>
                )}
              </View>

              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderTextBlock}>
                  <Text style={styles.sectionTitle}>Résumé global</Text>
                  <Text style={styles.sectionSubtitle}>
                    Les grandes tendances de votre suivi.
                  </Text>
                </View>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Nombre total de check-ins
                  </Text>
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
                  <Text style={styles.detailLabel}>
                    Zone la plus fréquente
                  </Text>
                  <Text style={styles.detailValue}>{mostFrequentZone}</Text>
                </View>

                <View style={styles.detailRowLast}>
                  <Text style={styles.detailLabel}>Tendance</Text>
                  <Text style={styles.detailValue}>{trend.title}</Text>
                </View>
              </View>

              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderTextBlock}>
                  <Text style={styles.sectionTitle}>Derniers check-ins</Text>
                  <Text style={styles.sectionSubtitle}>
                    Les dix entrées les plus récentes.
                  </Text>
                </View>
              </View>

              <View style={styles.historySection}>
                {lastTenCheckins.map((checkin) => {
                  const painPercent = Math.round(
                    (checkin.painLevel / 10) * 100
                  );
                  const isConfirmingDelete = deleteConfirmId === checkin.id;

                  return (
                    <View key={checkin.id} style={styles.historyCard}>
                      <View style={styles.historyHeader}>
                        <View style={styles.historyHeaderTextBlock}>
                          <Text style={styles.historyDate}>
                            {checkin.date} à {checkin.time}
                          </Text>
                          <Text style={styles.historySubtitle}>
                            {checkin.mainZone} · fatigue {checkin.fatigueLevel}
                          </Text>
                        </View>

                        <View style={styles.historyPainBadge}>
                          <Text style={styles.historyPainNumber}>
                            {checkin.painLevel}
                          </Text>
                          <Text style={styles.historyPainSmall}>/10</Text>
                        </View>
                      </View>

                      <View style={styles.miniBarBackground}>
                        <View
                          style={[
                            styles.miniBarFill,
                            { width: `${painPercent}%` },
                          ]}
                        />
                      </View>

                      {checkin.note.length > 0 && (
                        <Text style={styles.historyNote}>{checkin.note}</Text>
                      )}

                      {!isConfirmingDelete ? (
                        <PressableScale
                          style={styles.deleteButton}
                          onPress={() => setDeleteConfirmId(checkin.id)}
                        >
                          <Text style={styles.deleteButtonText}>
                            Supprimer ce check-in
                          </Text>
                        </PressableScale>
                      ) : (
                        <View style={styles.deleteConfirmBox}>
                          <Text style={styles.deleteConfirmText}>
                            Confirmer la suppression ?
                          </Text>

                          <PressableScale
                            style={styles.confirmDeleteButton}
                            onPress={() => handleDeleteCheckin(checkin.id)}
                          >
                            <Text style={styles.confirmDeleteButtonText}>
                              Oui, supprimer
                            </Text>
                          </PressableScale>

                          <PressableScale
                            style={styles.cancelDeleteButton}
                            onPress={() => setDeleteConfirmId(null)}
                          >
                            <Text style={styles.cancelDeleteButtonText}>
                              Annuler
                            </Text>
                          </PressableScale>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={styles.sectionHeaderRow}>
                <View style={styles.sectionHeaderTextBlock}>
                  <Text style={styles.sectionTitle}>Actions rapides</Text>
                  <Text style={styles.sectionSubtitle}>
                    Continuez votre suivi ou votre routine.
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
                      <PressableScale style={styles.quickCard}>
                        <IconBadge
                          size={layout.isMobile ? 40 : 44}
                          backgroundColor={colors.backgroundSoft}
                          borderColor={colors.border}
                        >
                          <QuickIcon
                            size={layout.isMobile ? 19 : 21}
                            color={colors.text}
                          />
                        </IconBadge>

                        <Text style={styles.quickLabel}>{item.label}</Text>
                        <Text style={styles.quickTitle}>{item.title}</Text>
                        <Text style={styles.quickText}>{item.text}</Text>

                        <View style={styles.quickArrowCircle}>
                          <Text style={styles.quickArrowText}>→</Text>
                        </View>
                      </PressableScale>
                    </Link>
                  );
                })}
              </ScrollView>

              <View style={styles.tipBox}>
                <Text style={styles.tipTitle}>Interprétation</Text>

                <Text style={styles.tipText}>
                  Comme vous pouvez ajouter plusieurs check-ins par jour,
                  regardez surtout les tendances générales : douleur moyenne,
                  fatigue et zones qui reviennent souvent.
                </Text>
              </View>

              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>À retenir</Text>
                <Text style={styles.warningText}>
                  Ce suivi est un outil personnel d’éducation et de prévention.
                  Il ne remplace pas une consultation médicale. Si une douleur
                  est forte, persistante, inhabituelle ou inquiétante, consultez
                  un professionnel de la santé.
                </Text>
              </View>
            </>
          )}

          <BottomNav />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function TrendMiniIcon({ kind, color }: { kind: TrendKind; color: string }) {
  const lineColor = color;

  if (kind === "good") {
    return (
      <View style={trendIconStyles.iconBox}>
        <View
          style={[
            trendIconStyles.trendLine,
            trendIconStyles.trendLineOne,
            { backgroundColor: lineColor },
          ]}
        />
        <View
          style={[
            trendIconStyles.trendLine,
            trendIconStyles.trendLineTwoGood,
            { backgroundColor: lineColor },
          ]}
        />
      </View>
    );
  }

  if (kind === "watch") {
    return (
      <View style={trendIconStyles.iconBox}>
        <View
          style={[
            trendIconStyles.trendLine,
            trendIconStyles.trendLineOne,
            { backgroundColor: lineColor },
          ]}
        />
        <View
          style={[
            trendIconStyles.trendLine,
            trendIconStyles.trendLineTwoWatch,
            { backgroundColor: lineColor },
          ]}
        />
      </View>
    );
  }

  if (kind === "stable") {
    return (
      <View style={trendIconStyles.iconBox}>
        <View
          style={[
            trendIconStyles.stableLine,
            { backgroundColor: lineColor },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={trendIconStyles.iconBox}>
      <View
        style={[
          trendIconStyles.emptyDot,
          { backgroundColor: lineColor },
        ]}
      />
      <View
        style={[
          trendIconStyles.emptyLine,
          { backgroundColor: lineColor },
        ]}
      />
    </View>
  );
}

const trendIconStyles = StyleSheet.create({
  iconBox: {
    width: 24,
    height: 24,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  trendLine: {
    position: "absolute",
    height: 3,
    borderRadius: 999,
  },
  trendLineOne: {
    width: 12,
    left: 3,
    top: 14,
    transform: [{ rotate: "-24deg" }],
  },
  trendLineTwoGood: {
    width: 12,
    left: 11,
    top: 10,
    transform: [{ rotate: "-38deg" }],
  },
  trendLineTwoWatch: {
    width: 12,
    left: 11,
    top: 12,
    transform: [{ rotate: "38deg" }],
  },
  stableLine: {
    width: 18,
    height: 3,
    borderRadius: 999,
  },
  emptyDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginBottom: 4,
  },
  emptyLine: {
    width: 16,
    height: 3,
    borderRadius: 999,
  },
});

function createStyles(
  colors: ThemeColors,
  mode: "light" | "dark",
  layout: ReturnType<typeof useResponsiveLayout>
) {
  const isMobile = layout.isMobile;
  const isSmallMobile = layout.isSmallMobile;
  const horizontalPadding = layout.horizontalPadding;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingTop: isMobile ? 18 : 24,
      paddingBottom: isMobile ? 38 : 48,
    },
    pageHeader: {
      paddingHorizontal: horizontalPadding,
      marginTop: isMobile ? 6 : 10,
      marginBottom: isMobile ? 18 : 22,
    },
    pagePill: {
      alignSelf: "flex-start",
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: isMobile ? 7 : 8,
      paddingHorizontal: isMobile ? 11 : 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: isMobile ? 12 : 14,
    },
    pagePillText: {
      color: colors.textSoft,
      fontSize: isMobile ? 11 : 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    pageTitle: {
      fontFamily: "Georgia",
      fontSize: isSmallMobile ? 31 : isMobile ? 34 : 38,
      lineHeight: isSmallMobile ? 38 : isMobile ? 41 : 45,
      color: colors.primary,
      letterSpacing: -0.8,
      marginBottom: isMobile ? 8 : 10,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    subtitle: {
      fontSize: isMobile ? 14 : 16,
      lineHeight: isMobile ? 21 : 24,
      color: colors.textSoft,
      maxWidth: 520,
    },
    emptyCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 28 : 34,
      padding: isMobile ? 20 : 24,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      overflow: "hidden",
      position: "relative",
      boxShadow:
        mode === "dark"
          ? "0px 20px 42px rgba(0,0,0,0.16)"
          : "0px 20px 42px rgba(0,0,0,0.10)",
    },
    emptyTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 23 : 27,
      lineHeight: isMobile ? 29 : 34,
      color: colors.primary,
      textAlign: "center",
      marginTop: isMobile ? 16 : 18,
      marginBottom: 10,
      zIndex: 2,
      textShadowColor: "rgba(0,0,0,0.18)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    emptyText: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 22,
      color: colors.textSoft,
      textAlign: "center",
      marginBottom: 18,
      maxWidth: 430,
      zIndex: 2,
    },
    heroCard: {
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 16 : 18,
      borderRadius: isMobile ? 28 : 36,
      padding: isMobile ? 20 : 24,
      minHeight: isMobile ? 220 : 245,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      position: "relative",
      justifyContent: "space-between",
      boxShadow:
        mode === "dark"
          ? "0px 20px 42px rgba(0,0,0,0.16)"
          : "0px 20px 42px rgba(0,0,0,0.10)",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: isMobile ? 12 : 16,
      zIndex: 2,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroGreeting: {
      fontSize: isMobile ? 14 : 16,
      fontWeight: "900",
      color: colors.primary,
      marginBottom: 8,
    },
    heroTitle: {
      fontFamily: "Georgia",
      fontSize: isSmallMobile ? 27 : isMobile ? 30 : 34,
      lineHeight: isSmallMobile ? 33 : isMobile ? 36 : 41,
      color: colors.primary,
      letterSpacing: -0.7,
      maxWidth: isMobile ? 235 : 360,
      textShadowColor: "rgba(0,0,0,0.20)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 7,
    },
    heroText: {
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 21 : 23,
      color: colors.textSoft,
      maxWidth: 460,
      zIndex: 2,
      marginTop: isMobile ? 18 : 22,
    },
    trendBadge: {
      width: isMobile ? 50 : 58,
      height: isMobile ? 50 : 58,
      borderRadius: isMobile ? 25 : 29,
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    statsGrid: {
      flexDirection: "row",
      gap: isMobile ? 9 : 12,
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 24 : 26,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 21 : 26,
      paddingVertical: isMobile ? 14 : 16,
      paddingHorizontal: isMobile ? 8 : 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statLabel: {
      fontSize: isMobile ? 9 : 11,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 7,
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    statNumber: {
      fontSize: isMobile ? 25 : 32,
      lineHeight: isMobile ? 30 : 36,
      fontWeight: "900",
      color: colors.primary,
    },
    statSmall: {
      fontSize: isMobile ? 10 : 11,
      fontWeight: "800",
      color: colors.textSoft,
      textAlign: "center",
      marginTop: 3,
    },
    sectionHeaderRow: {
      paddingHorizontal: horizontalPadding,
      marginBottom: isMobile ? 12 : 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
      gap: 16,
    },
    sectionHeaderTextBlock: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 24 : 28,
      lineHeight: isMobile ? 30 : 35,
      color: colors.primary,
      letterSpacing: -0.5,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 19 : 20,
      color: colors.textSoft,
    },
    sectionAction: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 4,
    },
    latestCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 26 : 30,
      padding: isMobile ? 17 : 20,
      marginBottom: isMobile ? 24 : 26,
      borderWidth: 1,
      borderColor: colors.border,
    },
    latestSectionIntro: {
      marginBottom: isMobile ? 16 : 18,
    },
    latestHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: isMobile ? 12 : 14,
      marginBottom: isMobile ? 16 : 18,
    },
    latestHeaderText: {
      flex: 1,
    },
    dateText: {
      fontSize: isMobile ? 11 : 12,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 5,
    },
    latestTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 21 : 23,
      lineHeight: isMobile ? 26 : 29,
      color: colors.primary,
      letterSpacing: -0.3,
    },
    painHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    painLabel: {
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      color: colors.text,
    },
    painValue: {
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      color: colors.primary,
    },
    progressBarBackground: {
      height: isMobile ? 12 : 14,
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: isMobile ? 16 : 18,
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
      paddingVertical: isMobile ? 12 : 13,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    detailRowLast: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: isMobile ? 12 : 13,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    detailLabel: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "800",
      color: colors.textSoft,
      flex: 1,
    },
    detailValue: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
      flex: 1,
    },
    noteBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 18,
      padding: isMobile ? 13 : 14,
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
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 19 : 20,
      color: colors.textSoft,
    },
    summaryCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.secondaryLight,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 17 : 20,
      marginBottom: isMobile ? 24 : 26,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historySection: {
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 24 : 26,
    },
    historyCard: {
      backgroundColor: colors.card,
      borderRadius: isMobile ? 22 : 24,
      padding: isMobile ? 15 : 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
      gap: 12,
    },
    historyHeaderTextBlock: {
      flex: 1,
    },
    historyDate: {
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 4,
    },
    historySubtitle: {
      fontSize: isMobile ? 12 : 13,
      lineHeight: isMobile ? 17 : 18,
      color: colors.textSoft,
      fontWeight: "700",
    },
    historyPainBadge: {
      minWidth: isMobile ? 46 : 50,
      height: isMobile ? 39 : 42,
      borderRadius: isMobile ? 20 : 21,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      paddingHorizontal: 9,
    },
    historyPainNumber: {
      fontSize: isMobile ? 17 : 19,
      fontWeight: "900",
      color: colors.black,
    },
    historyPainSmall: {
      fontSize: 10,
      fontWeight: "900",
      color: colors.black,
      marginTop: 5,
    },
    miniBarBackground: {
      height: 9,
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    miniBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 20,
    },
    historyNote: {
      marginTop: 4,
      fontSize: isMobile ? 12 : 13,
      lineHeight: isMobile ? 18 : 19,
      color: colors.textSoft,
    },
    deleteButton: {
      alignSelf: isMobile ? "stretch" : "flex-start",
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 13,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.dangerBorder,
      backgroundColor: colors.dangerSoft,
    },
    deleteButtonText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center",
    },
    deleteConfirmBox: {
      marginTop: 12,
      backgroundColor: colors.dangerSoft,
      borderRadius: 20,
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
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
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
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelDeleteButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
    },
    quickActionsRow: {
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      gap: 12,
      marginBottom: isMobile ? 22 : 24,
    },
    quickCard: {
      width: isSmallMobile ? 155 : isMobile ? 165 : 165,
      minHeight: isMobile ? 185 : 200,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 24 : 28,
      padding: isMobile ? 15 : 17,
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
      marginTop: isMobile ? 12 : 14,
      marginBottom: 7,
    },
    quickTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 19,
      lineHeight: isMobile ? 22 : 24,
      color: colors.primary,
      marginBottom: 6,
    },
    quickText: {
      fontSize: isMobile ? 12 : 13,
      lineHeight: isMobile ? 18 : 19,
      color: colors.textSoft,
      marginBottom: 12,
    },
    quickArrowCircle: {
      width: isMobile ? 34 : 38,
      height: isMobile ? 34 : 38,
      borderRadius: isMobile ? 17 : 19,
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
    tipBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.secondaryLight,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tipTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.primary,
      marginBottom: 6,
    },
    tipText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSoft,
    },
    warningBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 14,
    },
    warningTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.warningText,
      marginBottom: 5,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: isMobile ? 16 : 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
      alignSelf: isMobile ? "stretch" : "center",
      zIndex: 2,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      textAlign: "center",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
  });
}