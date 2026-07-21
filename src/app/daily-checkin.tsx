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

const fatigueOptions = ["Faible", "Moyenne", "Élevée"];
const zoneOptions = [
  "Cou",
  "Dos",
  "Épaules",
  "Poignets",
  "Jambes",
  "Aucune zone",
];

function getCurrentDateAndTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}`,
  };
}

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

function saveNewCheckin(checkin: DailyCheckin) {
  if (typeof window === "undefined") {
    return;
  }

  const savedCheckins = getSavedCheckins();

  const updatedCheckins = [checkin, ...savedCheckins];

  window.localStorage.setItem(
    CHECKIN_STORAGE_KEY,
    JSON.stringify(updatedCheckins)
  );
}

export default function DailyCheckinScreen() {
  const currentDateAndTime = getCurrentDateAndTime();

  const [stats, setStats] = useState<AppStats | null>(null);
  const [painLevel, setPainLevel] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState("Moyenne");
  const [mainZone, setMainZone] = useState("Aucune zone");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(currentDateAndTime.date);
  const [time, setTime] = useState(currentDateAndTime.time);
  const [savedMessage, setSavedMessage] = useState("");
  const [previousCheckins, setPreviousCheckins] = useState<DailyCheckin[]>([]);

  useEffect(() => {
    const savedStats = getAppStats();
    const savedCheckins = getSavedCheckins();

    setStats(savedStats);
    setPreviousCheckins(savedCheckins.slice(0, 8));
  }, []);

  const profile = stats?.profile ?? null;

  function getPainMessage() {
    if (painLevel === 0) {
      return "Aucune douleur rapportée pour ce check-in.";
    }

    if (painLevel <= 3) {
      return "Douleur légère : continuez à bouger régulièrement.";
    }

    if (painLevel <= 6) {
      return "Douleur modérée : privilégiez les pauses, les ajustements et les mouvements doux.";
    }

    return "Douleur élevée : évitez de forcer et consultez un professionnel si la douleur persiste ou vous inquiète.";
  }

  function handleUseCurrentTime() {
    const now = getCurrentDateAndTime();

    setDate(now.date);
    setTime(now.time);
    setSavedMessage("");
  }

  function handleSaveCheckin() {
    const newCheckin: DailyCheckin = {
      id: `${Date.now()}`,
      createdAt: `${date}T${time}:00`,
      date,
      time,
      painLevel,
      fatigueLevel,
      mainZone,
      note,
    };

    saveNewCheckin(newCheckin);

    const savedCheckins = getSavedCheckins();

    setPreviousCheckins(savedCheckins.slice(0, 8));
    setSavedMessage("Nouveau check-in ajouté ✓");

    const now = getCurrentDateAndTime();
    setDate(now.date);
    setTime(now.time);
    setNote("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Check-in</Text>

        <Text style={styles.subtitle}>
          Ajoutez autant de check-ins que vous voulez, à n’importe quel moment de
          la journée.
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroGreeting}>
            {profile?.firstName
              ? `Bonjour ${profile.firstName}`
              : "Nouveau suivi"}
          </Text>

          <Text style={styles.heroTitle}>Comment vous sentez-vous maintenant ?</Text>

          <Text style={styles.heroText}>
            Chaque check-in est sauvegardé séparément avec une date et une heure.
            Vous pouvez donc en faire plusieurs dans la même journée.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Date et heure</Text>

          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Heure</Text>
          <TextInput
            style={styles.input}
            value={time}
            onChangeText={setTime}
            placeholder="HH:MM"
          />

          <Pressable style={styles.secondaryButton} onPress={handleUseCurrentTime}>
            <Text style={styles.secondaryButtonText}>
              Utiliser la date et l’heure actuelles
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Douleur</Text>

          <Text style={styles.painNumber}>{painLevel}/10</Text>

          <View style={styles.painGrid}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => {
              const selected = painLevel === number;

              return (
                <Pressable
                  key={number}
                  style={[
                    styles.painButton,
                    selected && styles.painButtonSelected,
                  ]}
                  onPress={() => setPainLevel(number)}
                >
                  <Text
                    style={[
                      styles.painButtonText,
                      selected && styles.painButtonTextSelected,
                    ]}
                  >
                    {number}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.infoText}>{getPainMessage()}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Niveau de fatigue</Text>

          <View style={styles.optionsContainer}>
            {fatigueOptions.map((item) => {
              const selected = fatigueLevel === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                  onPress={() => setFatigueLevel(item)}
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
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Zone principale</Text>

          <View style={styles.optionsContainer}>
            {zoneOptions.map((item) => {
              const selected = mainZone === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                  onPress={() => setMainZone(item)}
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
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Note personnelle</Text>

          <TextInput
            style={styles.textArea}
            placeholder="Ex. Douleur au cou après 2 heures sur ordinateur, fatigue élevée en fin de journée..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.primaryButton} onPress={handleSaveCheckin}>
          <Text style={styles.primaryButtonText}>Ajouter ce check-in</Text>
        </Pressable>

        {savedMessage.length > 0 && (
          <Text style={styles.savedMessage}>{savedMessage}</Text>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Résumé du check-in</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date</Text>
            <Text style={styles.summaryValue}>{date}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Heure</Text>
            <Text style={styles.summaryValue}>{time}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Douleur</Text>
            <Text style={styles.summaryValue}>{painLevel}/10</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Fatigue</Text>
            <Text style={styles.summaryValue}>{fatigueLevel}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Zone</Text>
            <Text style={styles.summaryValue}>{mainZone}</Text>
          </View>
        </View>

        {previousCheckins.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Derniers check-ins</Text>

            {previousCheckins.map((checkin) => (
              <View key={checkin.id} style={styles.historyCard}>
                <Text style={styles.historyDate}>
                  {checkin.date} à {checkin.time}
                </Text>

                <Text style={styles.historyText}>
                  Douleur : {checkin.painLevel}/10 · Fatigue :{" "}
                  {checkin.fatigueLevel} · Zone : {checkin.mainZone}
                </Text>

                {checkin.note.length > 0 && (
                  <Text style={styles.historyNote}>{checkin.note}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Ce suivi est un outil personnel d’éducation et de prévention. Il ne
            remplace pas une consultation médicale. Si une douleur est forte,
            persistante, inhabituelle ou inquiétante, consultez un professionnel
            de la santé.
          </Text>
        </View>

        <Link href="/progress" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir mon évolution</Text>
          </Pressable>
        </Link>

        <Link href="/routine" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir ma routine du jour</Text>
          </Pressable>
        </Link>

        <Link href="/personal-plan" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>
              Voir mon plan personnalisé
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
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  heroGreeting: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1E8A6A",
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 10,
  },
  heroText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C7D7DF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#183642",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  painNumber: {
    fontSize: 48,
    fontWeight: "900",
    color: "#1E8A6A",
    textAlign: "center",
    marginBottom: 14,
  },
  painGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginBottom: 14,
  },
  painButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  painButtonSelected: {
    backgroundColor: "#1E8A6A",
    borderColor: "#1E8A6A",
  },
  painButtonText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#183642",
  },
  painButtonTextSelected: {
    color: "#FFFFFF",
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#536B78",
    textAlign: "center",
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
  },
  optionButtonSelected: {
    backgroundColor: "#1E8A6A",
    borderColor: "#1E8A6A",
  },
  optionText: {
    color: "#183642",
    fontSize: 15,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#C7D7DF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    lineHeight: 21,
    color: "#183642",
    backgroundColor: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: "#1E8A6A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  savedMessage: {
    color: "#1E8A6A",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 14,
  },
  summaryCard: {
    backgroundColor: "#EAF7F1",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
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
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#183642",
    textAlign: "right",
  },
  historyCard: {
    backgroundColor: "#F4F8FB",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1E8A6A",
    marginBottom: 4,
  },
  historyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#183642",
    fontWeight: "700",
  },
  historyNote: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#536B78",
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