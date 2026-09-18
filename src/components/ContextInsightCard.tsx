import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import PressableScale from "./PressableScale";
import { useAppTheme } from "../theme/ThemeContext";
import type { ThemeColors } from "../theme/colors";
import type { ContextInsight } from "../lib/contextEngine";

type ContextInsightCardProps = {
  insight: ContextInsight;
  heading?: string;
};

export default function ContextInsightCard({
  insight,
  heading = "Contexte récurrent",
}: ContextInsightCardProps) {
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const targetedHref =
    `/adjust-discomfort?zones=${encodeURIComponent(
      insight.zone
    )}&targeted=true` as any;

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>
        {heading} · {insight.occurrenceCount} observations
      </Text>

      <Text style={styles.title}>
        {insight.title}
      </Text>

      <Text style={styles.meta}>
        {insight.workstationName} · {insight.durationCategory}
      </Text>

      <Text style={styles.text}>
        {insight.summary}
      </Text>

      <View style={styles.adaptiveBox}>
        <Text style={styles.adaptiveTitle}>
          {insight.adaptiveTitle}
        </Text>

        <Text style={styles.adaptiveText}>
          {insight.adaptiveText}
        </Text>
      </View>

      <Text style={styles.checks}>
        À revérifier : {insight.checks.join(", ")}.
      </Text>

      <Text style={styles.disclaimer}>
        « Récurrent » signifie ici au moins deux check-ins similaires dans votre historique. C’est une règle de personnalisation d’ErgoPrevent, pas un seuil clinique ni un niveau de risque.
      </Text>

      <Text style={styles.sources}>
        Références ergonomiques : {insight.evidenceLabel}
      </Text>

      <Link href={targetedHref} asChild>
        <PressableScale style={styles.button}>
          <Text style={styles.buttonText}>
            Vérifier ce contexte
          </Text>
          <Text style={styles.buttonArrow}>→</Text>
        </PressableScale>
      </Link>
    </View>
  );
}

function createStyles(
  colors: ThemeColors,
  mode: "light" | "dark"
) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
      boxShadow:
        mode === "dark"
          ? "0px 16px 32px rgba(0,0,0,0.12)"
          : "0px 16px 32px rgba(0,0,0,0.07)",
    },
    eyebrow: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 7,
    },
    title: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 22,
      lineHeight: 28,
      marginBottom: 5,
    },
    meta: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: "800",
      marginBottom: 10,
    },
    text: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 12,
    },
    adaptiveBox: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 11,
    },
    adaptiveTitle: {
      color: colors.primary,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "900",
      marginBottom: 5,
    },
    adaptiveText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "700",
    },
    checks: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "800",
      marginBottom: 8,
    },
    disclaimer: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      fontWeight: "700",
      marginBottom: 7,
    },
    sources: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      fontWeight: "900",
      marginBottom: 12,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    buttonText: {
      color: colors.black,
      fontSize: 13,
      fontWeight: "900",
      textAlign: "center",
    },
    buttonArrow: {
      color: colors.black,
      fontSize: 18,
      lineHeight: 18,
      fontWeight: "900",
    },
  });
}
