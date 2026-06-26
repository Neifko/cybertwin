const AssetService = require("../services/assetService");

class AssetController {
  async getAll(req, res, next) {
    try {
      const companyId = req.query.companyId || null;
      const assets = await AssetService.getAssetsByUser(
        req.user.id,
        companyId,
      );
      res.status(200).json(assets);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const newAssetId = await AssetService.createAsset(req.body, req.user.id);
      res
        .status(201)
        .json({ id: newAssetId, message: "Actif créé avec succès" });
    } catch (error) {
      if (
        error.message.includes("obligatoire") ||
        error.message.includes("invalide")
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updated = await AssetService.updateAsset(id, req.body, req.user.id);
      if (!updated) {
        return res
          .status(404)
          .json({ message: "Actif non trouvé ou non autorisé" });
      }
      res.status(200).json({ message: "Actif mis à jour" });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await AssetService.deleteAsset(id, req.user.id);
      if (!deleted) {
        return res
          .status(404)
          .json({ message: "Actif non trouvé ou non autorisé" });
      }
      res.status(200).json({ message: "Actif supprimé" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssetController();
