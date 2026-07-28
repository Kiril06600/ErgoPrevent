import { Stack } from "expo-router";
import { ThemeProvider } from "../theme/ThemeContext";

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
    </ThemeProvider>
  );
}