const express = require("express");
const router = express.Router();
const AssetController = require("../controllers/assetController");

router.get("/", AssetController.getAll);
router.post("/", AssetController.create);
router.put("/:id", AssetController.update);
router.delete("/:id", AssetController.delete);

module.exports = router;
