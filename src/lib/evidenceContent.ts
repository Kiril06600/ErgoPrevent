export type EvidencePlanRecommendation = {
  title: string;
  text: string;
  href:
    | "/workstation-audit"
    | "/exercises"
    | "/education"
    | "/timer"
    | "/dashboard";
  buttonText: string;
};

export const CONTEXT_EVIDENCE_LABEL = "CNESST · INRS · IRSST";

export function getDeclarativeIndexLabel(score: number) {
  if (score < 30) {
    return "Peu de signaux déclarés";
  }

  if (score < 60) {
    return "Plusieurs signaux déclarés";
  }

  return "Nombreux signaux déclarés";
}

export function getDeclarativeIndexMessage(score: number) {
  if (score < 30) {
    return "Votre indice interne comporte peu de signaux déclarés dans ce questionnaire. Cet indice sert uniquement à prioriser les thèmes dans ErgoPrevent et ne constitue pas une estimation clinique ou validée du risque de TMS.";
  }

  if (score < 60) {
    return "Votre indice interne comporte plusieurs signaux déclarés. Utilisez-les pour choisir les thèmes à revoir dans ErgoPrevent. Cet indice n’est pas un score clinique ni une estimation validée du risque de TMS.";
  }

  return "Votre indice interne comporte de nombreux signaux déclarés. Ils peuvent guider les thèmes à revoir et, si des symptômes persistent ou vous inquiètent, une évaluation professionnelle peut être pertinente. Cet indice n’est pas un score clinique ni une estimation validée du risque de TMS.";
}

export function getPainTrackingMessage(painLevel: number) {
  if (painLevel === 0) {
    return "Aucune douleur rapportée pour ce check-in.";
  }

  return `Douleur rapportée : ${painLevel}/10. Cette valeur sert à suivre votre expérience dans le temps; elle ne constitue pas à elle seule un niveau de risque ergonomique.`;
}

