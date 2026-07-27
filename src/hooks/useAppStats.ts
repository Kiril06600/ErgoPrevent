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

    refreshStats();

    window.addEventListener(
      APP_STATS_UPDATED_EVENT,
      handleStatsUpdate as EventListener
    );

    window.addEventListener("storage", refreshStats);
    window.addEventListener("focus", refreshStats);

    return () => {
      window.removeEventListener(
        APP_STATS_UPDATED_EVENT,
        handleStatsUpdate as EventListener
      );

      window.removeEventListener("storage", refreshStats);
      window.removeEventListener("focus", refreshStats);
    };
  }, []);

  return {
    stats,
    refreshStats,
  };
}