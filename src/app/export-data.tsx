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

/* -------------------- Icônes personnalisées -------------------- */

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

function JsonIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: ExportIconProps) {
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
  const [stats, setStats] = useState<AppStats | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [message, setMessage] = useState("");

  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  useEffect(() => {
    const savedStats = getAppStats();
    const savedCheckins = getSavedCheckins();

    setStats(savedStats);
    setCheckins(savedCheckins);
  }, []);

  const appStats = stats ?? getAppStats();

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
          <View style={styles.heroShapeLarge} />
          <View style={styles.heroShapeSmall} />

          <View style={styles.heroTopRow}>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroLabel}>Confidentialité</Text>
              <Text style={styles.heroTitle}>Vos données restent locales.</Text>
            </View>

            <IconBadge
              size={58}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <LockIcon size={28} color={colors.text} />
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
              size={46}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <DownloadIcon size={22} color={colors.text} />
            </IconBadge>

            <View style={styles.cardHeaderText}>
              <Text style={styles.sectionTitle}>Formats disponibles</Text>
              <Text style={styles.sectionSubtitle}>
                Choisissez le type de fichier à générer.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.exportButtonPrimary}
            onPress={handleDownloadCheckinsCsv}
          >
            <IconBadge
              size={38}
              backgroundColor={colors.primaryLight}
              borderColor={colors.border}
            >
              <CsvIcon size={18} color={colors.black} />
            </IconBadge>

            <View style={styles.exportButtonTextBlock}>
              <Text style={styles.exportButtonTitlePrimary}>
                Exporter les check-ins
              </Text>
              <Text style={styles.exportButtonSubtitlePrimary}>CSV</Text>
            </View>

            <Text style={styles.exportArrowPrimary}>→</Text>
          </Pressable>

          <Pressable
            style={styles.exportButton}
            onPress={handleDownloadSummaryCsv}
          >
            <IconBadge
              size={38}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <CsvIcon size={18} color={colors.text} />
            </IconBadge>

            <View style={styles.exportButtonTextBlock}>
              <Text style={styles.exportButtonTitle}>Résumé global</Text>
              <Text style={styles.exportButtonSubtitle}>CSV</Text>
            </View>

            <Text style={styles.exportArrow}>→</Text>
          </Pressable>

          <Pressable style={styles.exportButton} onPress={handleDownloadJson}>
            <IconBadge
              size={38}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <JsonIcon size={18} color={colors.text} />
            </IconBadge>

            <View style={styles.exportButtonTextBlock}>
              <Text style={styles.exportButtonTitle}>Données complètes</Text>
              <Text style={styles.exportButtonSubtitle}>JSON</Text>
            </View>

            <Text style={styles.exportArrow}>→</Text>
          </Pressable>

          <Pressable style={styles.exportButton} onPress={handlePrintPdfReport}>
            <IconBadge
              size={38}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <PdfIcon size={18} color={colors.text} />
            </IconBadge>

            <View style={styles.exportButtonTextBlock}>
              <Text style={styles.exportButtonTitle}>Rapport imprimable</Text>
              <Text style={styles.exportButtonSubtitle}>PDF</Text>
            </View>

            <Text style={styles.exportArrow}>→</Text>
          </Pressable>

          {message.length > 0 && (
            <View style={styles.messageBox}>
              <Text style={styles.savedMessage}>{message}</Text>
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
              size={46}
              backgroundColor={colors.backgroundSoft}
              borderColor={colors.border}
            >
              <JsonIcon size={22} color={colors.text} />
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
          <View>
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

function createStyles(colors: ThemeColors, mode: "light" | "dark") {
  const isDark = mode === "dark";

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
      fontSize: 38,
      lineHeight: 43,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -1,
      marginBottom: 10,
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
      minHeight: 245,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      position: "relative",
      justifyContent: "space-between",
    },
    heroShapeLarge: {
      position: "absolute",
      width: 210,
      height: 210,
      borderRadius: 105,
      right: -70,
      top: -42,
      backgroundColor: isDark
        ? "rgba(95,159,149,0.16)"
        : "rgba(216,196,182,0.26)",
    },
    heroShapeSmall: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      left: -28,
      bottom: -28,
      backgroundColor: isDark
        ? "rgba(245,238,223,0.08)"
        : "rgba(95,159,149,0.12)",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 16,
      zIndex: 2,
    },
    heroTextBlock: {
      flex: 1,
    },
    heroLabel: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    heroTitle: {
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.7,
      maxWidth: 360,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 23,
      color: colors.textSoft,
      maxWidth: 500,
      zIndex: 2,
      marginTop: 22,
    },
    statsPanel: {
      marginHorizontal: 24,
      marginBottom: 18,
      backgroundColor: colors.card,
      borderRadius: 26,
      padding: 16,
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
      height: 38,
      backgroundColor: colors.border,
    },
    statNumber: {
      fontSize: 23,
      fontWeight: "900",
      color: colors.text,
      lineHeight: 27,
    },
    statLabel: {
      marginTop: 4,
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
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
      fontSize: 21,
      lineHeight: 26,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 4,
    },
    sectionTitleLarge: {
      fontSize: 24,
      fontWeight: "900",
      color: colors.text,
      letterSpacing: -0.4,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSoft,
    },
    exportButtonPrimary: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    },
    exportButton: {
      backgroundColor: colors.cardWarm,
      borderRadius: 24,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    },
    exportButtonTextBlock: {
      flex: 1,
    },
    exportButtonTitlePrimary: {
      fontSize: 15,
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
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
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
      color: colors.text,
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
      flex: 1,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
      flex: 1,
    },
    summaryValueSmall: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
      flex: 1,
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
    warningBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 26,
    },
    warningTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.warningText,
      marginBottom: 5,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
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
      fontSize: 18,
      lineHeight: 23,
      fontWeight: "900",
      color: colors.text,
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