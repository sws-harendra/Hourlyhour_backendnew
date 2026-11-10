const express = require("express");
const router = express.Router();
const { upload } = require("../helpers/multer");

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Public URL (if serving /uploads statically)
  const fileUrl = req.file.filename;

  const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const requestHost = req.get("host");
  const isHttps =
    proto === "https" ||
    req.headers["x-forwarded-ssl"] === "on" ||
    (requestHost &&
      !requestHost.includes("localhost") &&
      !requestHost.includes("127.0.0.1") &&
      !requestHost.includes("187.77.184.23"));

  let cleanBase = "";
  if (isHttps && requestHost && !requestHost.includes("187.77.184.23")) {
    cleanBase = `https://${requestHost}`;
  } else if (
    process.env.BACKEND_URL &&
    !process.env.BACKEND_URL.includes("187.77.184.23") &&
    !process.env.BACKEND_URL.includes("localhost")
  ) {
    cleanBase = process.env.BACKEND_URL.replace(/\/+$/, "");
  } else if (requestHost && !requestHost.includes("187.77.184.23")) {
    cleanBase = `${proto}://${requestHost}`;
  }

  const apiPath = `/api/uploads/${fileUrl}`;
  const uploadsPath = `/uploads/${fileUrl}`;

  // If cleanBase exists, full URL is https://<domain>/api/uploads/...
  // Otherwise, origin-relative /api/uploads/... is 100% safe against Mixed Content
  const publicUrl = cleanBase ? `${cleanBase}${apiPath}` : apiPath;
  const legacyFullUrl = cleanBase ? `${cleanBase}${uploadsPath}` : uploadsPath;

  res.json({
    url: publicUrl,
    fileUrl: publicUrl,
    apiFullUrl: publicUrl,
    fullUrl: legacyFullUrl,
    filename: fileUrl,
    path: uploadsPath,
    apiPath: apiPath,
  });
});

module.exports = router;
