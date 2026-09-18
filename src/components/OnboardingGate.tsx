import { useEffect } from "react";
import { subscribeAppEvent, subscribeAppRefreshSignals } from "../lib/appRuntime";
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

    const unsubscribeOnboarding = subscribeAppEvent(
      ONBOARDING_UPDATED_EVENT,
      checkOnboardingStatus
    );
    const unsubscribeRefreshSignals =
      subscribeAppRefreshSignals(checkOnboardingStatus);

    return () => {
      unsubscribeOnboarding();
      unsubscribeRefreshSignals();
    };
  }, [pathname, router]);

  return null;
}