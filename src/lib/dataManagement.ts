const ERGOPREVENT_STORAGE_PREFIX = "ergoprevent_";

const ERGOPREVENT_UPDATE_EVENTS = [
  "ergoprevent_stats_updated",
  "ergoprevent_checkins_updated",
  "ergoprevent_routine_updated",
  "ergoprevent_ergonomic_system_updated",
  "ergoprevent_notifications_updated",
  "ergoprevent_notification_settings_updated",
  "ergoprevent_onboarding_updated",
];

function parseStoredValue(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function getErgoPreventStorageSnapshot(): Record<
  string,
  unknown
> {
  if (typeof window === "undefined") {
    return {};
  }

  const snapshot: Record<string, unknown> = {};

  for (
    let index = 0;
    index < window.localStorage.length;
    index += 1
  ) {
    const key = window.localStorage.key(index);

    if (
      !key ||
      !key.startsWith(
        ERGOPREVENT_STORAGE_PREFIX
      )
    ) {
      continue;
    }

    const value =
      window.localStorage.getItem(key);

    if (value === null) {
      continue;
    }

    snapshot[key] =
      parseStoredValue(value);
  }

  return Object.keys(snapshot)
    .sort()
    .reduce<Record<string, unknown>>(
      (sortedSnapshot, key) => {
        sortedSnapshot[key] =
          snapshot[key];

        return sortedSnapshot;
      },
      {}
    );
}

export function clearAllErgoPreventLocalData() {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove: string[] = [];

  for (
    let index = 0;
    index < window.localStorage.length;
    index += 1
  ) {
    const key = window.localStorage.key(index);

    if (
      key &&
      key.startsWith(
        ERGOPREVENT_STORAGE_PREFIX
      )
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    window.localStorage.removeItem(key);
  });

  ERGOPREVENT_UPDATE_EVENTS.forEach(
    (eventName) => {
      window.dispatchEvent(
        new Event(eventName)
      );
    }
  );

  window.dispatchEvent(
    new Event("storage")
  );
}
