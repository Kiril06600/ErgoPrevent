import { useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import {
  isOnboardingCompleted,
  ONBOARDING_UPDATED_EVENT,
} from "../lib/onboarding";

export default function OnboardingGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function checkOnboardingStatus() {
      const completed = isOnboardingCompleted();

      if (!completed && pathname !== "/onboarding") {
        router.replace("/onboarding");
        return;
      }

      if (completed && pathname === "/onboarding") {
        router.replace("/explore");
      }
    }

    checkOnboardingStatus();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener(ONBOARDING_UPDATED_EVENT, checkOnboardingStatus);
    window.addEventListener("storage", checkOnboardingStatus);
    window.addEventListener("focus", checkOnboardingStatus);

    return () => {
      window.removeEventListener(ONBOARDING_UPDATED_EVENT, checkOnboardingStatus);
      window.removeEventListener("storage", checkOnboardingStatus);
      window.removeEventListener("focus", checkOnboardingStatus);
    };
  }, [pathname, router]);

  return null;
}