const router = require("express").Router();
const controller = require("../controllers/servicerequestuser.controller");
const { authenticated } = require("../middlewares/auth.middleware");

router.post("/", authenticated, controller.createRequest);
router.get("/my", authenticated, controller.getMyRequests);

// Admin
router.get("/", controller.getAllRequests);
router.put("/:id/status", controller.updateStatus);

module.exports = router;
