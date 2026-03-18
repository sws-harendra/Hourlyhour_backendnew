const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const { toWords } = require("number-to-words");

// ================= HELPERS =================
handlebars.registerHelper("inc", (v) => parseInt(v) + 1);
handlebars.registerHelper("eq", (a, b) => a === b);
handlebars.registerHelper("numberToWords", (num) => {
  if (!num) return "Zero";
  return toWords(Math.floor(num));
});

// ================= MAIN FUNCTION =================
const generateInvoicePdf = async (bookings, isCombined = false) => {
  let browser;

  try {
    // ✅ STEP 1: CLEAN SEQUELIZE DATA
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

    // ================= CALCULATIONS =================
    let subtotal = 0;

    const description = [];
    const hsnArr = [];
    const amountArr = [];

    const services = cleanBookings.map((b, i) => {
      const base = Number(b.basePriceAtBooking) || 0;
      let addonTotal = 0;

      const addons = (b.addons || []).map((a) => {
        const price = Number(a?.rate?.price || a?.price) || 0;

        if (a.status === "approved") {
          addonTotal += price;
        }

        return {
          title: a?.rate?.title || a?.title || "Addon",
          price,
          status: a?.status || "pending",
        };
      });

      const total = base + addonTotal;
      subtotal += total;

      return {
        index: i + 1,
        title: b?.service?.title || "Service",
        basePrice: base,
        addons,
        total,
        // hsn: "9987",
      };
    });

    // ================= FLATTEN FOR TABLE =================
    services.forEach((s) => {
      // service row
      description.push(s.title);
      // hsnArr.push(s.hsn);
      amountArr.push(s.basePrice.toFixed(2));

      // addon rows
      s.addons.forEach((a) => {
        if (a.status === "approved") {
          description.push(`${a.title} (Addon)`);
          // hsnArr.push(s.hsn);
          amountArr.push(a.price.toFixed(2));
        }
      });
    });

    // ================= TOTALS =================
    const gst = 18;
    const gstAmount = (subtotal * gst) / 100;
    const discount = 0;

    const grandTotal = subtotal + gstAmount - discount;
    const totalReceived = 0;
    const dueAmount = grandTotal - totalReceived;

    // ================= FINAL DATA =================
    const data = {
      client: {
        invoice_no: isCombined ? cleanBookings[0].groupId : cleanBookings[0].g,

        created_at: new Date().toLocaleDateString(),

        name: user?.name || "-",
        email: user?.email || "-",
        number: user?.phone || "-",
        address: cleanBookings[0]?.location || "-",

        company_name: "Repair Sathi",

        description,
        // hsn: hsnArr,
        amount: amountArr,

        logoSrc,

        gst,
        discount,

        total_amount: subtotal.toFixed(2),
        gst_amount: gstAmount.toFixed(2),
        grand_total: grandTotal.toFixed(2),
        total_received: totalReceived.toFixed(2),
        due_amount: dueAmount.toFixed(2),

        receive_amount: [],
        payment_date: [],
        mode_of_payment: [],

        grand_total_number: Math.floor(grandTotal),
      },
    };

    // ================= HTML → PDF =================
    const html = compiled(data);

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

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
