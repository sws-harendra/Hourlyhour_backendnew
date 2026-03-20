const { Booking } = require("../models");
const { generateInvoicePdf } = require("../utils/invoiceGenerate");

const getInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findByPk(bookingId, {
      attributes: [
        "id",
        "groupId",
        "basePriceAtBooking",
        "taxPercentageAtBooking",
        "location",
      ],
      include: [
        {
          association: "service",
          attributes: ["title"],
        },
        {
          association: "provider",
          attributes: ["name", "phone"],
        },
        {
          association: "user", // ✅ ADD THIS
          attributes: ["name", "phone", "email"],
        },
        {
          association: "addons",
          attributes: ["price", "quantity", "status", "title"],
          include: [
            {
              association: "rate",
              attributes: ["title", "price"],
            },
          ],
        },
      ],
    });
    console.log(booking);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { filePath } = await generateInvoicePdf([booking], false);

    return res.download(filePath);
  } catch (err) {
    console.error("Single invoice error:", err);
    res.status(500).json({ message: "Error generating invoice" });
  }
};

const getCombinedInvoice = async (req, res) => {
  try {
    const { groupId } = req.params;
    const bookings = await Booking.findAll({
      where: { groupId },
      attributes: [
        "id",
        "groupId",
        "basePriceAtBooking",
        "taxPercentageAtBooking",
        "location",
      ],
      include: [
        {
          association: "service",
          attributes: ["title"],
        },
        {
          association: "provider",
          attributes: ["name", "phone"],
        },
        {
          association: "user", // ✅ ADD THIS
          attributes: ["name", "phone", "email"],
        },
        {
          association: "addons",
          attributes: ["price", "quantity", "status", "title"],
          include: [
            {
              association: "rate", // ✅ THIS IS KEY
              attributes: ["title", "price"],
            },
          ],
        },
      ],
    });
    console.log(bookings);

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    const { filePath } = await generateInvoicePdf(bookings, true);

    return res.download(filePath);
  } catch (err) {
    console.error("Group invoice error:", err);
    res.status(500).json({ message: "Error generating invoice" });
  }
};

module.exports = {
  getInvoice,
  getCombinedInvoice,
};
