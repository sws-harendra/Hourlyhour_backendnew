const { generateOTP } = require("../helpers/otp_generator");
const jwt = require("jsonwebtoken");
const {
  Otp,
  User,
  UserService,
  Address,
  Service,
  Category,
} = require("../models");
const { Op } = require("sequelize");
const { ValidationError } = require("sequelize");
const path = require("path");
const fs = require("fs");
const sendOtptoPhone = require("../helpers/otp_send");

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res
        .status(400)
        .json({ success: false, message: "Phone required" });
    if (phone === "+911234567890") {
      return res.json({
        success: true,
        message: "Test OTP sent successfully",
        otp: "123456", // optional — can be hidden in production
      });
    }

    const otp = generateOTP();
    await Otp.create({
      phone: phone,
      otp,
      type: "login", // or register
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    });
    // const sent = await sendOtptoPhone(phone, otp);

    console.log(otp);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, userType } = req.body;
    if (!phone)
      return res
        .status(400)
        .json({ success: false, message: "Phone required" });

    if (!otp)
      return res.status(400).json({ success: false, message: "OTP required" });
    if (phone === "+911234567890" && otp === "1234") {
      let user = await User.findOne({ where: { phone } });

      if (!user) {
        user = await User.create({
          phone,
          userType,
          lastLogin: new Date(),
        });
      }

      const token = jwt.sign({ id: user.id, phone }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.json({
        success: true,
        token,
        profileCompleted: true,
        userType: user.userType,
        message: "OTP verified successfully (test)",
      });
    }

    // 🔹 Find last OTP
    const otpRecord = await Otp.findOne({
      where: { phone, otp, used: false },
      order: [["createdAt", "DESC"]],
    });

    if (!otpRecord)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    // 🔹 Check expiration
    if (otpRecord.expiresAt < new Date())
      return res.status(400).json({ success: false, message: "OTP expired" });

    // 🔹 Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    let user = await User.findOne({ where: { phone } });

    // 🔹 If new user → create user
    if (!user) {
      user = await User.create({
        phone,
        lastLogin: new Date(),
        userType: userType,
      });
    } else {
      user.lastLogin = new Date();
      await user.save();
    }
    console.log(user);
    let profileCompleted = true;

    if (user.userType == "service_provider") {
      if (
        !user.name ||
        !user.address ||
        user.name == undefined ||
        user.address == undefined
      ) {
        profileCompleted = false;
      }
    }
    console.log("profileCompleted", profileCompleted);

    const token = jwt.sign(
      { id: user.id, phone: phone },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      success: true,
      token,
      profileCompleted,
      userType: user.userType,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
  }
};

const userData = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Address,
          as: "addresses",
        },
      ],
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    let profileCompleted = true;
    if (user.userType == "service_provider") {
      if (
        !user.name ||
        !user.address ||
        user.name == undefined ||
        user.address == undefined
      ) {
        profileCompleted = false;
      }
    }
    return res.json({
      success: true,
      profileCompleted,
      message: "User data retrieved successfully",
      user,
    });
  } catch (err) {
    console.error("Error retrieving user data:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve user data" });
  }
};

// ===============================================================================================================
// 🔐 Above all are common for all user type
// ===============================================================================================================

const allusers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sort = req.query.sort || "id";
    const order = req.query.order || "DESC";

    const offset = (page - 1) * limit;

    const whereClause = search
      ? {
          name: { [Op.like]: `%${search}%` },
        }
      : {};

    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      order: [[sort, order]],
      limit,
      offset,
    });

    return res.json({
      success: true,
      message: "All users retrieved successfully",
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("Error retrieving users:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve users" });
  }
};

