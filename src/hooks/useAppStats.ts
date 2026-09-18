import { useEffect, useState } from "react";
import { subscribeAppEvent, subscribeAppRefreshSignals } from "../lib/appRuntime";
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
    const unsubscribeStats = subscribeAppEvent<AppStats>(
      APP_STATS_UPDATED_EVENT,
      (updatedStats) => {
        if (updatedStats) {
          setStats(updatedStats);
          return;
        }

        refreshStats();
      }
    );

    const unsubscribeRefreshSignals =
      subscribeAppRefreshSignals(refreshStats);

    return () => {
      unsubscribeStats();
      unsubscribeRefreshSignals();
    };
  }, []);

  return {
    stats,
    refreshStats,
  };
}