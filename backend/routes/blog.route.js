// routes/blog.route.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/blog.controller");

// Public & Admin endpoints for blog management
router.get("/", controller.getAllBlogs);
router.get("/:slug", controller.getBlogBySlug);
router.post("/", controller.createBlog);
router.put("/:id", controller.updateBlog);
router.delete("/:id", controller.deleteBlog);
router.patch("/:id/status", controller.toggleStatus);

module.exports = router;
