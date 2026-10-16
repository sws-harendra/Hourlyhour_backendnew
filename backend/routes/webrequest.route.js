// routes/webrequest.route.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/webrequest.controller");

// Public endpoints (for website bookings and admin dashboard)
router.get("/", controller.getAllWebRequests);
router.post("/", controller.createWebRequest);
router.put("/:id/status", controller.updateStatus);
router.delete("/:id", controller.deleteRequest);

module.exports = router;
