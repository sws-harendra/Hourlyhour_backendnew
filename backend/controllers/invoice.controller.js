const { Booking } = require("../models");
const { generateInvoicePdf } = require("../utils/invoiceGenerate");

const getInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId, {
      include: ["service", "provider", "addons"],
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { filePath } = await generateInvoicePdf([booking], false);

    return res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating invoice" });
  }
};

const getCombinedInvoice = async (req, res) => {
  try {
    const { groupId } = req.params;

    const bookings = await Booking.findAll({
      where: { groupId },
      include: ["service", "provider", "addons"],
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "No bookings found" });
    }

    const { filePath } = await generateInvoicePdf(bookings, true);

    return res.download(filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating invoice" });
  }
};

module.exports = {
  getInvoice,
  getCombinedInvoice,
};