export function getEvidenceBasedPlanRecommendations(
  priority: string
): EvidencePlanRecommendation[] {
  const recommendations: Record<string, EvidencePlanRecommendation[]> = {
    Cou: [
      {
        title: "Revérifier l’écran et la distance",
        text: "Placez l’écran devant vous, à une distance de lecture confortable, et évitez une hauteur qui vous oblige à maintenir le cou en flexion ou en extension. Avec des verres progressifs, un écran plus bas peut être préférable.",
        href: "/workstation-audit",
        buttonText: "Revoir le poste",
      },
      {
        title: "Varier la position",
        text: "Évitez de maintenir longtemps la même position de tête et de cou. Alternez les tâches et profitez des pauses pour changer de posture.",
        href: "/timer",
        buttonText: "Planifier une pause",
      },
    ],
    Dos: [
      {
        title: "Revérifier les appuis",
        text: "Vérifiez que le dos est soutenu, que l’arrière des genoux reste dégagé et que les pieds reposent au sol ou sur un repose-pieds stable.",
        href: "/workstation-audit",
        buttonText: "Revoir le poste",
      },
      {
        title: "Réduire le maintien statique",
        text: "Une posture assise peut devenir contraignante lorsqu’elle est maintenue longtemps. Changez régulièrement de position et alternez avec des tâches qui permettent de bouger.",
        href: "/timer",
        buttonText: "Planifier une pause",
      },
    ],
    Épaules: [
      {
        title: "Rapprocher les outils de travail",
        text: "Gardez la souris et les objets fréquemment utilisés près de vous afin de limiter les gestes avec le bras éloigné du corps.",
        href: "/workstation-audit",
        buttonText: "Revoir le poste",
      },
      {
        title: "Revérifier l’appui des avant-bras",
        text: "Un appui des avant-bras peut réduire certaines sollicitations du cou et des épaules, mais il ne doit pas créer une position fixe ou inconfortable au poignet. Variez les appuis selon la tâche.",
        href: "/education",
        buttonText: "Voir l’explication",
      },
    ],
    Poignets: [
      {
        title: "Aligner la main et l’avant-bras",
        text: "Placez clavier et souris de façon à limiter les flexions, extensions ou déviations maintenues du poignet et évitez l’appui prolongé du talon de la main sur une surface dure.",
        href: "/workstation-audit",
        buttonText: "Revoir le poste",
      },
      {
        title: "Rapprocher clavier et souris",
        text: "Gardez les outils de saisie suffisamment proches pour éviter d’augmenter inutilement la portée du bras et les contraintes du membre supérieur.",
        href: "/workstation-audit",
        buttonText: "Vérifier les outils",
      },
    ],
    Jambes: [
      {
        title: "Vérifier l’assise et les pieds",
        text: "Les pieds devraient être soutenus et le bord de l’assise ne devrait pas comprimer l’arrière des genoux.",
        href: "/workstation-audit",
        buttonText: "Revoir le poste",
      },
      {
        title: "Varier la posture",
        text: "Évitez de rester longtemps dans une posture statique. Alternez la position assise avec de courtes occasions de bouger lorsque l’activité le permet.",
        href: "/timer",
        buttonText: "Planifier une pause",
      },
    ],
    Habitudes: [
      {
        title: "Prévoir des pauses courtes et régulières",
        text: "Lors d’un travail continu sur écran, privilégiez des pauses courtes et fréquentes et alternez avec des tâches hors écran lorsque c’est possible.",
        href: "/timer",
        buttonText: "Ouvrir la minuterie",
      },
      {
        title: "Varier les tâches et les postures",
        text: "La prévention ne repose pas sur une posture parfaite unique. Alternez les tâches, les positions et les appuis au cours de la journée.",
        href: "/education",
        buttonText: "Voir les conseils",
      },
    ],
    Écran: [
      {
        title: "Revoir l’implantation de l’écran",
        text: "Placez l’écran devant vous, réduisez les reflets gênants et ajustez la hauteur et la distance pour éviter une posture contraignante du cou.",
        href: "/workstation-audit",
        buttonText: "Revoir le poste",
      },
    ],
    Chaise: [
      {
        title: "Stabiliser les appuis",
        text: "Réglez la chaise pour soutenir le dos, garder l’arrière des genoux dégagé et permettre un appui stable des pieds.",
        href: "/workstation-audit",
        buttonText: "Revoir la chaise",
      },
      {
        title: "Ne pas rester figé",
        text: "Même avec une chaise bien réglée, évitez de conserver la même posture trop longtemps.",
        href: "/timer",
        buttonText: "Planifier une pause",
      },
    ],
    Souris: [
      {
        title: "Rapprocher la souris",
        text: "Placez la souris près du clavier afin de limiter la portée du bras et les positions contraignantes de l’épaule.",
        href: "/workstation-audit",
        buttonText: "Revoir la souris",
      },
    ],
    Clavier: [
      {
        title: "Revoir la position du clavier",
        text: "Gardez le clavier proche et évitez une position qui maintient les poignets en extension ou en déviation.",
        href: "/workstation-audit",
        buttonText: "Revoir le clavier",
      },
    ],
    "Ordinateur portable": [
      {
        title: "Dissocier écran et saisie si possible",
        text: "Pour un usage prolongé, l’ajout d’un support avec clavier et souris externes permet de régler plus indépendamment l’écran et les outils de saisie.",
        href: "/workstation-audit",
        buttonText: "Revoir le poste",
      },
    ],
    Mouvement: [
      {
        title: "Introduire des changements de position",
        text: "Lors d’un travail statique ou sur écran, ajoutez de courtes occasions de changer de posture, de vous lever ou d’alterner avec une autre tâche.",
        href: "/timer",
        buttonText: "Ouvrir la minuterie",
      },
    ],
  };

  return (
    recommendations[priority] ?? [
      {
        title: "Revérifier la situation de travail",
        text: "Analysez le poste, la tâche, la durée et la fréquence des situations contraignantes plutôt que de chercher une posture parfaite unique.",
        href: "/workstation-audit",
        buttonText: "Revoir le poste",
      },
    ]
  );
}

export function getWorkstationIndexLabel(score: number) {
  if (score >= 80) {
    return "Peu de points à revoir";
  }

  if (score >= 60) {
    return "Quelques points à revoir";
  }

  return "Plusieurs points à revoir";
}

export function getWorkstationIndexMessage(score: number) {
  if (score >= 80) {
    return "Vos réponses font ressortir peu de points à revoir dans cet audit. Continuez néanmoins à varier les positions et à ajuster le poste selon la tâche et votre confort. Cet indice est un outil interne de priorisation, pas une mesure validée du risque ergonomique.";
  }

  if (score >= 60) {
    return "Vos réponses font ressortir quelques éléments du poste à revérifier. Utilisez les priorités affichées pour guider la vérification. Cet indice est un outil interne de priorisation, pas une mesure validée du risque ergonomique.";
  }

  return "Vos réponses font ressortir plusieurs éléments du poste à revérifier. Priorisez les éléments affichés et réévaluez le résultat après les changements. Cet indice est un outil interne de priorisation, pas une mesure validée du risque ergonomique.";
}
