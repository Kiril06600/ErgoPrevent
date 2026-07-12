import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { addCompletedCapsule, getAppStats } from "../lib/storage";
import BottomNav from "../components/BottomNav";

const capsules = [
  {
    id: "perfect-posture",
    title: "La posture parfaite n’existe pas",
    duration: "1 min",
    category: "Posture",
    content:
      "L’objectif n’est pas de garder une posture parfaite toute la journée. Le plus important est de varier les positions, bouger régulièrement et éviter de rester immobile trop longtemps.",
  },
  {
    id: "move-often",
    title: "Bouger souvent vaut mieux que bouger beaucoup une seule fois",
    duration: "1 min",
    category: "Prévention",
    content:
      "De petites pauses fréquentes peuvent être plus faciles à intégrer qu’une longue séance d’exercice. Se lever, marcher, changer de position ou mobiliser les épaules peut déjà aider.",
  },
  {
    id: "screen-height",
    title: "Pourquoi régler la hauteur de l’écran ?",
    duration: "1 min",
    category: "Poste de travail",
    content:
      "Un écran trop bas peut encourager la tête à pencher vers l’avant. Placer l’écran environ à la hauteur des yeux peut réduire certaines contraintes au niveau du cou.",
  },
  {
    id: "mouse-position",
    title: "Garder la souris proche",
    duration: "45 sec",
    category: "Poste de travail",
    content:
      "Lorsque la souris est trop loin, l’épaule peut rester tendue longtemps. Une souris proche du corps permet souvent de diminuer la tension dans l’épaule et le bras.",
  },
  {
    id: "breaks",
    title: "Pourquoi faire des pauses actives ?",
    duration: "1 min",
    category: "Habitudes",
    content:
      "Les pauses actives permettent de changer de posture, relancer le mouvement et réduire l’exposition prolongée à la même position. Elles n’ont pas besoin d’être longues pour être utiles.",
  },
];

export default function EducationScreen() {
  const savedStats = getAppStats();

  const [completedCapsules, setCompletedCapsules] = useState<string[]>(
    savedStats.completedCapsuleIds
  );

  const [points, setPoints] = useState(savedStats.points);

  function completeCapsule(id: string) {
    const updatedStats = addCompletedCapsule(id);

    setCompletedCapsules(updatedStats.completedCapsuleIds);
    setPoints(updatedStats.points);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Formation quotidienne</Text>

        <Text style={styles.subtitle}>
          Apprenez l’ergonomie progressivement avec de courtes capsules simples
          et pratiques.
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{completedCapsules.length}</Text>
            <Text style={styles.statLabel}>capsules lues</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{points}</Text>
            <Text style={styles.statLabel}>points gagnés</Text>
          </View>
        </View>

        {capsules.map((capsule) => {
          const completed = completedCapsules.includes(capsule.id);

          return (
            <View key={capsule.id} style={styles.capsuleCard}>
              <Text style={styles.capsuleCategory}>{capsule.category}</Text>
              <Text style={styles.capsuleTitle}>{capsule.title}</Text>
              <Text style={styles.capsuleDuration}>{capsule.duration}</Text>

              <Text style={styles.capsuleContent}>{capsule.content}</Text>

              <Pressable
                style={[
                  styles.primaryButton,
                  completed && styles.completedButton,
                ]}
                onPress={() => completeCapsule(capsule.id)}
              >
                <Text style={styles.primaryButtonText}>
                  {completed ? "Capsule lue ✓" : "Marquer comme lue"}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            Ces capsules sont éducatives. Elles ne remplacent pas l’évaluation
            personnalisée d’un professionnel.
          </Text>
        </View>

        <Link href="/dashboard" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir mon tableau de bord</Text>
          </Pressable>
        </Link>

        <Link href="/" asChild>
          <Pressable style={styles.backButton}>
            <Text style={styles.backButtonText}>Retour à l’accueil</Text>
          </Pressable>
        </Link>
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
    fontWeight: "800",
    color: "#183642",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#536B78",
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 34,
    fontWeight: "900",
    color: "#1E8A6A",
  },
  statLabel: {
    marginTop: 6,
    fontSize: 14,
    color: "#536B78",
    textAlign: "center",
  },
  capsuleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  capsuleCategory: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E8A6A",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  capsuleTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 8,
  },
  capsuleDuration: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E5B7A",
    marginBottom: 12,
  },
  capsuleContent: {
    fontSize: 15,
    lineHeight: 23,
    color: "#536B78",
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#1E8A6A",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  completedButton: {
    backgroundColor: "#7AAFA0",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "800",
  },
  backButton: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C7D7DF",
  },
  backButtonText: {
    color: "#1E5B7A",
    fontSize: 15,
    fontWeight: "700",
  },
  warningBox: {
    marginTop: 12,
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