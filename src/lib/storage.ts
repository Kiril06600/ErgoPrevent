import { appStorage, emitAppEvent, isAppStorageAvailable } from "./appRuntime";

export type QuestionnaireResult = {
  score: number;
  level: string;
  priorities: string[];
  completedAt: string;
};

export type WorkstationAuditResult = {
  score: number;
  level: string;
  priorities: string[];
  completedAt: string;
};

export type UserProfile = {
  firstName: string;
  status: string;
  profession: string;
  mainGoal: string;
  dateOfBirth?: string;
  sex?: string;
  dominantHand?: "Droite" | "Gauche" | "Ambidextre" | "";
  dominantEye?: "Droit" | "Gauche" | "Je ne sais pas" | "";
  progressiveLenses?: "Oui" | "Non" | "Je ne sais pas" | "";
};

export type AppStats = {
  profile: UserProfile | null;
  questionnaireResult: QuestionnaireResult | null;
  workstationAuditResult: WorkstationAuditResult | null;
  completedBreaks: number;
  completedExercises: number;
  completedExerciseIds: string[];
  completedCapsules: number;
  completedCapsuleIds: string[];
  points: number;
};

const STORAGE_KEY = "ergoprevent_stats";

export const APP_STATS_UPDATED_EVENT = "ergoprevent_stats_updated";

const defaultStats: AppStats = {
  profile: null,
  questionnaireResult: null,
  workstationAuditResult: null,
  completedBreaks: 0,
  completedExercises: 0,
  completedExerciseIds: [],
  completedCapsules: 0,
  completedCapsuleIds: [],
  points: 0,
};

function notifyAppStatsUpdated(stats: AppStats) {
  if (!isAppStorageAvailable()) {
    return;
  }

  emitAppEvent(APP_STATS_UPDATED_EVENT, stats);
}

export function getAppStats(): AppStats {
  if (!isAppStorageAvailable()) {
    return defaultStats;
  }

  const savedData = appStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return defaultStats;
  }

  try {
    const parsedData = JSON.parse(savedData);

    return {
      ...defaultStats,
      ...parsedData,
      completedExerciseIds: parsedData.completedExerciseIds ?? [],
      completedCapsuleIds: parsedData.completedCapsuleIds ?? [],
      profile: parsedData.profile ?? null,
      questionnaireResult: parsedData.questionnaireResult ?? null,
      workstationAuditResult: parsedData.workstationAuditResult ?? null,
      completedBreaks: parsedData.completedBreaks ?? 0,
      completedExercises: parsedData.completedExercises ?? 0,
      completedCapsules: parsedData.completedCapsules ?? 0,
      points: parsedData.points ?? 0,
    };
  } catch {
    appStorage.removeItem(STORAGE_KEY);
    return defaultStats;
  }
}

export function saveAppStats(stats: AppStats) {
  if (!isAppStorageAvailable()) {
    return;
  }

  appStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  notifyAppStatsUpdated(stats);
}

export function saveUserProfile(profile: UserProfile) {
  const currentStats = getAppStats();

  const updatedStats: AppStats = {
    ...currentStats,
    profile,
  };

  saveAppStats(updatedStats);

  return updatedStats;
}

export function resetAppStats() {
  if (!isAppStorageAvailable()) {
    return defaultStats;
  }

  appStorage.removeItem(STORAGE_KEY);
  notifyAppStatsUpdated(defaultStats);

  return defaultStats;
}

export function saveQuestionnaireResult(result: QuestionnaireResult) {
  const currentStats = getAppStats();

  const updatedStats: AppStats = {
    ...currentStats,
    questionnaireResult: result,
  };

  saveAppStats(updatedStats);

  return updatedStats;
}

export function saveWorkstationAuditResult(result: WorkstationAuditResult) {
  const currentStats = getAppStats();

  const isFirstAudit = currentStats.workstationAuditResult === null;

  const updatedStats: AppStats = {
    ...currentStats,
    workstationAuditResult: result,
    points: isFirstAudit ? currentStats.points + 30 : currentStats.points,
  };

  saveAppStats(updatedStats);

  return updatedStats;
}

export function addCompletedBreak() {
  const currentStats = getAppStats();

  const updatedStats: AppStats = {
    ...currentStats,
    completedBreaks: currentStats.completedBreaks + 1,
    points: currentStats.points + 5,
  };

  saveAppStats(updatedStats);

  return updatedStats;
}

export function addCompletedExercise(exerciseId: string) {
  const currentStats = getAppStats();

  if (currentStats.completedExerciseIds.includes(exerciseId)) {
    return currentStats;
  }

  const updatedStats: AppStats = {
    ...currentStats,
    completedExercises: currentStats.completedExercises + 1,
    completedExerciseIds: [...currentStats.completedExerciseIds, exerciseId],
    points: currentStats.points + 10,
  };

  saveAppStats(updatedStats);

  return updatedStats;
}

export function addCompletedCapsule(capsuleId: string) {
  const currentStats = getAppStats();

  if (currentStats.completedCapsuleIds.includes(capsuleId)) {
    return currentStats;
  }

  const updatedStats: AppStats = {
    ...currentStats,
    completedCapsules: currentStats.completedCapsules + 1,
    completedCapsuleIds: [...currentStats.completedCapsuleIds, capsuleId],
    points: currentStats.points + 5,
  };

  saveAppStats(updatedStats);

  return updatedStats;
}