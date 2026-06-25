const express = require("express");
const router = express.Router();

const { checkJwt } = require("../middlewares/authMiddleware");
const { resolveLocalUser } = require("../middlewares/resolveUser");

const companyRoutes = require("./companyRoutes");
const assetRoutes = require("./assetRoutes");
const vulnerabilityRoutes = require("./vulnerabilityRoutes");
const riskRoutes = require("./riskRoutes");

router.use(checkJwt);
router.use(resolveLocalUser);

router.use("/company", companyRoutes);
router.use("/assets", assetRoutes);
router.use("/vulnerabilities", vulnerabilityRoutes);
router.use("/risk", riskRoutes);

module.exports = router;
