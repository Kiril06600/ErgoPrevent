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
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
}

export function getOnboardingData(): OnboardingData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedData = window.localStorage.getItem(ONBOARDING_DATA_KEY);

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
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(ONBOARDING_UPDATED_EVENT));
}

export function completeOnboarding(data: OnboardingData) {
  if (typeof window === "undefined") {
    return;
  }

  saveOnboardingData(data);
  window.localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
  window.dispatchEvent(new Event(ONBOARDING_UPDATED_EVENT));
}

export function resetOnboarding() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
  window.localStorage.removeItem(ONBOARDING_DATA_KEY);
  window.dispatchEvent(new Event(ONBOARDING_UPDATED_EVENT));
}