export type DominantHand = "Droite" | "Gauche" | "Ambidextre" | "";
export type DominantEye = "Droit" | "Gauche" | "Je ne sais pas" | "";
export type ProgressiveLenses = "Oui" | "Non" | "Je ne sais pas" | "";

export type ErgonomicProfile = {
  heightCm: string;
  poplitealHeightCm: string;
  seatedElbowHeightCm: string;
  dominantHand: DominantHand;
  dominantEye: DominantEye;
  progressiveLenses: ProgressiveLenses;
  updatedAt: string;
};

export type WorkstationType = "Travail" | "Maison" | "Université" | "Autre";

export type Workstation = {
  id: string;
  name: string;
  type: WorkstationType;
  chairHeightCm: string;
  seatDepthStatus: string;
  backrestSetting: string;
  lumbarSupport: string;
  armrestSetting: string;
  deskHeightCm: string;
  keyboardMouseSetup: string;
  screenSetup: string;
  equipmentNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type ErgonomicEventType =
  | "reset"
  | "installation"
  | "adjustment"
  | "discomfort";

export type ErgonomicEvent = {
  id: string;
  type: ErgonomicEventType;
  workstationId: string;
  workstationName: string;
  zone?: string;
  activity?: string;
  action?: string;
  note?: string;
  createdAt: string;
};

export type ReferenceSettings = {
  seatHeightRange: string;
  deskHeightRange: string;
  armrestReference: string;
  screenDistanceRange: string;
  screenHeightAdvice: string;
};

const ERGONOMIC_PROFILE_KEY = "ergoprevent_ergonomic_profile";
const WORKSTATIONS_KEY = "ergoprevent_workstations";
const CURRENT_WORKSTATION_KEY = "ergoprevent_current_workstation";
const PRIMARY_WORKSTATION_KEY = "ergoprevent_primary_workstation";
const ERGONOMIC_EVENTS_KEY = "ergoprevent_ergonomic_events";

export const ERGONOMIC_SYSTEM_UPDATED_EVENT =
  "ergoprevent_ergonomic_system_updated";

function emitErgonomicUpdate() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ERGONOMIC_SYSTEM_UPDATED_EVENT));
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const savedData = window.localStorage.getItem(key);

  if (!savedData) {
    return fallback;
  }

  try {
    return JSON.parse(savedData) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  emitErgonomicUpdate();
}

function toNumber(value: string) {
  const number = Number(value.replace(",", "."));

  return Number.isFinite(number) ? number : null;
}

function formatRange(min: number, max: number) {
  return `${Math.round(min)}–${Math.round(max)} cm`;
}

export function getErgonomicProfile(): ErgonomicProfile | null {
  return readJson<ErgonomicProfile | null>(ERGONOMIC_PROFILE_KEY, null);
}

export function saveErgonomicProfile(profile: ErgonomicProfile) {
  writeJson<ErgonomicProfile>(ERGONOMIC_PROFILE_KEY, {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
}

export function getReferenceSettings(
  profile: ErgonomicProfile | null
): ReferenceSettings {
  const poplitealHeight = profile ? toNumber(profile.poplitealHeightCm) : null;
  const seatedElbowHeight = profile
    ? toNumber(profile.seatedElbowHeightCm)
    : null;

  const seatHeightRange =
    poplitealHeight !== null
      ? formatRange(poplitealHeight - 1, poplitealHeight + 2)
      : "À compléter";

  const deskHeightRange =
    seatedElbowHeight !== null
      ? formatRange(seatedElbowHeight + 1, seatedElbowHeight + 4)
      : "À compléter";

  const armrestReference =
    seatedElbowHeight !== null
      ? `Autour de ${Math.round(
          seatedElbowHeight
        )} cm, selon le confort des épaules`
      : "À compléter";

  const screenDistanceRange = "50–70 cm environ";

  const screenHeightAdvice =
    profile?.progressiveLenses === "Oui"
      ? "Avec des verres progressifs, évitez un écran trop haut. Le regard doit rester confortable sans extension du cou."
      : "Le haut de l’écran devrait être autour du niveau visuel, sans relever le menton.";

  return {
    seatHeightRange,
    deskHeightRange,
    armrestReference,
    screenDistanceRange,
    screenHeightAdvice,
  };
}

export function getPrimaryWorkstationId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(PRIMARY_WORKSTATION_KEY) ?? "";
}

export function setPrimaryWorkstationId(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRIMARY_WORKSTATION_KEY, id);
  window.localStorage.setItem(CURRENT_WORKSTATION_KEY, id);
  emitErgonomicUpdate();
}

