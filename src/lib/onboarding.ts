import { appStorage, emitAppEvent, isAppStorageAvailable } from "./appRuntime";

export type OnboardingData = {
  firstName: string;
  status: string;
  profession: string;
  mainGoal: string;
  workContext: string;
  priority: string;
  createdAt: string;
};

export const ONBOARDING_COMPLETED_KEY = "ergoprevent_onboarding_completed";
export const ONBOARDING_DATA_KEY = "ergoprevent_onboarding_data";
export const ONBOARDING_UPDATED_EVENT = "ergoprevent_onboarding_updated";

export function isOnboardingCompleted() {
  if (!isAppStorageAvailable()) {
    return false;
  }

  return appStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
}

export function getOnboardingData(): OnboardingData | null {
  if (!isAppStorageAvailable()) {
    return null;
  }

  const savedData = appStorage.getItem(ONBOARDING_DATA_KEY);

  if (!savedData) {
    return null;
  }

  try {
    return JSON.parse(savedData) as OnboardingData;
  } catch {
    return null;
  }
}

export function saveOnboardingData(data: OnboardingData) {
  if (!isAppStorageAvailable()) {
    return;
  }

  appStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
  emitAppEvent(ONBOARDING_UPDATED_EVENT);
}

export function completeOnboarding(data: OnboardingData) {
  if (!isAppStorageAvailable()) {
    return;
  }

  saveOnboardingData(data);
  appStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
  emitAppEvent(ONBOARDING_UPDATED_EVENT);
}

export function resetOnboarding() {
  if (!isAppStorageAvailable()) {
    return;
  }

  appStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  appStorage.removeItem(ONBOARDING_DATA_KEY);
  emitAppEvent(ONBOARDING_UPDATED_EVENT);
}