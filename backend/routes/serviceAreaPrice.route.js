const express = require("express");
const router = express.Router();

const controller = require("../controllers/serviceAreaPrice.controller");

router.get("/area/:areaId", controller.getPricesByArea);
router.post("/area/:areaId/bulk", controller.bulkUpsertPricesByArea);
router.delete("/area/:areaId/:id", controller.deletePriceByArea);
router.get("/service/:serviceId", controller.getPricesByService);
router.post("/service/:serviceId/bulk", controller.bulkUpsertPricesByService);

module.exports = router;