export function getWorkstations(): Workstation[] {
  const workstations = readJson<Workstation[]>(WORKSTATIONS_KEY, []);
  const primaryWorkstationId = getPrimaryWorkstationId();

  if (!primaryWorkstationId) {
    return workstations;
  }

  return [...workstations].sort((firstWorkstation, secondWorkstation) => {
    if (firstWorkstation.id === primaryWorkstationId) {
      return -1;
    }

    if (secondWorkstation.id === primaryWorkstationId) {
      return 1;
    }

    return 0;
  });
}

export function getCurrentWorkstationId() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(CURRENT_WORKSTATION_KEY) ?? "";
}

export function setCurrentWorkstationId(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CURRENT_WORKSTATION_KEY, id);
  emitErgonomicUpdate();
}

export function getCurrentWorkstation(): Workstation | null {
  const currentId = getCurrentWorkstationId();
  const workstations = getWorkstations();

  if (!currentId && workstations.length > 0) {
    return workstations[0];
  }

  return (
    workstations.find((workstation) => workstation.id === currentId) ?? null
  );
}

export function saveWorkstation(workstation: Workstation) {
  const workstations = getWorkstations();
  const existingIndex = workstations.findIndex(
    (item) => item.id === workstation.id
  );

  const updatedWorkstation = {
    ...workstation,
    updatedAt: new Date().toISOString(),
  };

  const updatedWorkstations =
    existingIndex >= 0
      ? workstations.map((item) =>
          item.id === workstation.id ? updatedWorkstation : item
        )
      : [...workstations, updatedWorkstation];

  writeJson<Workstation[]>(WORKSTATIONS_KEY, updatedWorkstations);
  setCurrentWorkstationId(updatedWorkstation.id);
}

export function createEmptyWorkstation(type: WorkstationType): Workstation {
  const now = new Date().toISOString();

  return {
    id: createId("workstation"),
    name:
      type === "Travail"
        ? "Bureau travail"
        : type === "Maison"
          ? "Bureau maison"
          : type === "Université"
            ? "Poste université"
            : "Nouveau poste",
    type,
    chairHeightCm: "",
    seatDepthStatus: "",
    backrestSetting: "",
    lumbarSupport: "",
    armrestSetting: "",
    deskHeightCm: "",
    keyboardMouseSetup: "",
    screenSetup: "",
    equipmentNotes: "",
    createdAt: now,
    updatedAt: now,
  };
}

