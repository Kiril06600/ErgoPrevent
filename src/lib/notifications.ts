export type NotificationCategory = "daily-pain" | "positive";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  category?: NotificationCategory;
  dateKey?: string;
};

export type NotificationSettings = {
  enabled: boolean;
  dailyCheckinReminder: boolean;
  positiveMessages: boolean;
};

const NOTIFICATIONS_STORAGE_KEY = "ergoprevent_notifications";
const GENERATED_NOTIFICATIONS_KEY = "ergoprevent_generated_notifications";
const NOTIFICATION_SETTINGS_KEY = "ergoprevent_notification_settings";

export const NOTIFICATIONS_UPDATED_EVENT = "ergoprevent_notifications_updated";
export const NOTIFICATION_SETTINGS_UPDATED_EVENT =
  "ergoprevent_notification_settings_updated";

const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  dailyCheckinReminder: true,
  positiveMessages: true,
};

const legacyDemoTitles = ["Bilan du jour disponible", "Rappel de posture"];

const positiveMessages = [
  "Chaque petit geste compte. Votre constance aide votre corps à mieux récupérer.",
  "Prendre une minute pour vous écouter est déjà une vraie action de prévention.",
  "Un bon suivi commence par une observation simple et régulière.",
  "Votre confort au travail se construit progressivement, un jour à la fois.",
  "Même une courte pause peut faire une différence dans votre journée.",
  "Écouter vos douleurs tôt permet souvent d’éviter qu’elles s’installent.",
  "Aujourd’hui, l’objectif n’est pas la perfection : seulement rester attentif à votre corps.",
];

function notifyNotificationsUpdated(notifications: AppNotification[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(NOTIFICATIONS_UPDATED_EVENT, {
      detail: notifications,
    })
  );
}

function notifyNotificationSettingsUpdated(settings: NotificationSettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(NOTIFICATION_SETTINGS_UPDATED_EVENT, {
      detail: settings,
    })
  );
}

