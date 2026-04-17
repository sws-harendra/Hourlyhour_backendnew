const express = require("express");
const router = express.Router();

const booking = require("../controllers/booking.controller");
const { authenticated } = require("../middlewares/auth.middleware");
const { upload } = require("../helpers/multer");

router.get("/accept-booking", authenticated, booking.acceptBooking);
router.get("/user-mybooking", authenticated, booking.getUserBookings);
// router.get("/provider-mybooking", authenticated, booking.getProviderBookings);
router.get("/pending-booking", authenticated, booking.allPendingBookings);
/* ───── PROVIDER ROUTES ───── */

// Provider: start service
router.post("/start", authenticated, booking.startService);

// Provider: complete service
router.post("/complete", authenticated, booking.completeService);

// Provider: my assigned bookings
router.get("/assigned", authenticated, booking.getProviderBookings);

// Provider: my warranties (for approved services)
router.get("/warranties", authenticated, booking.getProviderWarranties);

router.post("/add-addon", authenticated, booking.addAddon);
router.get("/:id/addons", authenticated, booking.getBookingAddons);

router.post("/approve-addons", authenticated, booking.approveAddons);
router.post("/reschedule", authenticated, booking.rescheduleBooking);
router.delete("/:id", booking.deleteBooking);
module.exports = router;
