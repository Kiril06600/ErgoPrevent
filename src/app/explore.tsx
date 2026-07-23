import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import BottomNav from "../components/BottomNav";
import { useAppTheme } from "../theme/ThemeContext";
import { ThemeColors } from "../theme/colors";

export default function ExploreScreen() {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.icon}>🌿</Text>

          <Text style={styles.title}>Explorer ErgoPrevent</Text>

          <Text style={styles.text}>
            Cette page regroupe les principales sections de l’application. Elle
            peut servir plus tard comme page de découverte ou d’aide.
          </Text>

          <Link href="/" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Retour à l’accueil</Text>
            </Pressable>
          </Link>

          <Link href="/routine" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Voir ma routine</Text>
            </Pressable>
          </Link>

          <Link href="/personal-plan" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>
                Voir mon plan personnalisé
              </Text>
            </Pressable>
          </Link>
        </View>

        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 24,
      paddingBottom: 48,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 28,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 20,
    },
    icon: {
      fontSize: 42,
      marginBottom: 14,
    },
    title: {
      fontSize: 30,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 12,
    },
    text: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSoft,
      marginBottom: 22,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: "center",
      marginBottom: 12,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: 16,
      fontWeight: "900",
    },
    secondaryButton: {
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      marginBottom: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "800",
    },
  });
}