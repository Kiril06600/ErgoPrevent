import React from "react";
import { Image, StyleSheet, View } from "react-native";

type AppLogoProps = {
  height?: number;
};

export default function AppLogo({ height = 54 }: AppLogoProps) {
  return (
    <View style={styles.wrapper}>
      <Image
        source={require("../../assets/images/logo-ergoprevent.png")}
        style={[
          styles.logo,
          {
            height,
            width: height * 4.6,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
  },
  logo: {
    display: "flex",
  },
});