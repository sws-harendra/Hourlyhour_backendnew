const express = require("express");
const router = express.Router();

const controller = require("../controllers/serviceAreaPrice.controller");

router.get("/area/:areaId", controller.getPricesByArea);
router.post("/area/:areaId/bulk", controller.bulkUpsertPricesByArea);
router.delete("/area/:areaId/:id", controller.deletePriceByArea);

module.exports = router;
