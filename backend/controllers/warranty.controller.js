const {
  Warranty,
  Service,
  Booking,
  WarrantyClaim,
  User,
} = require("../models");
const { upload } = require("../helpers/multer");

// ==================== WARRANTY CLAIMS ====================

// 7. Create/Submit Warranty Claim
exports.submitWarrantyClaim = async (req, res) => {
  try {
    const { bookingId, claimDescription } = req.body;
    const userId = req.user.id;
    let claimImage = null;

    console.log("🔵 [CLAIM] Request received:", {
      bookingId,
      userId,
      claimDescription: claimDescription?.substring(0, 30),
    });

    // Get booking details
    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
      include: [
        { model: Warranty, as: "appliedWarranty" },
        { model: Service, as: "service" },
      ],
    });

    if (!booking) {
      console.log("❌ [CLAIM] Booking not found");
      return res
        .status(404)
        .json({ message: "Booking not found", success: false });
    }

    console.log("✅ [CLAIM] Booking found. Status:", booking.status);

    if (booking.status !== "completed") {
      console.log("❌ [CLAIM] Booking not completed. Status:", booking.status);
      return res.status(400).json({
        message: "Cannot claim warranty for incomplete service",
        success: false,
      });
    }

    // Allow warranty claims if either:
    // 1. There's a warrantyId with appliedWarranty loaded, OR
    // 2. There's a warrantyExpiryDate (warranty was assigned even without explicit ID)
    const hasWarrantyId = booking.warrantyId && booking.appliedWarranty;
    const hasWarrantyExpiryDate = booking.warrantyExpiryDate;

    if (!hasWarrantyId && !hasWarrantyExpiryDate) {
      console.log(
        "❌ [CLAIM] No warranty applicable - no warrantyId or expiryDate",
      );
      return res.status(400).json({
        message: "No warranty is applicable for this booking",
        success: false,
      });
    }

    console.log("✅ [CLAIM] Warranty found:", {
      warrantyId: booking.warrantyId,
      expiryDate: booking.warrantyExpiryDate,
      hasWarrantyId,
      hasWarrantyExpiryDate,
    });

    if (
      !booking.warrantyExpiryDate ||
      new Date(booking.warrantyExpiryDate) < new Date()
    ) {
      console.log("❌ [CLAIM] Warranty expired");
      return res.status(400).json({
        message: "Warranty has expired",
        success: false,
      });
    }

    // Handle image upload if provided
    if (req.file) {
      claimImage = req.file.filename || req.file.path;
    }

    console.log("🔄 [CLAIM] Creating warranty claim record...");

    // Create warranty claim
    // 🔥 warrantyId can be null for bookings with only warrantyExpiryDate
    const claim = await WarrantyClaim.create({
      bookingId,
      userId,
      warrantyId: booking.warrantyId || null, // Allow null
      claimDescription: claimDescription || "",
      claimImage,
      status: "pending",
    });

    console.log("✅ [CLAIM] Claim created successfully:", {
      claimId: claim.id,
      status: claim.status,
    });

    res.status(201).json({
      message: "Warranty claim submitted successfully",
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error("❌ [CLAIM] Error submitting warranty claim:", error);
    res.status(500).json({
      message: "Failed to submit warranty claim",
      success: false,
      error: "Sorry for the inconvenience. Please try again later.",
    });
  }
};

// 8. Get warranty claims by booking ID
exports.getClaimByBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const claim = await WarrantyClaim.findOne({
      where: { bookingId, userId },
      include: [
        { model: Warranty, as: "warranty" },
        { model: Booking, as: "booking" },
      ],
    });

    res.status(200).json({ success: true, data: claim || null });
  } catch (error) {
    console.error("Error fetching warranty claim:", error);
    res.status(500).json({
      message: "Failed to fetch warranty claim",
      success: false,
    });
  }
};

