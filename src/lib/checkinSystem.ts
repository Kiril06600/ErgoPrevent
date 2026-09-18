import type { ErgonomicEvent } from "./ergonomicSystem";

export type DailyCheckin = {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  painLevel: number;
  fatigueLevel: string;
  mainZone: string;
  zones: string[];
  note: string;
  workstationId: string;
  workstationName: string;
  linkedEventId: string;
  activity: string;
  durationCategory: string;
};

export type FollowUpDirection =
  | "lower"
  | "higher"
  | "stable"
  | "insufficient";

export type InterventionFollowUpInsight = {
  interventionId: string;
  interventionType: "adjustment" | "reset";
  workstationId: string;
  workstationName: string;
  zones: string[];
  activity: string;
  baselineAverage: number | null;
  followUpAverage: number;
  baselineCount: number;
  followUpCount: number;
  direction: FollowUpDirection;
  title: string;
  text: string;
  createdAt: string;
};

const CHECKIN_STORAGE_KEY = "ergoprevent_daily_checkins";

export const CHECKINS_UPDATED_EVENT =
  "ergoprevent_checkins_updated";

export function createDailyCheckinId() {
  return `checkin-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const CHECKIN_ACTIVITY_OPTIONS = [
  "Ordinateur",
  "Téléphone",
  "Debout",
  "Manutention",
  "Conduite",
  "Études / lecture",
  "Autre",
  "Non précisée",
];

export const CHECKIN_DURATION_OPTIONS = [
  "Moins de 30 min",
  "30–60 min",
  "1–2 h",
  "2 h ou plus",
  "Non précisée",
];

export function parseZoneText(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((zone) => zone.trim())
        .filter(
          (zone) =>
            zone.length > 0 &&
            zone !== "Aucune zone"
        )
    )
  );
}

function normalizeCheckin(
  checkin: any,
  index: number
): DailyCheckin {
  const date =
    checkin.date ?? "Date inconnue";

  const time =
    checkin.time ?? "00:00";

  const rawZones = Array.isArray(checkin.zones)
    ? checkin.zones
    : parseZoneText(checkin.mainZone ?? "");

  const zones: string[] = Array.from(
    new Set<string>(
      rawZones
        .map((zone: unknown) =>
          String(zone).trim()
        )
        .filter(
          (zone: string) =>
            zone.length > 0 &&
            zone !== "Aucune zone"
        )
    )
  );

  return {
    id:
      checkin.id ??
      `${date}-${time}-${index}`,

    createdAt:
      checkin.createdAt ??
      `${date}T${time}:00`,

    date,
    time,

    painLevel:
      Number.isFinite(
        Number(checkin.painLevel)
      )
        ? Number(checkin.painLevel)
        : 0,

    fatigueLevel:
      checkin.fatigueLevel ?? "Moyenne",

    mainZone:
      zones.length > 0
        ? zones.join(", ")
        : "Aucune zone",

    zones,

    note:
      checkin.note ?? "",

    workstationId:
      checkin.workstationId ?? "",

    workstationName:
      checkin.workstationName ??
      "Poste non précisé",

    linkedEventId:
      checkin.linkedEventId ?? "",

    activity:
      checkin.activity ?? "Non précisée",

    durationCategory:
      checkin.durationCategory ?? "Non précisée",
  };
}

export function getDailyCheckins(): DailyCheckin[] {
  if (typeof window === "undefined") {
    return [];
  }

  const savedData =
    window.localStorage.getItem(
      CHECKIN_STORAGE_KEY
    );

  if (!savedData) {
    return [];
  }

  try {
    const parsedData =
      JSON.parse(savedData);

    const rawCheckins =
      Array.isArray(parsedData)
        ? parsedData
        : Object.values(parsedData);

    return rawCheckins
      .map((checkin, index) =>
        normalizeCheckin(
          checkin,
          index
        )
      )
      .sort((a, b) =>
        b.createdAt.localeCompare(
          a.createdAt
        )
      );
  } catch {
    return [];
  }
}

export function saveDailyCheckin(
  checkin: DailyCheckin
) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized =
    normalizeCheckin(checkin, 0);

  const existing =
    getDailyCheckins().filter(
      (item) =>
        item.id !== normalized.id
    );

  window.localStorage.setItem(
    CHECKIN_STORAGE_KEY,
    JSON.stringify([
      normalized,
      ...existing,
    ])
  );

  window.dispatchEvent(
    new Event(
      CHECKINS_UPDATED_EVENT
    )
  );
}

export function deleteDailyCheckin(
  checkinId: string
) {
  if (typeof window === "undefined") {
    return;
  }

  const updated =
    getDailyCheckins().filter(
      (checkin) =>
        checkin.id !== checkinId
    );

  window.localStorage.setItem(
    CHECKIN_STORAGE_KEY,
    JSON.stringify(updated)
  );

  window.dispatchEvent(
    new Event(
      CHECKINS_UPDATED_EVENT
    )
  );
}

function averagePain(
  checkins: DailyCheckin[]
) {
  if (checkins.length === 0) {
    return null;
  }

  const value =
    checkins.reduce(
      (sum, checkin) =>
        sum + checkin.painLevel,
      0
    ) / checkins.length;

  return (
    Math.round(value * 10) / 10
  );
}

function checkinMatchesZones(
  checkin: DailyCheckin,
  zones: string[]
) {
  if (zones.length === 0) {
    return true;
  }

  return checkin.zones.some(
    (zone) =>
      zones.includes(zone)
  );
}

export function getInterventionFollowUpInsights(
  ergonomicEvents: ErgonomicEvent[],
  checkins: DailyCheckin[]
): InterventionFollowUpInsight[] {
  const interventions = ergonomicEvents.filter(
    (event) =>
      event.type === "adjustment" ||
      event.type === "reset"
  );

  const insights: InterventionFollowUpInsight[] = [];

  interventions.forEach((event) => {
    const linkedFollowUps = checkins
      .filter(
        (checkin) =>
          checkin.linkedEventId === event.id
      )
      .sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt)
      );

    if (linkedFollowUps.length === 0) {
      return;
    }

    const eventZones = parseZoneText(event.zone ?? "");
    const linkedZones = Array.from(
      new Set(
        linkedFollowUps.flatMap(
          (checkin) => checkin.zones
        )
      )
    );

    const comparisonZones =
      eventZones.length > 0
        ? eventZones
        : linkedZones;

    const linkedActivity =
      linkedFollowUps.find(
        (checkin) =>
          checkin.activity !== "Non précisée"
      )?.activity ?? "Non précisée";

    const comparisonActivity =
      linkedActivity !== "Non précisée"
        ? linkedActivity
        : event.activity?.trim() ||
          "Non précisée";

    const baselineCandidates = checkins
      .filter((checkin) => {
        if (
          checkin.createdAt >= event.createdAt ||
          checkin.workstationId !== event.workstationId
        ) {
          return false;
        }

        if (
          !checkinMatchesZones(
            checkin,
            comparisonZones
          )
        ) {
          return false;
        }

        if (
          comparisonActivity !== "Non précisée" &&
          checkin.activity !== comparisonActivity
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      )
      .slice(0, 3);

    const baselineAverage =
      averagePain(baselineCandidates);

    const followUpAverage =
      averagePain(linkedFollowUps) ?? 0;

    let direction: FollowUpDirection =
      "insufficient";

    let title =
      "Suivi après intervention";

    let text =
      "Un suivi a été enregistré après cette intervention, mais il n’y a pas encore de mesure antérieure suffisamment comparable pour décrire l’évolution.";

    if (baselineAverage !== null) {
      if (followUpAverage < baselineAverage) {
        direction = "lower";
        title =
          "Intensité rapportée plus faible";
      } else if (
        followUpAverage > baselineAverage
      ) {
        direction = "higher";
        title =
          "Intensité rapportée plus élevée";
      } else {
        direction = "stable";
        title =
          "Intensité rapportée similaire";
      }

      const directionText =
        direction === "lower"
          ? "plus faible"
          : direction === "higher"
            ? "plus élevée"
            : "similaire";

      text =
        `Avant l’intervention : ${baselineAverage}/10 en moyenne ` +
        `(${baselineCandidates.length} mesure${baselineCandidates.length > 1 ? "s" : ""} comparable${baselineCandidates.length > 1 ? "s" : ""}). ` +
        `Suivi lié : ${followUpAverage}/10 en moyenne ` +
        `(${linkedFollowUps.length} mesure${linkedFollowUps.length > 1 ? "s" : ""}). ` +
        `L’intensité rapportée est ${directionText}. ` +
        `Cette comparaison reste descriptive et ne prouve pas que l’intervention en est la cause.`;
    }

    insights.push({
      interventionId: event.id,
      interventionType:
        event.type as "adjustment" | "reset",
      workstationId: event.workstationId,
      workstationName:
        event.workstationName ||
        "Poste non précisé",
      zones: comparisonZones,
      activity: comparisonActivity,
      baselineAverage,
      followUpAverage,
      baselineCount:
        baselineCandidates.length,
      followUpCount:
        linkedFollowUps.length,
      direction,
      title,
      text,
      createdAt: event.createdAt,
    });
  });

  return insights.sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}
