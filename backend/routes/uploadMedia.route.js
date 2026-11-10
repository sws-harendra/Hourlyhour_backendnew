const express = require("express");
const router = express.Router();
const { upload } = require("../helpers/multer");

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Public URL (if serving /uploads statically)
  const fileUrl = req.file.filename;

  // Authoritative upload base URL from .env
  let backendBase = (process.env.DEPLOYED_URL || "").replace(/\/+$/, "");

  if (!backendBase) {
    const proto = req.headers["x-forwarded-proto"] || req.protocol || "http";
    backendBase = `${proto}://${req.get("host") || "localhost:8008"}`;
  }

  const fullUrl = `${backendBase}/uploads/${fileUrl}`;
  const apiFullUrl = `${backendBase}/api/uploads/${fileUrl}`;

  res.json({
    url: fullUrl,
    fileUrl: fullUrl,
    apiFullUrl: apiFullUrl,
    filename: fileUrl,
    path: `/uploads/${fileUrl}`,
    apiPath: `/api/uploads/${fileUrl}`,
  });
});

module.exports = router;
