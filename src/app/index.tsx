import React from "react";
import { Link } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import BottomNav from "../components/BottomNav";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ErgoPrevent</Text>
          <Text style={styles.tagline}>Prévention musculo-squelettique</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.title}>
            Prévenez vos douleurs avant qu’elles n’apparaissent.
          </Text>

          <Text style={styles.subtitle}>
            Évaluez vos risques de troubles musculo-squelettiques, adoptez de
            meilleures habitudes et recevez des rappels pour bouger régulièrement.
          </Text>

<Link href="/questionnaire" asChild>
  <Pressable style={styles.primaryButton}>
    <Text style={styles.primaryButtonText}>Commencer gratuitement</Text>
  </Pressable>
</Link>
<Link href="/timer" asChild>
  <Pressable style={styles.secondaryButton}>
    <Text style={styles.secondaryButtonText}>Démarrer la minuterie</Text>
  </Pressable>
</Link>
<Link href="/exercises" asChild>
  <Pressable style={styles.secondaryButton}>
    <Text style={styles.secondaryButtonText}>Voir les exercices</Text>
  </Pressable>
</Link>
<Link href="/education" asChild>
  <Pressable style={styles.secondaryButton}>
    <Text style={styles.secondaryButtonText}>Formation quotidienne</Text>
  </Pressable>
</Link>

<Link href="/workstation-audit" asChild>
  <Pressable style={styles.secondaryButton}>
    <Text style={styles.secondaryButtonText}>Faire l’audit du poste</Text>
  </Pressable>
</Link>

<Link href="/dashboard" asChild>
  <Pressable style={styles.secondaryButton}>
    <Text style={styles.secondaryButtonText}>Voir mon tableau de bord</Text>
  </Pressable>
</Link>
<Link href="/profile" asChild>
  <Pressable style={styles.secondaryButton}>
    <Text style={styles.secondaryButtonText}>Mon profil</Text>
  </Pressable>
</Link>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ce que l’application vous aide à faire</Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🧠</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Comprendre vos risques</Text>
              <Text style={styles.featureText}>
                Questionnaire simple pour identifier vos priorités : cou, dos,
                épaules, poignets et jambes.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⏱️</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Bouger toutes les 25 minutes</Text>
              <Text style={styles.featureText}>
                Minuterie intelligente pour vous rappeler de vous lever et de
                faire des pauses actives.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🏆</Text>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Rester motivé</Text>
              <Text style={styles.featureText}>
                Points, niveaux, badges et progression pour transformer la
                prévention en habitude quotidienne.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ErgoPrevent est un outil d’éducation et de prévention. Il ne remplace
            pas une consultation avec un professionnel de la santé, un ergonome,
            un physiothérapeute ou un médecin.
          </Text>
        </View>
        <BottomNav />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FB",
  },
  container: {
    padding: 24,
    paddingBottom: 48,
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 32,
    alignItems: "center",
  },
  logo: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1E5B7A",
  },
  tagline: {
    marginTop: 6,
    fontSize: 15,
    color: "#5D7684",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 26,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "800",
    color: "#183642",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    textAlign: "center",
  },
  primaryButton: {
    marginTop: 26,
    backgroundColor: "#1E8A6A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
  },
  secondaryButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "700",
  },
  section: {
    marginTop: 34,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 6,
  },
  featureText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
  },
  warningBox: {
    marginTop: 24,
    backgroundColor: "#FFF7E6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3D28B",
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#725A20",
  },
});