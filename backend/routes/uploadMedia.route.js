const express = require("express");
const router = express.Router();
const { upload } = require("../helpers/multer");

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Public URL (if serving /uploads statically)
  const fileUrl = req.file.filename;

  let backendUrl = process.env.BACKEND_URL;
  const isLocalHost = !backendUrl || backendUrl.includes("localhost") || backendUrl.includes("127.0.0.1");
  const requestHost = req.get("host");

  // If running on a live domain but BACKEND_URL was omitted or left as localhost
  if (isLocalHost && requestHost && !requestHost.includes("localhost") && !requestHost.includes("127.0.0.1")) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
    backendUrl = `${proto}://${requestHost}`;
  } else if (!backendUrl) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
    backendUrl = `${proto}://${requestHost || "localhost:8008"}`;
  }

  const cleanBase = backendUrl.replace(/\/+$/, "");
  const fullUrl = `${cleanBase}/uploads/${fileUrl}`;

  res.json({
    url: fullUrl,
    fileUrl: fullUrl,
    filename: fileUrl,
    path: `/uploads/${fileUrl}`,
  });
});

module.exports = router;
