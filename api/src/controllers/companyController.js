const CompanyService = require("../services/companyService");

class CompanyController {
  async getAll(req, res, next) {
    try {
      const companies = await CompanyService.getCompanies(req.user.id);
      res.status(200).json(companies);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const company = await CompanyService.getCompanyById(
        req.params.id,
        req.user.id,
      );
      if (!company) {
        return res.status(404).json({ message: "Entreprise introuvable." });
      }
      res.status(200).json(company);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const companyId = await CompanyService.createCompany(
        req.body,
        req.user.id,
      );
      res.status(201).json({
        id: companyId,
        message: "Entreprise créée avec succès.",
      });
    } catch (error) {
      if (error.message.includes("obligatoires")) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await CompanyService.updateCompany(
        req.params.id,
        req.body,
        req.user.id,
      );
      if (!updated) {
        return res.status(404).json({ message: "Entreprise introuvable." });
      }
      res.status(200).json({ message: "Entreprise mise à jour." });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const deleted = await CompanyService.deleteCompany(
        req.params.id,
        req.user.id,
      );
      if (!deleted) {
        return res.status(404).json({ message: "Entreprise introuvable." });
      }
      res.status(200).json({ message: "Entreprise supprimée." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyController();
