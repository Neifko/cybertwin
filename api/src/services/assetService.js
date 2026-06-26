const AssetRepository = require("../repositories/assetRepository");

class AssetService {
  async getAssetsByUser(userId, companyId = null) {
    if (companyId) {
      return await AssetRepository.findAllByCompanyId(companyId, userId);
    }
    return await AssetRepository.findAllByUserId(userId);
  }

  async createAsset(data, userId) {
    if (!data.name || !data.type || !data.company_id) {
      throw new Error("Nom, type et company_id sont obligatoires.");
    }

    const validTypes = [
      "Serveur Web",
      "Base de données",
      "Poste utilisateur",
      "Routeur",
      "Pare-feu",
      "Application métier",
    ];
    if (!validTypes.includes(data.type)) {
      throw new Error("Type d'actif invalide.");
    }

    return await AssetRepository.create(data, userId);
  }

  async updateAsset(id, data, userId) {
    return await AssetRepository.update(id, data, userId);
  }

  async deleteAsset(id, userId) {
    return await AssetRepository.delete(id, userId);
  }
}

module.exports = new AssetService();
