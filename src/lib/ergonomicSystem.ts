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

  const screenDistanceRange =
    profile?.progressiveLenses === "Oui" ? "55–75 cm" : "50–70 cm";

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
}

export function recordReset(workstation: Workstation | null) {
  addErgonomicEvent({
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

export function getTargetedChecksForZone(zone: string) {
  if (zone === "Cou" || zone === "Maux de tête") {
    return ["Écran", "Dossier", "Accoudoirs", "Distance de travail"];
  }

  if (zone === "Épaules" || zone === "Bras") {
    return ["Accoudoirs", "Souris", "Clavier", "Hauteur du bureau"];
  }

  if (zone === "Poignets" || zone === "Doigts" || zone === "Coude") {
    return ["Clavier", "Souris", "Appui des avant-bras", "Hauteur du bureau"];
  }

  if (zone === "Dos" || zone === "Bassin") {
    return ["Chaise", "Dossier", "Support lombaire", "Hauteur d’assise"];
  }

  if (zone === "Jambes" || zone === "Pieds") {
    return ["Hauteur d’assise", "Appui des pieds", "Profondeur d’assise"];
  }

  return ["Posture", "Écran", "Clavier / souris", "Pauses"];
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