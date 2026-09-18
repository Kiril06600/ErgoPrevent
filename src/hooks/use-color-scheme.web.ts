import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

function subscribeToHydration() {
  return () => {};
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

/**
 * To support static rendering, use a stable server snapshot until hydration,
 * then expose the actual React Native color scheme on the client.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot
  );

  const colorScheme = useRNColorScheme();

  return hasHydrated ? colorScheme : 'light';
}
