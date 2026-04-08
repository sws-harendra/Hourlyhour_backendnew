const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authenticated } = require("../middlewares/auth.middleware");

// User: create review
router.post("/", authenticated, reviewController.createReview);

// Public/Provider: get reviews for a provider
router.get("/provider/:providerId", reviewController.getProviderReviews);

// Admin: get all reviews
router.get("/admin", authenticated, reviewController.getAllReviews);

module.exports = router;
