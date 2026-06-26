const express = require("express");
const router = express.Router();
const CompanyController = require("../controllers/companyController");

router.get("/", CompanyController.getAll);
router.post("/", CompanyController.create);
router.get("/:id", CompanyController.getOne);
router.put("/:id", CompanyController.update);
router.delete("/:id", CompanyController.delete);

module.exports = router;
