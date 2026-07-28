import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import {
  APP_STATS_UPDATED_EVENT,
  AppStats,
  getAppStats,
} from "../lib/storage";
import {
  addDailyCheckinCompletedNotificationIfNeeded,
  markTodaysDailyPainNotificationsAsRead,
} from "../lib/notifications";
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

type CheckinIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

type CheckinIcon = React.ComponentType<CheckinIconProps>;

type AppRoute = "/progress" | "/routine" | "/personal-plan";

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

const fatigueOptions = ["Faible", "Moyenne", "Élevée"];

const zoneOptions = [
  "Cou",
  "Dos",
  "Épaules",
  "Poignets",
  "Jambes",
  "Aucune zone",
];

const quickActions: QuickAction[] = [
  {
    label: "Suivi",
    title: "Évolution",
    text: "Voir vos derniers check-ins.",
    href: "/progress",
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
    text: "Consulter vos priorités.",
    href: "/personal-plan",
    Icon: PlanIcon,
  },
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

  window.dispatchEvent(new Event(CHECKINS_UPDATED_EVENT));
}

function PainIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CheckinIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.1,
          width: size * 0.16,
          height: size * 0.48,
          borderRadius: 999,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.36,
          top: size * 0.56,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          right: size * 0.08,
          top: size * 0.18,
          width: size * 0.15,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "35deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          right: size * 0.08,
          top: size * 0.4,
          width: size * 0.15,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-35deg" }],
        }}
      />
    </View>
  );
}

function FatigueIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CheckinIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.24,
          top: size * 0.16,
          width: size * 0.52,
          height: size * 0.42,
          borderRadius: size * 0.2,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.34,
          width: size * 0.1,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          right: size * 0.34,
          top: size * 0.34,
          width: size * 0.1,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.36,
          top: size * 0.7,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function NeckIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CheckinIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.08,
          width: size * 0.32,
          height: size * 0.32,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.37,
          width: strokeWidth,
          height: size * 0.18,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.54,
          top: size * 0.37,
          width: strokeWidth,
          height: size * 0.18,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.24,
          top: size * 0.58,
          width: size * 0.52,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function BackIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CheckinIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.39,
          top: size * 0.06,
          width: size * 0.22,
          height: size * 0.22,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.22,
          top: size * 0.32,
          width: size * 0.56,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.49,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.44,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.42,
          width: strokeWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "16deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          right: size * 0.34,
          top: size * 0.42,
          width: strokeWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-16deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.32,
          top: size * 0.78,
          width: size * 0.36,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function ShoulderIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CheckinIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.36,
          top: size * 0.1,
          width: size * 0.28,
          height: size * 0.28,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.47,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.12,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.16,
          top: size * 0.5,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-18deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          right: size * 0.16,
          top: size * 0.5,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "18deg" }],
        }}
      />
    </View>
  );
}

function WristIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CheckinIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.18,
          top: size * 0.44,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.38,
          width: strokeWidth,
          height: size * 0.16,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.48,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.12,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-22deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.54,
          top: size * 0.34,
          width: strokeWidth,
          height: size * 0.12,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-6deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.6,
          top: size * 0.36,
          width: strokeWidth,
          height: size * 0.1,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "10deg" }],
        }}
      />
    </View>
  );
}

function LegsIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CheckinIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.36,
          top: size * 0.12,
          width: size * 0.28,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.4,
          top: size * 0.18,
          width: strokeWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.56,
          top: size * 0.18,
          width: strokeWidth,
          height: size * 0.28,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.34,
          top: size * 0.44,
          width: size * 0.16,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "30deg" }],
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.52,
          top: size * 0.44,
          width: size * 0.16,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
          transform: [{ rotate: "-30deg" }],
        }}
      />
    </View>
  );
}

