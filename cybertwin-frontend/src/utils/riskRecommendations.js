export function getScoreRecommendation(score = 0) {
  const value = Number(score) || 0;

  if (value >= 80) {
    return {
      title: "Score solide",
      message:
        "Le niveau de sécurité est déjà bon. Conservez le rythme des audits, automatisez les contrôles et surveillez les changements sur les actifs exposés pour maintenir ce score.",
      recommendations: [
        "Maintenir un audit de sécurité régulier pour suivre l'évolution du score.",
        "Automatiser la surveillance des actifs exposés sur Internet.",
        "Documenter les bonnes pratiques actuelles pour les pérenniser.",
      ],
    };
  }

  if (value >= 60) {
    return {
      title: "Score correct mais perfectible",
      message:
        "Le socle est sain, mais plusieurs points restent à durcir. Priorisez les vulnérabilités élevées, réduisez les expositions publiques et refaites un contrôle après chaque correction.",
      recommendations: [
        "Corriger en priorité les vulnérabilités de criticité élevée restantes.",
        "Réduire la surface d'exposition Internet au strict nécessaire.",
        "Planifier un nouvel audit après chaque correction pour valider l'amélioration.",
      ],
    };
  }

  if (value >= 40) {
    return {
      title: "Score fragile",
      message:
        "Le niveau de risque reste trop élevé. Il faut réduire rapidement la surface d'exposition, activer l'authentification forte et traiter les vulnérabilités critiques en priorité.",
      recommendations: [
        "Traiter en urgence les vulnérabilités critiques et élevées détectées.",
        "Limiter au maximum les services accessibles depuis Internet.",
        "Mettre en place une authentification à plusieurs facteurs sur les accès sensibles.",
        "Vérifier l'existence d'une politique de sauvegarde régulière.",
      ],
    };
  }

  return {
    title: "Score critique",
    message:
      "Un plan de remédiation immédiat est nécessaire. Isolez les services les plus exposés, corrigez les failles majeures et renforcez les accès avant toute nouvelle exposition.",
    recommendations: [
      "Isoler immédiatement les services les plus exposés sur Internet.",
      "Corriger en priorité absolue les vulnérabilités critiques identifiées.",
      "Renforcer sans délai les accès (mots de passe, authentification forte).",
      "Mettre en place une politique de sauvegarde testée régulièrement.",
      "Planifier un nouvel audit dès les premières corrections appliquées.",
    ],
  };
}
