const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePdf = async (bookings, isCombined = false) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = isCombined
        ? `invoice_group_${bookings[0].groupId}.pdf`
        : `invoice_${bookings[0].id}.pdf`;

      const filePath = path.join(__dirname, "../uploads/", fileName);

      const doc = new PDFDocument({ margin: 40 });

      doc.pipe(fs.createWriteStream(filePath));

      // ================= HEADER =================
      doc.fontSize(22).text("INVOICE", { align: "left" });
      doc.moveDown(0.5);

      if (isCombined) {
        doc.fontSize(12).text(`Group ID: ${bookings[0].groupId}`);
        doc.text(`Total Services: ${bookings.length}`);
      } else {
        doc.fontSize(12).text(`Booking ID: ${bookings[0].id}`);
      }

      doc.moveDown();

      // ================= SERVICES =================
      let grandTotal = 0;

      bookings.forEach((b, index) => {
        const service = b.service || {};
        const addons = b.addons || [];

        let basePrice = b.basePriceAtBooking || 0;
        let total = basePrice;

        doc.fontSize(14).text(`${index + 1}. ${service.title || "Service"}`, {
          underline: true,
        });

        doc.fontSize(12).text(`Base Price: Rs ${basePrice}`);

        // ADDONS
        if (addons.length > 0) {
          doc.moveDown(0.5);
          doc.text("Addons:");

          addons.forEach((a) => {
            const rate = a.rate || {};
            const price = rate.price || 0;
            const status = a.status;

            let statusText = "Pending";

            if (status === "approved") {
              statusText = "Approved";
              total += price;
            } else if (status === "rejected") {
              statusText = "Rejected";
            }

            doc.text(`- ${rate.title} : Rs ${price} (${statusText})`);
          });
        }

        doc.moveDown(0.5);
        doc.text(`Service Total: Rs ${total}`, { bold: true });

        doc.moveDown();
        grandTotal += total;
      });

      // ================= PROVIDER =================
      const provider = bookings[0].provider || {};

      doc.moveDown();
      doc.fontSize(14).text("Provider Details", { underline: true });
      doc.fontSize(12).text(`Name: ${provider.name}`);
      doc.text(`Phone: ${provider.phone}`);
      doc.text(`Location: ${bookings[0].location}`);

      // ================= TOTAL =================
      doc.moveDown();
      doc.fontSize(16).text(`Grand Total: Rs ${grandTotal}`, {
        align: "right",
      });

      doc.end();

      doc.on("finish", () => {
        resolve({
          filePath,
          fileName,
        });
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvoicePdf,
};
