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
import BottomNav from "../components/BottomNav";
import AppLogo from "../components/AppLogo";
import AnimatedScreen from "../components/AnimatedScreen";
import PressableScale from "../components/PressableScale";
import { useAppTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";
import { APP_STATS_UPDATED_EVENT, getAppStats } from "../lib/storage";
import {
  AppNotification,
  deleteNotification,
  getNotificationSettings,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NOTIFICATION_SETTINGS_UPDATED_EVENT,
  NOTIFICATIONS_UPDATED_EVENT,
  seedInitialNotificationsIfNeeded,
} from "../lib/notifications";
import {
  IconBadge,
  RoutineIcon,
  PlanIcon,
  EducationIcon,
  ProfileIcon,
  ProgressIcon,
  BreakIcon,
  ExerciseIcon,
} from "../components/ErgoIcons";

type BellIconProps = {
  size?: number;
  color?: string;
};

function BellIcon({ size = 22, color = "#F5EEDF" }: BellIconProps) {
  return (
    <View style={{ width: size, height: size, position: "relative" }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.28,
          top: size * 0.22,
          width: size * 0.44,
          height: size * 0.5,
          borderTopLeftRadius: size * 0.24,
          borderTopRightRadius: size * 0.24,
          borderBottomLeftRadius: size * 0.1,
          borderBottomRightRadius: size * 0.1,
          borderWidth: 2,
          borderColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.21,
          top: size * 0.68,
          width: size * 0.58,
          height: 2,
          backgroundColor: color,
          borderRadius: 999,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.44,
          top: size * 0.1,
          width: size * 0.12,
          height: size * 0.12,
          borderRadius: size,
          backgroundColor: color,
        }}
      />

      <View
        style={{
          position: "absolute",
          left: size * 0.42,
          top: size * 0.78,
          width: size * 0.16,
          height: size * 0.16,
          borderRadius: size,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

function formatNotificationDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Date inconnue";
  }

  return date.toLocaleDateString("fr-CA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const essentialItems = [
  {
    title: "Bilan du jour",
    text: "Suivez comment votre corps va.",
    href: "/daily-checkin",
    Icon: ProgressIcon,
  },
  {
    title: "Posture",
    text: "Analysez votre poste de travail.",
    href: "/workstation-audit",
    Icon: PlanIcon,
  },
  {
    title: "Rappels Pauses",
    text: "Restez actif et bougez souvent.",
    href: "/timer",
    Icon: BreakIcon,
  },
  {
    title: "Objectifs",
    text: "Consultez votre plan personnalisé.",
    href: "/personal-plan",
    Icon: RoutineIcon,
  },
] as const;

const toolItems = [
  {
    title: "Étirements",
    text: "Exercices guidés pour chaque besoin.",
    href: "/exercises",
    Icon: ExerciseIcon,
  },
  {
    title: "Progression",
    text: "Suivez vos progrès dans le temps.",
    href: "/progress",
    Icon: ProgressIcon,
  },
  {
    title: "Formation",
    text: "Conseils et astuces pour votre bien-être.",
    href: "/education",
    Icon: EducationIcon,
  },
  {
    title: "Profil",
    text: "Gérez vos données et préférences.",
    href: "/profile",
    Icon: ProfileIcon,
  },
] as const;

export default function HomeScreen() {
  const [stats, setStats] = useState(() => getAppStats());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(() =>
    getNotificationSettings().enabled
  );

  useEffect(() => {
    function refreshStats() {
      setStats(getAppStats());
    }

    refreshStats();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(APP_STATS_UPDATED_EVENT, refreshStats);
    window.addEventListener("focus", refreshStats);
    window.addEventListener("storage", refreshStats);

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, refreshStats);
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("storage", refreshStats);
    };
  }, []);

  useEffect(() => {
    function refreshNotifications() {
      const settings = getNotificationSettings();

      setAreNotificationsEnabled(settings.enabled);

      if (!settings.enabled) {
        setIsNotificationsOpen(false);
        setNotifications(getNotifications());
        return;
      }

      seedInitialNotificationsIfNeeded();
      setNotifications(getNotifications());
    }

    refreshNotifications();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refreshNotifications);
    window.addEventListener(
      NOTIFICATION_SETTINGS_UPDATED_EVENT,
      refreshNotifications
    );
    window.addEventListener("focus", refreshNotifications);
    window.addEventListener("storage", refreshNotifications);

    return () => {
      window.removeEventListener(
        NOTIFICATIONS_UPDATED_EVENT,
        refreshNotifications
      );
      window.removeEventListener(
        NOTIFICATION_SETTINGS_UPDATED_EVENT,
        refreshNotifications
      );
      window.removeEventListener("focus", refreshNotifications);
      window.removeEventListener("storage", refreshNotifications);
    };
  }, []);

  function handleToggleNotifications() {
    setIsNotificationsOpen((currentValue) => !currentValue);
  }

  function handleMarkNotificationAsRead(notificationId: string) {
    const updatedNotifications = markNotificationAsRead(notificationId);
    setNotifications(updatedNotifications);
  }

  function handleMarkAllNotificationsAsRead() {
    const updatedNotifications = markAllNotificationsAsRead();
    setNotifications(updatedNotifications);
  }

  function handleDeleteNotification(notificationId: string) {
    const updatedNotifications = deleteNotification(notificationId);
    setNotifications(updatedNotifications);
  }

  const firstName = stats.profile?.firstName?.trim() || "Alex";
  const points = stats.points;
  const notificationCount = areNotificationsEnabled
    ? getUnreadNotificationCount()
    : 0;

  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.topBar}>
            <AppLogo height={100} />

            <PressableScale
              style={styles.notificationButton}
              onPress={handleToggleNotifications}
            >
              <BellIcon size={23} color={colors.primary} />

              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </Text>
                </View>
              )}
            </PressableScale>

            {isNotificationsOpen && (
              <View style={styles.notificationsPanel}>
                <View style={styles.notificationsPanelHeader}>
                  <View>
                    <Text style={styles.notificationsPanelTitle}>
                      Notifications
                    </Text>

                    <Text style={styles.notificationsPanelSubtitle}>
                      {areNotificationsEnabled
                        ? `${notificationCount} non lue${
                            notificationCount > 1 ? "s" : ""
                          }`
                        : "désactivées"}
                    </Text>
                  </View>

                  {areNotificationsEnabled && notificationCount > 0 && (
                    <PressableScale
                      style={styles.markAllSmallButton}
                      onPress={handleMarkAllNotificationsAsRead}
                    >
                      <Text style={styles.markAllSmallText}>Tout lire</Text>
                    </PressableScale>
                  )}
                </View>

                <ScrollView
                  style={styles.notificationsPanelScroll}
                  contentContainerStyle={styles.notificationsPanelContent}
                  showsVerticalScrollIndicator={false}
                >
                  {!areNotificationsEnabled ? (
                    <View style={styles.emptyNotificationBox}>
                      <Text style={styles.emptyNotificationTitle}>
                        Notifications désactivées
                      </Text>
                      <Text style={styles.emptyNotificationText}>
                        Vous pouvez les réactiver dans la page Profil.
                      </Text>
                    </View>
                  ) : notifications.length === 0 ? (
                    <View style={styles.emptyNotificationBox}>
                      <Text style={styles.emptyNotificationTitle}>
                        Aucune notification
                      </Text>
                      <Text style={styles.emptyNotificationText}>
                        Vos rappels apparaîtront ici.
                      </Text>
                    </View>
                  ) : (
                    notifications.map((notification) => (
                      <View
                        key={notification.id}
                        style={[
                          styles.notificationMiniCard,
                          !notification.read
                            ? styles.notificationMiniCardUnread
                            : null,
                        ]}
                      >
                        <Pressable
                          style={styles.notificationMiniContent}
                          onPress={() =>
                            handleMarkNotificationAsRead(notification.id)
                          }
                        >
                          <View style={styles.notificationMiniTitleRow}>
                            {!notification.read && (
                              <View style={styles.unreadDot} />
                            )}

                            <Text style={styles.notificationMiniTitle}>
                              {notification.title}
                            </Text>
                          </View>

                          <Text style={styles.notificationMiniDate}>
                            {formatNotificationDate(notification.createdAt)}
                          </Text>

                          <Text style={styles.notificationMiniMessage}>
                            {notification.message}
                          </Text>
                        </Pressable>

                        <PressableScale
                          style={styles.deleteNotificationButton}
                          onPress={() =>
                            handleDeleteNotification(notification.id)
                          }
                        >
                          <Text style={styles.deleteNotificationText}>×</Text>
                        </PressableScale>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.heroTextBlock}>
                <Text style={styles.greeting}>Bonjour, {firstName}</Text>

                <Text style={styles.heroTitle}>
                  De petits pas aujourd’hui,{"\n"}plus fort demain.
                </Text>

                <Text style={styles.heroSubtitle}>
                  Restez constant, restez sans douleur.
                </Text>
              </View>

              <View style={styles.pointsBadge}>
                <Text style={styles.pointsNumber}>{points}</Text>
                <Text style={styles.pointsText}>points</Text>
              </View>
            </View>

            <Link href="/daily-checkin" asChild>
              <PressableScale style={styles.heroButton}>
                <Text style={styles.heroButtonText}>
                  Commencer le bilan du jour
                </Text>
                <Text style={styles.heroButtonArrow}>›</Text>
              </PressableScale>
            </Link>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vos essentiels</Text>

            <Link href="/explore" asChild>
              <PressableScale style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Voir tout</Text>
                <Text style={styles.viewAllArrow}>›</Text>
              </PressableScale>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsRow}
          >
            {essentialItems.map((item) => {
              const ItemIcon = item.Icon;

              return (
                <Link key={item.href} href={item.href} asChild>
                  <PressableScale style={styles.featureCard}>
                    <IconBadge
                      size={70}
                      backgroundColor="rgba(0, 48, 38, 0.26)"
                      borderColor="rgba(245, 238, 223, 0.18)"
                    >
                      <ItemIcon size={32} color={colors.primary} />
                    </IconBadge>

                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureText}>{item.text}</Text>

                    <View style={styles.arrowCircle}>
                      <Text style={styles.arrowText}>›</Text>
                    </View>
                  </PressableScale>
                </Link>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Outils</Text>

            <Link href="/explore" asChild>
              <PressableScale style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>Voir tout</Text>
                <Text style={styles.viewAllArrow}>›</Text>
              </PressableScale>
            </Link>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsRow}
          >
            {toolItems.map((item) => {
              const ItemIcon = item.Icon;

              return (
                <Link key={item.href} href={item.href} asChild>
                  <PressableScale style={styles.featureCard}>
                    <IconBadge
                      size={70}
                      backgroundColor="rgba(0, 48, 38, 0.26)"
                      borderColor="rgba(245, 238, 223, 0.18)"
                    >
                      <ItemIcon size={32} color={colors.primary} />
                    </IconBadge>

                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureText}>{item.text}</Text>

                    <View style={styles.arrowCircle}>
                      <Text style={styles.arrowText}>›</Text>
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

function createStyles(colors: ThemeColors, mode: "light" | "dark") {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingTop: 28,
      paddingBottom: 42,
    },
    topBar: {
      paddingHorizontal: 24,
      marginBottom: 28,
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      position: "relative",
      minHeight: 105,
      zIndex: 1000,
      overflow: "visible",
    },
    notificationButton: {
      position: "absolute",
      top: 12,
      right: 24,
      zIndex: 70,
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.cardWarm,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      boxShadow:
        mode === "dark"
          ? "0px 12px 26px rgba(0,0,0,0.22)"
          : "0px 12px 26px rgba(8,45,36,0.12)",
    },
    notificationBadge: {
      position: "absolute",
      top: -4,
      right: -4,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 5,
    },
    notificationBadgeText: {
      color: colors.black,
      fontSize: 10,
      fontWeight: "900",
      lineHeight: 13,
    },
    notificationsPanel: {
      position: "absolute",
      top: 68,
      right: 24,
      zIndex: 2000,
      width: 310,
      maxHeight: 250,
      borderRadius: 26,
      backgroundColor: mode === "dark" ? "#243E37" : "#F7F1E7",
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      boxShadow:
        mode === "dark"
          ? "0px 24px 48px rgba(0,0,0,0.42)"
          : "0px 24px 48px rgba(8,45,36,0.18)",
    },
    notificationsPanelHeader: {
      padding: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    notificationsPanelTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 23,
      lineHeight: 28,
    },
    notificationsPanelSubtitle: {
      marginTop: 3,
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "800",
    },
    markAllSmallButton: {
      borderRadius: 999,
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 11,
      borderWidth: 1,
      borderColor: colors.primaryDark,
    },
    markAllSmallText: {
      color: colors.black,
      fontSize: 11,
      fontWeight: "900",
    },
    notificationsPanelScroll: {
      maxHeight: 165,
    },
    notificationsPanelContent: {
      padding: 12,
      gap: 10,
    },
    emptyNotificationBox: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: colors.cardWarm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyNotificationTitle: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "900",
      marginBottom: 5,
    },
    emptyNotificationText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 18,
    },
    notificationMiniCard: {
      position: "relative",
      borderRadius: 18,
      padding: 13,
      paddingRight: 40,
      backgroundColor: mode === "dark" ? "#314C44" : "#EFE6D8",
      borderWidth: 1,
      borderColor: colors.border,
    },
    notificationMiniCardUnread: {
      borderColor: colors.primary,
      backgroundColor: mode === "dark" ? "#3A554D" : "#E7DCCB",
    },
    notificationMiniContent: {
      gap: 4,
    },
    notificationMiniTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    notificationMiniTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "900",
    },
    notificationMiniDate: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "700",
    },
    notificationMiniMessage: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 18,
      marginTop: 3,
    },
    deleteNotificationButton: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundSoft,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteNotificationText: {
      color: colors.textSoft,
      fontSize: 18,
      lineHeight: 20,
      fontWeight: "700",
      marginTop: -2,
    },
    heroCard: {
      zIndex: 1,
      marginHorizontal: 24,
      marginBottom: 28,
      minHeight: 320,
      borderRadius: 36,
      padding: 28,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
      overflow: "hidden",
      boxShadow:
        mode === "dark"
          ? "0px 26px 52px rgba(0,0,0,0.18)"
          : "0px 26px 52px rgba(0,0,0,0.14)",
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 18,
    },
    heroTextBlock: {
      flex: 1,
      paddingTop: 8,
    },
    greeting: {
      fontSize: 17,
      lineHeight: 24,
      color: colors.textSoft,
      marginBottom: 24,
      fontWeight: "500",
    },
    heroTitle: {
      fontFamily: "Georgia",
      fontSize: 39,
      lineHeight: 48,
      color: colors.primary,
      letterSpacing: -1,
      marginBottom: 18,
      textShadowColor: "rgba(0,0,0,0.22)",
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    heroSubtitle: {
      fontSize: 18,
      lineHeight: 27,
      color: colors.textSoft,
      fontWeight: "400",
    },
    pointsBadge: {
      width: 112,
      minHeight: 82,
      borderRadius: 38,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      boxShadow: "0px 12px 26px rgba(0,0,0,0.16)",
    },
    pointsNumber: {
      fontSize: 34,
      lineHeight: 37,
      fontWeight: "900",
      color: colors.black,
      letterSpacing: -1,
    },
    pointsText: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
      color: colors.black,
    },
    heroButton: {
      alignSelf: "flex-start",
      minWidth: 300,
      borderRadius: 999,
      backgroundColor: colors.primary,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      paddingVertical: 16,
      paddingHorizontal: 25,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      marginTop: 30,
    },
    heroButtonText: {
      color: colors.black,
      fontSize: 17,
      fontWeight: "900",
    },
    heroButtonArrow: {
      color: colors.black,
      fontSize: 34,
      fontWeight: "600",
      lineHeight: 28,
      marginTop: -2,
    },
    sectionHeader: {
      paddingHorizontal: 24,
      marginBottom: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 31,
      lineHeight: 38,
      color: colors.primary,
      letterSpacing: -0.5,
    },
    viewAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    viewAllText: {
      color: colors.textSoft,
      fontSize: 17,
      fontWeight: "500",
    },
    viewAllArrow: {
      color: colors.primary,
      fontSize: 32,
      lineHeight: 30,
      fontWeight: "500",
    },
    cardsRow: {
      paddingLeft: 24,
      paddingRight: 24,
      gap: 14,
      marginBottom: 30,
    },
    featureCard: {
      width: 205,
      minHeight: 205,
      borderRadius: 24,
      padding: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: "space-between",
      overflow: "hidden",
    },
    featureTitle: {
      color: colors.text,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "900",
      marginTop: 18,
    },
    featureText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 21,
      marginTop: 8,
      paddingRight: 10,
    },
    arrowCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.11)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-end",
      marginTop: 8,
    },
    arrowText: {
      color: colors.primary,
      fontSize: 30,
      lineHeight: 28,
      fontWeight: "500",
      marginTop: -2,
    },
  });
}