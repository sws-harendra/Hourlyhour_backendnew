const {
  sequelize,
  ServiceArea,
  ServiceAreaPrice,
  Service,
} = require("../models");

const getAreaPriceRows = async (areaId) => {
  const [services, areaPrices] = await Promise.all([
    Service.findAll({
      where: { status: "active" },
      attributes: ["id", "title", "price", "mainimage", "status"],
      order: [["title", "ASC"]],
    }),
    ServiceAreaPrice.findAll({
      where: { areaId },
      include: [
        {
          model: Service,
          as: "service",
          attributes: ["id", "title", "price", "mainimage", "status"],
        },
      ],
      order: [["id", "ASC"]],
    }),
  ]);

  const priceMap = new Map(
    areaPrices.map((item) => [String(item.serviceId), item]),
  );

  const rows = services.map((service) => {
    const areaPrice = priceMap.get(String(service.id));
    return {
      serviceId: service.id,
      title: service.title,
      mainimage: service.mainimage,
      basePrice: Number(service.price) || 0,
      areaPriceId: areaPrice?.id || null,
      price: areaPrice?.price ?? service.price ?? 0,
      hasOverride: Boolean(areaPrice),
    };
  });

  return { rows, areaPrices };
};

exports.getPricesByArea = async (req, res) => {
  try {
    const { areaId } = req.params;

    const area = await ServiceArea.findByPk(areaId);
    if (!area) {
      return res.status(404).json({
        success: false,
        message: "Service area not found",
      });
    }

    const { rows } = await getAreaPriceRows(areaId);

    res.json({
      success: true,
      data: {
        area,
        rows,
      },
    });
  } catch (error) {
    console.error("Get area prices error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.bulkUpsertPricesByArea = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { areaId } = req.params;
    const { prices = [] } = req.body;

    const area = await ServiceArea.findByPk(areaId, { transaction });
    if (!area) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Service area not found",
      });
    }

    if (!Array.isArray(prices)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "prices must be an array",
      });
    }

    for (const item of prices) {
      const serviceId = Number(item.serviceId);
      const price = Number(item.price);

      if (!serviceId || Number.isNaN(price)) continue;

      const service = await Service.findByPk(serviceId, { transaction });
      if (!service) continue;

      const basePrice = Number(service.price) || 0;
      const existing = await ServiceAreaPrice.findOne({
        where: { areaId, serviceId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (price === basePrice) {
        if (existing) {
          await existing.destroy({ transaction });
        }
        continue;
      }

      if (existing) {
        await existing.update({ price }, { transaction });
      } else {
        await ServiceAreaPrice.create(
          {
            areaId,
            serviceId,
            price,
          },
          { transaction },
        );
      }
    }

    await transaction.commit();

    const payload = await getAreaPriceRows(areaId);

    res.json({
      success: true,
      message: "Service area prices saved successfully",
      data: payload.rows,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Bulk upsert area prices error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletePriceByArea = async (req, res) => {
  try {
    const { areaId, id } = req.params;

    const deleted = await ServiceAreaPrice.destroy({
      where: {
        id,
        areaId,
      },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Area price not found",
      });
    }

    res.json({
      success: true,
      message: "Area price deleted successfully",
    });
  } catch (error) {
    console.error("Delete area price error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