// 9. Get all user warranty claims
exports.getUserClaims = async (req, res) => {
  try {
    const userId = req.user.id;

    const claims = await WarrantyClaim.findAll({
      where: { userId },
      include: [
        { model: Warranty, as: "warranty", attributes: ["id", "title"] },
        {
          model: Booking,
          as: "booking",
          attributes: ["id", "priceAtBooking", "completedAt"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: claims });
  } catch (error) {
    console.error("Error fetching user claims:", error);
    res.status(500).json({
      message: "Failed to fetch warranty claims",
      success: false,
    });
  }
};

// 10. Get all warranty claims (Admin)
exports.getAllClaims = async (req, res) => {
  try {
    const { status = "", page = 1, limit = 10 } = req.query;

    let where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await WarrantyClaim.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        { model: Warranty, as: "warranty", attributes: ["id", "title"] },
        {
          model: Booking,
          as: "booking",
          attributes: ["id", "priceAtBooking", "status"],
          include: [
            {
              model: User,
              as: "provider", // 👈 important
              attributes: ["id", "name", "email", "phone"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({
      message: "Failed to fetch warranty claims",
      success: false,
    });
  }
};

// 11. Update Warranty Claim Status (Admin)
exports.updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const claim = await WarrantyClaim.findByPk(id);
    if (!claim) {
      return res
        .status(404)
        .json({ message: "Claim not found", success: false });
    }

    const validStatuses = ["pending", "approved", "rejected", "resolved"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status", success: false });
    }

    await claim.update({
      status,
      adminNotes: adminNotes || null,
      resolvedAt: ["approved", "rejected", "resolved"].includes(status)
        ? new Date()
        : null,
    });

    res.status(200).json({
      message: "Claim status updated successfully",
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error("Error updating claim:", error);
    res.status(500).json({
      message: "Failed to update warranty claim",
      success: false,
    });
  }
};

// 6. Claim Warranty (DEPRECATED - use /claim/submit instead)
exports.claimWarranty = async (req, res) => {
  console.warn(
    "⚠️  DEPRECATED ENDPOINT CALLED: /api/warranty/claim\n" +
      "   Please use: POST /api/warranty/claim/submit instead",
  );

  return res.status(400).json({
    success: false,
    message:
      "This endpoint is deprecated. Please use POST /api/warranty/claim/submit instead",
    correctEndpoint: "/api/warranty/claim/submit",
  });
};

// ==================== WARRANTY MANAGEMENT ====================

// 1. Create a Warranty
exports.createWarranty = async (req, res) => {
  try {
    const { serviceId, title, description, durationInDays, status } = req.body;

    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res
        .status(404)
        .json({ message: "Service not found", success: false });
    }

    const warranty = await Warranty.create({
      serviceId,
      title,
      description,
      durationInDays,
      status: status || "active",
    });

    res.status(201).json({
      message: "Warranty created successfully",
      success: true,
      data: warranty,
    });
  } catch (error) {
    console.error("Error creating warranty:", error);
    res
      .status(500)
      .json({ message: "Failed to create warranty", success: false });
  }
};

// 2. Get all warranties (Admin)
exports.getAllWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.findAll({
      include: [{ model: Service, as: "service", attributes: ["id", "title"] }],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: warranties });
  } catch (error) {
    console.error("Error retrieving warranties:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve warranties", success: false });
  }
};

// 3. Get warranties by Service ID (App)
exports.getWarrantiesByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const warranties = await Warranty.findAll({
      where: { serviceId, status: "active" },
    });

    res.status(200).json({ success: true, data: warranties });
  } catch (error) {
    console.error("Error retrieving service warranties:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve warranties", success: false });
  }
};

// 4. Update Warranty
exports.updateWarranty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, durationInDays, status } = req.body;

    const warranty = await Warranty.findByPk(id);
    if (!warranty) {
      return res
        .status(404)
        .json({ message: "Warranty not found", success: false });
    }

    await warranty.update({
      title,
      description,
      durationInDays,
      status,
    });

    res.status(200).json({
      message: "Warranty updated successfully",
      success: true,
      data: warranty,
    });
  } catch (error) {
    console.error("Error updating warranty:", error);
    res
      .status(500)
      .json({ message: "Failed to update warranty", success: false });
  }
};

// 5. Delete Warranty
exports.deleteWarranty = async (req, res) => {
  try {
    const { id } = req.params;

    const warranty = await Warranty.findByPk(id);
    if (!warranty) {
      return res
        .status(404)
        .json({ message: "Warranty not found", success: false });
    }

    await warranty.destroy();

    res
      .status(200)
      .json({ message: "Warranty deleted successfully", success: true });
  } catch (error) {
    console.error("Error deleting warranty:", error);
    res
      .status(500)
      .json({ message: "Failed to delete warranty", success: false });
  }
};
