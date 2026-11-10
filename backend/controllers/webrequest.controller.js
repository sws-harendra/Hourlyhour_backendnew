// controllers/webrequest.controller.js
const db = require("../models");
const WebRequest = db.WebRequest;
const Booking = db.Booking;
const User = db.User;
const Service = db.Service;
const Category = db.Category;
const { Op } = require("sequelize");

exports.getAllWebRequests = async (req, res) => {
  try {
    const { status, search, date } = req.query;
    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    const conditions = [];

    if (search && search.trim() !== "") {
      const q = `%${search.trim()}%`;
      conditions.push({
        [Op.or]: [
          { customerName: { [Op.like]: q } },
          { phone: { [Op.like]: q } },
          { email: { [Op.like]: q } },
          { serviceName: { [Op.like]: q } },
          { message: { [Op.like]: q } },
          { inquiryId: { [Op.like]: q } },
        ],
      });
    }

    if (date && date.trim() !== "") {
      const d = date.trim();
      const startOfDay = new Date(`${d}T00:00:00.000Z`);
      const endOfDay = new Date(`${d}T23:59:59.999Z`);

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().slice(0, 10);

      const dateOrClauses = [
        db.Sequelize.where(
          db.Sequelize.fn("DATE", db.Sequelize.col("createdAt")),
          d
        ),
        { createdAt: { [Op.between]: [startOfDay, endOfDay] } },
        { preferredDate: { [Op.like]: `%${d}%` } },
      ];

      if (d === todayStr) {
        dateOrClauses.push({ preferredDate: { [Op.like]: "%Today%" } });
      }
      if (d === tomorrowStr) {
        dateOrClauses.push({ preferredDate: { [Op.like]: "%Tomorrow%" } });
      }

      conditions.push({ [Op.or]: dateOrClauses });
    }

    if (conditions.length === 1) {
      Object.assign(where, conditions[0]);
    } else if (conditions.length > 1) {
      where[Op.and] = conditions;
    }

    let records = await WebRequest.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
    // Format to match admin panel expectation
    const formatted = records.map((r) => ({
      id: r.inquiryId || `WR-${r.id}`,
      numericId: r.id,
      customerName: r.customerName,
      phone: r.phone,
      email: r.email,
      serviceName: r.serviceName,
      category: r.category,
      city: r.city,
      address: r.address,
      message: r.message,
      appliances: r.appliances,
      source: r.source,
      status: r.status,
      preferredDate: r.preferredDate,
      preferredTime: r.preferredTime,
      notes: r.notes || "",
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error in getAllWebRequests:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createWebRequest = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      serviceName,
      category,
      city,
      address,
      message,
      appliances,
      preferredDate,
      preferredTime,
      source,
      notes,
    } = req.body;

    if (!customerName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone number are required.",
      });
    }

    let numericId = req.body.inquiryId
      ? parseInt(String(req.body.inquiryId).replace(/\D/g, ""), 10)
      : null;

    if (!numericId || isNaN(numericId) || numericId < 100000) {
      numericId = Math.floor(100000 + Math.random() * 900000);
    }

    // Ensure unique numericId across both tables
    let existsWeb = await WebRequest.findOne({ where: { inquiryId: `RS-${numericId}` } });
    let existsBooking = Booking ? await Booking.findByPk(numericId) : null;
    while (existsWeb || existsBooking) {
      numericId = Math.floor(100000 + Math.random() * 900000);
      existsWeb = await WebRequest.findOne({ where: { inquiryId: `RS-${numericId}` } });
      existsBooking = Booking ? await Booking.findByPk(numericId) : null;
    }

    const inquiryId = `RS-${numericId}`;

    const newRequest = await WebRequest.create({
      inquiryId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      serviceName: serviceName || category || "Home Appliance Service",
      category: category || "Home Appliance",
      city: city || "Patna",
      address: address ? address.trim() : null,
      message: message ? message.trim() : null,
      appliances: appliances || null,
      source: source || "Website Booking Form",
      status: "pending",
      preferredDate: preferredDate || "Today",
      preferredTime: preferredTime || "10:00 AM - 01:00 PM",
      notes: notes || "",
    });

    // Also mirror booking into All Bookings (`bookings` table) so admin can assign provider
    try {
      if (Booking && User && Service) {
        const cleanPhone = phone.trim();
        const digitsOnly = cleanPhone.replace(/\D/g, "").slice(-10);
        const normalizedPhone = `+91${digitsOnly}`;

        let user = await User.findOne({
          where: {
            phone: { [Op.like]: `%${digitsOnly}` },
          },
        });

        if (!user) {
          user = await User.create({
            name: customerName.trim(),
            phone: normalizedPhone,
            email: email ? email.trim() : null,
            userType: "user",
            lastLogin: new Date(),
          });
        } else if (!user.name && customerName) {
          user.name = customerName.trim();
          if (email && !user.email) user.email = email.trim();
          await user.save();
        }

        // Match service for foreign key
        let matchedService = null;
        if (category) {
          const catKeyword = category.split(" ")[0];
          matchedService = await Service.findOne({
            include: [
              {
                model: Category,
                as: "category",
                where: { name: { [Op.like]: `%${catKeyword}%` } },
                required: true,
              },
            ],
          });
        }
        if (!matchedService && serviceName) {
          const srvKeyword = serviceName.split(" ")[0];
          matchedService = await Service.findOne({
            where: { title: { [Op.like]: `%${srvKeyword}%` } },
          });
        }
        if (!matchedService) {
          matchedService = await Service.findOne();
        }

        // Parse booking date
        let bookingDate = new Date().toISOString().slice(0, 10);
        if (preferredDate) {
          if (preferredDate.toLowerCase() === "today") {
            bookingDate = new Date().toISOString().slice(0, 10);
          } else if (preferredDate.toLowerCase() === "tomorrow") {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            bookingDate = d.toISOString().slice(0, 10);
          } else if (/^\d{4}-\d{2}-\d{2}$/.test(preferredDate.trim())) {
            bookingDate = preferredDate.trim();
          }
        }

        // Parse booking time
        let bookingTime = "10:00:00";
        if (preferredTime) {
          const timeMatch = preferredTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = timeMatch[2];
            const meridiem = timeMatch[3]?.toUpperCase();
            if (meridiem === "PM" && hours < 12) hours += 12;
            if (meridiem === "AM" && hours === 12) hours = 0;
            bookingTime = `${String(hours).padStart(2, "0")}:${minutes}:00`;
          }
        }

        // Extract price dynamically from appliances or serviceName
        let estimatedPrice = 0;
        let parsedAppliances = appliances;
        if (typeof parsedAppliances === "string") {
          try { parsedAppliances = JSON.parse(parsedAppliances); } catch {}
        }
        if (Array.isArray(parsedAppliances) && parsedAppliances.length > 0) {
          for (const app of parsedAppliances) {
            const list =
              Array.isArray(app.services) && app.services.length > 0
                ? app.services
                : Array.isArray(app.requirements)
                ? app.requirements
                : [];
            for (const item of list) {
              const p = typeof item === "object" ? item?.price : item;
              if (p) {
                const match = String(p).match(/(?:₹|Rs\.?)\s*([\d,]+)/i);
                if (match) {
                  estimatedPrice += parseFloat(match[1].replace(/,/g, "")) || 0;
                }
              }
            }
          }
        }
        if (!estimatedPrice && typeof serviceName === "string") {
          const allMatches = serviceName.matchAll(/(?:₹|Rs\.?)\s*([\d,]+)/gi);
          for (const m of allMatches) {
            estimatedPrice += parseFloat(m[1].replace(/,/g, "")) || 0;
          }
        }
        if (!estimatedPrice && matchedService?.price) {
          estimatedPrice = matchedService.price;
        }

        const fullLocation = [address, city || "Patna"].filter(Boolean).join(", ");
        const completionOtp = String(Math.floor(1000 + Math.random() * 9000));

        await Booking.create({
          id: numericId,
          userId: user.id,
          serviceId: matchedService ? matchedService.id : 1,
          bookingDate,
          bookingTime,
          location: fullLocation || "Patna",
          specialNote: `${serviceName || ""}\n${message || ""}`.trim(),
          status: "pending",
          priceAtBooking: estimatedPrice,
          basePriceAtBooking: estimatedPrice,
          taxPercentageAtBooking: 0,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: email ? email.trim() : null,
          completionOtp,
          paymentMethod: "pending",
          paymentStatus: "pending",
        });
      }
    } catch (bErr) {
      console.error("Error creating mirrored Booking in all bookings:", bErr);
    }

    const responseItem = {
      id: newRequest.inquiryId,
      numericId: newRequest.id,
      customerName: newRequest.customerName,
      phone: newRequest.phone,
      email: newRequest.email,
      serviceName: newRequest.serviceName,
      category: newRequest.category,
      city: newRequest.city,
      address: newRequest.address,
      message: newRequest.message,
      appliances: newRequest.appliances,
      source: newRequest.source,
      status: newRequest.status,
      preferredDate: newRequest.preferredDate,
      preferredTime: newRequest.preferredTime,
      notes: newRequest.notes,
      createdAt: newRequest.createdAt,
      updatedAt: newRequest.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Web request received successfully",
      data: responseItem,
    });
  } catch (err) {
    console.error("Error creating web request:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const where = {};
    if (isNaN(id)) {
      where.inquiryId = id;
    } else {
      where[Op.or] = [{ id: parseInt(id, 10) }, { inquiryId: id }];
    }

    const item = await WebRequest.findOne({ where });
    if (!item) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (status) item.status = status;
    if (notes !== undefined) item.notes = notes;
    await item.save();

    // Sync status to mirrored Booking record if present
    try {
      const numId = parseInt(String(item.inquiryId).replace(/\D/g, ""), 10);
      if (numId && Booking && status) {
        const booking = await Booking.findByPk(numId);
        if (booking) {
          booking.status = status;
          await booking.save();
        }
      }
    } catch {}

    res.json({
      success: true,
      message: "Status updated successfully",
      data: item,
    });
  } catch (err) {
    console.error("Error updating web request:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const where = {};
    if (isNaN(id)) {
      where.inquiryId = id;
    } else {
      where[Op.or] = [{ id: parseInt(id, 10) }, { inquiryId: id }];
    }

    const item = await WebRequest.findOne({ where });
    if (!item) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const numId = parseInt(String(item.inquiryId).replace(/\D/g, ""), 10);
    await item.destroy();

    if (numId && Booking) {
      try {
        await Booking.destroy({ where: { id: numId } });
      } catch {}
    }

    res.json({ success: true, message: "Request deleted successfully" });
  } catch (err) {
    console.error("Error deleting web request:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
