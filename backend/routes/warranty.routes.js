const express = require("express");
const router = express.Router();
const warrantyController = require("../controllers/warranty.controller");
const {
  authenticated,
  adminAuthenticated,
} = require("../middlewares/auth.middleware");

// ==================== WARRANTY MANAGEMENT ====================
// Admin routes
router.post("/admin", adminAuthenticated, warrantyController.createWarranty);
router.get("/admin", adminAuthenticated, warrantyController.getAllWarranties);
router.put("/admin/:id", adminAuthenticated, warrantyController.updateWarranty);
router.delete(
  "/admin/:id",
  adminAuthenticated,
  warrantyController.deleteWarranty,
);

// App routes
router.get(
  "/service/:serviceId",

  warrantyController.getWarrantiesByService,
);

// ==================== WARRANTY CLAIMS ====================
// User routes
router.post(
  "/claim/submit",
  authenticated,
  warrantyController.submitWarrantyClaim,
);
router.get(
  "/claim/booking/:bookingId",
  authenticated,
  warrantyController.getClaimByBooking,
);
router.get("/my-claims", authenticated, warrantyController.getUserClaims);

// Admin routes
router.get("/claims/all", adminAuthenticated, warrantyController.getAllClaims);
router.put(
  "/claim/:id/status",
  adminAuthenticated,
  warrantyController.updateClaimStatus,
);

module.exports = router;
