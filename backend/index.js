require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const http = require("http");

const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 8008;
const allowedOrigins = [
  "http://localhost:5172",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.get("/", (req, res) => res.send("Hello World"));
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/category", require("./routes/category.route"));
app.use("/api/service", require("./routes/service.route"));
app.use("/api/upload-media", require("./routes/uploadMedia.route"));
app.use("/api/booking", require("./routes/booking.route"));
app.use("/api/banners", require("./routes/banner.route"));
app.use("/api/payment-cred", require("./routes/razorpay.route"));
app.use("/api/settings", require("./routes/setting.route"));
app.use("/api/section", require("./routes/section.route"));
app.use("/api/dashboard", require("./routes/dashboard.route"));
app.use("/api/serviceRequest", require("./routes/servicerequest.route"));
app.use("/api/coupon", require("./routes/coupon.route"));

/* ===== INIT SOCKET ===== */
initSocket(server, allowedOrigins);

/* ===== START SERVER ===== */
server.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
