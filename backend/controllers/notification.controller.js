const { sendNotification } = require("../utils/notification.util");

exports.sendManualNotification = async (req, res) => {
  try {
    const { title, body, target, token, topic, imageUrl } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    let options = { title, body, imageUrl };

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
