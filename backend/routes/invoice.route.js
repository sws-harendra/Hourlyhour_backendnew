const express = require("express");
const router = express.Router();
const {
  getInvoice,
  getCombinedInvoice,
} = require("../controllers/invoice.controller");
const {
  authenticated,
  adminAuthenticated,
} = require("../middlewares/auth.middleware");

router.get("/:bookingId", authenticated, getInvoice);
router.get("/group/:groupId", authenticated, getCombinedInvoice);
router.get("/admin/:bookingId", adminAuthenticated, getInvoice);
router.get("/admin/group/:groupId", adminAuthenticated, getCombinedInvoice);
module.exports = router;
