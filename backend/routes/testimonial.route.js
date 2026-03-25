const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/testimonial.controller");
const { adminAuthenticated } = require("../middlewares/auth.middleware");

// ADMIN
router.post("/", adminAuthenticated, ctrl.createTestimonial);
router.put("/:id", adminAuthenticated, ctrl.updateTestimonial);
router.delete("/:id", adminAuthenticated, ctrl.deleteTestimonial);

// APP (Public)
router.get("/", ctrl.getTestimonials);
router.get("/:id", ctrl.getTestimonial);

module.exports = router;
