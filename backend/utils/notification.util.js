require("dotenv").config();
const admin = require("firebase-admin");
// Note: You need to add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to your .env
// or provide a serviceAccountKey.json file.
let firebaseApp;

try {
  if (!admin.apps.length) {
    const serviceAccount = {
      projectId: process.env.PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
    };
    if (serviceAccount.clientEmail && serviceAccount.privateKey) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("✅ Firebase Admin initialized successfully");
    } else {
      console.warn(
        "⚠️ Firebase Admin credentials missing. Notifications will not be sent.",
      );
      console.warn(
        "Please add FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to your .env",
      );
    }
  }
} catch (error) {
  console.error("❌ Error initializing Firebase Admin:", error);
}

/**
 * Send a notification to a specific token, topic, or condition
 * @param {Object} options
 * @param {string} [options.token] - Specific FCM token
 * @param {string} [options.topic] - Specific FCM topic (e.g. 'all_users', 'all_providers')
 * @param {string} options.title - Notification title
 * @param {string} options.body - Notification body
 * @param {Object} [options.data] - Custom data payload
 * @param {string} [options.imageUrl] - Image URL for the notification
 */
const sendNotification = async ({
  token,
  topic,
  title,
  body,
  data = {},
  imageUrl,
}) => {
  if (!admin.apps.length) {
    console.error("Firebase Admin not initialized. Cannot send notification.");
    return { success: false, error: "Firebase Admin not initialized" };
  }

  const message = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK",
    },
  };

  if (imageUrl) {
    message.notification.imageUrl = imageUrl;
    // For Android, we often need to put it in android.notification.imageUrl as well
    message.android = {
      notification: {
        imageUrl,
      },
    };
    message.apns = {
      payload: {
        aps: {
          "mutable-content": 1,
        },
      },
      fcm_options: {
        image: imageUrl,
      },
    };
  }

  try {
    if (token) {
      message.token = token;
    } else if (topic) {
      message.topic = topic;
    } else {
      throw new Error("Either token or topic must be provided");
    }

    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNotification,
};
