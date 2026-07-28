import { useEffect, useState } from "react";
import {
  APP_STATS_UPDATED_EVENT,
  AppStats,
  getAppStats,
} from "../lib/storage";

export function useAppStats() {
  const [stats, setStats] = useState<AppStats>(() => getAppStats());

  function refreshStats() {
    setStats(getAppStats());
  }

  useEffect(() => {
    refreshStats();

    if (typeof window === "undefined") {
      return;
    }

    function handleStatsUpdate(event: Event) {
      const customEvent = event as CustomEvent<AppStats>;

      if (customEvent.detail) {
        setStats(customEvent.detail);
        return;
      }

      refreshStats();
    }

    const statsUpdateListener = handleStatsUpdate as EventListener;

    window.addEventListener(APP_STATS_UPDATED_EVENT, statsUpdateListener);
    window.addEventListener("storage", refreshStats);
    window.addEventListener("focus", refreshStats);

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", refreshStats);
    }

    return () => {
      window.removeEventListener(APP_STATS_UPDATED_EVENT, statsUpdateListener);
      window.removeEventListener("storage", refreshStats);
      window.removeEventListener("focus", refreshStats);

      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", refreshStats);
      }
    };
  }, []);

  return {
    stats,
    refreshStats,
  };
}