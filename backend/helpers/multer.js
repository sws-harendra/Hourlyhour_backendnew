const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads");

    // Ensure the folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const parsed = path.parse(file.originalname);
    const safeName = (parsed.name || "upload").replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = (parsed.ext || ".png").toLowerCase();
    cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

exports.upload = multer({ storage: storage });
