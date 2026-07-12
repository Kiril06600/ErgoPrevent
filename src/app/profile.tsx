import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import {
  getAppStats,
  saveUserProfile,
  resetAppStats,
} from "../lib/storage";
import BottomNav from "../components/BottomNav";

const statuses = ["Étudiant", "Travailleur", "Télétravailleur", "Autre"];

const goals = [
  "Prévenir les douleurs",
  "Réduire les tensions actuelles",
  "Améliorer mon poste de travail",
  "Faire plus de pauses",
  "Bouger davantage",
];

export default function ProfileScreen() {
  const stats = getAppStats();
  const savedProfile = stats.profile;

  const [firstName, setFirstName] = useState(savedProfile?.firstName ?? "");
  const [status, setStatus] = useState(savedProfile?.status ?? "Étudiant");
  const [profession, setProfession] = useState(savedProfile?.profession ?? "");
  const [mainGoal, setMainGoal] = useState(
    savedProfile?.mainGoal ?? "Prévenir les douleurs"
  );
  const [savedMessage, setSavedMessage] = useState("");

  const questionnaireScore = stats.questionnaireResult?.score;
  const workstationScore = stats.workstationAuditResult?.score;

  function handleSaveProfile() {
    saveUserProfile({
      firstName,
      status,
      profession,
      mainGoal,
    });

    setSavedMessage("Profil sauvegardé ✓");
  }

  function handleResetData() {
    resetAppStats();

    setFirstName("");
    setStatus("Étudiant");
    setProfession("");
    setMainGoal("Prévenir les douleurs");
    setSavedMessage("Données réinitialisées ✓");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Profil</Text>

        <Text style={styles.subtitle}>
          Personnalisez votre profil pour adapter progressivement les
          recommandations à votre situation.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex. Antonia"
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text style={styles.label}>Statut</Text>

          <View style={styles.optionsContainer}>
            {statuses.map((item) => {
              const selected = status === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                  onPress={() => setStatus(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Profession ou domaine</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex. médecine, ergonomie, bureau, informatique..."
            value={profession}
            onChangeText={setProfession}
          />

          <Text style={styles.label}>Objectif principal</Text>

          <View style={styles.optionsContainer}>
            {goals.map((item) => {
              const selected = mainGoal === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.optionButton,
                    selected && styles.optionButtonSelected,
                  ]}
                  onPress={() => setMainGoal(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={styles.primaryButton} onPress={handleSaveProfile}>
            <Text style={styles.primaryButtonText}>Sauvegarder mon profil</Text>
          </Pressable>

          {savedMessage.length > 0 && (
            <Text style={styles.savedMessage}>{savedMessage}</Text>
          )}
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>
            {firstName ? `Résumé de ${firstName}` : "Résumé"}
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Score TMS</Text>
            <Text style={styles.summaryValue}>
              {questionnaireScore ? `${questionnaireScore}/100` : "--/100"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Score du poste</Text>
            <Text style={styles.summaryValue}>
              {workstationScore ? `${workstationScore}/100` : "--/100"}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Points</Text>
            <Text style={styles.summaryValue}>{stats.points}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Objectif</Text>
            <Text style={styles.summaryValueSmall}>{mainGoal}</Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            La réinitialisation supprime le profil, les scores, les pauses, les
            exercices, les capsules et les points sauvegardés sur cet appareil.
          </Text>
        </View>

        <Pressable style={styles.dangerButton} onPress={handleResetData}>
          <Text style={styles.dangerButtonText}>Réinitialiser mes données</Text>
        </Pressable>

        <Link href="/dashboard" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Voir mon tableau de bord</Text>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: "#183642",
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#C7D7DF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#183642",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  optionsContainer: {
    gap: 8,
    marginBottom: 10,
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C7D7DF",
    backgroundColor: "#FFFFFF",
  },
  optionButtonSelected: {
    backgroundColor: "#1E8A6A",
    borderColor: "#1E8A6A",
  },
  optionText: {
    color: "#183642",
    fontSize: 15,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: "#FFFFFF",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#1E8A6A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  savedMessage: {
    marginTop: 12,
    color: "#1E8A6A",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#EAF7F1",
    borderRadius: 22,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#183642",
    marginBottom: 14,
  },
  summaryRow: {
    borderTopWidth: 1,
    borderTopColor: "#C7D7DF",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#536B78",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#183642",
  },
  summaryValueSmall: {
    flex: 1,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "800",
    color: "#183642",
  },
  warningBox: {
    backgroundColor: "#FFF7E6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3D28B",
    marginBottom: 12,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#725A20",
  },
  dangerButton: {
    backgroundColor: "#B94A48",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
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
});