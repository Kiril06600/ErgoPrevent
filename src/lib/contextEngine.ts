import {
  getInterventionFollowUpInsights,
  type DailyCheckin,
  type FollowUpDirection,
} from "./checkinSystem";
import {
  getTargetedChecksForZone,
  type ErgonomicEvent,
} from "./ergonomicSystem";
import { CONTEXT_EVIDENCE_LABEL } from "./evidenceContent";

export type ContextInsight = {
  id: string;
  workstationId: string;
  workstationName: string;
  activity: string;
  durationCategory: string;
  zone: string;
  occurrenceCount: number;
  averageReportedPain: number;
  averageFatigue: string;
  latestAt: string;
  checks: string[];
  followUpDirection: FollowUpDirection | "none";
  title: string;
  summary: string;
  adaptiveTitle: string;
  adaptiveText: string;
  actions: string[];
  evidenceLabel: string;
};

function averagePain(checkins: DailyCheckin[]) {
  if (checkins.length === 0) {
    return 0;
  }

  const value =
    checkins.reduce(
      (sum, checkin) => sum + checkin.painLevel,
      0
    ) / checkins.length;

  return Math.round(value * 10) / 10;
}

function averageFatigue(checkins: DailyCheckin[]) {
  if (checkins.length === 0) {
    return "Non disponible";
  }

  const scores: Record<string, number> = {
    Faible: 1,
    Moyenne: 2,
    Élevée: 3,
  };

  const average =
    checkins.reduce(
      (sum, checkin) =>
        sum +
        (scores[checkin.fatigueLevel] ?? 2),
      0
    ) / checkins.length;

  if (average < 1.5) {
    return "Faible";
  }

  if (average < 2.5) {
    return "Moyenne";
  }

  return "Élevée";
}

function getAdaptiveMessage(
  direction: FollowUpDirection | "none"
) {
  if (direction === "lower") {
    return {
      title: "Maintenir et observer",
      text: "Un suivi lié à une intervention récente rapporte une intensité plus faible qu’avant. Conservez les changements qui vous semblent confortables et continuez à observer la tendance; cette évolution temporelle ne prouve pas que l’intervention en est la cause.",
    };
  }

  if (direction === "higher") {
    return {
      title: "Élargir la vérification",
      text: "Un suivi lié à une intervention récente rapporte une intensité plus élevée qu’avant. Évitez d’en conclure qu’un réglage précis est responsable : revérifiez l’ensemble du contexte de travail et, si les symptômes persistent ou vous inquiètent, envisagez une évaluation professionnelle.",
    };
  }

  if (direction === "stable") {
    return {
      title: "Ne pas répéter automatiquement le même réglage",
      text: "Un suivi lié à une intervention récente rapporte une intensité similaire. Avant de refaire exactement le même changement, revérifiez les autres éléments du contexte et continuez le suivi.",
    };
  }

  if (direction === "insufficient") {
    return {
      title: "Continuer à mesurer",
      text: "Une intervention a été suivie, mais les données comparables sont encore insuffisantes pour décrire une évolution. Gardez le contexte stable autant que possible et refaites un check-in.",
    };
  }

  return {
    title: "Vérifier le contexte",
    text: "Ce contexte revient dans vos check-ins. Revérifiez les éléments associés à la zone et observez l’évolution après vos changements.",
  };
}

export function getContextInsights(
  checkins: DailyCheckin[],
  ergonomicEvents: ErgonomicEvent[],
  workstationId?: string
): ContextInsight[] {
  const relevantCheckins = checkins.filter((checkin) => {
    if (workstationId && checkin.workstationId !== workstationId) {
      return false;
    }

    return (
      checkin.zones.length > 0 &&
      checkin.workstationId.length > 0 &&
      (
        checkin.activity !== "Non précisée" ||
        checkin.durationCategory !== "Non précisée"
      )
    );
  });

  const groups = new Map<string, DailyCheckin[]>();

  relevantCheckins.forEach((checkin) => {
    checkin.zones.forEach((zone) => {
      const key = [
        checkin.workstationId,
        checkin.activity || "Non précisée",
        checkin.durationCategory || "Non précisée",
        zone,
      ].join("||");

      const existing = groups.get(key) ?? [];
      groups.set(key, [...existing, checkin]);
    });
  });

  const followUps =
    getInterventionFollowUpInsights(
      ergonomicEvents,
      checkins
    );

  const insights: ContextInsight[] = [];

  groups.forEach((groupCheckins, key) => {
    // Règle de produit : au moins 2 observations similaires.
    // Ce n'est ni un seuil clinique ni un seuil scientifique de risque.
    if (groupCheckins.length < 2) {
      return;
    }

    const [
      groupedWorkstationId,
      activity,
      durationCategory,
      zone,
    ] = key.split("||");

    const sorted = [...groupCheckins].sort(
      (a, b) =>
        b.createdAt.localeCompare(a.createdAt)
    );

    const workstationName =
      sorted[0]?.workstationName ??
      "Poste non précisé";

    const matchingFollowUp =
      followUps.find(
        (followUp) =>
          followUp.workstationId ===
            groupedWorkstationId &&
          (
            followUp.zones.length === 0 ||
            followUp.zones.includes(zone)
          ) &&
          (
            followUp.activity === "Non précisée" ||
            activity === "Non précisée" ||
            followUp.activity === activity
          )
      ) ?? null;

    const direction =
      matchingFollowUp?.direction ?? "none";

    const adaptive =
      getAdaptiveMessage(direction);

    const checks =
      getTargetedChecksForZone(zone);

    const count = groupCheckins.length;
    const reportedPain =
      averagePain(groupCheckins);
    const fatigue =
      averageFatigue(groupCheckins);

    const activityText =
      activity === "Non précisée"
        ? "activité non précisée"
        : activity;

    const durationText =
      durationCategory === "Non précisée"
        ? "durée non précisée"
        : durationCategory;

    insights.push({
      id: key,
      workstationId:
        groupedWorkstationId,
      workstationName,
      activity,
      durationCategory,
      zone,
      occurrenceCount: count,
      averageReportedPain:
        reportedPain,
      averageFatigue: fatigue,
      latestAt:
        sorted[0]?.createdAt ?? "",
      checks,
      followUpDirection:
        direction,
      title: `${zone} · ${activityText}`,
      summary:
        `${count} observations similaires dans vos check-ins sur « ${workstationName} », ` +
        `avec ${durationText}. Douleur rapportée moyenne : ${reportedPain}/10; ` +
        `fatigue moyenne déclarée : ${fatigue.toLowerCase()}.`,
      adaptiveTitle:
        adaptive.title,
      adaptiveText:
        adaptive.text,
      actions: [
        `Revérifier : ${checks.join(", ")}.`,
        "Réduire les périodes prolongées dans une même posture en variant les tâches et les positions lorsque l’activité le permet.",
        adaptive.text,
      ],
      evidenceLabel:
        CONTEXT_EVIDENCE_LABEL,
    });
  });

  return insights.sort((first, second) => {
    if (
      second.occurrenceCount !==
      first.occurrenceCount
    ) {
      return (
        second.occurrenceCount -
        first.occurrenceCount
      );
    }

    return second.latestAt.localeCompare(
      first.latestAt
    );
  });
}

export function getPrimaryContextInsight(
  checkins: DailyCheckin[],
  ergonomicEvents: ErgonomicEvent[],
  workstationId?: string
) {
  return (
    getContextInsights(
      checkins,
      ergonomicEvents,
      workstationId
    )[0] ?? null
  );
}
