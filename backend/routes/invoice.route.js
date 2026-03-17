const express = require("express");
const router = express.Router();
const {
  getInvoice,
  getCombinedInvoice,
} = require("../controllers/invoice.controller");
const { authenticated } = require("../middlewares/auth.middleware");

router.get("/:bookingId", authenticated, getInvoice);
router.get("/group/:groupId", authenticated, getCombinedInvoice);

module.exports = router;
