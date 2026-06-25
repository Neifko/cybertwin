const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/companyController");

router.get("/", CompanyController.get);
router.post("/", CompanyController.upsert);

module.exports = router;