export function getErgonomicEvents(): ErgonomicEvent[] {
  return readJson<ErgonomicEvent[]>(ERGONOMIC_EVENTS_KEY, []).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function addErgonomicEvent(
  event: Omit<ErgonomicEvent, "id" | "createdAt">
) {
  const events = getErgonomicEvents();

  const newEvent: ErgonomicEvent = {
    ...event,
    id: createId("event"),
    createdAt: new Date().toISOString(),
  };

  writeJson<ErgonomicEvent[]>(ERGONOMIC_EVENTS_KEY, [newEvent, ...events]);

  return newEvent;
}

export function recordReset(workstation: Workstation | null) {
  return addErgonomicEvent({
    type: "reset",
    workstationId: workstation?.id ?? "",
    workstationName: workstation?.name ?? "Poste non défini",
    action: "Reset ergonomique complété",
  });
}

export function getDiscomfortCountsByZone(workstationId?: string) {
  const events = getErgonomicEvents().filter((event) => {
    if (event.type !== "discomfort") {
      return false;
    }

    if (workstationId && event.workstationId !== workstationId) {
      return false;
    }

    return true;
  });

  return events.reduce<Record<string, number>>((accumulator, event) => {
    const zone = event.zone ?? "Zone non précisée";
    accumulator[zone] = (accumulator[zone] ?? 0) + 1;
    return accumulator;
  }, {});
}

export type ErgonomicEvidenceSource = {
  organization: string;
  title: string;
  url: string;
};

export type WorkstationErgonomicInsight = {
  zone: string;
  count: number;
  checks: string[];
  isRepeated: boolean;
  title: string;
  message: string;
  lastReportedAt: string;
};

export const ERGONOMIC_EVIDENCE_SOURCES: ErgonomicEvidenceSource[] = [
  {
    organization: "CNESST",
    title: "Travail de bureau et ergonomie",
    url: "https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/travail-bureau-ergonomie",
  },
  {
    organization: "CNESST",
    title: "Ergonomie et télétravail",
    url: "https://www.cnesst.gouv.qc.ca/fr/prevention-securite/identifier-corriger-risques/liste-informations-prevention/ergonomie-teletravail",
  },
  {
    organization: "INRS",
    title: "Travail sur écran — prévention des risques",
    url: "https://www.inrs.fr/risques/travail-ecran/prevention-risques",
  },
  {
    organization: "IRSST",
    title:
      "Impact du mobilier de bureau sur la posture et la sollicitation musculaire du membre supérieur",
    url: "https://pharesst.irsst.qc.ca/rapports-scientifique/633/",
  },
];

export function getTargetedChecksForZone(zone: string) {
  if (zone === "Cou") {
    return [
      "Écran",
      "Distance de travail",
      "Accoudoirs",
      "Hauteur du bureau",
      "Pauses",
    ];
  }

  if (zone === "Maux de tête") {
    return [
      "Écran",
      "Distance de travail",
      "Éclairage / reflets",
      "Pauses",
    ];
  }

  if (zone === "Épaules" || zone === "Bras") {
    return [
      "Accoudoirs",
      "Souris",
      "Clavier",
      "Hauteur du bureau",
      "Appui des avant-bras",
    ];
  }

  if (zone === "Poignets" || zone === "Doigts" || zone === "Coude") {
    return [
      "Clavier",
      "Souris",
      "Alignement main-avant-bras",
      "Hauteur du bureau",
      "Appui des avant-bras",
    ];
  }

  if (zone === "Dos" || zone === "Bassin") {
    return [
      "Chaise",
      "Dossier",
      "Support lombaire",
      "Hauteur d’assise",
      "Profondeur d’assise",
      "Appui des pieds",
      "Pauses",
    ];
  }

  if (zone === "Jambes" || zone === "Pieds") {
    return [
      "Hauteur d’assise",
      "Appui des pieds",
      "Profondeur d’assise",
      "Pauses",
    ];
  }

  return ["Posture", "Écran", "Clavier / souris", "Pauses"];
}

export function getEvidenceBasedCheckInstruction(check: string) {
  if (check === "Écran") {
    return "Placez l’écran devant vous. Le haut de l’écran devrait se situer autour du niveau des yeux; il peut être placé plus bas si vous portez des verres progressifs.";
  }

  if (check === "Distance de travail") {
    return "Gardez une distance de lecture confortable, généralement autour de 50 à 70 cm, soit environ une longueur de bras.";
  }

  if (check === "Éclairage / reflets") {
    return "Réduisez les reflets gênants et adaptez l’angle, la luminosité et le contraste de l’écran à votre environnement.";
  }

  if (check === "Dossier") {
    return "Réglez le dossier pour que le dos soit soutenu confortablement, en portant une attention particulière à la région lombaire.";
  }

  if (check === "Support lombaire") {
    return "Le bas du dossier devrait soutenir la courbure naturelle du bas du dos sans créer de pression excessive.";
  }

  if (check === "Chaise") {
    return "Réglez la chaise pour pouvoir vous asseoir au fond du siège avec le dos soutenu et les pieds en appui.";
  }

  if (check === "Hauteur d’assise") {
    return "Réglez l’assise pour que les pieds reposent au sol ou sur un repose-pieds et que les cuisses restent confortablement soutenues.";
  }

  if (check === "Profondeur d’assise") {
    return "L’arrière des genoux doit rester dégagé et ne pas être comprimé par le bord de l’assise.";
  }

  if (check === "Appui des pieds") {
    return "Les pieds devraient être soutenus par le sol ou par un repose-pieds stable.";
  }

  if (check === "Accoudoirs") {
    return "Réglez les accoudoirs pour soutenir les avant-bras sans faire remonter les épaules et sans empêcher de vous rapprocher du bureau.";
  }

  if (check === "Hauteur du bureau") {
    return "La hauteur de travail devrait permettre de garder les épaules relâchées, les bras près du corps et les coudes dans une position confortable.";
  }

  if (check === "Clavier") {
    return "Gardez le clavier proche, de préférence mince et peu incliné. Évitez de maintenir les poignets en extension pendant la frappe.";
  }

  if (check === "Souris") {
    return "Placez la souris près du clavier afin d’éviter d’éloigner inutilement le bras et l’épaule.";
  }

  if (check === "Alignement main-avant-bras") {
    return "Essayez de garder la main dans le prolongement de l’avant-bras plutôt que de maintenir le poignet dévié.";
  }

  if (check === "Appui des avant-bras") {
    return "Un soutien des avant-bras peut réduire certaines sollicitations du cou et des épaules, mais il ne doit pas imposer une position fixe ou inconfortable au poignet. Alternez vos appuis selon la tâche.";
  }

  if (check === "Clavier / souris") {
    return "Gardez le clavier et la souris proches de vous afin de limiter les positions contraignantes des épaules, des bras et des poignets.";
  }

  if (check === "Pauses") {
    return "Changez régulièrement de position. Lors du travail sur écran, reposez aussi les yeux régulièrement; la CNESST propose notamment la règle 20-20-20.";
  }

  if (check === "Posture") {
    return "Cherchez une posture confortable et naturelle plutôt qu’une position rigide. Variez régulièrement votre posture au cours du travail.";
  }

  return "Vérifiez que cet élément peut être utilisé confortablement, sans vous obliger à maintenir une posture contraignante.";
}

export function getEvidenceBasedImmediateAction(selectedZones: string[]) {
  if (selectedZones.length === 0) {
    return {
      title: "Changer de position",
      text: "Changez de position quelques instants et revérifiez les principaux éléments de votre poste.",
    };
  }

  if (selectedZones.includes("Maux de tête")) {
    return {
      title: "Pause visuelle et vérification de l’écran",
      text: "Regardez au loin pendant quelques instants, puis vérifiez la distance de l’écran, sa hauteur, les reflets et votre position. ErgoPrevent ne détermine pas la cause d’un mal de tête.",
    };
  }

  if (
    selectedZones.some(
      (zone) => zone === "Cou" || zone === "Épaules" || zone === "Bras"
    )
  ) {
    return {
      title: "Relâcher et revérifier le poste",
      text: "Changez de position, relâchez les épaules puis vérifiez la hauteur de travail, l’écran, les accoudoirs et la proximité du clavier et de la souris.",
    };
  }

  if (
    selectedZones.some(
      (zone) =>
        zone === "Poignets" || zone === "Doigts" || zone === "Coude"
    )
  ) {
    return {
      title: "Revérifier les outils de saisie",
      text: "Rapprochez le clavier et la souris si nécessaire, puis vérifiez l’alignement de la main avec l’avant-bras et la hauteur de la surface de travail.",
    };
  }

  if (
    selectedZones.some((zone) => zone === "Dos" || zone === "Bassin")
  ) {
    return {
      title: "Changer d’appui et revérifier la chaise",
      text: "Changez de position puis vérifiez l’appui des pieds, la profondeur d’assise, le dossier et le soutien du bas du dos.",
    };
  }

  if (
    selectedZones.some((zone) => zone === "Jambes" || zone === "Pieds")
  ) {
    return {
      title: "Changer de position et vérifier les appuis",
      text: "Changez de position ou levez-vous quelques instants si votre activité le permet, puis vérifiez la hauteur d’assise, la profondeur de l’assise et l’appui des pieds.",
    };
  }

  return {
    title: "Changer de position et revérifier le poste",
    text: "Variez votre posture et vérifiez les éléments du poste qui peuvent vous obliger à maintenir une position inconfortable.",
  };
}

export function getWorkstationErgonomicInsight(
  workstationId: string
): WorkstationErgonomicInsight | null {
  if (!workstationId) {
    return null;
  }

  const discomfortEvents = getErgonomicEvents().filter(
    (event) =>
      event.type === "discomfort" &&
      event.workstationId === workstationId &&
      Boolean(event.zone)
  );

  if (discomfortEvents.length === 0) {
    return null;
  }

  const counts = discomfortEvents.reduce<Record<string, number>>(
    (accumulator, event) => {
      const zone = event.zone ?? "Zone non précisée";
      accumulator[zone] = (accumulator[zone] ?? 0) + 1;
      return accumulator;
    },
    {}
  );

  const sortedZones = Object.entries(counts).sort((first, second) => {
    if (second[1] !== first[1]) {
      return second[1] - first[1];
    }

    const firstLatest =
      discomfortEvents.find((event) => event.zone === first[0])?.createdAt ?? "";
    const secondLatest =
      discomfortEvents.find((event) => event.zone === second[0])?.createdAt ?? "";

    return secondLatest.localeCompare(firstLatest);
  });

  const [zone, count] = sortedZones[0];
  const lastReportedAt =
    discomfortEvents.find((event) => event.zone === zone)?.createdAt ?? "";

  const isRepeated = count >= 2;

  return {
    zone,
    count,
    checks: getTargetedChecksForZone(zone),
    isRepeated,
    title: isRepeated
      ? "Inconfort répété à surveiller"
      : "Zone récemment signalée",
    message: isRepeated
      ? `${zone} a été signalé ${count} fois sur ce poste. Cela indique une répétition dans votre historique, sans constituer un diagnostic.`
      : `${zone} a été signalé sur ce poste. ErgoPrevent peut vous aider à revérifier les éléments ergonomiques associés.`,
    lastReportedAt,
  };
}

export function resetErgonomicSystem() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ERGONOMIC_PROFILE_KEY);
  window.localStorage.removeItem(WORKSTATIONS_KEY);
  window.localStorage.removeItem(CURRENT_WORKSTATION_KEY);
  window.localStorage.removeItem(PRIMARY_WORKSTATION_KEY);
  window.localStorage.removeItem(ERGONOMIC_EVENTS_KEY);
  emitErgonomicUpdate();
}