function CalmIcon({
  size = 22,
  color = "#163028",
  strokeWidth = 2,
}: CheckinIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.2,
          top: size * 0.2,
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: size,
          borderWidth: strokeWidth,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.35,
          top: size * 0.47,
          width: size * 0.3,
          height: strokeWidth,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function getZoneIcon(zone: string): CheckinIcon {
  switch (zone) {
    case "Cou":
      return NeckIcon;
    case "Dos":
      return BackIcon;
    case "Épaules":
      return ShoulderIcon;
    case "Poignets":
      return WristIcon;
    case "Jambes":
      return LegsIcon;
    default:
      return CalmIcon;
  }
}

export default function DailyCheckinScreen() {
  const currentDateAndTime = getCurrentDateAndTime();

  const [stats, setStats] = useState<AppStats>(() => getAppStats());
  const [painLevel, setPainLevel] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState("Moyenne");
  const [mainZone, setMainZone] = useState("Aucune zone");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(currentDateAndTime.date);
  const [time, setTime] = useState(currentDateAndTime.time);
  const [savedMessage, setSavedMessage] = useState("");
  const [previousCheckins, setPreviousCheckins] = useState<DailyCheckin[]>(() =>
    getSavedCheckins().slice(0, 8)
  );

  const { colors, mode } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = createStyles(colors, mode, layout);

  useEffect(() => {
    function refreshData() {
      setStats(getAppStats());
      setPreviousCheckins(getSavedCheckins().slice(0, 8));
    }

    refreshData();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(APP_STATS_UPDATED_EVENT, refreshData);
    window.addEventListener(CHECKINS_UPDATED_EVENT, refreshData);
    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", refreshData);
    }

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshData);
      window.removeEventListener(CHECKINS_UPDATED_EVENT, refreshData);
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);

      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", refreshData);
      }
    };
  }, []);

  const profile = stats.profile ?? null;
  const SelectedZoneIcon = getZoneIcon(mainZone);

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

    markTodaysDailyPainNotificationsAsRead();
    addDailyCheckinCompletedNotificationIfNeeded();

    const savedCheckins = getSavedCheckins();

    setPreviousCheckins(savedCheckins.slice(0, 8));
    setSavedMessage("Nouveau check-in ajouté");

    const now = getCurrentDateAndTime();

    setDate(now.date);
    setTime(now.time);
    setNote("");
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Suivi quotidien</Text>
            </View>

            <Text style={styles.pageTitle}>Check-in</Text>

            <Text style={styles.subtitle}>
              Ajoutez autant de check-ins que vous voulez, à n’importe quel
              moment de la journée.
            </Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.heroGreeting}>
                  {profile?.firstName
                    ? `Bonjour ${profile.firstName}`
                    : "Nouveau suivi"}
                </Text>

                <Text style={styles.heroTitle}>
                  Comment vous sentez-vous maintenant ?
                </Text>
              </View>

              <IconBadge
                size={layout.isMobile ? 50 : 58}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <ProgressIcon
                  size={layout.isMobile ? 23 : 27}
                  color={colors.text}
                />
              </IconBadge>
            </View>

            <Text style={styles.heroText}>
              Chaque check-in est sauvegardé séparément avec une date et une
              heure. Vous pouvez donc en faire plusieurs dans la même journée.
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <ProgressIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Date et heure</Text>
                <Text style={styles.sectionSubtitle}>
                  Modifiez seulement si le check-in concerne un autre moment.
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Heure</Text>
            <TextInput
              style={styles.input}
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
              placeholderTextColor={colors.textMuted}
            />

            <PressableScale
              style={styles.secondaryButtonInside}
              onPress={handleUseCurrentTime}
            >
              <Text style={styles.secondaryButtonText}>
                Utiliser la date et l’heure actuelles
              </Text>
            </PressableScale>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <PainIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Douleur</Text>
                <Text style={styles.sectionSubtitle}>
                  Sélectionnez une intensité entre 0 et 10.
                </Text>
              </View>
            </View>

            <View style={styles.painScoreCard}>
              <Text style={styles.painNumber}>{painLevel}</Text>
              <Text style={styles.painSmall}>/10</Text>
            </View>

            <View style={styles.painGrid}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => {
                const selected = painLevel === number;

                return (
                  <PressableScale
                    key={number}
                    style={[
                      styles.painButton,
                      selected ? styles.painButtonSelected : null,
                    ]}
                    onPress={() => setPainLevel(number)}
                  >
                    <Text
                      style={[
                        styles.painButtonText,
                        selected ? styles.painButtonTextSelected : null,
                      ]}
                    >
                      {number}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>{getPainMessage()}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <FatigueIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Niveau de fatigue</Text>
                <Text style={styles.sectionSubtitle}>
                  Notez votre énergie générale.
                </Text>
              </View>
            </View>

            <View style={styles.optionsContainer}>
              {fatigueOptions.map((item) => {
                const selected = fatigueLevel === item;

                return (
                  <PressableScale
                    key={item}
                    style={[
                      styles.optionButton,
                      selected ? styles.optionButtonSelected : null,
                    ]}
                    onPress={() => setFatigueLevel(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected ? styles.optionTextSelected : null,
                      ]}
                    >
                      {item}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.backgroundSoft}
                borderColor={colors.border}
              >
                <SelectedZoneIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Zone principale</Text>
                <Text style={styles.sectionSubtitle}>
                  Indiquez la zone la plus présente maintenant.
                </Text>
              </View>
            </View>

            <View style={styles.zoneGrid}>
              {zoneOptions.map((item) => {
                const selected = mainZone === item;
                const ZoneIcon = getZoneIcon(item);

                return (
                  <PressableScale
                    key={item}
                    style={[
                      styles.zoneButton,
                      selected ? styles.zoneButtonSelected : null,
                    ]}
                    onPress={() => setMainZone(item)}
                  >
                    <IconBadge
                      size={layout.isMobile ? 32 : 34}
                      backgroundColor={
                        selected ? colors.primaryLight : colors.backgroundSoft
                      }
                      borderColor={selected ? colors.border : "transparent"}
                    >
                      <ZoneIcon
                        size={layout.isMobile ? 16 : 17}
                        color={selected ? colors.black : colors.text}
                      />
                    </IconBadge>

                    <Text
                      style={[
                        styles.zoneButtonText,
                        selected ? styles.zoneButtonTextSelected : null,
                      ]}
                    >
                      {item}
                    </Text>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Note personnelle</Text>

            <TextInput
              style={styles.textArea}
              placeholder="Ex. Douleur au cou après 2 heures sur ordinateur, fatigue élevée en fin de journée..."
              placeholderTextColor={colors.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <PressableScale style={styles.primaryButton} onPress={handleSaveCheckin}>
            <Text style={styles.primaryButtonText}>Ajouter ce check-in</Text>
            <Text style={styles.primaryButtonArrow}>→</Text>
          </PressableScale>

          {savedMessage.length > 0 && (
            <View style={styles.messageBox}>
              <Text style={styles.savedMessage}>{savedMessage}</Text>
            </View>
          )}

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <IconBadge
                size={layout.isMobile ? 42 : 46}
                backgroundColor={colors.turquoiseSoft}
                borderColor={colors.border}
              >
                <SelectedZoneIcon
                  size={layout.isMobile ? 20 : 22}
                  color={colors.text}
                />
              </IconBadge>

              <View style={styles.cardHeaderText}>
                <Text style={styles.sectionTitle}>Résumé du check-in</Text>
                <Text style={styles.sectionSubtitle}>
                  Aperçu avant ou après sauvegarde.
                </Text>
              </View>
            </View>

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

              {previousCheckins.map((checkin) => {
                const HistoryIcon = getZoneIcon(checkin.mainZone);

                return (
                  <View key={checkin.id} style={styles.historyCard}>
                    <View style={styles.historyTopRow}>
                      <IconBadge
                        size={layout.isMobile ? 36 : 38}
                        backgroundColor={colors.backgroundSoft}
                        borderColor={colors.border}
                      >
                        <HistoryIcon
                          size={layout.isMobile ? 17 : 18}
                          color={colors.text}
                        />
                      </IconBadge>

                      <View style={styles.historyTextBlock}>
                        <Text style={styles.historyDate}>
                          {checkin.date} à {checkin.time}
                        </Text>

                        <Text style={styles.historyText}>
                          Douleur : {checkin.painLevel}/10 · Fatigue :{" "}
                          {checkin.fatigueLevel} · Zone : {checkin.mainZone}
                        </Text>
                      </View>
                    </View>

                    {checkin.note.length > 0 && (
                      <Text style={styles.historyNote}>{checkin.note}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>À retenir</Text>
            <Text style={styles.warningText}>
              Ce suivi est un outil personnel d’éducation et de prévention. Il
              ne remplace pas une consultation médicale. Si une douleur est
              forte, persistante, inhabituelle ou inquiétante, consultez un
              professionnel de la santé.
            </Text>
          </View>

          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeaderTextBlock}>
              <Text style={styles.sectionTitleLarge}>Actions rapides</Text>
              <Text style={styles.sectionSubtitle}>
                Continuez avec votre suivi ou votre routine.
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
    heroGreeting: {
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
      maxWidth: isMobile ? 235 : 390,
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
    label: {
      fontSize: isMobile ? 12 : 13,
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
      paddingVertical: isMobile ? 13 : 14,
      paddingHorizontal: 14,
      fontSize: isMobile ? 15 : 16,
      color: colors.text,
      backgroundColor: colors.cardWarm,
      marginBottom: 10,
    },
    secondaryButtonInside: {
      marginTop: 8,
      paddingVertical: isMobile ? 12 : 13,
      paddingHorizontal: 16,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    painScoreCard: {
      alignSelf: "center",
      minWidth: isMobile ? 106 : 118,
      minHeight: isMobile ? 84 : 92,
      borderRadius: isMobile ? 27 : 30,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      marginBottom: 16,
      paddingHorizontal: 18,
    },
    painNumber: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 48 : 56,
      lineHeight: isMobile ? 54 : 62,
      color: colors.black,
    },
    painSmall: {
      fontSize: 14,
      fontWeight: "900",
      color: colors.black,
      marginTop: isMobile ? 24 : 28,
      marginLeft: 2,
    },
    painGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: isMobile ? 7 : 8,
      justifyContent: "center",
      marginBottom: 14,
    },
    painButton: {
      width: isSmallMobile ? 37 : isMobile ? 39 : 42,
      height: isSmallMobile ? 37 : isMobile ? 39 : 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      alignItems: "center",
      justifyContent: "center",
    },
    painButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    painButtonText: {
      fontSize: isMobile ? 14 : 15,
      fontWeight: "900",
      color: colors.text,
    },
    painButtonTextSelected: {
      color: colors.black,
    },
    infoBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 18,
      padding: isMobile ? 13 : 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.textSoft,
      textAlign: "center",
      fontWeight: "800",
    },
    optionsContainer: {
      gap: 8,
    },
    optionButton: {
      paddingVertical: isMobile ? 12 : 13,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      alignItems: "center",
      justifyContent: "center",
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    optionText: {
      color: colors.text,
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      textAlign: "center",
    },
    optionTextSelected: {
      color: colors.black,
    },
    zoneGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: isMobile ? 8 : 10,
    },
    zoneButton: {
      width: isSmallMobile ? "100%" : "48%",
      minHeight: isMobile ? 70 : 74,
      borderRadius: isMobile ? 20 : 22,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      padding: isMobile ? 11 : 12,
      justifyContent: "space-between",
    },
    zoneButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    zoneButtonText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "900",
      marginTop: 8,
    },
    zoneButtonTextSelected: {
      color: colors.black,
    },
    textArea: {
      minHeight: isMobile ? 116 : 126,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: isMobile ? 13 : 14,
      paddingHorizontal: 14,
      fontSize: isMobile ? 14 : 15,
      lineHeight: isMobile ? 20 : 21,
      color: colors.text,
      backgroundColor: colors.cardWarm,
    },
    primaryButton: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.primary,
      paddingVertical: isMobile ? 14 : 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
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
    messageBox: {
      marginHorizontal: horizontalPadding,
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
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
      marginBottom: 10,
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
    },
    summaryValue: {
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      color: colors.text,
      textAlign: "right",
    },
    historyCard: {
      backgroundColor: colors.cardWarm,
      borderRadius: isMobile ? 20 : 22,
      padding: isMobile ? 13 : 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    historyTopRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    historyTextBlock: {
      flex: 1,
    },
    historyDate: {
      fontFamily: "Georgia",
      fontSize: isMobile ? 16 : 17,
      lineHeight: isMobile ? 21 : 22,
      color: colors.primary,
      marginBottom: 4,
    },
    historyText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.text,
      fontWeight: "700",
    },
    historyNote: {
      marginTop: 10,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textSoft,
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
    secondaryButtonText: {
      color: colors.text,
      fontSize: isMobile ? 13 : 14,
      fontWeight: "900",
      textAlign: "center",
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