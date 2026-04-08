const { Review, Booking, User } = require("../models");

const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "Booking ID and rating are required" });
    }

    // Check if booking exists and is completed
    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Can only rate completed bookings" });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ where: { bookingId } });
    if (existingReview) {
      return res.status(400).json({ message: "Booking already reviewed" });
    }

    const review = await Review.create({
      bookingId,
      userId,
      providerId: booking.providerId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;

    const reviews = await Review.findAll({
      where: { providerId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "profilePicture"],
        },
        {
          model: Booking,
          as: "booking",
          attributes: ["id", "bookingDate"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Get provider reviews error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "phone"],
        },
        {
          model: User,
          as: "provider",
          attributes: ["id", "name", "phone"],
        },
        {
          model: Booking,
          as: "booking",
          attributes: ["id", "bookingDate", "status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, reviews });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getAllReviews,
};
