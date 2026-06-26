const RiskService = require("../services/riskService");

class RiskController {
  async calculate(req, res, next) {
    try {
      const companyId =
        (req.body && req.body.company_id) || req.query.companyId || null;

      if (companyId) {
        const riskReport = await RiskService.calculateRisk(
          req.user.id,
          companyId,
        );
        return res.status(200).json(riskReport);
      }

      const reports = await RiskService.calculateAllRisks(req.user.id);
      res.status(200).json(reports);
    } catch (error) {
      if (
        error.message.includes("entreprise") ||
        error.message.includes("introuvable")
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new RiskController();
