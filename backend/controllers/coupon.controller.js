const { Coupon } = require("../models");

// Basic validity check used by getCouponByCode
const isCouponValid = (coupon) => {
  if (!coupon) return { valid: false, message: "Coupon not found" };
  if (coupon.status !== "active") return { valid: false, message: "Coupon is inactive" };
  if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) return { valid: false, message: "Coupon has expired" };
  return { valid: true, message: "Coupon is valid" };
};



// Create new coupon
const createCoupon = async (req, res) => {
  try {
    const { code, discountValue, expiryDate, description } = req.body;

    // Validate required fields
    if (!code || discountValue === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Code and discountValue are required" });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (existingCoupon) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountValue,
      expiryDate: expiryDate || null,
      description: description || null,
    });

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get all coupons
const getAllCoupons = async (req, res) => {
  try {
    const rows = await Coupon.findAll({ order: [["id", "DESC"]] });

    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Get coupon by code
const getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Code is required" });
    }

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    const validationResult = isCouponValid(coupon);

    return res.status(200).json({
      success: true,
      coupon,
      isValid: validationResult.valid,
      message: validationResult.message,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }

    await coupon.destroy();

    return res.json({ success: true, message: "Coupon deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponByCode,
  deleteCoupon,
};
