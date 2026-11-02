// controllers/webrequest.controller.js
const db = require("../models");
const WebRequest = db.WebRequest;
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

    const uniqueNum = Math.floor(100000 + Math.random() * 900000);
    const inquiryId = req.body.inquiryId || `RS-${uniqueNum}`;

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

    const deleted = await WebRequest.destroy({ where });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    res.json({ success: true, message: "Request deleted successfully" });
  } catch (err) {
    console.error("Error deleting web request:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
