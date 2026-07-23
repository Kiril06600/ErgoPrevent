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

export function getAppStats(): AppStats {
  if (typeof window === "undefined") {
    return defaultStats;
  }

  const savedData = window.localStorage.getItem(STORAGE_KEY);

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
    window.localStorage.removeItem(STORAGE_KEY);
    return defaultStats;
  }
}

export function saveAppStats(stats: AppStats) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
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
  if (typeof window === "undefined") {
    return defaultStats;
  }

  window.localStorage.removeItem(STORAGE_KEY);

  return defaultStats;
}

export function saveQuestionnaireResult(result: QuestionnaireResult) {
  const currentStats = getAppStats();

  const updatedStats: AppStats = {
    ...currentStats,
    questionnaireResult: result,
  };

  saveAppStats(updatedStats);
}

export function saveWorkstationAuditResult(result: WorkstationAuditResult) {
  const currentStats = getAppStats();

  const updatedStats: AppStats = {
    ...currentStats,
    workstationAuditResult: result,
    points: currentStats.points + 30,
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