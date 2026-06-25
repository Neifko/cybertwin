const CompanyService = require("../services/companyService");

class CompanyController {
  async get(req, res, next) {
    try {
      const company = await CompanyService.getCompany(req.user.id);
      if (!company) {
        return res
          .status(404)
          .json({ message: "Aucune entreprise trouvée pour cet utilisateur." });
      }
      res.status(200).json(company);
    } catch (error) {
      next(error);
    }
  }

  async upsert(req, res, next) {
    try {
      const companyId = await CompanyService.saveCompany(req.body, req.user.id);
      res
        .status(200)
        .json({
          id: companyId,
          message: "Informations de l'entreprise enregistrées.",
        });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyController();
