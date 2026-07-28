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
  ProfileIcon,
  ProgressIcon,
  PlanIcon,
  RoutineIcon,
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

type ExportIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type AppRoute = "/profile" | "/dashboard" | "/routine" | "/personal-plan";

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
const ROUTINE_STORAGE_KEY = "ergoprevent_daily_routine";
const THEME_STORAGE_KEY = "ergoprevent_theme_mode";

const CHECKINS_UPDATED_EVENT = "ergoprevent_checkins_updated";
const ROUTINE_UPDATED_EVENT = "ergoprevent_routine_updated";

const quickActions: QuickAction[] = [
  {
    label: "Profil",
    title: "Retour",
    text: "Revenir à vos paramètres.",
    href: "/profile",
    Icon: ProfileIcon,
  },
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
    text: "Voir vos priorités.",
    href: "/personal-plan",
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

function escapeCsvValue(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);
  const escapedText = text.replace(/"/g, '""');

  return `"${escapedText}"`;
}

function escapeHtml(value: string | number | null | undefined) {
  const text = value === null || value === undefined ? "" : String(value);

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function convertCheckinsToCsv(checkins: DailyCheckin[]) {
  const header = [
    "id",
    "date",
    "heure",
    "douleur_sur_10",
    "fatigue",
    "zone_principale",
    "note",
  ];

  const rows = checkins.map((checkin) => [
    checkin.id,
    checkin.date,
    checkin.time,
    checkin.painLevel,
    checkin.fatigueLevel,
    checkin.mainZone,
    checkin.note,
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

function convertSummaryToCsv(stats: AppStats, checkins: DailyCheckin[]) {
  const rows = [
    ["Champ", "Valeur"],
    ["Prénom", stats.profile?.firstName ?? ""],
    ["Statut", stats.profile?.status ?? ""],
    ["Profession", stats.profile?.profession ?? ""],
    ["Objectif principal", stats.profile?.mainGoal ?? ""],
    ["Score TMS", stats.questionnaireResult?.score ?? ""],
    ["Niveau TMS", stats.questionnaireResult?.level ?? ""],
    [
      "Priorités TMS",
      stats.questionnaireResult?.priorities?.join(" | ") ?? "",
    ],
    ["Score poste", stats.workstationAuditResult?.score ?? ""],
    ["Niveau poste", stats.workstationAuditResult?.level ?? ""],
    [
      "Priorités poste",
      stats.workstationAuditResult?.priorities?.join(" | ") ?? "",
    ],
    ["Pauses complétées", stats.completedBreaks],
    ["Exercices complétés", stats.completedExercises],
    ["Capsules lues", stats.completedCapsules],
    ["Points", stats.points],
    ["Nombre de check-ins", checkins.length],
  ];

  return rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  if (typeof document === "undefined") {
    return false;
  }

  const blob = new Blob([content], {
    type: `${mimeType};charset=utf-8`,
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);

  return true;
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

function createPdfReportHtml(stats: AppStats, checkins: DailyCheckin[]) {
  const profile = stats.profile;
  const questionnaire = stats.questionnaireResult;
  const workstation = stats.workstationAuditResult;

  const latestCheckins = checkins.slice(0, 10);
  const averagePain = getAveragePain(checkins);
  const mostFrequentZone = getMostFrequentZone(checkins);

  const checkinRows =
    latestCheckins.length > 0
      ? latestCheckins
          .map(
            (checkin) => `
              <tr>
                <td>${escapeHtml(checkin.date)}</td>
                <td>${escapeHtml(checkin.time)}</td>
                <td>${escapeHtml(checkin.painLevel)}/10</td>
                <td>${escapeHtml(checkin.fatigueLevel)}</td>
                <td>${escapeHtml(checkin.mainZone)}</td>
                <td>${escapeHtml(checkin.note || "-")}</td>
              </tr>
            `
          )
          .join("")
      : `
          <tr>
            <td colspan="6">Aucun check-in sauvegardé.</td>
          </tr>
        `;

  return `
    <!doctype html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>Rapport ErgoPrevent</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #03110D;
            padding: 32px;
            line-height: 1.5;
            background: #FFFFFF;
          }

          h1 {
            font-size: 30px;
            margin-bottom: 4px;
          }

          h2 {
            font-size: 20px;
            margin-top: 28px;
            border-bottom: 1px solid #D8C4B6;
            padding-bottom: 6px;
          }

          .subtitle {
            color: #4D5A53;
            margin-bottom: 24px;
          }

          .box {
            border: 1px solid #E6DED3;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
            background: #FBF7F0;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .label {
            font-weight: bold;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 13px;
          }

          th,
          td {
            border: 1px solid #E6DED3;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #D8C4B6;
          }

          .warning {
            margin-top: 28px;
            font-size: 12px;
            color: #7D6548;
            border: 1px solid #E8D0A8;
            background: #FFF6E8;
            padding: 12px;
            border-radius: 10px;
          }

          @media print {
            body {
              padding: 16px;
            }
          }
        </style>
      </head>

      <body>
        <h1>Rapport ErgoPrevent</h1>
        <p class="subtitle">
          Rapport généré le ${escapeHtml(new Date().toLocaleString("fr-CA"))}
        </p>

        <h2>Profil</h2>
        <div class="box grid">
          <div><span class="label">Prénom :</span> ${escapeHtml(profile?.firstName || "-")}</div>
          <div><span class="label">Statut :</span> ${escapeHtml(profile?.status || "-")}</div>
          <div><span class="label">Profession :</span> ${escapeHtml(profile?.profession || "-")}</div>
          <div><span class="label">Objectif :</span> ${escapeHtml(profile?.mainGoal || "-")}</div>
        </div>

        <h2>Scores</h2>
        <div class="box grid">
          <div>
            <span class="label">Score TMS :</span>
            ${questionnaire ? `${escapeHtml(questionnaire.score)}/100` : "-"}
          </div>
          <div>
            <span class="label">Niveau TMS :</span>
            ${escapeHtml(questionnaire?.level || "-")}
          </div>
          <div>
            <span class="label">Score poste :</span>
            ${workstation ? `${escapeHtml(workstation.score)}/100` : "-"}
          </div>
          <div>
            <span class="label">Niveau poste :</span>
            ${escapeHtml(workstation?.level || "-")}
          </div>
        </div>

        <h2>Priorités</h2>
        <div class="box">
          <p>
            <span class="label">Priorités TMS :</span>
            ${escapeHtml(questionnaire?.priorities?.join(", ") || "-")}
          </p>
          <p>
            <span class="label">Priorités du poste :</span>
            ${escapeHtml(workstation?.priorities?.join(", ") || "-")}
          </p>
        </div>

        <h2>Progression</h2>
        <div class="box grid">
          <div><span class="label">Pauses :</span> ${escapeHtml(stats.completedBreaks)}</div>
          <div><span class="label">Exercices :</span> ${escapeHtml(stats.completedExercises)}</div>
          <div><span class="label">Capsules :</span> ${escapeHtml(stats.completedCapsules)}</div>
          <div><span class="label">Points :</span> ${escapeHtml(stats.points)}</div>
        </div>

        <h2>Check-ins</h2>
        <div class="box grid">
          <div><span class="label">Nombre total :</span> ${escapeHtml(checkins.length)}</div>
          <div><span class="label">Douleur moyenne :</span> ${escapeHtml(averagePain)}/10</div>
          <div><span class="label">Zone fréquente :</span> ${escapeHtml(mostFrequentZone)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Heure</th>
              <th>Douleur</th>
              <th>Fatigue</th>
              <th>Zone</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            ${checkinRows}
          </tbody>
        </table>

        <div class="warning">
          ErgoPrevent est un outil d’éducation et de prévention. Ce rapport ne
          remplace pas une consultation avec un professionnel de la santé ou de
          l’ergonomie.
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
}

function LockIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: ExportIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.26,
          top: size * 0.42,
          width: size * 0.48,
          height: size * 0.36,
          borderRadius: 4,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.18,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
          borderBottomColor: "transparent",
        }}
      />
    </View>
  );
}

function CsvIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: ExportIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.18,
          top: size * 0.12,
          width: size * 0.64,
          height: size * 0.72,
          borderRadius: 5,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      {[0.32, 0.48, 0.64].map((top) => (
        <View
          key={top}
          style={{
            position: "absolute",
            left: size * 0.28,
            top: size * top,
            width: size * 0.44,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: 999,
          }}
        />
      ))}
    </View>
  );
}

function JsonIcon({ size = 22, color = "#163028" }: ExportIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <Text
        style={{
          position: "absolute",
          left: size * 0.18,
          top: size * 0.08,
          color,
          fontSize: size * 0.78,
          lineHeight: size,
          fontWeight: "900",
        }}
      >
        {"{}"}
      </Text>
    </View>
  );
}

function PdfIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: ExportIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.2,
          top: size * 0.12,
          width: size * 0.56,
          height: size * 0.72,
          borderRadius: 5,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          right: size * 0.2,
          top: size * 0.12,
          width: size * 0.18,
          height: size * 0.18,
          borderRightWidth: strokeWidth,
          borderTopWidth: strokeWidth,
          borderColor: color,
          transform: [{ rotate: "45deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.32,
          top: size * 0.58,
          width: size * 0.32,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function DownloadIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: ExportIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.48,
          top: size * 0.14,
          width: strokeWidth,
          height: size * 0.42,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.44,
          width: size * 0.18,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "38deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          right: size * 0.34,
          top: size * 0.44,
          width: size * 0.18,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-38deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.24,
          top: size * 0.76,
          width: size * 0.52,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

export default function ExportDataScreen() {
  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [checkins, setCheckins] = useState<DailyCheckin[]>(() =>
    getSavedCheckins()
  );
  const [message, setMessage] = useState("");

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
    window.addEventListener(ROUTINE_UPDATED_EVENT, refreshData);
    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", refreshData);
    }

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshData);
      window.removeEventListener(CHECKINS_UPDATED_EVENT, refreshData);
      window.removeEventListener(ROUTINE_UPDATED_EVENT, refreshData);
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);

      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", refreshData);
      }
    };
  }, []);

  const appStats = stats;

  const fullExportData = {
    appStats,
    checkins,
    routine: readLocalStorageValue(ROUTINE_STORAGE_KEY),
    themeMode: readLocalStorageValue(THEME_STORAGE_KEY),
    exportedAt: new Date().toISOString(),
  };

  const averagePain = getAveragePain(checkins);
  const mostFrequentZone = getMostFrequentZone(checkins);

  function handleDownloadCheckinsCsv() {
    const csvContent = convertCheckinsToCsv(checkins);
    const success = downloadTextFile(
      "ergoprevent-checkins.csv",
      csvContent,
      "text/csv"
    );

    setMessage(
      success
        ? "Export CSV des check-ins téléchargé"
        : "Export non disponible sur cet appareil."
    );
  }

  function handleDownloadSummaryCsv() {
    const csvContent = convertSummaryToCsv(appStats, checkins);
    const success = downloadTextFile(
      "ergoprevent-resume.csv",
      csvContent,
      "text/csv"
    );

    setMessage(
      success
        ? "Résumé CSV téléchargé"
        : "Export non disponible sur cet appareil."
    );
  }

  function handleDownloadJson() {
    const jsonContent = JSON.stringify(fullExportData, null, 2);
    const success = downloadTextFile(
      "ergoprevent-donnees-completes.json",
      jsonContent,
      "application/json"
    );

    setMessage(
      success
        ? "Export JSON complet téléchargé"
        : "Export non disponible sur cet appareil."
    );
  }

  function handlePrintPdfReport() {
    if (typeof window === "undefined") {
      setMessage("Rapport PDF non disponible sur cet appareil.");
      return;
    }

    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
      setMessage(
        "Le rapport n’a pas pu s’ouvrir. Vérifiez si votre navigateur bloque les fenêtres."
      );
      return;
    }

    reportWindow.document.open();
    reportWindow.document.write(createPdfReportHtml(appStats, checkins));
    reportWindow.document.close();

    setMessage("Rapport PDF ouvert. Utilisez Enregistrer en PDF.");
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Données locales</Text>
            </View>

            <Text style={styles.pageTitle}>Exporter</Text>

            <Text style={styles.subtitle}>
              Téléchargez vos données en CSV, en JSON ou générez un rapport
              imprimable en PDF.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroLabel}>Confidentialité</Text>
                <Text style={styles.heroTitle}>Vos données restent locales.</Text>
              </View>

              <IconBadge
                size={layout.isMobile ? 50 : 58}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <LockIcon
                  size={layout.isMobile ? 24 : 28}
                  color={colors.text}
                />
              </IconBadge>
            </View>

            <Text style={styles.heroText}>
              Les exports sont générés directement dans votre navigateur. Les
              données ne sont pas envoyées vers un serveur externe.
            </Text>
          </View>

          <View style={styles.statsPanel}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{checkins.length}</Text>
              <Text style={styles.statLabel}>check-ins</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{averagePain}</Text>
              <Text style={styles.statLabel}>douleur</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{appStats.points}</Text>
              <Text style={styles.statLabel}>points</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <DownloadIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Formats disponibles</Text>
                <Text style={styles.sectionSubtitle}>
                  Choisissez le type de fichier à générer.
                </Text>
              </View>
            </View>

            <PressableScale
              style={styles.exportButtonPrimary}
              onPress={handleDownloadCheckinsCsv}
            >
              <IconBadge
                size={layout.isMobile ? 36 : 38}
                backgroundColor={colors.primaryLight}
                borderColor={colors.border}
              >
                <CsvIcon
                  size={layout.isMobile ? 17 : 18}
                  color={colors.black}
                />
              </IconBadge>

              <View style={styles.exportButtonTextBlock}>
                <Text style={styles.exportButtonTitlePrimary}>
                  Exporter les check-ins
                </Text>
                <Text style={styles.exportButtonSubtitlePrimary}>CSV</Text>
              </View>

              <Text style={styles.exportArrowPrimary}>→</Text>
            </PressableScale>

            <PressableScale
              style={styles.exportButton}
              onPress={handleDownloadSummaryCsv}
            >
              <IconBadge
                size={layout.isMobile ? 36 : 38}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <CsvIcon
                  size={layout.isMobile ? 17 : 18}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.exportButtonTextBlock}>
                <Text style={styles.exportButtonTitle}>Résumé global</Text>
                <Text style={styles.exportButtonSubtitle}>CSV</Text>
              </View>

              <Text style={styles.exportArrow}>→</Text>
            </PressableScale>

            <PressableScale style={styles.exportButton} onPress={handleDownloadJson}>
              <IconBadge
                size={layout.isMobile ? 36 : 38}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <JsonIcon
                  size={layout.isMobile ? 17 : 18}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.exportButtonTextBlock}>
                <Text style={styles.exportButtonTitle}>Données complètes</Text>
                <Text style={styles.exportButtonSubtitle}>JSON</Text>
              </View>

              <Text style={styles.exportArrow}>→</Text>
            </PressableScale>

            <PressableScale style={styles.exportButton} onPress={handlePrintPdfReport}>
              <IconBadge
                size={layout.isMobile ? 36 : 38}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <PdfIcon
                  size={layout.isMobile ? 17 : 18}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.exportButtonTextBlock}>
                <Text style={styles.exportButtonTitle}>Rapport imprimable</Text>
                <Text style={styles.exportButtonSubtitle}>PDF</Text>
              </View>

              <Text style={styles.exportArrow}>→</Text>
            </PressableScale>

            {message.length > 0 && (
              <View style={styles.messageBox}>
                <Text style={styles.savedMessage}>{message}</Text>
              </View>
            )}
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.turquoiseSoft}
                borderColor={colors.border}
              >
                <ProgressIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Résumé exportable</Text>
                <Text style={styles.sectionSubtitle}>
                  Aperçu des principales données.
                </Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryMiniCard}>
                <Text style={styles.summaryMiniNumber}>{checkins.length}</Text>
                <Text style={styles.summaryMiniLabel}>Check-ins</Text>
              </View>

              <View style={styles.summaryMiniCard}>
                <Text style={styles.summaryMiniNumber}>{averagePain}</Text>
                <Text style={styles.summaryMiniLabel}>Douleur</Text>
              </View>

              <View style={styles.summaryMiniCard}>
                <Text style={styles.summaryMiniNumber}>{appStats.points}</Text>
                <Text style={styles.summaryMiniLabel}>Points</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Prénom</Text>
              <Text style={styles.summaryValue}>
                {appStats.profile?.firstName || "-"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Score TMS</Text>
              <Text style={styles.summaryValue}>
                {appStats.questionnaireResult
                  ? `${appStats.questionnaireResult.score}/100`
                  : "-"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Score poste</Text>
              <Text style={styles.summaryValue}>
                {appStats.workstationAuditResult
                  ? `${appStats.workstationAuditResult.score}/100`
                  : "-"}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Zone fréquente</Text>
              <Text style={styles.summaryValueSmall}>{mostFrequentZone}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <JsonIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Aperçu complet</Text>
                <Text style={styles.sectionSubtitle}>
                  Vérifiez les données avant export.
                </Text>
              </View>
            </View>

            <Text style={styles.dataText}>
              Cet aperçu montre les données locales qui peuvent être exportées.
            </Text>

            <View style={styles.dataBox}>
              <ScrollView
                style={styles.dataScroll}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <ScrollView horizontal showsHorizontalScrollIndicator>
                  <Text selectable style={styles.dataCode}>
                    {JSON.stringify(fullExportData, null, 2)}
                  </Text>
                </ScrollView>
              </ScrollView>
            </View>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>À retenir</Text>
            <Text style={styles.warningText}>
              Après export, le fichier téléchargé est sous votre responsabilité.
              Évitez de partager ces fichiers s’ils contiennent des informations
              personnelles ou de santé.
            </Text>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitleLarge}>Actions rapides</Text>
              <Text style={styles.sectionSubtitle}>
                Retournez au profil ou au tableau de bord.
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

          <BottomNav />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

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
    heroLabel: {
      fontSize: isMobile ? 12 : 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
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
      maxWidth: 500,
      zIndex: 2,
      marginTop: isMobile ? 18 : 22,
    },
    statsPanel: {
      marginHorizontal: horizontalPadding,
      marginBottom: isMobile ? 16 : 18,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 22 : 26,
      padding: isMobile ? 13 : 16,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statDivider: {
      width: 1,
      height: isMobile ? 34 : 38,
      backgroundColor: colors.border,
    },
    statNumber: {
      fontSize: isMobile ? 19 : 23,
      fontWeight: "900",
      color: colors.primary,
      lineHeight: isMobile ? 23 : 27,
    },
    statLabel: {
      marginTop: 4,
      fontSize: isMobile ? 8 : 10,
      color: colors.textMuted,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    card: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.card,
      borderRadius: isMobile ? 26 : 30,
      padding: isMobile ? 17 : 20,
      marginBottom: isMobile ? 14 : 16,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow:
        mode === "dark"
          ? "0px 18px 36px rgba(0,0,0,0.12)"
          : "0px 18px 36px rgba(0,0,0,0.08)",
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: isMobile ? 12 : 14,
      marginBottom: isMobile ? 14 : 16,
    },
    cardHeaderText: {
      flex: 1,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 21 : 24,
      lineHeight: isMobile ? 26 : 30,
      color: colors.primary,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    sectionTitleLarge: {
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
    exportButtonPrimary: {
      backgroundColor: colors.primary,
      borderRadius: isMobile ? 22 : 24,
      padding: isMobile ? 13 : 15,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      alignItems: "center",
      gap: isMobile ? 10 : 12,
      marginBottom: 10,
    },
    exportButton: {
      backgroundColor: colors.cardWarm,
      borderRadius: isMobile ? 22 : 24,
      padding: isMobile ? 13 : 15,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: isMobile ? 10 : 12,
      marginBottom: 10,
    },
    exportButtonTextBlock: {
      flex: 1,
    },
    exportButtonTitlePrimary: {
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      color: colors.black,
      marginBottom: 2,
    },
    exportButtonSubtitlePrimary: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.black,
      opacity: 0.7,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    exportButtonTitle: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 17 : 18,
      lineHeight: isMobile ? 22 : 23,
      color: colors.primary,
      marginBottom: 2,
    },
    exportButtonSubtitle: {
      fontSize: 11,
      fontWeight: "900",
      color: colors.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    exportArrowPrimary: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
    exportArrow: {
      color: colors.text,
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
      marginTop: 6,
    },
    savedMessage: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    summaryCard: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.secondaryLight,
      borderRadius: isMobile ? 26 : 30,
      padding: isMobile ? 17 : 20,
      marginBottom: isMobile ? 14 : 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: isMobile ? 12 : 14,
      marginBottom: isMobile ? 14 : 16,
    },
    summaryGrid: {
      flexDirection: "row",
      gap: isMobile ? 8 : 10,
      marginBottom: 14,
    },
    summaryMiniCard: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderRadius: isMobile ? 18 : 20,
      padding: isMobile ? 11 : 13,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
    },
    summaryMiniNumber: {
      fontSize: isMobile ? 20 : 24,
      fontWeight: "900",
      color: colors.primary,
      lineHeight: isMobile ? 24 : 28,
    },
    summaryMiniLabel: {
      marginTop: 5,
      fontSize: isMobile ? 8 : 10,
      color: colors.textMuted,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    summaryRow: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingVertical: isMobile ? 11 : 12,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    summaryLabel: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      color: colors.textSoft,
      flex: 1,
    },
    summaryValue: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
      flex: 1,
    },
    summaryValueSmall: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
      flex: 1,
    },
    dataText: {
      fontSize: isMobile ? 13 : 14,
      lineHeight: isMobile ? 20 : 21,
      color: colors.textSoft,
      marginBottom: 14,
    },
    dataBox: {
      backgroundColor: colors.cardWarm,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      height: isMobile ? 260 : 320,
      overflow: "hidden",
    },
    dataScroll: {
      maxHeight: isMobile ? 232 : 292,
    },
    dataCode: {
      fontSize: isMobile ? 11 : 12,
      lineHeight: isMobile ? 17 : 18,
      color: colors.text,
    },
    warningBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.warning,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 15 : 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: isMobile ? 24 : 26,
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
    sectionAction: {
      fontSize: 12,
      fontWeight: "900",
      color: colors.textMuted,
      marginBottom: 4,
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
  });
}