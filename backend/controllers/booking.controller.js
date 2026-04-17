const {
  Booking,
  sequelize,
  User,
  Service,
  ServiceRate,
  BookingAddon,
  Review,
  Warranty,
  WarrantyClaim,
} = require("../models");
const { emitToAllProviders, emitToProvider } = require("../socket");
const { sendNotification } = require("../utils/notification.util");
const Sequelize = require("sequelize");

const acceptBooking = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const providerId = req.user.id;
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: [{ model: User, as: "user", attributes: ["id", "fcmToken"] }],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      await transaction.rollback();
      return res.status(409).json({
        message: "Booking already processed",
      });
    }

    const groupId = booking.groupId;

    /* 🔹 Accept all bookings in group */
    await Booking.update(
      {
        status: "confirmed",
        providerId,
      },
      {
        where: { groupId },
        transaction,
      },
    );

    await transaction.commit();

    emitToAllProviders("order-taken", {
      groupId,
      acceptedBy: providerId,
    });

    emitToProvider(providerId, "order-accepted", {
      groupId,
    });

    // Send Push Notification to User
    if (booking.user && booking.user.fcmToken) {
      sendNotification({
        token: booking.user.fcmToken,
        title: "Booking Accepted!",
        body: `Your booking (ID: ${bookingId}) has been accepted by a service provider.`,
        data: {
          type: "order_accepted",
          bookingId: String(bookingId),
          groupId: String(groupId),
        },
      }).catch((err) => console.error("Notification error:", err));
    }

    res.json({
      message: "Booking accepted successfully",
      groupId,
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Accept booking error:", error);

    res.status(500).json({
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

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "on_the_way") {
      return res.status(400).json({ message: "Invalid booking state" });
    }

    if (booking.completionOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const groupId = booking.groupId;

    /* 🔹 COMPLETE ALL BOOKINGS IN GROUP */
    const bookingsInGroup = await Booking.findAll({
      where: {
        groupId,
        providerId,
      },
      include: [{ model: Warranty, as: "appliedWarranty" }],
    });

    for (const b of bookingsInGroup) {
      b.status = "completed";
      b.completedAt = new Date();

      // 🔥 Set warranty expiry date - use warranty duration if available, else 30 days default
      if (b.warrantyId && b.appliedWarranty) {
        const expiryDate = new Date(b.completedAt);
        expiryDate.setDate(
          expiryDate.getDate() + b.appliedWarranty.durationInDays,
        );
        b.warrantyExpiryDate = expiryDate;
      } else {
        // 🔥 Default to 30 days warranty for bookings without explicit warranty
        const expiryDate = new Date(b.completedAt);
        expiryDate.setDate(expiryDate.getDate() + 30);
        b.warrantyExpiryDate = expiryDate;
      }
      await b.save();
    }

    res.json({
      success: true,

      message: "Service completed successfully",
      groupId,
    });
  } catch (error) {
    console.error("Complete service error:", error);

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
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.update(
      { status: "cancelled" },
      { where: { groupId: booking.groupId } },
    );

    emitToAllProviders("order-cancelled", {
      groupId: booking.groupId,
    });

    res.json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ───────────────── RESCHEDULE BOOKING (USER) ───────────────── */
const rescheduleBooking = async (req, res) => {
  try {
    const { bookingId, bookingDate, bookingTime } = req.body;
    const userId = req.user.id;

    if (!bookingId || !bookingDate || !bookingTime) {
      return res.status(400).json({
        message: "bookingId, bookingDate and bookingTime are required",
      });
    }

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (["cancelled", "completed"].includes(booking.status)) {
      return res.status(400).json({
        message: "This booking cannot be rescheduled",
      });
    }

    if (booking.isRescheduled) {
      return res.status(400).json({
        message: "Booking can only be rescheduled once",
      });
    }

    const whereClause = booking.groupId
      ? { groupId: booking.groupId }
      : { id: booking.id };

    await Booking.update(
      {
        bookingDate,
        bookingTime,
        status: "pending",
        isRescheduled: true,
      },
      { where: whereClause },
    );

    const updatedBookings = await Booking.findAll({
      where: whereClause,
      order: [["id", "ASC"]],
    });

    emitToAllProviders("order-rescheduled", {
      groupId: booking.groupId,
      bookingId: booking.id,
      bookingDate,
      bookingTime,
    });

    res.json({
      success: true,
      message: "Booking rescheduled successfully",
      bookings: updatedBookings,
    });
  } catch (error) {
    console.error("Reschedule booking error:", error);
    res.status(500).json({ error: error.message });
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
        {
          model: BookingAddon,
          as: "addons",
          include: [
            {
              model: ServiceRate,
              as: "rate",
            },
          ],
        },
        {
          model: Review,
          as: "review",
          attributes: ["id", "rating", "comment"],
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
  try {
    const bookings = await Booking.findAll({
      where: { providerId: req.user.id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "user",
        },
        {
          model: Service,
          as: "service",
        },
        {
          model: BookingAddon,
          as: "addons",
          include: [
            {
              model: ServiceRate,
              as: "rate",
            },
          ],
        },
        {
          model: Review,
          as: "review",
          attributes: ["id", "rating", "comment"],
        },
      ],
    });
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

const allPendingBookings = async (req, res) => {
  try {
    const providerId = req.user.id;

    // Get provider location
    const provider = await User.findByPk(providerId, {
      attributes: ["latitude", "longitude"],
    });

    if (!provider?.latitude || !provider?.longitude) {
      return res.status(400).json({ error: "Provider location not set" });
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

    /* STEP 1: Find groups where provider can do at least one service */

    const eligible = await Booking.findAll({
      where: {
        status: "pending",
        latitude: { [Sequelize.Op.ne]: null },
        longitude: { [Sequelize.Op.ne]: null },
      },
      attributes: ["groupId"],
      include: [
        {
          model: Service,
          as: "service",
          required: true,
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

    const groupIds = [...new Set(eligible.map((b) => b.groupId))];

    if (groupIds.length === 0) {
      return res.json({ bookings: [] });
    }

    /* STEP 2: Fetch full bookings for those groups */

    const bookings = await Booking.findAll({
      where: {
        status: "pending",
        groupId: groupIds,
        latitude: { [Sequelize.Op.ne]: null },
        longitude: { [Sequelize.Op.ne]: null },
        [Sequelize.Op.and]: Sequelize.where(distanceFormula, "<=", 20),
      },
      attributes: {
        include: [[distanceFormula, "distance_km"]],
      },
      order: [
        [Sequelize.literal("distance_km"), "ASC"],
        ["groupId", "ASC"],
      ],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "price", "mainImage"],
        },
      ],
    });

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

const addAddon = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { bookingId, items } = req.body;

    if (!bookingId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Booking ID required",
      });
    }

    const booking = await Booking.findByPk(bookingId, { transaction });

    if (!booking) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    /* 🔹 REMOVE OLD ADDONS */
    await BookingAddon.destroy({
      where: { bookingId },
      transaction,
    });

    const addonItems = [];

    /* 🔹 ADD NEW ADDONS */
    if (items && items.length > 0) {
      for (const item of items) {
        const rate = await ServiceRate.findByPk(item.rateId, { transaction });

        if (!rate) continue;

        addonItems.push({
          bookingId,
          rateId: rate.id,
          title: rate.title,
          price: rate.price,
          quantity: item.quantity || 1,
        });
      }

      await BookingAddon.bulkCreate(
        addonItems.map((item) => ({
          ...item,
          status: "pending",
        })),
        { transaction },
      );
    }

    /* 🔹 RECALCULATE TOTAL */
    const addons = await BookingAddon.findAll({
      where: { bookingId },
      transaction,
    });

    let addonTotal = 0;

    for (const addon of addons) {
      addonTotal += addon.price * addon.quantity;
    }

    /* 🔹 GET ORIGINAL SERVICE PRICE */
    const service = await Service.findByPk(booking.serviceId, { transaction });

    const serviceBasePrice = service?.price || 0;

    /* 🔹 FINAL PRICE */
    // booking.priceAtBooking = serviceBasePrice + addonTotal;

    // await booking.save({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: "Addons updated successfully",
      bookingTotal: booking.priceAtBooking,
      addons: addons,
    });
  } catch (err) {
    await transaction.rollback();

    console.error("Addon update error:", err);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getBookingAddons = async (req, res) => {
  try {
    const { id } = req.params;

    const addons = await BookingAddon.findAll({
      where: { bookingId: id },
      include: [
        {
          model: ServiceRate,
          as: "rate",
          attributes: ["id", "title", "price"],
        },
      ],
    });
    const formatted = addons.map((a) => ({
      rateId: a.rateId,
      quantity: a.quantity,
      title: a.rate?.title,
      price: a.rate?.price,
      status: a.status, // <-- add this
    }));
    console.log(formatted, id);
    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking addons",
    });
  }
};
const approveAddons = async (req, res) => {
  const { bookingId, approve } = req.body;

  const addons = await BookingAddon.findAll({
    where: { bookingId, status: "pending" },
  });

  if (approve) {
    for (const addon of addons) {
      addon.status = "approved";
      await addon.save();
    }

    const booking = await Booking.findByPk(bookingId);

    let total = booking.basePriceAtBooking;

    const approvedAddons = await BookingAddon.findAll({
      where: { bookingId, status: "approved" },
    });

    for (const a of approvedAddons) {
      total += a.price * a.quantity;
    }

    booking.priceAtBooking = total;
    await booking.save();
  } else {
    for (const addon of addons) {
      addon.status = "rejected";
      await addon.save();
    }
  }

  res.json({ success: true });
};

/* ───────────────── PROVIDER WARRANTIES ───────────────── */
const getProviderWarranties = async (req, res) => {
  try {
    const providerId = req.user.id;

    // Fetch all completed bookings for the provider that have warranty
    const warranties = await Booking.findAll({
      where: {
        providerId,
        status: "completed",
        warrantyExpiryDate: {
          [Sequelize.Op.ne]: null,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "phone"],
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title"],
        },
        {
          model: Warranty,
          as: "appliedWarranty",
          attributes: ["id", "title", "description", "durationInDays"],
        },
        {
          model: WarrantyClaim,
          as: "warrantyClaim",
          attributes: [
            "id",
            "claimDescription",
            "claimImage",
            "status",
            "adminNotes",
            "claimedAt",
            "resolvedAt",
          ],
        },
      ],
      order: [["completedAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: warranties,
    });
  } catch (error) {
    console.error("Error fetching provider warranties:", error);
    res.status(500).json({
      message: "Failed to fetch warranties",
      success: false,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    await booking.destroy();

    res.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      message: "Delete failed",
    });
  }
};

module.exports = {
  acceptBooking,
  startService,
  getProviderBookings,
  completeService,
  getUserBookings,
  cancelBooking,
  rescheduleBooking,
  allPendingBookings,
  addAddon,
  getBookingAddons,
  approveAddons,
  getProviderWarranties,
  deleteBooking,
};