function createNotificationId() {
  return `notification_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getGeneratedNotificationKeys(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedData = window.localStorage.getItem(GENERATED_NOTIFICATIONS_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData;
  } catch {
    window.localStorage.removeItem(GENERATED_NOTIFICATIONS_KEY);
    return [];
  }
}

function saveGeneratedNotificationKeys(keys: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GENERATED_NOTIFICATIONS_KEY, JSON.stringify(keys));
}

function getPositiveMessageForDate(dateKey: string) {
  const total = dateKey.split("").reduce((currentTotal, character) => {
    return currentTotal + character.charCodeAt(0);
  }, 0);

  return positiveMessages[total % positiveMessages.length];
}

function createAutomaticNotification({
  category,
  title,
  message,
  date,
}: {
  category: NotificationCategory;
  title: string;
  message: string;
  date: Date;
}): AppNotification {
  return {
    id: createNotificationId(),
    title,
    message,
    createdAt: date.toISOString(),
    read: false,
    category,
    dateKey: getTodayKey(date),
  };
}

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return defaultNotificationSettings;
  }

  const savedData = window.localStorage.getItem(NOTIFICATION_SETTINGS_KEY);

  if (!savedData) {
    return defaultNotificationSettings;
  }

  try {
    const parsedData = JSON.parse(savedData);

    return {
      ...defaultNotificationSettings,
      ...parsedData,
    };
  } catch {
    window.localStorage.removeItem(NOTIFICATION_SETTINGS_KEY);
    return defaultNotificationSettings;
  }
}

export function saveNotificationSettings(settings: NotificationSettings) {
  if (typeof window === "undefined") {
    return defaultNotificationSettings;
  }

  window.localStorage.setItem(
    NOTIFICATION_SETTINGS_KEY,
    JSON.stringify(settings)
  );

  notifyNotificationSettingsUpdated(settings);

  return settings;
}

export function setNotificationsEnabled(enabled: boolean) {
  const currentSettings = getNotificationSettings();

  const updatedSettings: NotificationSettings = {
    ...currentSettings,
    enabled,
  };

  saveNotificationSettings(updatedSettings);

  if (!enabled) {
    markAllNotificationsAsRead();
  }

  return updatedSettings;
}

export function setDailyCheckinReminderEnabled(enabled: boolean) {
  const currentSettings = getNotificationSettings();

  const updatedSettings: NotificationSettings = {
    ...currentSettings,
    dailyCheckinReminder: enabled,
  };

  return saveNotificationSettings(updatedSettings);
}

export function setPositiveMessagesEnabled(enabled: boolean) {
  const currentSettings = getNotificationSettings();

  const updatedSettings: NotificationSettings = {
    ...currentSettings,
    positiveMessages: enabled,
  };

  return saveNotificationSettings(updatedSettings);
}

export function getNotifications(): AppNotification[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedData = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData;
  } catch {
    window.localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    return [];
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    NOTIFICATIONS_STORAGE_KEY,
    JSON.stringify(notifications)
  );

  notifyNotificationsUpdated(notifications);
}

export function getUnreadNotificationCount() {
  const settings = getNotificationSettings();

  if (!settings.enabled) {
    return 0;
  }

  return getNotifications().filter((notification) => !notification.read).length;
}

export function addNotification(title: string, message: string) {
  const settings = getNotificationSettings();

  if (!settings.enabled) {
    return getNotifications();
  }

  const currentNotifications = getNotifications();

  const newNotification: AppNotification = {
    id: createNotificationId(),
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const updatedNotifications = [newNotification, ...currentNotifications];

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export function markNotificationAsRead(notificationId: string) {
  const currentNotifications = getNotifications();

  const updatedNotifications = currentNotifications.map((notification) => {
    if (notification.id !== notificationId) {
      return notification;
    }

    return {
      ...notification,
      read: true,
    };
  });

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export function markAllNotificationsAsRead() {
  const currentNotifications = getNotifications();

  const updatedNotifications = currentNotifications.map((notification) => ({
    ...notification,
    read: true,
  }));

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export function deleteNotification(notificationId: string) {
  const currentNotifications = getNotifications();

  const updatedNotifications = currentNotifications.filter(
    (notification) => notification.id !== notificationId
  );

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export function clearNotifications() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(GENERATED_NOTIFICATIONS_KEY);
  }

  saveNotifications([]);

  return [];
}

export function seedInitialNotificationsIfNeeded() {
  if (typeof window === "undefined") {
    return [];
  }

  const settings = getNotificationSettings();

  if (!settings.enabled) {
    return getNotifications();
  }

  const now = new Date();
  const todayKey = getTodayKey(now);

  const currentNotifications = getNotifications();

  const cleanedNotifications = currentNotifications.filter((notification) => {
    return !legacyDemoTitles.includes(notification.title);
  });

  const generatedKeys = getGeneratedNotificationKeys();
  const newGeneratedKeys = [...generatedKeys];

  const dailyPainKey = `daily-pain-${todayKey}`;
  const positiveKey = `positive-${todayKey}`;

  const newNotifications: AppNotification[] = [];

  if (
    settings.dailyCheckinReminder &&
    !generatedKeys.includes(dailyPainKey)
  ) {
    newNotifications.push(
      createAutomaticNotification({
        category: "daily-pain",
        title: "Comment va votre corps aujourd’hui ?",
        message:
          "Prenez une minute pour noter vos douleurs, votre confort et les zones à surveiller.",
        date: now,
      })
    );

    newGeneratedKeys.push(dailyPainKey);
  }

  if (settings.positiveMessages && !generatedKeys.includes(positiveKey)) {
    newNotifications.push(
      createAutomaticNotification({
        category: "positive",
        title: "Petit rappel positif",
        message: getPositiveMessageForDate(todayKey),
        date: now,
      })
    );

    newGeneratedKeys.push(positiveKey);
  }

  const updatedNotifications = [...newNotifications, ...cleanedNotifications];

  const hasChanged =
    newNotifications.length > 0 ||
    cleanedNotifications.length !== currentNotifications.length;

  if (hasChanged) {
    saveGeneratedNotificationKeys(newGeneratedKeys);
    saveNotifications(updatedNotifications);
  }

  return updatedNotifications;
}

export function markTodaysDailyPainNotificationsAsRead() {
  const todayKey = getTodayKey();
  const currentNotifications = getNotifications();

  const updatedNotifications = currentNotifications.map((notification) => {
    if (
      notification.category === "daily-pain" &&
      notification.dateKey === todayKey
    ) {
      return {
        ...notification,
        read: true,
      };
    }

    return notification;
  });

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}

export function addDailyCheckinCompletedNotificationIfNeeded() {
  const settings = getNotificationSettings();

  if (!settings.enabled || !settings.positiveMessages) {
    return getNotifications();
  }

  const now = new Date();
  const todayKey = getTodayKey(now);
  const generatedKeys = getGeneratedNotificationKeys();
  const completedKey = `daily-checkin-completed-${todayKey}`;

  if (generatedKeys.includes(completedKey)) {
    return getNotifications();
  }

  const currentNotifications = getNotifications();

  const completedNotification: AppNotification = {
    id: createNotificationId(),
    title: "Bilan enregistré",
    message:
      "Bravo, vous avez pris un moment pour écouter votre corps aujourd’hui.",
    createdAt: now.toISOString(),
    read: false,
    category: "positive",
    dateKey: todayKey,
  };

  const updatedNotifications = [completedNotification, ...currentNotifications];

  saveGeneratedNotificationKeys([...generatedKeys, completedKey]);
  saveNotifications(updatedNotifications);

  return updatedNotifications;
}