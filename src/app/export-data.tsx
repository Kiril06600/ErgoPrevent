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

const CHECKIN_STORAGE_KEY = "ergoprevent_daily_checkins";
const ROUTINE_STORAGE_KEY = "ergoprevent_daily_routine";
const THEME_STORAGE_KEY = "ergoprevent_theme_mode";

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
                <td>${checkin.date}</td>
                <td>${checkin.time}</td>
                <td>${checkin.painLevel}/10</td>
                <td>${checkin.fatigueLevel}</td>
                <td>${checkin.mainZone}</td>
                <td>${checkin.note || "-"}</td>
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
          Rapport généré le ${new Date().toLocaleString("fr-CA")}
        </p>

        <h2>Profil</h2>
        <div class="box grid">
          <div><span class="label">Prénom :</span> ${profile?.firstName || "-"}</div>
          <div><span class="label">Statut :</span> ${profile?.status || "-"}</div>
          <div><span class="label">Profession :</span> ${profile?.profession || "-"}</div>
          <div><span class="label">Objectif :</span> ${profile?.mainGoal || "-"}</div>
        </div>

        <h2>Scores</h2>
        <div class="box grid">
          <div>
            <span class="label">Score TMS :</span>
            ${questionnaire ? `${questionnaire.score}/100` : "-"}
          </div>
          <div>
            <span class="label">Niveau TMS :</span>
            ${questionnaire?.level || "-"}
          </div>
          <div>
            <span class="label">Score poste :</span>
            ${workstation ? `${workstation.score}/100` : "-"}
          </div>
          <div>
            <span class="label">Niveau poste :</span>
            ${workstation?.level || "-"}
          </div>
        </div>

        <h2>Priorités</h2>
        <div class="box">
          <p>
            <span class="label">Priorités TMS :</span>
            ${questionnaire?.priorities?.join(", ") || "-"}
          </p>
          <p>
            <span class="label">Priorités du poste :</span>
            ${workstation?.priorities?.join(", ") || "-"}
          </p>
        </div>

        <h2>Progression</h2>
        <div class="box grid">
          <div><span class="label">Pauses :</span> ${stats.completedBreaks}</div>
          <div><span class="label">Exercices :</span> ${stats.completedExercises}</div>
          <div><span class="label">Capsules :</span> ${stats.completedCapsules}</div>
          <div><span class="label">Points :</span> ${stats.points}</div>
        </div>

        <h2>Check-ins</h2>
        <div class="box grid">
          <div><span class="label">Nombre total :</span> ${checkins.length}</div>
          <div><span class="label">Douleur moyenne :</span> ${averagePain}/10</div>
          <div><span class="label">Zone fréquente :</span> ${mostFrequentZone}</div>
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

export default function ExportDataScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [message, setMessage] = useState("");

  const { colors } = useAppTheme();
  const styles = createStyles(colors);

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
        ? "Export CSV des check-ins téléchargé ✓"
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
        ? "Résumé CSV téléchargé ✓"
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
        ? "Export JSON complet téléchargé ✓"
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

    setMessage("Rapport PDF ouvert ✓ Utilisez Enregistrer en PDF.");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Exporter mes données</Text>

        <Text style={styles.subtitle}>
          Téléchargez vos données en CSV ou générez un rapport imprimable en PDF.
        </Text>

        <View style={styles.heroCard}>
          <View>
            <Text style={styles.heroLabel}>Confidentialité</Text>
            <Text style={styles.heroTitle}>Vos données restent locales.</Text>
            <Text style={styles.heroText}>
              Les exports sont générés directement dans votre navigateur. Les
              données ne sont pas envoyées vers un serveur externe.
            </Text>
          </View>

          <View style={styles.heroIconBox}>
            <Text style={styles.heroIcon}>🔒</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{checkins.length}</Text>
            <Text style={styles.statLabel}>check-ins</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{averagePain}</Text>
            <Text style={styles.statLabel}>douleur moyenne</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{appStats.points}</Text>
            <Text style={styles.statLabel}>points</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Formats disponibles</Text>

          <Pressable style={styles.primaryButton} onPress={handleDownloadCheckinsCsv}>
            <Text style={styles.primaryButtonText}>
              Exporter les check-ins en CSV
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleDownloadSummaryCsv}>
            <Text style={styles.secondaryButtonText}>
              Exporter le résumé en CSV
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handleDownloadJson}>
            <Text style={styles.secondaryButtonText}>
              Exporter toutes les données en JSON
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={handlePrintPdfReport}>
            <Text style={styles.secondaryButtonText}>
              Générer un rapport PDF
            </Text>
          </Pressable>

          {message.length > 0 && <Text style={styles.savedMessage}>{message}</Text>}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Résumé exportable</Text>

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
            <Text style={styles.summaryLabel}>Check-ins</Text>
            <Text style={styles.summaryValue}>{checkins.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Douleur moyenne</Text>
            <Text style={styles.summaryValue}>{averagePain}/10</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Zone fréquente</Text>
            <Text style={styles.summaryValueSmall}>{mostFrequentZone}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Points</Text>
            <Text style={styles.summaryValue}>{appStats.points}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Aperçu des données complètes</Text>

          <Text style={styles.dataText}>
            Cet aperçu montre les données locales qui peuvent être exportées. Il
            est surtout utile pour vérifier que l’information est bien présente.
          </Text>

          <View style={styles.dataBox}>
            <Text selectable style={styles.dataCode}>
              {JSON.stringify(fullExportData, null, 2)}
            </Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Après export, le fichier téléchargé est sous votre responsabilité.
            Évitez de partager ces fichiers s’ils contiennent des informations
            personnelles ou de santé.
          </Text>
        </View>

        <Link href="/profile" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Retour au profil</Text>
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
    heroCard: {
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 24,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 18,
    },
    heroLabel: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    heroTitle: {
      fontSize: 27,
      lineHeight: 34,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 8,
    },
    heroText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSoft,
      maxWidth: 520,
    },
    heroIconBox: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.secondaryLight,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    heroIcon: {
      fontSize: 34,
    },
    statsGrid: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 18,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderRadius: 22,
      padding: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      fontSize: 30,
      fontWeight: "900",
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.textSoft,
      fontWeight: "800",
      textAlign: "center",
      marginTop: 6,
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
    savedMessage: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
      marginTop: 4,
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
      flex: 1,
    },
    summaryValue: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
      flex: 1,
    },
    summaryValueSmall: {
      fontSize: 15,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
      flex: 1,
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
      marginBottom: 14,
    },
    warningText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.warningText,
    },
  });
}