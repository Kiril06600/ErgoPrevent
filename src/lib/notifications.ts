export type AppNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

const NOTIFICATIONS_STORAGE_KEY = "ergoprevent_notifications";

export const NOTIFICATIONS_UPDATED_EVENT = "ergoprevent_notifications_updated";

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

function createNotificationId() {
  return `notification_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;
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
  return getNotifications().filter((notification) => !notification.read).length;
}

export function addNotification(title: string, message: string) {
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
  saveNotifications([]);

  return [];
}

export function seedInitialNotificationsIfNeeded() {
  if (typeof window === "undefined") {
    return [];
  }

  const existingNotifications = window.localStorage.getItem(
    NOTIFICATIONS_STORAGE_KEY
  );

  if (existingNotifications) {
    return getNotifications();
  }

  const initialNotifications: AppNotification[] = [
    {
      id: createNotificationId(),
      title: "Bilan du jour disponible",
      message:
        "Prenez une minute pour noter votre niveau de confort aujourd’hui.",
      createdAt: new Date().toISOString(),
      read: false,
    },
    {
      id: createNotificationId(),
      title: "Rappel de posture",
      message:
        "Pensez à ajuster votre position et à faire une courte pause active.",
      createdAt: new Date().toISOString(),
      read: false,
    },
  ];

  saveNotifications(initialNotifications);

  return initialNotifications;
}