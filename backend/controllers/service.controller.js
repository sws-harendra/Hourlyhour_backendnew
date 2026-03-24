const {
  Service,
  Category,
  Booking,
  User,
  ServiceRelation,
  Address,
  ServiceRate,
  AppSetting,
  BookingAddon,
} = require("../models");
const { Op } = require("sequelize");
const {
  emitToAllProviders,
  emitToNearbyOnlineProviders,
} = require("../socket");
const { generateOTP } = require("../helpers/otp_generator");
const { v4: uuidv4 } = require("uuid");

const addService = async (req, res) => {
  try {
    const {
      categoryId,
      title,
      shortDescription,
      fullDescription,
      price,
      rateType,
      duration,
      isMostBooked,
      relatedServiceIds, // <-- array
      rateListHeading,
    } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    let mainimage = null;
    if (req.files?.mainimage?.length > 0) {
      const file = req.files.mainimage[0];
      mainimage = `${process.env.BACKEND_URL}/uploads/${file.filename}`;
    }

    let images = [];
    if (req.files?.images?.length > 0) {
      images = req.files.images.map(
        (file) => `${process.env.BACKEND_URL}/uploads/${file.filename}`,
      );
    }

    const service = await Service.create({
      categoryId,
      title,
      shortDescription,
      fullDescription,
      price,
      rateType,
      duration,
      isMostBooked: isMostBooked === "true" || isMostBooked === true,
      mainimage,
      images,
      rateListHeading,
    });

    // 🔁 related services
    if (relatedServiceIds) {
      const ids = Array.isArray(relatedServiceIds)
        ? relatedServiceIds
        : JSON.parse(relatedServiceIds);

      const relations = ids.map((id) => ({
        serviceId: service.id,
        relatedServiceId: id,
      }));

      await ServiceRelation.bulkCreate(relations);
    }

    return res.status(201).json({ message: "Service created", service });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const {
      categoryId,
      title,
      shortDescription,
      fullDescription,
      price,
      rateType,
      duration,
      isMostBooked,
      relatedServiceIds,
      rateListHeading,
    } = req.body;

    // check category if changed
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
    }

    let updatedData = {
      categoryId,
      title,
      shortDescription,
      fullDescription,
      price,
      rateType,
      duration,
      isMostBooked: isMostBooked === "true" || isMostBooked === true,
      rateListHeading,
    };

    // 🔁 main image
    if (req.files?.mainimage?.length > 0) {
      updatedData.mainimage = `${process.env.BACKEND_URL}/uploads/${req.files.mainimage[0].filename}`;
    }

    // 🔁 multiple images
    if (req.files?.images?.length > 0) {
      updatedData.images = req.files.images.map(
        (file) => `${process.env.BACKEND_URL}/uploads/${file.filename}`,
      );
    }

    await service.update(updatedData);

    // 🔁 update related services
    // 🔁 update related services (OPTIONAL)
    if (
      relatedServiceIds !== undefined &&
      relatedServiceIds !== null &&
      relatedServiceIds !== "" &&
      relatedServiceIds !== "undefined" &&
      relatedServiceIds !== "null"
    ) {
      let ids = [];

      if (Array.isArray(relatedServiceIds)) {
        ids = relatedServiceIds;
      } else {
        try {
          ids = JSON.parse(relatedServiceIds);
        } catch (err) {
          // ❌ silently ignore instead of error
          ids = [];
        }
      }

      // remove old relations
      await ServiceRelation.destroy({
        where: { serviceId: service.id },
      });

      if (ids.length > 0) {
        const relations = ids.map((relId) => ({
          serviceId: service.id,
          relatedServiceId: relId,
        }));

        await ServiceRelation.bulkCreate(relations);
      }
    }

    return res.status(200).json({
      message: "Service updated successfully",
      service,
    });
  } catch (err) {
    console.error("Update Service Error:", err);
    return res.status(500).json({ error: err.message });
  }
};
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 🧹 delete relations
    await ServiceRelation.destroy({
      where: {
        serviceId: id,
      },
    });

    // 🧹 delete service
    await service.destroy();

    return res.status(200).json({
      message: "Service deleted successfully",
      success: true,
    });
  } catch (err) {
    console.error("Delete Service Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

const getServicesByCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract pagination query params
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    const { rows: services, count: total } = await Service.findAndCountAll({
      where: { categoryId: id },
      order: [["id", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: services,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getAllServices = async (req, res) => {
  try {
    // Query params
    let {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    // Convert numeric params
    page = parseInt(page);
    limit = parseInt(limit);

    const offset = (page - 1) * limit;

    // Search conditions
    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
        { fullDescription: { [Op.like]: `%${search}%` } },
      ];
    }

    // Validate sorting
    const validOrder = order.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Fetch data
    const { rows, count } = await Service.findAndCountAll({
      where,
      order: [[sortBy, validOrder]],
      limit,
      offset,
      include: [
        {
          model: Category,
          as: "category", // make sure this matches your model alias
          attributes: ["id", "name", "image"],
        },
        {
          model: Service,
          as: "relatedServices",
          attributes: ["id", "title", "price", "mainimage"],
          through: { attributes: [] }, // hide junction table
        },
      ],
    });

    return res.json({
      success: true,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (err) {
    console.error("Error retrieving services:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const bookService = async (req, res) => {
  try {
    const {
      serviceIds,
      bookingDate,
      bookingTime,
      location,
      specialNote,
      addressId,
    } = req.body;

    const userId = req.user.id;

    if (!serviceIds || serviceIds.length === 0) {
      return res.status(400).json({ message: "No services selected" });
    }

    let finalLocation = location;
    let latitude = null;
    let longitude = null;

    if (addressId) {
      const address = await Address.findOne({
        where: { id: addressId, userId },
      });

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      finalLocation = `${address.address1}, ${address.city}, ${
        address.state || ""
      }, ${address.zipCode || ""}`;

      latitude = address.latitude;
      longitude = address.longitude;
    }
    const setting = await AppSetting.findOne(); // adjust if needed
    const taxPercent = setting?.tax || 0;

    const completionOtp = generateOTP();
    const bookings = [];
    const bookingsTransaction = await Booking.sequelize.transaction();

    try {
      // Lock the current highest group so concurrent requests don't reuse it.
      const lastGroupBooking = await Booking.findOne({
        attributes: ["groupId"],
        where: {
          groupId: {
            [Op.ne]: null,
          },
        },
        order: [["groupId", "DESC"]],
        transaction: bookingsTransaction,
        lock: bookingsTransaction.LOCK.UPDATE,
      });

      const groupId = (lastGroupBooking?.groupId || 0) + 1;

      for (const serviceId of serviceIds) {
        const service = await Service.findByPk(serviceId, {
          transaction: bookingsTransaction,
        });

        if (!service) continue;

        const booking = await Booking.create(
          {
            userId,
            serviceId,
            bookingDate,
            bookingTime,
            location: finalLocation,
            specialNote: specialNote || "",
            priceAtBooking: service.price,
            basePriceAtBooking: service.price,
            taxPercentageAtBooking: taxPercent,
            status: "pending",
            latitude,
            longitude,
            completionOtp,
            groupId,
          },
          { transaction: bookingsTransaction },
        );

        bookings.push(booking);
      }

      await bookingsTransaction.commit();

      /* 🔔 Send one notification to providers */
      await emitToNearbyOnlineProviders(latitude, longitude, "new-order", {
        groupId,
        bookingDate,
        bookingTime,
        location: finalLocation,
        services: bookings.map((b) => ({
          id: b.id,
          serviceId: b.serviceId,
          price: b.priceAtBooking,
        })),
      });

      return res.status(201).json({
        message: "Services booked successfully",
        groupId,
        bookings,
      });
    } catch (transactionError) {
      await bookingsTransaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("Booking error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// ----------------------------------------------------------
// 2️⃣ ALL BOOKINGS (ADMIN)
// ----------------------------------------------------------
const allBookings = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const where = {};

    // ✅ Status filter
    if (status) {
      where.status = status;
    }

    // ✅ Search filter
    if (search) {
      where[Op.or] = [
        { location: { [Op.like]: `%${search}%` } },
        { specialNote: { [Op.like]: `%${search}%` } },
        { "$user.name$": { [Op.like]: `%${search}%` } },
        { "$service.title$": { [Op.like]: `%${search}%` } },
      ];
    }

    const { rows, count } = await Booking.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
          required: false,
        },
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "price"],
          required: false,
        },
        {
          model: BookingAddon,
          as: "addons",
          attributes: ["id", "title", "price", "quantity", "status"],
          required: false,
          include: [
            {
              model: ServiceRate,
              as: "rate",
              attributes: ["id", "title", "price"],
              required: false,
            },
          ],
        },
      ],
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"], // tie breaker
      ],
      limit,
      offset,
      distinct: true,
    });

    return res.json({
      data: rows,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------------
// 3️⃣ MY BOOKINGS (USER)
// ----------------------------------------------------------
const mybookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "price", "mainimage"],
        },
      ],
      order: [["bookingDateTime", "ASC"]],
    });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------------
// 4️⃣ CANCEL BOOKING
// ----------------------------------------------------------
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findOne({
      where: { id: bookingId, userId },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Already cancelled" });

    booking.status = "cancelled";
    await booking.save();
    emitToAllProviders("order-cancelled", { bookingId });

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Controller function
const bookingDetail = async (req, res) => {
  try {
    const bookingId = req.params.id; // get the id from route parameter

    // Assuming you are using Sequelize
    const booking = await Booking.findOne({
      where: { id: bookingId },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Service, as: "service", attributes: ["id", "title", "price"] },
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
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const assignProvider = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { providerId } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.providerId = providerId;
    await booking.save();

    res.json({ message: "Provider assigned successfully", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const assignProviderToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { providerId } = req.body;

    await Booking.update({ providerId }, { where: { groupId } });

    res.json({ message: "Assigned to all" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const statusUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByPk(id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await Booking.update({ status }, { where: { groupId: booking.groupId } });

    const updated = await Booking.findAll({
      where: { groupId: booking.groupId },
      include: ["user", "provider", "service"],
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const updateGroupStatus = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { status } = req.body;

    const bookings = await Booking.findAll({ where: { groupId } });

    if (!bookings.length) {
      return res.status(404).json({ message: "Group not found" });
    }

    await Booking.update({ status }, { where: { groupId } });

    const updated = await Booking.findAll({
      where: { groupId },
      include: ["user", "provider", "service"],
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const getServiceDetail = async (req, res) => {
  try {
    const id = req.params.id;

    const servicedetail = await Service.findByPk(id);

    res.json({ servicedetail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const popularService = async (req, res) => {
  try {
    let { limit = 10 } = req.query;
    limit = parseInt(limit);

    const services = await Service.findAll({
      where: {
        isMostBooked: true,
        status: "active",
      },
      limit,
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "image"],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    console.error("Error fetching popular services:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getRateList = async (req, res) => {
  try {
    const rates = await ServiceRate.findAll({
      where: { status: "active" },
      attributes: ["id", "title", "price"],
      order: [["id", "ASC"]],
    });

    res.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rate list",
    });
  }
};

const createRate = async (req, res) => {
  try {
    const { serviceId, title, price } = req.body;

    const rate = await ServiceRate.create({
      serviceId,
      title,
      price,
    });

    res.status(201).json({
      success: true,
      message: "Rate created successfully",
      data: rate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
GET ALL RATES
*/
const getRates = async (req, res) => {
  try {
    const rates = await ServiceRate.findAll({
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
GET SINGLE RATE
*/
const getRateById = async (req, res) => {
  try {
    const rate = await ServiceRate.findByPk(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }

    res.json({
      success: true,
      data: rate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/*
UPDATE RATE
*/
const updateRate = async (req, res) => {
  try {
    const { title, price, status } = req.body;

    const rate = await ServiceRate.findByPk(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }

    await rate.update({
      title,
      price,
      status,
    });

    res.json({
      success: true,
      message: "Rate updated successfully",
      data: rate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getRatesByService = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // 🔹 get service (for heading)
    const service = await Service.findByPk(serviceId, {
      attributes: ["id", "rateListHeading"],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    // 🔹 get rates
    const rates = await ServiceRate.findAll({
      where: { serviceId },
      order: [["id", "DESC"]],
    });

    res.json({
      success: true,

      heading: service.rateListHeading,
      data: rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/*
DELETE RATE
*/
const deleteRate = async (req, res) => {
  try {
    const rate = await ServiceRate.findByPk(req.params.id);

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: "Rate not found",
      });
    }

    await rate.destroy();

    res.json({
      success: true,
      message: "Rate deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// controllers/service.controller.js

const getRelatedServices = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const service = await Service.findByPk(serviceId, {
      include: [
        {
          model: Service,
          as: "relatedServices",
          attributes: ["id", "title", "price", "mainimage"],
          through: { attributes: [] },
        },
      ],
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.json({
      success: true,
      data: service.relatedServices, // ✅ THIS IS IMPORTANT
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getGroupBookings = async (req, res) => {
  try {
    const { groupId } = req.params;

    const bookings = await Booking.findAll({
      where: { groupId },
      include: [
        "user",
        "provider",
        "service",
        {
          model: BookingAddon,
          as: "addons",
          attributes: ["id", "title", "price", "quantity", "status"],
          required: false,
          include: [
            {
              model: ServiceRate,
              as: "rate",
              attributes: ["id", "title", "price"],
              required: false,
            },
          ],
        },
      ],
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
// Route
module.exports = {
  getServicesByCategory,
  addService,
  getAllServices,
  bookService,
  allBookings,
  mybookings,
  cancelBooking,
  bookingDetail,
  assignProvider,
  getServiceDetail,
  statusUpdate,
  popularService,
  updateService,
  deleteService,
  getRelatedServices,
  createRate,
  updateRate,
  getRateById,
  deleteRate,
  getRates,
  getRatesByService,
  assignProviderToGroup,
  getGroupBookings,
  updateGroupStatus,
};
