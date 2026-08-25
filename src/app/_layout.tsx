import { Stack, usePathname } from "expo-router";
import { ThemeProvider } from "../theme/ThemeContext";
import BottomNav from "../components/BottomNav";
import OnboardingGate from "../components/OnboardingGate";

export default function RootLayout() {
  const pathname = usePathname();
  const hideBottomNav = pathname === "/onboarding";

  return (
    <ThemeProvider>
      <OnboardingGate />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          animationDuration: 350,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      />

      {!hideBottomNav && <BottomNav fixed />}
    </ThemeProvider>
  );
}