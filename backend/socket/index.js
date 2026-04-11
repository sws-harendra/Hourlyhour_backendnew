// socket.js
const { Server } = require("socket.io");
const { Booking, sequelize, User, AppSetting } = require("../models"); // ✅ IMPORT MODEL
const { getNearbyOnlineProviders } = require("../helpers/getNearbyProvider");

let io;

/**
 * providerId -> socketId
 */
const onlineProviders = new Map();

const initSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    /* ───────── PROVIDER JOIN ───────── */
    socket.on("provider-join", (providerId) => {
      if (!providerId) return;

      onlineProviders.set(providerId.toString(), socket.id);
      socket.providerId = providerId;

      console.log(`✅ Provider online: ${providerId}`);
    });

    /* ───────── CONFIRM ORDER ───────── */
    // socket.js
    socket.on("confirm-order", async ({ groupId }) => {
      const transaction = await sequelize.transaction();
      console.log(groupId);
      try {
        if (!socket.providerId) {
          socket.emit("order-unavailable", { groupId });
          return;
        }

        /** 1️⃣ Lock booking */
        const booking = await Booking.findOne({
          where: { groupId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!booking || booking.status !== "pending") {
          await transaction.rollback();
          socket.emit("order-unavailable", { groupId });
          return;
        }

        /** 2️⃣ Lock provider user */
        const provider = await User.findOne({
          where: { id: socket.providerId },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!provider) {
          await transaction.rollback();
          socket.emit("order-unavailable", { groupId });
          return;
        }
        console.log(
          "Booking:",
          booking?.status,
          socket.providerId,
          "Provider Wallet:",
          provider?.wallet,
        );

        /** 3️⃣ Get App Settings (single row) */
        const appSetting = await AppSetting.findByPk(1, { transaction });

        if (!appSetting) {
          await transaction.rollback();
          socket.emit("order-error", {
            message: "App settings not configured",
          });
          return;
        }

        const { minimumBalance, adminCommissionPercent } = appSetting;

        /** 4️⃣ Check minimum wallet balance */
        if (provider.wallet < minimumBalance) {
          await transaction.rollback();
          socket.emit("insufficient-balance", {
            orderId,
            wallet: provider.wallet,
            minimumBalance,
          });
          return;
        }

        /** 5️⃣ Calculate admin commission */
        const commissionAmount =
          (booking.priceAtBooking * adminCommissionPercent) / 100;

        /** 6️⃣ Deduct commission */
        provider.wallet = provider.wallet - commissionAmount;
        await provider.save({ transaction });

        /** 7️⃣ Accept booking */
        await Booking.update(
          {
            status: "confirmed",
            providerId: socket.providerId,
          },
          {
            where: { groupId: booking.groupId },
            transaction,
          },
        );
        /** 8️⃣ Commit */
        await transaction.commit();

        /** 9️⃣ Notify others */
        socket.broadcast.emit("order-taken", {
          groupId: booking.groupId,

          acceptedBy: socket.providerId,
        });

        socket.emit("order-accepted", {
          groupId: booking.groupId,
          deducted: commissionAmount,
          walletLeft: provider.wallet,
        });
      } catch (err) {
        await transaction.rollback();
        console.error("❌ confirm-order socket error:", err);

        socket.emit("order-error", {
          message: "Something went wrong",
        });
      }
    });

    /* ───────── LIVE LOCATION ───────── */
    socket.on("provider-location", (data) => {
      const { orderId, lat, lng } = data;

      socket.on("provider-location", async (data) => {
        const { orderId, lat, lng } = data;

        // 🔎 Find booking → get userId
        const booking = await Booking.findByPk(orderId);
        if (!booking) return;

        const userSocketId = onlineUsers.get(booking.userId.toString());

        if (userSocketId) {
          io.to(userSocketId).emit("provider-location-update", {
            lat,
            lng,
            orderId,
          });
        }
      });
    });
    /* ───────── DISCONNECT ───────── */
    socket.on("disconnect", () => {
      if (socket.providerId) {
        onlineProviders.delete(socket.providerId.toString());
        console.log(`❌ Provider offline: ${socket.providerId}`);
      }
    });
  });

  return io;
};

/* ───────── HELPERS ───────── */

const getIO = () => io;

const emitToProvider = (providerId, event, payload) => {
  const socketId = onlineProviders.get(providerId.toString());
  if (socketId && io) {
    io.to(socketId).emit(event, payload);
  }
};
const emitToSpecificProviders = (providerIds, event, data) => {
  providerIds.forEach((id) => {
    const socketId = onlineProviders[id]; // you must track this
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  });
};
const emitToNearbyOnlineProviders = async (
  latitude,
  longitude,
  event,
  payload,
) => {
  if (!latitude || !longitude) return;

  // 1️⃣ Online providers from socket memory
  const onlineProviderIds = Array.from(onlineProviders.keys()).map(Number);

  if (onlineProviderIds.length === 0) return;

  // 2️⃣ DB geo filter
  const nearbyProviders = await getNearbyOnlineProviders(
    latitude,
    longitude,
    onlineProviderIds,
  );

  // 3️⃣ Emit socket
  for (const provider of nearbyProviders) {
    emitToProvider(provider.id, event, payload);
  }
};

const emitToAllProviders = (event, payload) => {
  if (io) io.emit(event, payload);
};

module.exports = {
  initSocket,
  getIO,
  emitToProvider,
  emitToAllProviders,
  onlineProviders,
  emitToNearbyOnlineProviders,
  emitToSpecificProviders,
};
