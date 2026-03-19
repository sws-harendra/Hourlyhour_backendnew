const express = require("express");
const router = express.Router();

const service = require("../controllers/service.controller");
const {
  authenticated,
  adminAuthenticated,
} = require("../middlewares/auth.middleware");
const { upload } = require("../helpers/multer");

router.post(
  "/add-service",
  upload.fields([
    { name: "mainimage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),

  //  authenticated,
  service.addService,
); // update service
router.put(
  "/edit-service/:id",
  upload.fields([
    { name: "mainimage", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  // authenticated,
  service.updateService,
);

// delete service
router.delete(
  "/delete-service/:id",
  // authenticated,
  service.deleteService,
);

router.get(
  "/category/:id/services",
  authenticated,
  service.getServicesByCategory,
);
router.get("/services/:serviceId/related", service.getRelatedServices);

router.get("/service/:id", authenticated, service.getServiceDetail);
router.get(
  "/all-services",
  // authenticated,
  service.getAllServices,
);

router.get("/popular-services", service.popularService);

router.post("/book-service", authenticated, service.bookService);
router.get("/all-bookings", service.allBookings);
router.get("/booking/:id", service.bookingDetail);
router.post("/booking/:id/assign-provider", service.assignProvider);

router.get("/my-bookings", authenticated, service.mybookings);
router.post("/cancel-booking", authenticated, service.cancelBooking);
router.put("/booking/:id/status", service.statusUpdate);

// rate list

router.get("/rate-list", adminAuthenticated, service.getRates);
router.post("/add-rate-list", adminAuthenticated, service.createRate);
router.get("/rate-list/:id", adminAuthenticated, service.getRateById);

router.put("/rate-list/:id", adminAuthenticated, service.updateRate);

router.delete("/rate-list/:id", adminAuthenticated, service.deleteRate);
router.get("/rate-list/service/:serviceId", service.getRatesByService);
// router.get("/rate-list/service/:serviceId", service.getRatesByService);
// router.get("/rate-list/service/:serviceId", service.getRatesByService);
// GROUP BOOKINGS
router.get("/booking/group/:groupId", service.getGroupBookings);

// ✅ Assign provider to entire group
router.put("/booking/group/:groupId/assign", service.assignProviderToGroup);
router.put("/booking/group/:groupId/status", service.updateGroupStatus);
// ✅ Update status for entire group
module.exports = router;
