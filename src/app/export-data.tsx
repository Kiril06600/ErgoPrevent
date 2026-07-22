import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { AppStats, getAppStats } from "../lib/storage";
import BottomNav from "../components/BottomNav";

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

function escapeCsvValue(value: string | number) {
  const text = String(value).replace(/\n/g, " ").replace(/\r/g, " ");
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string | number | undefined | null) {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return String(value ?? "").replace(/[&<>"']/g, (char) => entities[char]);
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(url);
}

function buildCsv(checkins: DailyCheckin[]) {
  const header = [
    "Date",
    "Heure",
    "Douleur sur 10",
    "Fatigue",
    "Zone principale",
    "Note",
  ];

  const rows = checkins.map((checkin) => [
    checkin.date,
    checkin.time,
    checkin.painLevel,
    checkin.fatigueLevel,
    checkin.mainZone,
    checkin.note,
  ]);

  const csvRows = [header, ...rows].map((row) =>
    row.map((value) => escapeCsvValue(value)).join(";")
  );

  return "\uFEFFsep=;\n" + csvRows.join("\n");
}

function buildPdfHtml(stats: AppStats, checkins: DailyCheckin[]) {
  const profile = stats.profile;
  const questionnaireResult = stats.questionnaireResult;
  const workstationAuditResult = stats.workstationAuditResult;

  const averagePain = getAveragePain(checkins);
  const mostFrequentZone = getMostFrequentZone(checkins);
  const exportedAt = new Date().toLocaleString("fr-CA");

  const latestRows = checkins
    .slice(0, 20)
    .map(
      (checkin) => `
        <tr>
          <td>${escapeHtml(checkin.date)}</td>
          <td>${escapeHtml(checkin.time)}</td>
          <td>${escapeHtml(checkin.painLevel)}/10</td>
          <td>${escapeHtml(checkin.fatigueLevel)}</td>
          <td>${escapeHtml(checkin.mainZone)}</td>
          <td>${escapeHtml(checkin.note)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Rapport ErgoPrevent</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #183642;
            line-height: 1.5;
          }

          h1 {
            color: #1E5B7A;
            margin-bottom: 4px;
          }

          h2 {
            color: #183642;
            margin-top: 28px;
            border-bottom: 2px solid #EAF7F1;
            padding-bottom: 6px;
          }

          .subtitle {
            color: #536B78;
            margin-bottom: 24px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }

          .card {
            background: #F4F8FB;
            border-radius: 14px;
            padding: 16px;
            border: 1px solid #DCE9EF;
          }

          .label {
            font-weight: bold;
            color: #536B78;
            font-size: 13px;
          }

          .value {
            font-size: 20px;
            font-weight: bold;
            color: #1E8A6A;
            margin-top: 4px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            font-size: 13px;
          }

          th {
            background: #EAF7F1;
            color: #183642;
            text-align: left;
            padding: 8px;
            border: 1px solid #C7D7DF;
          }

          td {
            padding: 8px;
            border: 1px solid #DCE9EF;
            vertical-align: top;
          }

          .warning {
            margin-top: 28px;
            background: #FFF7E6;
            border: 1px solid #F3D28B;
            border-radius: 14px;
            padding: 14px;
            color: #725A20;
            font-size: 13px;
          }

          @media print {
            button {
              display: none;
            }

            body {
              margin: 24px;
            }
          }
        </style>
      </head>

      <body>
        <h1>Rapport ErgoPrevent</h1>
        <p class="subtitle">Rapport généré le ${escapeHtml(exportedAt)}</p>

        <h2>Profil</h2>
        <div class="grid">
          <div class="card">
            <div class="label">Prénom</div>
            <div class="value">${escapeHtml(profile?.firstName || "Non renseigné")}</div>
          </div>

          <div class="card">
            <div class="label">Statut</div>
            <div class="value">${escapeHtml(profile?.status || "Non renseigné")}</div>
          </div>

          <div class="card">
            <div class="label">Profession / domaine</div>
            <div class="value">${escapeHtml(profile?.profession || "Non renseigné")}</div>
          </div>

          <div class="card">
            <div class="label">Objectif principal</div>
            <div class="value">${escapeHtml(profile?.mainGoal || "Non renseigné")}</div>
          </div>
        </div>

        <h2>Résumé</h2>
        <div class="grid">
          <div class="card">
            <div class="label">Score TMS</div>
            <div class="value">${
              questionnaireResult
                ? `${escapeHtml(questionnaireResult.score)}/100`
                : "--/100"
            }</div>
          </div>

          <div class="card">
            <div class="label">Score du poste</div>
            <div class="value">${
              workstationAuditResult
                ? `${escapeHtml(workstationAuditResult.score)}/100`
                : "--/100"
            }</div>
          </div>

          <div class="card">
            <div class="label">Nombre de check-ins</div>
            <div class="value">${escapeHtml(checkins.length)}</div>
          </div>

          <div class="card">
            <div class="label">Douleur moyenne</div>
            <div class="value">${escapeHtml(averagePain)}/10</div>
          </div>

          <div class="card">
            <div class="label">Zone la plus fréquente</div>
            <div class="value">${escapeHtml(mostFrequentZone)}</div>
          </div>

          <div class="card">
            <div class="label">Points</div>
            <div class="value">${escapeHtml(stats.points)}</div>
          </div>
        </div>

        <h2>Derniers check-ins</h2>

        ${
          checkins.length > 0
            ? `
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
                  ${latestRows}
                </tbody>
              </table>
            `
            : "<p>Aucun check-in enregistré.</p>"
        }

        <div class="warning">
          ErgoPrevent est un outil d’éducation et de prévention. Ce rapport ne
          remplace pas une consultation avec un professionnel de la santé, un
          ergonome, un physiothérapeute ou un médecin.
        </div>
      </body>
    </html>
  `;
}

export default function ExportDataScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [checkins, setCheckins] = useState<DailyCheckin[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStats(getAppStats());
    setCheckins(getSavedCheckins());
  }, []);

  function handleExportCsv() {
    const latestCheckins = getSavedCheckins();
    const csvContent = buildCsv(latestCheckins);

    downloadTextFile(
      "ergoprevent-checkins.csv",
      csvContent,
      "text/csv;charset=utf-8"
    );

    setMessage("Export CSV créé ✓");
  }

  function handleExportPdf() {
    if (typeof window === "undefined") {
      return;
    }

    const latestStats = getAppStats();
    const latestCheckins = getSavedCheckins();
    const html = buildPdfHtml(latestStats, latestCheckins);

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      Alert.alert(
        "Fenêtre bloquée",
        "Autorisez les fenêtres contextuelles pour exporter le rapport PDF."
      );
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);

    setMessage("Rapport PDF ouvert ✓ Choisissez “Enregistrer au format PDF”.");
  }

  const averagePain = getAveragePain(checkins);
  const mostFrequentZone = getMostFrequentZone(checkins);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Exporter mes données</Text>

        <Text style={styles.subtitle}>
          Téléchargez vos check-ins en CSV ou générez un rapport PDF à conserver
          ou à partager avec un professionnel.
        </Text>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Résumé des données</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-ins enregistrés</Text>
            <Text style={styles.summaryValue}>{checkins.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Douleur moyenne</Text>
            <Text style={styles.summaryValue}>{averagePain}/10</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Zone la plus fréquente</Text>
            <Text style={styles.summaryValue}>{mostFrequentZone}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Points</Text>
            <Text style={styles.summaryValue}>{stats?.points ?? 0}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.exportIcon}>📄</Text>
          <Text style={styles.exportTitle}>Exporter en CSV</Text>

          <Text style={styles.exportText}>
            Le fichier CSV contient tous les check-ins avec date, heure, douleur,
            fatigue, zone principale et note. Il peut être ouvert avec Excel,
            Google Sheets ou Numbers.
          </Text>

          <Pressable style={styles.primaryButton} onPress={handleExportCsv}>
            <Text style={styles.primaryButtonText}>
              Télécharger mes check-ins en CSV
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.exportIcon}>🧾</Text>
          <Text style={styles.exportTitle}>Exporter en PDF</Text>

          <Text style={styles.exportText}>
            Le rapport PDF contient le profil, les scores, la douleur moyenne, la
            zone la plus fréquente et les derniers check-ins.
          </Text>

          <Pressable style={styles.primaryButton} onPress={handleExportPdf}>
            <Text style={styles.primaryButtonText}>
              Générer un rapport PDF
            </Text>
          </Pressable>

          <Text style={styles.smallNote}>
            Une fenêtre d’impression va s’ouvrir. Choisissez ensuite “Enregistrer
            au format PDF”.
          </Text>
        </View>

        {message.length > 0 && <Text style={styles.savedMessage}>{message}</Text>}

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Les données sont exportées depuis ce navigateur seulement. Si
            l’utilisateur utilise un autre appareil ou navigateur, les données
            locales peuvent être différentes.
          </Text>
        </View>

        <Link href="/profile" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Retour au profil
            </Text>
          </Pressable>
        </Link>

        <Link href="/progress" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Voir mon évolution
            </Text>
          </Pressable>
        </Link>

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FB",
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    marginBottom: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  summaryCard: {
    backgroundColor: "#EAF7F1",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 14,
  },
  summaryRow: {
    borderTopWidth: 1,
    borderTopColor: "#C7D7DF",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#536B78",
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#183642",
    textAlign: "right",
    flex: 1,
  },
  exportIcon: {
    fontSize: 34,
    marginBottom: 8,
  },
  exportTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 8,
  },
  exportText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#1E8A6A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  smallNote: {
    fontSize: 13,
    lineHeight: 19,
    color: "#536B78",
    textAlign: "center",
  },
  savedMessage: {
    color: "#1E8A6A",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },
  warningBox: {
    backgroundColor: "#FFF7E6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3D28B",
    marginBottom: 14,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#725A20",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "800",
  },
});