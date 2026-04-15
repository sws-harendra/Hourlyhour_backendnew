// routes/sectionRoutes.js
const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/section.controller");

const { authenticated } = require("../middlewares/auth.middleware");

router.post(
  "/",
  //   isAdmin("admin"),
  sectionController.createSection
);
router.get("/", authenticated, sectionController.getSections); // for homepage
router.get("/:id", authenticated, sectionController.getSectionById);
router.put(
  "/:id",
  //   isAdmin("admin"),
  sectionController.updateSection
);
router.delete(
  "/:id",
  //   isAdmin("admin"),
  sectionController.deleteSection
);

module.exports = router;
