const RiskService = require("../services/riskService");

class RiskController {
  async calculate(req, res, next) {
    try {
      const riskReport = await RiskService.calculateRisk(req.user.id);
      res.status(200).json(riskReport);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RiskController();
