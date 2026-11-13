const express = require("express");
const router = express.Router();
const controller = require("../controllers/seoLocationPage.controller");

// Stats & AI endpoints (must be before :id to prevent collision)
router.get("/stats", controller.getStats);
router.get("/locations-summary", controller.getLocationsSummary);
router.get("/ai-settings", controller.getAiSettings);
router.post("/ai-settings", controller.saveAiSettings);
router.post("/generate-ai", controller.generateAiContent);
router.post("/humanize", controller.humanizeContent);
router.post("/bulk-delete", controller.bulkDeletePages);
router.post("/locations", controller.quickAddLocation);
router.post("/services", controller.quickAddService);

// Slug retrieval
router.get("/slug/:slug", controller.getPageBySlug);

// Core CRUD
router.get("/", controller.getAllPages);
router.get("/:id", controller.getPageById);
router.post("/", controller.createPage);
router.put("/:id", controller.updatePage);
router.delete("/:id", controller.deletePage);
router.patch("/:id/status", controller.toggleStatus);

module.exports = router;
