const express = require("express");
const authcontroller = require("../controllers/auth.controller");
const { upload } = require("../helpers/multer");
const { authenticated } = require("../middlewares/auth.middleware");

const router = express.Router();
router.post("/send-otp", authcontroller.sendOtp); // Create

router.post("/verify-otp", authcontroller.verifyOtp); // Create
router.post("/userdetail", authenticated, authcontroller.userData); // Create
router.post("/complete-profile", authenticated, authcontroller.completeProfile);
router.get(
  "/all-users",
  //  authenticated,
  authcontroller.allusers
); // Create

router.delete("/users/:id", authcontroller.deleteUser); // Delete user
router.get(
  "/all-service-provider",
  //   authenticated,
  authcontroller.allServiceProvider
); // Create

router.put(
  "/edit-profile",
  upload.single("profilePicture"),
  authenticated,
  authcontroller.editProfile
);

router.put(
  "/admin/user/:id",
  upload.single("profilePicture"),
  // authenticated,
  authcontroller.updateUserByAdmin
);
// Users management
router.post("/users", authcontroller.createUser);
router.post("/toggleactive", authenticated, authcontroller.toggleActiveUser);

router.post("/provider/wallet-add", authenticated, authcontroller.addToWallet);
// Auth

router.put(
  "/update-user-addresses",
  authenticated,
  authcontroller.updateUserAddress
);

router.delete(
  "/delete-user-address/:id",
  authenticated,
  authcontroller.deleteUserAddress
);
router.put("/location", authenticated, authcontroller.updateProviderLocation);
router.get("/me/services", authenticated, authcontroller.getMyServices);
router.put("/me/services", authenticated, authcontroller.updateMyServices);

module.exports = router;