const allServiceProvider = async (req, res) => {
  try {
    // Query params
    const page = parseInt(req.query.page) || 1; // ?page=1
    const limit = parseInt(req.query.limit) || 10; // ?limit=10
    const search = req.query.search || ""; // ?search=john
    const sortBy = req.query.sortBy || "createdAt"; // ?sortBy=name
    const order = req.query.order || "DESC"; // ?order=ASC

    const offset = (page - 1) * limit;

    // Sequelize filters
    const where = {
      userType: "service_provider",
    };

    // Search on name, email, phone etc.
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const providers = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortBy, order]], // Sorting
    });

    return res.json({
      success: true,
      message: "All service providers retrieved successfully",
      currentPage: page,
      totalPages: Math.ceil(providers.count / limit),
      totalRecords: providers.count,
      data: providers.rows,
    });
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
    });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      phone,
      name,
      email,
      userType,
      address,
      profilePicture,
      status,
      gender,
      bio,
    } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone required" });
    }

    const payload = {
      phone,
      name: name || null,
      email: email || null,
      userType: userType || "user",
      address: address || null,
      profilePicture: profilePicture || null,
      status: status || undefined,
      gender: gender || null,
      bio: bio || null,
    };

    const created = await User.create(payload);
    return res
      .status(201)
      .json({ success: true, message: "User created", data: created });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ success: false, message: "Phone or email already exists" });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error("Error creating user:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create user" });
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fields allowed to update
    const { name, email, address, gender, bio } = req.body;

    // Prepare updated values
    let updatedData = {
      name,
      email,
      // address,
      gender,
      bio,
    };

    // If profile picture uploaded
    if (req.file) {
      // Delete previous file if exists
      if (user.profilePicture) {
        const oldPath = path.join(__dirname, "../uploads", user.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updatedData.profilePicture = `${process.env.BACKEND_URL}/uploads/${fileUrl}`;
    }

    // Update DB
    await user.update(updatedData);

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
      success: true,
    });
  } catch (error) {
    console.log("Update Error:", error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

const completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, services } = req.body;

    if (!name || !address)
      return res.status(400).json({
        success: false,
        message: "Name & address required",
      });

    if (!Array.isArray(services) || services.length === 0)
      return res.status(400).json({
        success: false,
        message: "Select at least one service",
      });

    // 🔹 Update user info
    await User.update({ name, address }, { where: { id: userId } });

    // 🔹 Replace services
    await UserService.destroy({ where: { userId } });

    await UserService.bulkCreate(
      services.map((serviceId) => ({
        userId,
        serviceId,
      }))
    );

    return res.json({
      success: true,
      message: "Profile completed successfully",
    });
  } catch (err) {
    console.error("completeProfile:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const toggleActiveUser = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ lowercase id
    const { isActive } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ convert boolean → status string
    user.status = isActive ? "active" : "offline";

    await user.save(); // ✅ persist to DB

    return res.status(200).json({
      success: true,
      status: user.status,
    });
  } catch (error) {
    console.error("Toggle Active Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    await user.destroy();
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

const updateUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, email, userType, status } = req.body;

    await user.update({
      name,
      phone,
      email,
      userType,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Admin update error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const addToWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    if (!userId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "userId and amount are required" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.wallet = (user.wallet || 0) + parseFloat(amount);
    await user.save();
    return res.json({
      success: true,
      message: "Amount added to wallet successfully",
      walletBalance: user.wallet,
    });
  } catch (err) {
    console.error("Error adding to wallet:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to add to wallet" });
  }
};

const updateUserAddress = async (req, res, next) => {
  try {
    const { id, addressType, ...rest } = req.body;

    if (id) {
      // EDIT existing address
      const address = await Address.findOne({
        where: { id, userId: req.user.id },
      });
      if (!address)
        return res
          .status(404)
          .json({ success: false, message: "Address not found" });

      // Optional: check if new type conflicts with other addresses
      const conflict = await Address.findOne({
        where: { userId: req.user.id, addressType, id: { [Op.ne]: id } },
      });
      if (conflict)
        return res.status(400).json({
          success: false,
          message: `${addressType} already exists`,
        });

      await address.update({ addressType, ...rest });
      return res.json({ success: true, address });
    }

    // ADD new address
    const exists = await Address.findOne({
      where: { userId: req.user.id, addressType },
    });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: `${addressType} already exists` });

    const newAddress = await Address.create({
      ...rest,
      addressType,
      userId: req.user.id,
    });
    res.json({ success: true, address: newAddress });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Delete address
const deleteUserAddress = async (req, res, next) => {
  try {
    await Address.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    const addresses = await Address.findAll({ where: { userId: req.user.id } });
    res.json({ success: true, addresses });
  } catch (err) {
    next(new ErrorHandler(err.message, 500));
  }
};

// controllers/provider.controller.js
const updateProviderLocation = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { latitude, longitude } = req.body;
    console.log("Update location:", { providerId, latitude, longitude });
    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "Latitude and longitude are required",
      });
    }

    await User.update({ latitude, longitude }, { where: { id: providerId } });

    return res.json({
      success: true,
      message: "Location updated successfully",
      latitude,
      longitude,
    });
  } catch (error) {
    console.error("Update location error:", error);
    res.status(500).json({ error: "Failed to update location" });
  }
};
const getMyServices = async (req, res) => {
  try {
    // Get all UserService entries for this user
    const userServices = await UserService.findAll({
      where: { userId: req.user.id },
      attributes: ["serviceId"], // Only get service IDs
    });
    // console.log(userServices);
    // Extract just the service IDs
    const serviceIds = userServices.map((us) => us.serviceId);
    console.log(serviceIds);

    // Now fetch the actual services
    const services = await Service.findAll({
      where: { id: serviceIds },
      include: [
        {
          model: Category,
          as: "category",
        },
      ],
    });
    // console.log(services);

    return res.status(200).json({
      success: true,
      services: services,
      serviceIds: serviceIds, // Optional: for debugging
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
const updateMyServices = async (req, res) => {
  try {
    const { services } = req.body; // array of serviceIds

    if (!Array.isArray(services)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid services payload" });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await user.setServices(services);

    return res.json({
      success: true,
      message: "Services updated successfully",
    });
  } catch (error) {
    console.error("Update My Services Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  userData,
  allusers,
  allServiceProvider,
  createUser,
  editProfile,
  completeProfile,
  toggleActiveUser,
  deleteUser,
  updateUserByAdmin,
  addToWallet,
  updateUserAddress,
  deleteUserAddress,
  updateProviderLocation,
  getMyServices,
  updateMyServices,
};
