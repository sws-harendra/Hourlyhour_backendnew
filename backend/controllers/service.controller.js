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
  ServiceAreaPrice,
  Warranty,
} = require("../models");

const { Op } = require("sequelize");
const { sendNotification } = require("../utils/notification.util");
const {
  emitToAllProviders,
  emitToNearbyOnlineProviders,
} = require("../socket");
const { generateOTP } = require("../helpers/otp_generator");
const {
  getNumericValue,
  formatAddressLabel,
  resolveServiceAreaContext,
  getAreaPriceMap,
  serializeServiceWithAreaPrice,
} = require("../helpers/serviceAreaPricing");

const isInvalidFcmTokenError = (errorCode) =>
  errorCode === "messaging/registration-token-not-registered" ||
  errorCode === "messaging/invalid-registration-token";

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
    const areaContext = await resolveServiceAreaContext(req);

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

    const areaPriceMap = await getAreaPriceMap(
      services.map((service) => service.id),
      areaContext.matchedArea?.id,
    );

    const data = services.map((service) =>
      serializeServiceWithAreaPrice(
        service,
        areaContext.matchedArea,
        areaPriceMap.get(String(service.id)),
      ),
    );

    return res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const getAllServices = async (req, res) => {
  try {
    const areaContext = await resolveServiceAreaContext(req);

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
      distinct: true,
    });

    const areaPriceMap = await getAreaPriceMap(
      rows.map((service) => service.id),
      areaContext.matchedArea?.id,
    );

    const relatedAreaPriceMap = await getAreaPriceMap(
      rows
        .flatMap((service) => service.relatedServices || [])
        .map((relatedService) => relatedService.id),
      areaContext.matchedArea?.id,
    );

    const data = rows.map((service) =>
      serializeServiceWithAreaPrice(
        service,
        areaContext.matchedArea,
        areaPriceMap.get(String(service.id)),
        relatedAreaPriceMap,
      ),
    );

    return res.json({
      success: true,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      data,
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
      latitude: bodyLatitude,
      longitude: bodyLongitude,
    } = req.body;

    const userId = req.user.id;

    let selectedServiceIds = [];
    if (Array.isArray(serviceIds)) {
      selectedServiceIds = serviceIds;
    } else if (typeof serviceIds === "string") {
      try {
        selectedServiceIds = JSON.parse(serviceIds);
      } catch (parseError) {
        selectedServiceIds = serviceIds
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } else if (serviceIds !== undefined && serviceIds !== null) {
      selectedServiceIds = [serviceIds];
    }

    if (!selectedServiceIds || selectedServiceIds.length === 0) {
      return res.status(400).json({ message: "No services selected" });
    }

    let finalLocation = location;
    let latitude = getNumericValue(bodyLatitude);
    let longitude = getNumericValue(bodyLongitude);

    // 📍 GET USER LOCATION
    if (addressId) {
      const address = await Address.findOne({
        where: { id: addressId, userId },
      });

      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }

      finalLocation = formatAddressLabel(address) || finalLocation;

      latitude = getNumericValue(address.latitude);
      longitude = getNumericValue(address.longitude);
    }

    if ((latitude === null || longitude === null) && req.user) {
      latitude = getNumericValue(req.user.latitude);
      longitude = getNumericValue(req.user.longitude);
    }

    finalLocation = finalLocation
      ? String(finalLocation).trim()
      : finalLocation;
    if (!finalLocation) {
      return res.status(400).json({
        message: "Location is required for booking",
      });
    }

    // ❌ LOCATION REQUIRED
    if (latitude === null || longitude === null) {
      return res.status(400).json({
        message: "Location required for booking",
      });
    }

    const areaContext = await resolveServiceAreaContext({
      user: { latitude, longitude },
      query: {},
      body: {},
    });
    const matchedArea = areaContext.matchedArea;

    // ❌ OUTSIDE SERVICE AREA
    if (!matchedArea) {
      return res.status(400).json({
        message: "Service not available in your location",
      });
    }

    const setting = await AppSetting.findOne();
    const taxPercent = setting?.tax || 0;

    const completionOtp = generateOTP();
    const bookings = [];

    const bookingsTransaction = await Booking.sequelize.transaction();

    try {
      // 🔒 SAFE GROUP ID GENERATION
      const lastGroupBooking = await Booking.findOne({
        attributes: ["groupId"],
        where: { groupId: { [Op.ne]: null } },
        order: [["groupId", "DESC"]],
        transaction: bookingsTransaction,
        lock: bookingsTransaction.LOCK.UPDATE,
      });

      const groupId = (lastGroupBooking?.groupId || 0) + 1;

      // 🔁 LOOP SERVICES
      for (const serviceId of selectedServiceIds) {
        const service = await Service.findByPk(serviceId, {
          transaction: bookingsTransaction,
          include: [
            {
              model: Warranty,
              as: "warranties",
              where: { status: "active" },
              limit: 1,
              required: false,
            },
          ],
        });

        if (!service) continue;

        const appliedWarranty =
          service.warranties?.length > 0 ? service.warranties[0] : null;

        // 💰 AREA BASED PRICE
        const areaPrice = await ServiceAreaPrice.findOne({
          where: {
            serviceId,
            areaId: matchedArea.id,
          },
          transaction: bookingsTransaction,
        });

        const finalPrice = areaPrice?.price ?? service.price;

        // 🧾 CREATE BOOKING
        const booking = await Booking.create(
          {
            userId,
            serviceId,
            bookingDate,
            bookingTime,
            location: finalLocation,
            specialNote: specialNote || "",
            priceAtBooking: finalPrice,
            basePriceAtBooking: finalPrice,
            taxPercentageAtBooking: taxPercent,
            status: "pending",
            latitude,
            longitude,
            completionOtp,
            groupId,
            areaId: matchedArea.id, // 🔥 IMPORTANT
            warrantyId: appliedWarranty ? appliedWarranty.id : null,
          },
          { transaction: bookingsTransaction },
        );

        bookings.push(booking);
      }

      await bookingsTransaction.commit();

      // 🔔 SEND TO NEARBY ONLINE PROVIDERS
      await emitToNearbyOnlineProviders(latitude, longitude, "new-order", {
        groupId,
        bookingDate,
        bookingTime,
        location: finalLocation,
        area: matchedArea.name,
        services: bookings.map((b) => ({
          id: b.id,
          serviceId: b.serviceId,
          price: b.priceAtBooking,
        })),
      });

      return res.status(201).json({
        message: "Services booked successfully",
        groupId,
        area: matchedArea.name,
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
      userId = "",
      providerId = "",
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const where = {};
    if (userId) {
      where.userId = userId;
    }

    if (providerId) {
      where.providerId = providerId;
    }

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
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone"],
        },
        {
          model: User,
          as: "provider",
          attributes: ["id", "name", "email", "phone", "latitude", "longitude"],
        },
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
        {
          model: Warranty,
          as: "appliedWarranty",
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

    if (!providerId) {
      return res.status(400).json({ message: "providerId is required" });
    }

    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Service, as: "service", attributes: ["id", "title"] },
        { model: User, as: "user", attributes: ["id", "name"] },
      ],
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.providerId = providerId;
    await booking.save();

    const provider = await User.findByPk(providerId, {
      attributes: ["id", "name", "fcmToken"],
    });

    if (provider?.fcmToken) {
      const notificationResult = await sendNotification({
        token: provider.fcmToken,
        title: "New booking assigned",
        body: `You have been assigned booking #${bookingId}${booking.service?.title ? ` for ${booking.service.title}` : ""}.`,
        data: {
          type: "booking_assigned",
          bookingId: String(bookingId),
          providerId: String(providerId),
          groupId: booking.groupId ? String(booking.groupId) : "",
          navigateTo: "bookings",
        },
      });

      if (!notificationResult.success) {
        console.error(
          "Error sending provider assignment notification:",
          notificationResult.error,
        );

        if (isInvalidFcmTokenError(notificationResult.errorCode)) {
          await provider.update({ fcmToken: null });
          console.warn(
            `Cleared invalid FCM token for provider ${providerId} after assignment notification failure.`,
          );
        }
      }
    }

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

    if (!providerId) {
      return res.status(400).json({ message: "providerId is required" });
    }

    const bookings = await Booking.findAll({
      where: { groupId },
      include: [
        { model: Service, as: "service", attributes: ["id", "title"] },
        { model: User, as: "user", attributes: ["id", "name"] },
      ],
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "Group not found" });
    }

    await Booking.update({ providerId }, { where: { groupId } });

    const provider = await User.findByPk(providerId, {
      attributes: ["id", "name", "fcmToken"],
    });

    if (provider?.fcmToken) {
      const notificationResult = await sendNotification({
        token: provider.fcmToken,
        title: "New group booking assigned",
        body: `You have been assigned ${bookings.length} booking${bookings.length > 1 ? "s" : ""} in group #${groupId}.`,
        data: {
          type: "group_booking_assigned",
          groupId: String(groupId),
          providerId: String(providerId),
          bookingId: String(bookings[0].id),
          navigateTo: "bookings",
        },
      });

      if (!notificationResult.success) {
        console.error(
          "Error sending group assignment notification:",
          notificationResult.error,
        );

        if (isInvalidFcmTokenError(notificationResult.errorCode)) {
          await provider.update({ fcmToken: null });
          console.warn(
            `Cleared invalid FCM token for provider ${providerId} after group assignment notification failure.`,
          );
        }
      }
    }

    res.json({ message: "Assigned to all" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
const statusUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByPk(id, {
      include: [{ model: Warranty, as: "appliedWarranty" }],
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Calculate completion dates when booking is marked as completed
    let updateData = { status };
    if (status === "completed") {
      const completedAt = new Date();
      updateData.completedAt = completedAt;

      // Set warranty expiry date (use warranty duration if available, else 30 days default)
      if (booking.appliedWarranty) {
        const warrantyExpiryDate = new Date(
          completedAt.getTime() +
          booking.appliedWarranty.durationInDays * 24 * 60 * 60 * 1000,
        );
        updateData.warrantyExpiryDate = warrantyExpiryDate;
      } else {
        // 🔥 Default to 30 days warranty even if no warranty is explicitly set
        const warrantyExpiryDate = new Date(
          completedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
        );
        updateData.warrantyExpiryDate = warrantyExpiryDate;
      }
    }

    await Booking.update(updateData, { where: { groupId: booking.groupId } });

    const updated = await Booking.findAll({
      where: { groupId: booking.groupId },
      include: ["user", "provider", "service", "appliedWarranty"],
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

    const bookings = await Booking.findAll({
      where: { groupId },
      include: [{ model: Warranty, as: "appliedWarranty" }],
    });

    if (!bookings.length) {
      return res.status(404).json({ message: "Group not found" });
    }

    // 🔥 Set warranty dates when marking as completed
    if (status === "completed") {
      for (const booking of bookings) {
        const completedAt = new Date();
        let warrantyExpiryDate;

        if (booking.appliedWarranty) {
          warrantyExpiryDate = new Date(
            completedAt.getTime() +
            booking.appliedWarranty.durationInDays * 24 * 60 * 60 * 1000,
          );
        } else {
          // 🔥 Default to 30 days warranty for bookings without explicit warranty
          warrantyExpiryDate = new Date(
            completedAt.getTime() + 30 * 24 * 60 * 60 * 1000,
          );
        }

        await booking.update({
          status,
          completedAt,
          warrantyExpiryDate,
        });
      }
    } else {
      // 🔥 Update status only for non-completed statuses
      await Booking.update({ status }, { where: { groupId } });
    }

    const updated = await Booking.findAll({
      where: { groupId },
      include: ["user", "provider", "service", "appliedWarranty"],
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
    const areaContext = await resolveServiceAreaContext(req);
    console.log("Resolved Area Context:", areaContext);
    const servicedetail = await Service.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "image"],
        },
        {
          model: Service,
          as: "relatedServices",
          attributes: ["id", "title", "price", "mainimage"],
          through: { attributes: [] },
        },
      ],
    });

    if (!servicedetail) {
      return res.status(404).json({ message: "Service not found" });
    }

    let areaPrice = null;
    if (areaContext.matchedArea?.id) {
      const serviceAreaPrice = await ServiceAreaPrice.findOne({
        where: {
          serviceId: id,
          areaId: areaContext.matchedArea.id,
        },
      });
      areaPrice = serviceAreaPrice?.price ?? null;
    }
    console.log("Area Price for Service:", areaPrice);
    const relatedAreaPriceMap = await getAreaPriceMap(
      servicedetail.relatedServices?.map(
        (relatedService) => relatedService.id,
      ) || [],
      areaContext.matchedArea?.id,
    );

    res.json({
      servicedetail: serializeServiceWithAreaPrice(
        servicedetail,
        areaContext.matchedArea,
        areaPrice,
        relatedAreaPriceMap,
      ),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const popularService = async (req, res) => {
  try {
    let { limit = 10 } = req.query;
    limit = parseInt(limit);
    const areaContext = await resolveServiceAreaContext(req);

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

    const areaPriceMap = await getAreaPriceMap(
      services.map((service) => service.id),
      areaContext.matchedArea?.id,
    );

    const data = services.map((service) =>
      serializeServiceWithAreaPrice(
        service,
        areaContext.matchedArea,
        areaPriceMap.get(String(service.id)),
      ),
    );

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
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

/**
 * 🔄 SYNC RATES TO CATEGORY
 * Copies rates from source service to all other services in same category
 */
const syncRatesToCategory = async (req, res) => {
  const transaction = await ServiceRate.sequelize.transaction();
  try {
    const { serviceId } = req.params;
    const { mode } = req.body; // 'replace' or 'append'

    const sourceService = await Service.findByPk(serviceId);
    if (!sourceService) {
      return res
        .status(404)
        .json({ success: false, message: "Source service not found" });
    }

    // 1. Get source rates
    const sourceRates = await ServiceRate.findAll({
      where: { serviceId },
    });

    if (sourceRates.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Source service has no rates" });
    }

    // 2. Get target services in same category
    const targetServices = await Service.findAll({
      where: {
        categoryId: sourceService.categoryId,
        id: { [Op.ne]: serviceId },
      },
    });

    for (const targetService of targetServices) {
      // 3. Handle replace mode
      if (mode === "replace") {
        await ServiceRate.destroy({
          where: { serviceId: targetService.id },
          transaction,
        });
      }

      // 4. Create copies
      const newRates = sourceRates.map((rate) => ({
        serviceId: targetService.id,
        title: rate.title,
        price: rate.price,
        status: rate.status,
      }));

      await ServiceRate.bulkCreate(newRates, { transaction });

      // 5. Update heading if source has one
      if (sourceService.rateListHeading) {
        await targetService.update(
          { rateListHeading: sourceService.rateListHeading },
          { transaction },
        );
      }
    }

    await transaction.commit();
    res.json({
      success: true,
      message: `Successfully synced rates to ${targetServices.length} services`,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ➕ BULK ADD RATE
 * Adds a new rate to all services in a category
 */
const bulkAddRate = async (req, res) => {
  const transaction = await ServiceRate.sequelize.transaction();
  try {
    const { serviceId, title, price } = req.body;

    const sourceService = await Service.findByPk(serviceId);
    if (!sourceService) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const allServices = await Service.findAll({
      where: { categoryId: sourceService.categoryId },
    });

    const ratesToCreate = allServices.map((service) => ({
      serviceId: service.id,
      title,
      price,
    }));

    await ServiceRate.bulkCreate(ratesToCreate, { transaction });

    await transaction.commit();
    res.json({
      success: true,
      message: `Rate added to all ${allServices.length} services in category`,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 📝 BULK UPDATE RATE
 * Updates rates with matching title across category
 * (Matching by title because individual services have different IDs)
 */
const bulkUpdateRate = async (req, res) => {
  const transaction = await ServiceRate.sequelize.transaction();
  try {
    const { serviceId, oldTitle, title, price, status } = req.body;

    const sourceService = await Service.findByPk(serviceId);
    if (!sourceService) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const allServices = await Service.findAll({
      where: { categoryId: sourceService.categoryId },
      attributes: ["id"],
    });

    const serviceIds = allServices.map((s) => s.id);

    const [updatedCount] = await ServiceRate.update(
      { title, price, status },
      {
        where: {
          serviceId: serviceIds,
          title: oldTitle,
        },
        transaction,
      },
    );

    await transaction.commit();
    res.json({
      success: true,
      message: `Updated ${updatedCount} rates across category`,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 🗑️ BULK DELETE RATE
 * Deletes rates with matching title across category
 */
const bulkDeleteRate = async (req, res) => {
  const transaction = await ServiceRate.sequelize.transaction();
  try {
    const { serviceId, title } = req.body;

    const sourceService = await Service.findByPk(serviceId);
    if (!sourceService) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    const allServices = await Service.findAll({
      where: { categoryId: sourceService.categoryId },
      attributes: ["id"],
    });

    const serviceIds = allServices.map((s) => s.id);

    const deletedCount = await ServiceRate.destroy({
      where: {
        serviceId: serviceIds,
        title: title,
      },
      transaction,
    });

    await transaction.commit();
    res.json({
      success: true,
      message: `Deleted ${deletedCount} rates across category`,
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, message: error.message });
  }
};

// controllers/service.controller.js

const getRelatedServices = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const areaContext = await resolveServiceAreaContext(req);

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

    const relatedServices = service.relatedServices || [];
    const areaPriceMap = await getAreaPriceMap(
      relatedServices.map((item) => item.id),
      areaContext.matchedArea?.id,
    );

    return res.json({
      success: true,
      data: relatedServices.map((item) =>
        serializeServiceWithAreaPrice(
          item,
          areaContext.matchedArea,
          areaPriceMap.get(String(item.id)),
        ),
      ),
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

  // BULK ACTIONS
  syncRatesToCategory,
  bulkAddRate,
  bulkUpdateRate,
  bulkDeleteRate,
};
