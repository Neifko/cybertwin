const CompanyRepository = require("../repositories/companyRepository");
const AssetRepository = require("../repositories/assetRepository");
const VulnerabilityRepository = require("../repositories/vulnerabilityRepository");

class RiskService {
  async calculateRisk(userId) {
    const company = await CompanyRepository.findByUserId(userId);
    if (!company)
      throw new Error("Veuillez d'abord configurer votre entreprise.");

    const assets = await AssetRepository.findAllByUserId(userId);
    const vulnerabilities =
      await VulnerabilityRepository.findAllByUserId(userId);

    let totalScore = 0;
    const recommendations = [];

    totalScore += assets.length * 2;

    vulnerabilities.forEach((vuln) => {
      if (vuln.severity === "élevé") {
        totalScore += 15;
        recommendations.push(
          `Correction critique requise sur l'actif : ${vuln.asset_name} (${vuln.name})`,
        );
      } else if (vuln.severity === "moyen") {
        totalScore += 5;
      } else {
        totalScore += 2;
      }
    });

    let internetExposure = false;
    if (company.exposed_services && company.exposed_services.length > 0) {
      internetExposure = true;
      totalScore = Math.floor(totalScore * 1.5);
      recommendations.push(
        "Sécuriser les services exposés sur Internet (Pare-feu, WAF).",
      );
    }

    if (assets.length === 0) {
      recommendations.push(
        "Commencez par ajouter des actifs informatiques à votre inventaire.",
      );
    }

    let riskLevel = "faible";
    if (totalScore >= 50) {
      riskLevel = "élevé";
    } else if (totalScore >= 20) {
      riskLevel = "moyen";
    }

    return {
      companyName: company.name,
      metrics: {
        totalAssets: assets.length,
        totalVulnerabilities: vulnerabilities.length,
        internetExposure: internetExposure,
      },
      score: totalScore,
      level: riskLevel,
      recommendations: recommendations,
    };
  }
}

module.exports = new RiskService();
