import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import AnimatedScreen from "../components/AnimatedScreen";
import BottomNav from "../components/BottomNav";
import PressableScale from "../components/PressableScale";
import { ThemeColors } from "../theme/colors";
import { useAppTheme } from "../theme/ThemeContext";
import {
  Workstation,
  WorkstationType,
  addErgonomicEvent,
  createEmptyWorkstation,
  getCurrentWorkstation,
  getErgonomicProfile,
  getReferenceSettings,
  getWorkstations,
  saveWorkstation,
} from "../lib/ergonomicSystem";

const workstationTypes: WorkstationType[] = [
  "Travail",
  "Maison",
  "Université",
  "Autre",
];

const seatDepthOptions = ["Correct", "Trop profond", "Trop court"];
const lumbarOptions = ["Correct", "À ajuster", "Je ne sais pas"];

const installationSteps = [
  "Poste",
  "Chaise",
  "Assise",
  "Dossier",
  "Lombaires",
  "Accoudoirs",
  "Bureau",
  "Clavier / souris",
  "Écran",
  "Final",
];

export default function InstallWorkstationScreen() {
  const { new: newParam } = useLocalSearchParams<{ new?: string }>();
  const shouldCreateNewWorkstation = newParam === "true";

  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors, mode);

  const profile = getErgonomicProfile();
  const references = getReferenceSettings(profile);
  const savedWorkstations = getWorkstations();
  const currentWorkstation = getCurrentWorkstation();

  const initialWorkstation = shouldCreateNewWorkstation
    ? createEmptyWorkstation("Travail")
    : currentWorkstation ?? savedWorkstations[0] ?? createEmptyWorkstation("Travail");

  const initialSelectedWorkstationId = shouldCreateNewWorkstation
    ? ""
    : savedWorkstations.some((item) => item.id === initialWorkstation.id)
      ? initialWorkstation.id
      : "";

  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<WorkstationType>(
    initialWorkstation.type
  );
  const [selectedWorkstationId, setSelectedWorkstationId] = useState(
    initialSelectedWorkstationId
  );

  const [workstation, setWorkstation] =
    useState<Workstation>(initialWorkstation);

  const [message, setMessage] = useState("");

  const progressText = `${step + 1}/${installationSteps.length}`;

  const profileStatusText = profile
    ? "Profil ergonomique utilisé"
    : "Profil ergonomique à compléter";

  const workstationMemoryText = `${savedWorkstations.length} poste${
    savedWorkstations.length > 1 ? "s" : ""
  } enregistré${savedWorkstations.length > 1 ? "s" : ""}`;

  const currentWorkstationText =
    currentWorkstation?.name ?? "Aucun poste actuel";

  function updateWorkstation(field: keyof Workstation, value: string) {
    setWorkstation((currentWorkstation) => ({
      ...currentWorkstation,
      [field]: value,
    }));
  }

  function handleSelectExistingWorkstation(id: string) {
    const foundWorkstation = savedWorkstations.find((item) => item.id === id);

    if (!foundWorkstation) {
      return;
    }

    setSelectedWorkstationId(id);
    setSelectedType(foundWorkstation.type);
    setWorkstation(foundWorkstation);
    setMessage("");
  }

  function handleCreateNewWorkstation(type: WorkstationType) {
    const newWorkstation = createEmptyWorkstation(type);

    setSelectedType(type);
    setSelectedWorkstationId("");
    setWorkstation(newWorkstation);
    setMessage("");
  }

  function handleNext() {
    setStep((currentStep) =>
      Math.min(currentStep + 1, installationSteps.length - 1)
    );
  }

  function handleBack() {
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  }

  function handleSaveInstallation() {
    saveWorkstation(workstation);

    addErgonomicEvent({
      type: "installation",
      workstationId: workstation.id,
      workstationName: workstation.name,
      action: "Installation complète du poste",
      note: `Assise : ${workstation.chairHeightCm || "non renseignée"} cm · Bureau : ${
        workstation.deskHeightCm || "non renseigné"
      } cm · Écran : ${workstation.screenSetup || "non renseigné"}`,
    });

    setSelectedWorkstationId(workstation.id);
    setMessage("Poste enregistré");
  }

  return (
    <AnimatedScreen>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.pageHeader}>
            <View style={styles.pagePill}>
              <Text style={styles.pagePillText}>Installer</Text>
            </View>

            <Text style={styles.pageTitle}>Installer mon poste</Text>

            <Text style={styles.subtitle}>
              Suivez les étapes comme une intervention ergonomique guidée. Les
              mesures sont entrées manuellement par l’utilisateur.
            </Text>
          </View>

          <View style={styles.interventionCard}>
            <View style={styles.interventionHeaderRow}>
              <View style={styles.interventionTextBlock}>
                <Text style={styles.interventionLabel}>
                  Intervention ergonomique guidée
                </Text>

                <Text style={styles.interventionTitle}>
                  Configurez votre poste dans le bon ordre.
                </Text>

                <Text style={styles.interventionText}>
                  Cette installation reprend la logique d’une intervention
                  ergonomique simple : chaise, assise, dossier, accoudoirs,
                  bureau, clavier, souris et écran. Les mesures sont entrées
                  manuellement et restent enregistrées localement.
                </Text>
              </View>

              <View style={styles.interventionTimeBadge}>
                <Text style={styles.interventionTimeNumber}>3–8</Text>
                <Text style={styles.interventionTimeText}>min</Text>
              </View>
            </View>

            <View style={styles.interventionStatsRow}>
              <View style={styles.interventionStatBox}>
                <Text style={styles.interventionStatValue}>
                  {installationSteps.length}
                </Text>
                <Text style={styles.interventionStatLabel}>étapes</Text>
              </View>

              <View style={styles.interventionStatBox}>
                <Text style={styles.interventionStatValue}>
                  {profile ? "✓" : "!"}
                </Text>
                <Text style={styles.interventionStatLabel}>
                  {profileStatusText}
                </Text>
              </View>

              <View style={styles.interventionStatBox}>
                <Text style={styles.interventionStatValue}>
                  {savedWorkstations.length}
                </Text>
                <Text style={styles.interventionStatLabel}>
                  {workstationMemoryText}
                </Text>
              </View>
            </View>

            <View style={styles.interventionCurrentBox}>
              <Text style={styles.interventionCurrentLabel}>Poste actuel</Text>
              <Text style={styles.interventionCurrentText}>
                {currentWorkstationText}
              </Text>
            </View>

            <View style={styles.interventionPreviewList}>
              <Text style={styles.interventionPreviewTitle}>
                Ce qui sera mémorisé
              </Text>

              <Text style={styles.interventionPreviewText}>
                ✓ Hauteur d’assise · ✓ Profondeur d’assise · ✓ Dossier · ✓
                Lombaires · ✓ Accoudoirs · ✓ Bureau · ✓ Clavier/souris · ✓ Écran
              </Text>
            </View>
          </View>

          <View style={styles.progressBox}>
            <Text style={styles.progressLabel}>Étape {progressText}</Text>
            <Text style={styles.progressTitle}>{installationSteps[step]}</Text>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((step + 1) / installationSteps.length) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>

          {step === 0 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Où êtes-vous ?</Text>
              <Text style={styles.sectionText}>
                Choisissez un poste déjà enregistré ou créez un nouveau poste.
              </Text>

              <HelpBox
                title="Conseil"
                text="Créez un poste différent pour chaque endroit où vous travaillez souvent. Par exemple : Bureau travail, Bureau maison, Bibliothèque, Portable cuisine. Comme ça, chaque poste garde ses propres réglages."
                styles={styles}
              />

              {savedWorkstations.length > 0 && (
                <>
                  <Text style={styles.label}>Postes enregistrés</Text>

                  <View style={styles.optionsContainer}>
                    {savedWorkstations.map((item) => {
                      const selected = workstation.id === item.id;

                      return (
                        <PressableScale
                          key={item.id}
                          style={[
                            styles.optionButton,
                            selected ? styles.optionButtonSelected : null,
                          ]}
                          onPress={() => handleSelectExistingWorkstation(item.id)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              selected ? styles.optionTextSelected : null,
                            ]}
                          >
                            {item.name}
                          </Text>
                        </PressableScale>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={styles.label}>Créer un nouveau poste</Text>

              <View style={styles.optionsContainer}>
                {workstationTypes.map((item) => {
                  const selected =
                    selectedType === item && selectedWorkstationId.length === 0;

                  return (
                    <PressableScale
                      key={item}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => handleCreateNewWorkstation(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <Text style={styles.label}>Nom du poste</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. Bureau PhysioExtra"
                placeholderTextColor={colors.textMuted}
                value={workstation.name}
                onChangeText={(value) => updateWorkstation("name", value)}
              />

              <HelpBox
                title="Comment nommer le poste"
                text="Choisissez un nom facile à reconnaître. Par exemple : Bureau travail, Bureau maison, Poste université, Portable café. Ce nom apparaîtra ensuite dans votre mémoire de poste."
                styles={styles}
              />
            </View>
          )}

          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Réglez la chaise</Text>

              <Text style={styles.sectionText}>
                Vos pieds doivent être bien soutenus et vos cuisses
                approximativement horizontales.
              </Text>

              <View style={styles.referenceBox}>
                <Text style={styles.referenceLabel}>
                  Hauteur de référence de l’assise
                </Text>
                <Text style={styles.referenceValue}>
                  {references.seatHeightRange}
                </Text>
              </View>

              <HelpBox
                title="Comment régler la hauteur de la chaise"
                text="Asseyez-vous normalement, les pieds à plat au sol. Les cuisses devraient être à peu près horizontales. Si vos pieds ne touchent pas bien le sol, baissez la chaise ou ajoutez un repose-pieds. Si vos genoux sont trop hauts, montez légèrement la chaise."
                styles={styles}
              />

              <HelpBox
                title="Comment mesurer la hauteur d’assise"
                text="Prenez un ruban à mesurer et mesurez du sol jusqu’au dessus de l’assise, environ au centre de la chaise. Entrez seulement le nombre en centimètres, par exemple 46."
                styles={styles}
              />

              <Text style={styles.label}>Hauteur d’assise utilisée</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. 46"
                placeholderTextColor={colors.textMuted}
                value={workstation.chairHeightCm}
                onChangeText={(value) => updateWorkstation("chairHeightCm", value)}
                keyboardType="numeric"
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Profondeur de l’assise</Text>

              <Text style={styles.sectionText}>
                Asseyez-vous au fond de la chaise. Vérifiez l’espace entre
                l’avant du siège et l’arrière de vos genoux.
              </Text>

              <View style={styles.schemaBox}>
                <Text style={styles.schemaTitle}>Petit repère</Text>
                <Text style={styles.schemaText}>
                  Il devrait rester un petit espace confortable derrière les
                  genoux. L’assise ne devrait pas pousser dans l’arrière des
                  jambes.
                </Text>
              </View>

              <HelpBox
                title="Comment vérifier"
                text="Asseyez-vous au fond de la chaise, dos contre le dossier. Passez vos doigts entre l’avant de l’assise et l’arrière de vos genoux. Il devrait rester environ 2 à 3 doigts d’espace."
                styles={styles}
              />

              <HelpBox
                title="Comment choisir la bonne réponse"
                text="Choisissez Correct si vous avez un petit espace confortable. Choisissez Trop profond si le bord de la chaise touche ou pousse l’arrière des genoux. Choisissez Trop court si vos cuisses ne sont pas assez soutenues."
                styles={styles}
              />

              <Text style={styles.label}>Votre résultat</Text>

              <View style={styles.optionsContainer}>
                {seatDepthOptions.map((item) => {
                  const selected = workstation.seatDepthStatus === item;

                  return (
                    <PressableScale
                      key={item}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => updateWorkstation("seatDepthStatus", item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              {workstation.seatDepthStatus === "Trop profond" && (
                <View style={styles.adviceBox}>
                  <Text style={styles.adviceText}>
                    Réduisez la profondeur de l’assise si votre chaise le permet.
                    Sinon, évitez d’être poussé vers l’avant par le siège.
                  </Text>
                </View>
              )}

              {workstation.seatDepthStatus === "Trop court" && (
                <View style={styles.adviceBox}>
                  <Text style={styles.adviceText}>
                    Vérifiez que vos cuisses sont suffisamment soutenues sans
                    pression excessive.
                  </Text>
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Réglez le dossier</Text>

              <Text style={styles.sectionText}>
                Évitez une position complètement figée. Cherchez une position
                stable, confortable, avec une légère inclinaison vers l’arrière.
              </Text>

              <HelpBox
                title="Comment régler le dossier"
                text="Appuyez votre dos contre le dossier. Le dossier devrait vous soutenir sans vous pousser vers l’avant. Une légère inclinaison vers l’arrière est souvent plus confortable qu’une position totalement droite et rigide."
                styles={styles}
              />

              <HelpBox
                title="Quoi écrire dans le réglage"
                text="Notez quelque chose que vous pourrez retrouver facilement plus tard : légère inclinaison, tension moyenne, dossier débloqué, position 2, inclinaison confortable, etc."
                styles={styles}
              />

              <Text style={styles.label}>Réglage du dossier</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. légère inclinaison, tension moyenne..."
                placeholderTextColor={colors.textMuted}
                value={workstation.backrestSetting}
                onChangeText={(value) =>
                  updateWorkstation("backrestSetting", value)
                }
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Aucune mesure par téléphone n’est utilisée. Notez simplement le
                  réglage qui vous permet de le retrouver plus tard.
                </Text>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Support lombaire</Text>

              <Text style={styles.sectionText}>
                Le support doit correspondre à la région lombaire, sans pousser
                excessivement le dos.
              </Text>

              <HelpBox
                title="Comment vérifier le support lombaire"
                text="Asseyez-vous au fond de la chaise. Le soutien devrait se placer dans le bas du dos, dans la zone légèrement creuse au-dessus du bassin. Il ne devrait pas pousser trop fort ni créer d’inconfort."
                styles={styles}
              />

              <HelpBox
                title="Repère simple"
                text="Si vous sentez que le bas du dos est soutenu sans pression désagréable, choisissez Correct. Si le soutien est trop haut, trop bas, trop fort ou absent, choisissez À ajuster."
                styles={styles}
              />

              <Text style={styles.label}>État du support lombaire</Text>

              <View style={styles.optionsContainer}>
                {lumbarOptions.map((item) => {
                  const selected = workstation.lumbarSupport === item;

                  return (
                    <PressableScale
                      key={item}
                      style={[
                        styles.optionButton,
                        selected ? styles.optionButtonSelected : null,
                      ]}
                      onPress={() => updateWorkstation("lumbarSupport", item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextSelected : null,
                        ]}
                      >
                        {item}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>
            </View>
          )}

          {step === 5 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Accoudoirs</Text>

              <Text style={styles.sectionText}>
                Les épaules doivent rester relâchées. Les accoudoirs ne devraient
                pas forcer les épaules vers le haut.
              </Text>

              <View style={styles.referenceBox}>
                <Text style={styles.referenceLabel}>Référence du profil</Text>
                <Text style={styles.referenceValue}>
                  {references.armrestReference}
                </Text>
              </View>

              <HelpBox
                title="Comment régler les accoudoirs"
                text="Relâchez vos épaules. Les coudes devraient pouvoir être soutenus sans que les épaules montent. Si les épaules se soulèvent, les accoudoirs sont probablement trop hauts. Si les bras tombent sans soutien, ils sont peut-être trop bas."
                styles={styles}
              />

              <HelpBox
                title="Quoi enregistrer"
                text="Écrivez le repère qui vous aidera à retrouver le réglage : position 3, au niveau des coudes, légèrement sous les coudes, accoudoirs retirés, etc."
                styles={styles}
              />

              <Text style={styles.label}>Réglage enregistré</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. position 3, au niveau des coudes..."
                placeholderTextColor={colors.textMuted}
                value={workstation.armrestSetting}
                onChangeText={(value) =>
                  updateWorkstation("armrestSetting", value)
                }
              />
            </View>
          )}

          {step === 6 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Hauteur du bureau</Text>

              <Text style={styles.sectionText}>
                Le plan de travail doit permettre de garder les épaules
                relâchées et les avant-bras confortables.
              </Text>

              <View style={styles.referenceBox}>
                <Text style={styles.referenceLabel}>Référence selon le profil</Text>
                <Text style={styles.referenceValue}>
                  {references.deskHeightRange}
                </Text>
              </View>

              <HelpBox
                title="Comment vérifier la hauteur du bureau"
                text="Placez vos mains près du clavier. Les épaules devraient rester relâchées, les coudes près du corps et les poignets dans une position neutre. Si vous devez hausser les épaules, le bureau est probablement trop haut."
                styles={styles}
              />

              <HelpBox
                title="Comment mesurer la hauteur"
                text="Mesurez du sol jusqu’au dessus du plan de travail, à l’endroit où reposent le clavier et la souris. Entrez seulement le nombre en centimètres, par exemple 72."
                styles={styles}
              />

              <Text style={styles.label}>Hauteur du bureau</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. 72"
                placeholderTextColor={colors.textMuted}
                value={workstation.deskHeightCm}
                onChangeText={(value) => updateWorkstation("deskHeightCm", value)}
                keyboardType="numeric"
              />
            </View>
          )}

          {step === 7 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Clavier et souris</Text>

              <Text style={styles.sectionText}>
                Gardez la souris près du clavier, sans devoir éloigner le bras.
              </Text>

              <View style={styles.referenceBox}>
                <Text style={styles.referenceLabel}>Main dominante</Text>
                <Text style={styles.referenceValue}>
                  {profile?.dominantHand || "À compléter dans le profil"}
                </Text>
              </View>

              <HelpBox
                title="Comment placer le clavier"
                text="Le clavier devrait être devant vous, assez proche pour éviter de tendre les bras. Les poignets devraient rester le plus neutres possible, sans être cassés vers le haut ou sur le côté."
                styles={styles}
              />

              <HelpBox
                title="Comment placer la souris"
                text="La souris devrait rester proche du clavier, du côté de votre main dominante. Évitez de devoir éloigner le bras ou avancer l’épaule pour l’atteindre."
                styles={styles}
              />

              <Text style={styles.label}>Réglage clavier / souris</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. souris proche du clavier, côté droit..."
                placeholderTextColor={colors.textMuted}
                value={workstation.keyboardMouseSetup}
                onChangeText={(value) =>
                  updateWorkstation("keyboardMouseSetup", value)
                }
              />
            </View>
          )}

          {step === 8 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Écran</Text>

              <Text style={styles.sectionText}>
                Positionnez l’écran directement devant vous. Évitez de relever le
                menton ou de tourner la tête de façon prolongée.
              </Text>

              <View style={styles.referenceBox}>
                <Text style={styles.referenceLabel}>Distance recommandée</Text>
                <Text style={styles.referenceValue}>
                  {references.screenDistanceRange}
                </Text>
              </View>

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  {references.screenHeightAdvice}
                </Text>
              </View>

              <HelpBox
                title="Comment vérifier la distance"
                text="Un repère simple : l’écran devrait être environ à une longueur de bras, selon votre confort visuel. Vous devriez pouvoir lire sans avancer la tête vers l’écran."
                styles={styles}
              />

              <HelpBox
                title="Comment vérifier la hauteur"
                text="Le haut de l’écran devrait être autour du niveau des yeux ou légèrement plus bas. Avec des verres progressifs, évitez un écran trop haut, car cela peut pousser à relever le menton."
                styles={styles}
              />

              <HelpBox
                title="Quoi enregistrer"
                text="Notez un repère concret : écran sur support +8 cm, portable sur support, écran centré, deuxième écran à gauche, distance environ 60 cm, etc."
                styles={styles}
              />

              <Text style={styles.label}>Réglage de l’écran</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex. écran sur support +8 cm, centré..."
                placeholderTextColor={colors.textMuted}
                value={workstation.screenSetup}
                onChangeText={(value) => updateWorkstation("screenSetup", value)}
              />
            </View>
          )}

          {step === 9 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Votre poste est prêt</Text>

              <Text style={styles.sectionText}>
                Vérifiez les réglages enregistrés avant de sauvegarder ce poste.
              </Text>

              <HelpBox
                title="À quoi sert cette sauvegarde"
                text="Ces réglages deviennent la mémoire de ce poste. La prochaine fois, vous pourrez revenir à cette fiche pour retrouver rapidement la hauteur de chaise, la hauteur du bureau, le réglage de l’écran et les autres repères."
                styles={styles}
              />

              <View style={styles.finalList}>
                <View style={styles.finalRow}>
                  <Text style={styles.finalLabel}>Poste</Text>
                  <Text style={styles.finalValue}>{workstation.name}</Text>
                </View>

                <View style={styles.finalRow}>
                  <Text style={styles.finalLabel}>Assise</Text>
                  <Text style={styles.finalValue}>
                    {workstation.chairHeightCm || "--"} cm
                  </Text>
                </View>

                <View style={styles.finalRow}>
                  <Text style={styles.finalLabel}>Bureau</Text>
                  <Text style={styles.finalValue}>
                    {workstation.deskHeightCm || "--"} cm
                  </Text>
                </View>

                <View style={styles.finalRow}>
                  <Text style={styles.finalLabel}>Dossier</Text>
                  <Text style={styles.finalValue}>
                    {workstation.backrestSetting || "Non renseigné"}
                  </Text>
                </View>

                <View style={styles.finalRow}>
                  <Text style={styles.finalLabel}>Accoudoirs</Text>
                  <Text style={styles.finalValue}>
                    {workstation.armrestSetting || "Non renseigné"}
                  </Text>
                </View>

                <View style={styles.finalRow}>
                  <Text style={styles.finalLabel}>Écran</Text>
                  <Text style={styles.finalValue}>
                    {workstation.screenSetup || "Non renseigné"}
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Notes sur le matériel</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ex. nouveau clavier, support écran, souris verticale..."
                placeholderTextColor={colors.textMuted}
                value={workstation.equipmentNotes}
                onChangeText={(value) =>
                  updateWorkstation("equipmentNotes", value)
                }
                multiline
              />

              <HelpBox
                title="Exemples de notes utiles"
                text="Support d’écran utilisé, modèle de chaise, repose-pieds, souris verticale, clavier externe, portable sur support, double écran, changement de matériel récent."
                styles={styles}
              />

              <PressableScale
                style={styles.primaryButton}
                onPress={handleSaveInstallation}
              >
                <Text style={styles.primaryButtonText}>
                  Enregistrer ces réglages
                </Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>

              {message.length > 0 && (
                <View style={styles.messageBox}>
                  <Text style={styles.messageText}>{message}</Text>
                </View>
              )}

              {message.length > 0 && (
                <View style={styles.nextActionsBox}>
                  <Text style={styles.nextActionsTitle}>
                    Votre poste est maintenant dans la mémoire ErgoPrevent.
                  </Text>

                  <Text style={styles.nextActionsText}>
                    Vous pourrez retrouver ses réglages, refaire une vérification
                    ou utiliser ce poste comme référence pour les prochains resets
                    et ajustements.
                  </Text>

                  <View style={styles.nextActionsList}>
                    <Link href="/workstations" asChild>
                      <PressableScale style={styles.nextActionButton}>
                        <Text style={styles.nextActionButtonText}>
                          Voir mes postes
                        </Text>
                        <Text style={styles.nextActionArrow}>→</Text>
                      </PressableScale>
                    </Link>

                    <Link href="/ergonomic-reset" asChild>
                      <PressableScale style={styles.nextActionButton}>
                        <Text style={styles.nextActionButtonText}>
                          Faire un reset
                        </Text>
                        <Text style={styles.nextActionArrow}>→</Text>
                      </PressableScale>
                    </Link>

                    <Link href="/" asChild>
                      <PressableScale style={styles.nextActionButtonSecondary}>
                        <Text style={styles.nextActionButtonSecondaryText}>
                          Retour à l’accueil
                        </Text>
                      </PressableScale>
                    </Link>
                  </View>
                </View>
              )}
            </View>
          )}

          <View style={styles.buttonsRow}>
            {step > 0 && (
              <PressableScale style={styles.secondaryButton} onPress={handleBack}>
                <Text style={styles.secondaryButtonText}>Retour</Text>
              </PressableScale>
            )}

            {step < installationSteps.length - 1 && (
              <PressableScale style={styles.primaryButton} onPress={handleNext}>
                <Text style={styles.primaryButtonText}>Continuer</Text>
                <Text style={styles.primaryButtonArrow}>→</Text>
              </PressableScale>
            )}
          </View>

          {!profile && (
            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>Profil incomplet</Text>
              <Text style={styles.warningText}>
                Les références seront plus utiles si vous complétez votre profil
                ergonomique.
              </Text>

              <Link href="/ergonomic-profile" asChild>
                <PressableScale style={styles.warningButton}>
                  <Text style={styles.warningButtonText}>
                    Compléter mon profil ergonomique
                  </Text>
                </PressableScale>
              </Link>
            </View>
          )}

          <BottomNav />
        </ScrollView>
      </SafeAreaView>
    </AnimatedScreen>
  );
}

function HelpBox({
  title,
  text,
  styles,
}: {
  title: string;
  text: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.helpBox}>
      <Text style={styles.helpTitle}>{title}</Text>
      <Text style={styles.helpText}>{text}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors, _mode: "light" | "dark") {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      paddingTop: 24,
      paddingBottom: 48,
    },
    pageHeader: {
      paddingHorizontal: 24,
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
      fontSize: 38,
      lineHeight: 45,
      color: colors.primary,
      letterSpacing: -0.8,
      marginBottom: 10,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 16,
      lineHeight: 24,
      maxWidth: 560,
    },
    interventionCard: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 34,
      padding: 22,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    interventionHeaderRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 16,
    },
    interventionTextBlock: {
      flex: 1,
    },
    interventionLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 8,
    },
    interventionTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 31,
      lineHeight: 38,
      letterSpacing: -0.6,
      marginBottom: 8,
    },
    interventionText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: "700",
    },
    interventionTimeBadge: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: colors.turquoiseSoft,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    interventionTimeNumber: {
      color: colors.primary,
      fontSize: 22,
      lineHeight: 26,
      fontWeight: "900",
    },
    interventionTimeText: {
      color: colors.textSoft,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    interventionStatsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 12,
    },
    interventionStatBox: {
      flex: 1,
      backgroundColor: colors.cardWarm,
      borderRadius: 20,
      paddingVertical: 13,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 82,
    },
    interventionStatValue: {
      color: colors.primary,
      fontSize: 23,
      lineHeight: 27,
      fontWeight: "900",
      marginBottom: 4,
      textAlign: "center",
    },
    interventionStatLabel: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "900",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    interventionCurrentBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 20,
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    interventionCurrentLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 4,
    },
    interventionCurrentText: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "900",
    },
    interventionPreviewList: {
      backgroundColor: colors.backgroundSoft,
      borderRadius: 20,
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    interventionPreviewTitle: {
      color: colors.primary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "900",
      marginBottom: 5,
    },
    interventionPreviewText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: "700",
    },
    progressBox: {
      marginHorizontal: 24,
      backgroundColor: colors.secondaryLight,
      borderRadius: 24,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    progressLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.7,
      marginBottom: 4,
    },
    progressTitle: {
      fontFamily: "Georgia",
      fontSize: 24,
      lineHeight: 30,
      color: colors.primary,
      marginBottom: 12,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.cardWarm,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 999,
    },
    card: {
      marginHorizontal: 24,
      backgroundColor: colors.card,
      borderRadius: 30,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontFamily: "Georgia",
      fontSize: 28,
      lineHeight: 35,
      color: colors.primary,
      marginBottom: 8,
    },
    sectionText: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: "700",
      marginBottom: 14,
    },
    helpBox: {
      backgroundColor: colors.backgroundSoft,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    helpTitle: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "900",
      marginBottom: 5,
    },
    helpText: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "700",
    },
    label: {
      fontSize: 13,
      fontWeight: "900",
      color: colors.textSoft,
      marginBottom: 8,
      marginTop: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingVertical: 14,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.text,
      backgroundColor: colors.cardWarm,
      marginBottom: 10,
    },
    textArea: {
      minHeight: 94,
      textAlignVertical: "top",
    },
    optionsContainer: {
      gap: 8,
      marginBottom: 10,
    },
    optionButton: {
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
      alignItems: "center",
    },
    optionButtonSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
    },
    optionText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    optionTextSelected: {
      color: colors.black,
    },
    referenceBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 20,
      padding: 15,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    referenceLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 5,
    },
    referenceValue: {
      color: colors.text,
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "900",
    },
    schemaBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    schemaTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 20,
      lineHeight: 26,
      marginBottom: 6,
    },
    schemaText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    adviceBox: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 4,
    },
    adviceText: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    infoBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    infoText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
    },
    finalList: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 6,
      marginBottom: 14,
    },
    finalRow: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 14,
    },
    finalLabel: {
      color: colors.textSoft,
      fontSize: 14,
      fontWeight: "900",
    },
    finalValue: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "right",
    },
    buttonsRow: {
      paddingHorizontal: 24,
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    primaryButton: {
      flex: 1,
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
      textAlign: "center",
    },
    primaryButtonArrow: {
      color: colors.black,
      fontSize: 20,
      fontWeight: "900",
      lineHeight: 20,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 15,
      paddingHorizontal: 18,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.cardWarm,
    },
    secondaryButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "900",
      textAlign: "center",
    },
    messageBox: {
      backgroundColor: colors.turquoiseSoft,
      borderRadius: 18,
      padding: 13,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 14,
    },
    messageText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    nextActionsBox: {
      backgroundColor: colors.secondaryLight,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 14,
    },
    nextActionsTitle: {
      fontFamily: "Georgia",
      color: colors.primary,
      fontSize: 21,
      lineHeight: 27,
      marginBottom: 7,
    },
    nextActionsText: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 13,
    },
    nextActionsList: {
      gap: 9,
    },
    nextActionButton: {
      backgroundColor: colors.primary,
      borderRadius: 999,
      paddingVertical: 13,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: colors.primaryDark,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    nextActionButtonText: {
      color: colors.black,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    nextActionArrow: {
      color: colors.black,
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 18,
    },
    nextActionButtonSecondary: {
      backgroundColor: colors.cardWarm,
      borderRadius: 999,
      paddingVertical: 13,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    nextActionButtonSecondaryText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    warningBox: {
      marginHorizontal: 24,
      backgroundColor: colors.warning,
      borderRadius: 24,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.warningBorder,
      marginBottom: 16,
    },
    warningTitle: {
      fontFamily: "Georgia",
      fontSize: 20,
      lineHeight: 26,
      color: colors.warningText,
      marginBottom: 8,
    },
    warningText: {
      color: colors.warningText,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: "700",
      marginBottom: 12,
    },
    warningButton: {
      backgroundColor: colors.card,
      borderRadius: 999,
      paddingVertical: 13,
      paddingHorizontal: 16,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.warningBorder,
    },
    warningButtonText: {
      color: colors.warningText,
      fontSize: 14,
      fontWeight: "900",
      textAlign: "center",
    },
  });
}