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

    vulnerabilities.forEach((vuln) => {
      if (vuln.severity === "élevée" || vuln.severity === "élevé") {
        totalScore += 15;
        recommendations.push(
          `Correction critique requise sur l'actif : ${vuln.asset_name} (${vuln.name})`,
        );
      } else if (vuln.severity === "moyenne" || vuln.severity === "moyen") {
        totalScore += 5;
      } else {
        totalScore += 2;
      }
    });

    assets.forEach((asset) => {
      if (asset.is_exposed) {
        totalScore += 3;
      }
    });

    let exposedServices = [];
    if (company.exposed_services) {
      try {
        exposedServices = JSON.parse(company.exposed_services);
      } catch {
        exposedServices = [company.exposed_services];
      }
    }

    let internetExposure = false;
    if (Array.isArray(exposedServices) && exposedServices.length > 0) {
      internetExposure = true;
      totalScore += 5;
      recommendations.push(
        "Sécuriser les services exposés sur Internet (Pare-feu, WAF).",
      );
    }

    if (internetExposure && totalScore > 0) {
      totalScore = Math.floor(totalScore * 1.2);
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
