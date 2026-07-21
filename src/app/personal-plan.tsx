import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { AppStats, getAppStats } from "../lib/storage";
import BottomNav from "../components/BottomNav";

type Recommendation = {
  title: string;
  text: string;
  href: string;
  buttonText: string;
};

function getRecommendations(priority: string): Recommendation[] {
  const recommendationsByPriority: Record<string, Recommendation[]> = {
    Cou: [
      {
        title: "Surélever l’écran",
        text: "Placez l’écran plus près de la hauteur des yeux pour limiter la flexion prolongée du cou.",
        href: "/workstation-audit",
        buttonText: "Revoir l’audit du poste",
      },
      {
        title: "Faire une pause cervicale",
        text: "Ajoutez une mobilisation douce du cou pendant vos pauses actives.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
      {
        title: "Limiter le travail sur portable seul",
        text: "Si vous utilisez un ordinateur portable longtemps, utilisez idéalement un support, un clavier et une souris externes.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
    ],
    Dos: [
      {
        title: "Varier les positions",
        text: "Le plus important n’est pas une posture parfaite, mais d’éviter de rester immobile trop longtemps.",
        href: "/timer",
        buttonText: "Démarrer la minuterie",
      },
      {
        title: "Ajouter une pause active",
        text: "Levez-vous régulièrement, marchez un peu et changez de position pendant la journée.",
        href: "/timer",
        buttonText: "Démarrer une pause",
      },
      {
        title: "Mobiliser le haut du dos",
        text: "Essayez des extensions thoraciques douces pour contrebalancer la posture assise prolongée.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    Épaules: [
      {
        title: "Rapprocher la souris",
        text: "Gardez la souris proche de votre corps pour éviter de maintenir l’épaule en tension.",
        href: "/workstation-audit",
        buttonText: "Faire l’audit du poste",
      },
      {
        title: "Relâcher les épaules",
        text: "Pendant vos pauses, faites quelques cercles d’épaules ou relâchez volontairement les trapèzes.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
      {
        title: "Ajuster la zone de travail",
        text: "Placez les objets utilisés souvent à portée confortable pour limiter les mouvements répétitifs éloignés.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
    ],
    Poignets: [
      {
        title: "Réduire les appuis prolongés",
        text: "Évitez de garder les poignets appuyés longtemps sur une surface dure pendant l’utilisation du clavier ou de la souris.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
      {
        title: "Garder clavier et souris proches",
        text: "Un clavier et une souris proches permettent souvent de réduire les tensions dans les avant-bras et les poignets.",
        href: "/workstation-audit",
        buttonText: "Faire l’audit du poste",
      },
      {
        title: "Mobiliser les mains",
        text: "Ajoutez une courte mobilité des doigts et des poignets dans votre routine.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    Jambes: [
      {
        title: "Se lever régulièrement",
        text: "Évitez les longues périodes assises sans interruption. Une courte marche peut déjà aider.",
        href: "/timer",
        buttonText: "Démarrer la minuterie",
      },
      {
        title: "Vérifier l’appui des pieds",
        text: "Assurez-vous que vos pieds touchent le sol ou un repose-pieds pour améliorer le confort en position assise.",
        href: "/workstation-audit",
        buttonText: "Faire l’audit du poste",
      },
      {
        title: "Ajouter une marche active",
        text: "Une marche de 2 minutes est une pause simple et efficace à intégrer dans la journée.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    Habitudes: [
      {
        title: "Installer une routine 25/2",
        text: "Travaillez 25 minutes, puis prenez 2 minutes pour bouger ou changer de position.",
        href: "/timer",
        buttonText: "Démarrer la minuterie",
      },
      {
        title: "Commencer petit",
        text: "Visez d’abord 2 ou 3 pauses actives par jour. L’objectif est de créer une habitude réaliste.",
        href: "/dashboard",
        buttonText: "Voir ma progression",
      },
      {
        title: "Lire une capsule par jour",
        text: "Une courte capsule peut vous aider à comprendre pourquoi une habitude est utile.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
    ],
    Écran: [
      {
        title: "Ajuster la hauteur de l’écran",
        text: "Un écran trop bas peut favoriser une flexion prolongée du cou. Essayez de le rapprocher de la hauteur des yeux.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
      {
        title: "Placer l’écran devant vous",
        text: "Évitez de travailler longtemps avec l’écran décalé sur le côté.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
    ],
    Chaise: [
      {
        title: "Stabiliser les appuis",
        text: "Les pieds devraient idéalement être bien appuyés au sol ou sur un repose-pieds.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
      {
        title: "Changer de posture",
        text: "Même une bonne chaise ne remplace pas le mouvement. Variez régulièrement votre position.",
        href: "/timer",
        buttonText: "Démarrer une pause",
      },
    ],
    Souris: [
      {
        title: "Rapprocher la souris",
        text: "Gardez la souris près du corps pour limiter la tension dans l’épaule et le bras.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
      {
        title: "Relâcher l’épaule",
        text: "Ajoutez des cercles d’épaules ou une rétraction scapulaire douce dans vos pauses.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    Clavier: [
      {
        title: "Rapprocher le clavier",
        text: "Un clavier trop éloigné peut augmenter les contraintes aux épaules, bras et poignets.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
      {
        title: "Réduire les tensions des poignets",
        text: "Essayez une courte mobilité des poignets et des doigts pendant les pauses.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
    "Ordinateur portable": [
      {
        title: "Éviter le portable seul longtemps",
        text: "Pour de longues périodes, un support, un clavier externe et une souris externe sont souvent préférables.",
        href: "/workstation-audit",
        buttonText: "Refaire l’audit",
      },
      {
        title: "Surélever l’écran",
        text: "Surélever le portable peut aider à réduire la flexion du cou, surtout pendant les longues sessions.",
        href: "/education",
        buttonText: "Lire une capsule",
      },
    ],
    Mouvement: [
      {
        title: "Utiliser la minuterie 25/2",
        text: "La meilleure action immédiate est d’intégrer de courtes pauses actives dans votre journée.",
        href: "/timer",
        buttonText: "Démarrer la minuterie",
      },
      {
        title: "Faire une marche active",
        text: "Une marche de 2 minutes suffit pour changer de position et relancer le mouvement.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ],
  };

  return (
    recommendationsByPriority[priority] ?? [
      {
        title: "Bouger régulièrement",
        text: "Commencez par intégrer de petites pauses actives dans votre journée.",
        href: "/timer",
        buttonText: "Démarrer la minuterie",
      },
      {
        title: "Faire un exercice simple",
        text: "Choisissez un exercice facile et court pour créer une première habitude.",
        href: "/exercises",
        buttonText: "Voir les exercices",
      },
    ]
  );
}

export default function PersonalPlanScreen() {
  const [stats, setStats] = useState<AppStats | null>(null);

  useEffect(() => {
    const savedStats = getAppStats();
    setStats(savedStats);
  }, []);

  const profile = stats?.profile ?? null;
  const questionnaireResult = stats?.questionnaireResult ?? null;
  const workstationAuditResult = stats?.workstationAuditResult ?? null;

  const tmsPriorities = questionnaireResult?.priorities ?? [];
  const workstationPriorities = workstationAuditResult?.priorities ?? [];

  const mainPriorities = [...tmsPriorities, ...workstationPriorities].slice(0, 4);

  const hasEnoughData = questionnaireResult || workstationAuditResult;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Plan personnalisé</Text>

        <Text style={styles.subtitle}>
          Transformez vos scores en actions simples à appliquer dès aujourd’hui.
        </Text>

        {!hasEnoughData && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Votre plan n’est pas encore prêt</Text>
            <Text style={styles.emptyText}>
              Complétez d’abord le questionnaire TMS ou l’audit du poste pour
              recevoir des recommandations personnalisées.
            </Text>

            <Link href="/questionnaire" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  Faire le questionnaire
                </Text>
              </Pressable>
            </Link>

            <Link href="/workstation-audit" asChild>
              <Pressable style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>
                  Faire l’audit du poste
                </Text>
              </Pressable>
            </Link>
          </View>
        )}

        {hasEnoughData && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>
                {profile?.firstName
                  ? `Plan de ${profile.firstName}`
                  : "Votre plan"}
              </Text>

              <Text style={styles.summaryText}>
                Votre objectif : commencer par les actions les plus simples et
                les plus utiles selon vos priorités actuelles.
              </Text>

              <View style={styles.scoreRow}>
                <View style={styles.scoreMiniCard}>
                  <Text style={styles.scoreLabel}>Score TMS</Text>
                  <Text style={styles.scoreValue}>
                    {questionnaireResult
                      ? `${questionnaireResult.score}/100`
                      : "--/100"}
                  </Text>
                </View>

                <View style={styles.scoreMiniCard}>
                  <Text style={styles.scoreLabel}>Score poste</Text>
                  <Text style={styles.scoreValue}>
                    {workstationAuditResult
                      ? `${workstationAuditResult.score}/100`
                      : "--/100"}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Priorités détectées</Text>

            {mainPriorities.length > 0 ? (
              mainPriorities.map((priority, index) => (
                <View key={`${priority}-${index}`} style={styles.priorityCard}>
                  <Text style={styles.priorityNumber}>{index + 1}</Text>
                  <Text style={styles.priorityText}>{priority}</Text>
                </View>
              ))
            ) : (
              <View style={styles.priorityCard}>
                <Text style={styles.priorityText}>
                  Aucune priorité majeure détectée. Continuez vos bonnes
                  habitudes.
                </Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Actions recommandées</Text>

            {mainPriorities.length > 0 ? (
              mainPriorities.map((priority) => (
                <View key={priority} style={styles.planSection}>
                  <Text style={styles.planSectionTitle}>Priorité : {priority}</Text>

                  {getRecommendations(priority).map((recommendation) => (
                    <View
                      key={`${priority}-${recommendation.title}`}
                      style={styles.recommendationCard}
                    >
                      <Text style={styles.recommendationTitle}>
                        {recommendation.title}
                      </Text>
                      <Text style={styles.recommendationText}>
                        {recommendation.text}
                      </Text>

                      <Link href={recommendation.href} asChild>
                        <Pressable style={styles.smallButton}>
                          <Text style={styles.smallButtonText}>
                            {recommendation.buttonText}
                          </Text>
                        </Pressable>
                      </Link>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <View style={styles.recommendationCard}>
                <Text style={styles.recommendationTitle}>
                  Continuer vos habitudes
                </Text>
                <Text style={styles.recommendationText}>
                  Gardez une routine simple : pauses régulières, mouvement,
                  exercices doux et ajustements du poste au besoin.
                </Text>
              </View>
            )}

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Ce plan est un outil d’éducation et de prévention. Il ne remplace
                pas une évaluation personnalisée par un professionnel.
              </Text>
            </View>

            <Link href="/dashboard" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>
                  Voir mon tableau de bord
                </Text>
              </Pressable>
            </Link>
          </>
        )}

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
  pageTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
    marginBottom: 18,
  },
  scoreRow: {
    flexDirection: "row",
    gap: 12,
  },
  scoreMiniCard: {
    flex: 1,
    backgroundColor: "#EAF7F1",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E5B7A",
    marginBottom: 6,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1E8A6A",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 14,
  },
  priorityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  priorityNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DFF4EC",
    color: "#1E8A6A",
    textAlign: "center",
    lineHeight: 34,
    fontWeight: "900",
    marginRight: 12,
  },
  priorityText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    color: "#183642",
  },
  planSection: {
    marginBottom: 22,
  },
  planSectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1E8A6A",
    marginBottom: 10,
  },
  recommendationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#536B78",
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: "#1E8A6A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "800",
  },
  smallButton: {
    backgroundColor: "#EAF7F1",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  smallButtonText: {
    color: "#1E8A6A",
    fontSize: 14,
    fontWeight: "900",
  },
  warningBox: {
    backgroundColor: "#FFF7E6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3D28B",
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#725A20",
  },
});