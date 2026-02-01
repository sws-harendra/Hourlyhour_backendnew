const express = require("express");
const router = express.Router();

const coupon = require("../controllers/coupon.controller");
const { authenticated } = require("../middlewares/auth.middleware");

// Create coupon with specific code
router.post(
  "/create",
  // authenticated,
  coupon.createCoupon
);

// Get all coupons with pagination
router.get(
  "/all",
  // authenticated,
  coupon.getAllCoupons
);

// Get coupon by code
router.get(
  "/code/:code",
  // authenticated,
  coupon.getCouponByCode
);


// Delete coupon
router.delete(
  "/:id",
  // authenticated,
  coupon.deleteCoupon
);

module.exports = router;
