const { sendNotification } = require("../utils/notification.util");

exports.sendManualNotification = async (req, res) => {
  try {
    const {
      title,
      body,
      target,
      token,
      topic,
      imageUrl,
      navigateTo,
      serviceId,
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    const allowedNavigations = new Set([
      "service_details",
      "service_warranty",
      "bookings",
      "warranty",
      "service_requests",
      "search",
      "home",
    ]);
    if (navigateTo && !allowedNavigations.has(navigateTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid navigateTo value",
      });
    }
    if (
      ["service_details", "service_warranty"].includes(navigateTo) &&
      !serviceId
    ) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required for this destination",
      });
    }

    const data = {};

    if (navigateTo) {
      data.navigateTo = navigateTo;
    }

    if (serviceId) {
      data.serviceId = String(serviceId);
    }

    data.title = title;
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }

    let options = { title, body, imageUrl, data };

    if (target === "token") {
      if (!token) return res.status(400).json({ success: false, message: "FCM token is required" });
      options.token = token;
    } else if (target === "topic") {
      if (!topic) return res.status(400).json({ success: false, message: "Topic is required" });
      options.topic = topic;
    } else if (target === "all_users") {
      options.topic = "all_users";
    } else if (target === "all_providers") {
      options.topic = "all_providers";
    } else {
      return res.status(400).json({ success: false, message: "Invalid target" });
    }

    const result = await sendNotification(options);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Notification sent successfully",
        response: result.response,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send notification",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Error in sendManualNotification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
