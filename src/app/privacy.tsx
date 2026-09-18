import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import BottomNav from "../components/BottomNav";
import PressableScale from "../components/PressableScale";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";

const sections = [
  {
    title: "Données enregistrées",
    text:
      "Selon les fonctions utilisées, ErgoPrevent peut enregistrer localement des informations que vous saisissez vous-même : profil, contexte de travail, mensurations ergonomiques, réglages et postes, réponses aux questionnaires, douleur ou inconfort rapporté, fatigue, zones corporelles, notes, activité, durée du contexte, historique d’interventions, progression et préférences de l’application.",
  },
  {
    title: "Pourquoi ces données sont utilisées",
    text:
      "Ces informations servent uniquement aux fonctions visibles d’ErgoPrevent : personnaliser les repères ergonomiques, organiser votre suivi, repérer des contextes récurrents dans vos propres données, adapter les recommandations affichées et produire les exports que vous demandez.",
  },
  {
    title: "Stockage et transmission",
    text:
      "Dans la version actuelle, ces données sont conservées localement sur l’appareil ou dans le stockage local du navigateur. ErgoPrevent n’utilise pas de compte cloud, de serveur de synchronisation, de publicité ni d’outil d’analytique qui transmettrait ces données à un tiers.",
  },
  {
    title: "Capteurs et données externes",
    text:
      "ErgoPrevent ne demande pas l’accès à la caméra, au microphone, à la localisation, aux contacts, à Apple Health ni à Health Connect pour son fonctionnement actuel. Les mesures et observations sont saisies manuellement par l’utilisateur.",
  },
  {
    title: "Exports et partage",
    text:
      "Vous pouvez volontairement exporter certaines ou toutes vos données en CSV, JSON ou PDF. Sur iPhone et Android, la feuille de partage du système vous permet de choisir une destination. Une fois un fichier exporté ou partagé, sa conservation et sa transmission dépendent de l’emplacement ou du service que vous choisissez.",
  },
  {
    title: "Conservation et suppression",
    text:
      "Les données locales restent disponibles jusqu’à leur suppression par l’utilisateur ou selon le comportement du système ou du navigateur. Depuis le Profil, vous pouvez afficher, exporter et réinitialiser les données ErgoPrevent. La réinitialisation supprime les données locales de l’application sur l’appareil concerné.",
  },
  {
    title: "Sécurité",
    text:
      "Le fait de conserver les données localement limite leur transmission par ErgoPrevent, mais aucun appareil ou stockage local ne peut être présenté comme absolument invulnérable. Protégez l’accès à votre appareil et choisissez avec soin les destinations de vos exports.",
  },
  {
    title: "Santé et ergonomie",
    text:
      "ErgoPrevent est un outil d’éducation, de prévention et de suivi personnel. Il ne pose pas de diagnostic et ne remplace pas l’évaluation d’un ergonome, d’un physiothérapeute, d’un médecin ou d’un autre professionnel de la santé.",
  },
];

export default function PrivacyScreen() {
  const { colors, mode } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = createStyles(colors, mode, layout);

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Confidentialité</Text>
            </View>

            <Text style={styles.pageTitle}>Politique de confidentialité</Text>
            <Text style={styles.subtitle}>
              Cette page décrit les pratiques de données de la version actuelle
              d’ErgoPrevent.
            </Text>
            <Text style={styles.updatedAt}>
              Dernière mise à jour : 18 septembre 2026
            </Text>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Vos données restent sous votre contrôle.</Text>
            <Text style={styles.heroText}>
              ErgoPrevent fonctionne actuellement sans compte cloud et conserve
              les données de suivi sur l’appareil utilisé.
            </Text>
          </View>

          {sections.map((section) => (
            <View key={section.title} style={styles.card}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionText}>{section.text}</Text>
            </View>
          ))}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Questions et changements</Text>
            <Text style={styles.sectionText}>
              Si les pratiques de données d’ErgoPrevent changent, cette politique
              devra être mise à jour avant la distribution de la version concernée.
              Pour toute question, utilisez les coordonnées de contact publiées
              avec l’application sur sa fiche de distribution.
            </Text>
          </View>

          <Link href="/profile" asChild>
            <PressableScale style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Retour au profil</Text>
              <Text style={styles.primaryButtonArrow}>→</Text>
            </PressableScale>
          </Link>

          <BottomNav />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function createStyles(
  colors: ThemeColors,
  mode: "light" | "dark",
  layout: ReturnType<typeof useResponsiveLayout>
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingTop: layout.isMobile ? 18 : 24,
      paddingBottom: layout.isMobile ? 38 : 48,
    },
    pageHeader: {
      paddingHorizontal: layout.horizontalPadding,
      marginBottom: 20,
    },
    pagePill: {
      alignSelf: "flex-start",
      backgroundColor: colors.backgroundSoft,
      borderRadius: 999,
      paddingVertical: 8,
      paddingHorizontal: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    pagePillText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
    },
    pageTitle: {
      fontFamily: "Georgia",
      fontSize: layout.isSmallMobile ? 31 : layout.isMobile ? 34 : 38,
      lineHeight: layout.isSmallMobile ? 38 : layout.isMobile ? 41 : 45,
      color: colors.primary,
      letterSpacing: -0.8,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: layout.isMobile ? 14 : 16,
      lineHeight: layout.isMobile ? 21 : 24,
      color: colors.textSoft,
      maxWidth: 620,
    },
    updatedAt: {
      marginTop: 10,
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "800",
    },
    heroCard: {
      marginHorizontal: layout.horizontalPadding,
      marginBottom: 16,
      borderRadius: layout.isMobile ? 28 : 34,
      padding: layout.isMobile ? 20 : 24,
      backgroundColor: colors.secondaryLight,
      borderWidth: 1,
      borderColor: colors.border,
      boxShadow:
        mode === "dark"
          ? "0px 18px 36px rgba(0,0,0,0.12)"
          : "0px 18px 36px rgba(0,0,0,0.08)",
    },
    heroTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: layout.isMobile ? 25 : 30,
      lineHeight: layout.isMobile ? 31 : 37,
      marginBottom: 9,
    },
    heroText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
    },
    card: {
      marginHorizontal: layout.horizontalPadding,
      marginBottom: 14,
      borderRadius: layout.isMobile ? 24 : 28,
      padding: layout.isMobile ? 17 : 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: layout.isMobile ? 20 : 22,
      lineHeight: layout.isMobile ? 25 : 28,
      marginBottom: 7,
    },
    sectionText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "600",
    },
    primaryButton: {
      marginHorizontal: layout.horizontalPadding,
      marginTop: 4,
      marginBottom: 22,
      backgroundColor: colors.primary,
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      gap: 10,
    },
    primaryButtonText: {
      color: colors.black,
      fontSize: 15,
      fontWeight: "900",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
  });
}
