const { Booking, sequelize, User, Service } = require("../models");
const { emitToAllProviders, emitToProvider } = require("../socket");
const Sequelize = require("sequelize");
const acceptBooking = async (req, res) => {
  const transaction = await sequelize.transaction();
  console.log("✅ Accept booking initiated", req.body);
  try {
    const providerId = req.user.id; // authenticated provider
    const { bookingId } = req.body;

    if (!bookingId) {
      await transaction.rollback();
      return res.status(400).json({ message: "Booking ID is required" });
    }

    /* ───── Lock booking row (prevents double accept) ───── */
    const booking = await Booking.findOne({
      where: { id: bookingId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({ message: "Booking not found" });
    }

    /* ❌ Already accepted or cancelled */
    if (booking.status !== "pending") {
      await transaction.rollback();
      return res.status(409).json({
        message: "Booking already processed",
        status: booking.status,
      });
    }

    /* ✅ Accept booking */
    booking.status = "confirmed"; // matches your ENUM
    booking.providerId = providerId;

    await booking.save({ transaction });

    await transaction.commit();

    /* 🔔 Notify ALL other providers (clear popup) */
    emitToAllProviders("order-taken", {
      orderId: booking.id,
      acceptedBy: providerId,
    });

    /* 🔔 Notify accepted provider */
    emitToProvider(providerId, "order-accepted", {
      orderId: booking.id,
      booking,
    });

    return res.json({
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Accept booking error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
/* ───────────────── START SERVICE ───────────────── */
const startService = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId, providerId },
    });

    if (!booking || booking.status !== "confirmed") {
      return res.status(400).json({ message: "Invalid booking state" });
    }

    booking.status = "on_the_way";
    await booking.save();

    res.json({ message: "Service started", booking });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ───────────────── COMPLETE SERVICE ───────────────── */
const completeService = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { bookingId, otp } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId, providerId },
    });
    if (booking.completionOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (!booking || booking.status !== "on_the_way") {
      return res.status(400).json({ message: "Invalid booking state" });
    }

    booking.status = "completed";
    await booking.save();

    res.json({ message: "Service completed", booking });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};
// exports.verifyCompletionOtp = async (req, res) => {
//   const { bookingId, otp } = req.body;

//   const booking = await Booking.findByPk(bookingId);

//   if (!booking) {
//     return res.status(404).json({ message: "Booking not found" });
//   }

//   if (booking.status === "completed") {
//     return res.status(400).json({ message: "Booking already completed" });
//   }

//   if (booking.completionOtp !== otp) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   booking.status = "completed";
//   booking.otpVerified = true;

//   await booking.save();

//   res.json({ message: "Service completed successfully" });
// };

/* ───────────────── CANCEL BOOKING (USER) ───────────────── */
cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking || booking.status !== "pending") {
      return res.status(400).json({ message: "Cannot cancel booking" });
    }

    booking.status = "cancelled";
    await booking.save();

    emitToAllProviders("order-cancelled", { orderId: booking.id });

    res.json({ message: "Booking cancelled" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
};

/* ───────────────── USER BOOKINGS ───────────────── */
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "provider",
          attributes: ["id", "name", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "shortDescription", "price", "mainImage"],
        },
      ],
    });

    res.json({ bookings });
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

/* ───────────────── PROVIDER BOOKINGS ───────────────── */
const getProviderBookings = async (req, res) => {
  const bookings = await Booking.findAll({
    where: { providerId: req.user.id },
    order: [["createdAt", "DESC"]],
  });

  res.json({ bookings });
};

const allPendingBookings = async (req, res) => {
  try {
    const providerId = req.user.id;

    // 🔥 Fetch provider lat/lng
    const provider = await User.findByPk(providerId, {
      attributes: ["latitude", "longitude"],
    });

    if (!provider?.latitude || !provider?.longitude) {
      return res.status(400).json({
        error: "Provider location not set",
      });
    }

    const { latitude, longitude } = provider;

    const distanceFormula = Sequelize.literal(`
      (
        6371 * acos(
          cos(radians(${latitude}))
          * cos(radians(Booking.latitude))
          * cos(radians(Booking.longitude) - radians(${longitude}))
          + sin(radians(${latitude}))
          * sin(radians(Booking.latitude))
        )
      )
    `);

    const bookings = await Booking.findAll({
      where: {
        status: "pending",
        latitude: { [Sequelize.Op.ne]: null },
        longitude: { [Sequelize.Op.ne]: null },
        [Sequelize.Op.and]: Sequelize.where(distanceFormula, "<=", 20),
      },
      attributes: {
        include: [[distanceFormula, "distance_km"]],
      },
      order: [[Sequelize.literal("distance_km"), "ASC"]],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "phone"],
        },
        {
          model: Service,
          as: "service",
          required: true,
          attributes: ["id", "title", "price", "mainImage"],
          include: [
            {
              model: User,
              as: "providers",
              attributes: [],
              where: { id: providerId },
              through: { attributes: [] },
              required: true,
            },
          ],
        },
      ],
    });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

module.exports = {
  acceptBooking,
  startService,
  getProviderBookings,
  completeService,
  getUserBookings,
  cancelBooking,
  allPendingBookings,
};
