const express = require("express");
const router = express.Router();
const RiskController = require("../controllers/riskController");

router.post("/calculate", RiskController.calculate);

module.exports = router;
