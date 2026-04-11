const express = require("express");
const router = express.Router();
const {
  getAllServiceAreas,
  getServiceAreaById,
  createServiceArea,
  updateServiceArea,
  deleteServiceArea,
  checkPointInServiceArea,
} = require("../controllers/serviceArea.controller");

// Public routes
router.get("/", getAllServiceAreas);
router.get("/:id", getServiceAreaById);
router.get("/check/point", checkPointInServiceArea);

// Admin routes (should add auth middleware if needed)
router.post("/", createServiceArea);
router.put("/:id", updateServiceArea);
router.delete("/:id", deleteServiceArea);

module.exports = router;
