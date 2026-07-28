import React from "react";
import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import { useAppTheme } from "../theme/ThemeContext";

type AppLogoProps = {
  height?: number;
};

export default function AppLogo({ height = 120 }: AppLogoProps) {
  const { mode } = useAppTheme();

  const logoSource: ImageSourcePropType =
    mode === "dark"
      ? require("../../assets/images/logo-ergoprevent-blanc.png")
      : require("../../assets/images/logo-ergoprevent-vert.png");

  return (
    <View
      style={[
        styles.wrapper,
        {
          height,
          width: height * 5.1,
        },
      ]}
    >
      <Image
        source={logoSource}
        style={styles.logo}
        resizeMode="contain"
        fadeDuration={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
    backgroundColor: "transparent",
    overflow: "visible",
    opacity: 1,
  },
  logo: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
    opacity: 1,
  },
});