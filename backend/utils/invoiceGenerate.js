const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const { toWords } = require("number-to-words");

// ================= HELPERS =================
handlebars.registerHelper("inc", (v) => parseInt(v) + 1);
handlebars.registerHelper("numberToWords", (num) => {
  if (!num) return "Zero";
  return toWords(Math.floor(num));
});

// ================= MAIN FUNCTION =================
const generateInvoicePdf = async (
  bookings,
  isCombined = false,
  defaultTaxPercent = 0,
) => {
  let browser;

  try {
    // ✅ CLEAN DATA
    const cleanBookings = bookings.map((b) =>
      b.get ? b.get({ plain: true }) : b,
    );

    const user = cleanBookings[0]?.user || {};
    const provider = cleanBookings[0]?.provider || {};

    // ================= TEMPLATE =================
    const templatePath = path.join(__dirname, "../templates/invoice.hbs");
    const htmlTemplate = fs.readFileSync(templatePath, "utf8");
    const compiled = handlebars.compile(htmlTemplate);

    // ================= LOGO =================
    const logoPath = path.join(__dirname, "..", "public", "logo.png");
    let logoSrc = "";
    if (fs.existsSync(logoPath)) {
      const b64 = fs.readFileSync(logoPath).toString("base64");
      logoSrc = `data:image/png;base64,${b64}`;
    }

    // ================= ITEMS =================
    let subtotal = 0;
    let totalTax = 0;
    const items = [];

    cleanBookings.forEach((b) => {
      const base = Number(b.basePriceAtBooking) || 0;
      let addonTotal = 0;

      const serviceTitle = b?.service?.title || "Service";
      const rateType = b?.service?.rateType || "fixed";
      const providerName = b?.provider?.name || "-";
      const providerPhone = b?.provider?.phone || "-";

      // SERVICE
      items.push({
        index: items.length + 1,
        name: serviceTitle,
        rateType,
        provider: providerName,
        providerPhone,
        qty: 1,
        amount: base.toFixed(2),
      });

      // ADDONS
      (b.addons || []).forEach((a) => {
        const price = Number(a?.rate?.price || a?.price) || 0;
        const qty = Number(a?.quantity) || 1;

        if (a.status === "approved") {
          addonTotal += price * qty;

          items.push({
            index: items.length + 1,
            name: `${a?.rate?.title || a?.title || "Addon"} (Addon)`,
            rateType: "extra",
            provider: providerName,
            providerPhone,
            qty,
            amount: (price * qty).toFixed(2),
          });
        }
      });

      const bookingSubtotal = base + addonTotal;
      const bookingTaxPercent =
        Number(b.taxPercentageAtBooking) || Number(defaultTaxPercent) || 0;
      const bookingTax = (bookingSubtotal * bookingTaxPercent) / 100;

      subtotal += bookingSubtotal;
      totalTax += bookingTax;
    });

    // ================= TOTALS =================
    const gst =
      Number(cleanBookings[0]?.taxPercentageAtBooking) ||
      Number(defaultTaxPercent) ||
      0;
    const gstAmount = totalTax;
    const discount = 0;

    const grandTotal = subtotal + gstAmount - discount;
    const totalReceived = 0;
    const dueAmount = grandTotal - totalReceived;

    // ================= FINAL DATA =================
    const data = {
      client: {
        invoice_no: isCombined ? cleanBookings[0].groupId : cleanBookings[0].id,

        created_at: new Date().toLocaleDateString(),

        name: user?.name || "-",
        email: user?.email || "-",
        number: user?.phone || "-",
        address: cleanBookings[0]?.location || "-",

        provider_name: provider?.name || "-",
        provider_phone: provider?.phone || "-",

        company_name: "Repair Sathi",

        items,

        logoSrc,

        gst,
        discount,

        total_amount: subtotal.toFixed(2),
        gst_amount: gstAmount.toFixed(2),
        grand_total: grandTotal.toFixed(2),
        total_received: totalReceived.toFixed(2),
        due_amount: dueAmount.toFixed(2),

        grand_total_number: Math.floor(grandTotal),
      },
    };

    // ================= GENERATE PDF =================
    const html = compiled(data);

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    // const browser = await puppeteer.launch({
    //   executablePath: "/usr/bin/chromium-browser",
    //   headless: "new",

    //   // headless: true,
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const fileName = `${data.client.invoice_no}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../uploads/", fileName);

    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        bottom: "20mm",
        left: "10mm",
        right: "10mm",
      },
    });

    await browser.close();

    return { filePath, fileName };
  } catch (err) {
    if (browser) await browser.close();
    throw err;
  }
};

module.exports = { generateInvoicePdf };
