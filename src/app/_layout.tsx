import { Stack } from "expo-router";
import { ThemeProvider } from "../theme/ThemeContext";
import BottomNav from "../components/BottomNav";

export default function RootLayout() {
  return (
    <ThemeProvider>
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

      <BottomNav fixed />
    </ThemeProvider>
  );
}