const turf = require("@turf/turf");
const { Op } = require("sequelize");
const { Address, ServiceArea, ServiceAreaPrice } = require("../models");

const getNumericValue = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatAddressLabel = (address) => {
  if (!address) return null;

  const parts = [
    address.address1,
    address.city,
    address.state,
    address.zipCode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
};

const resolveServiceAreaContext = async (req) => {
  let latitude = null;
  let longitude = null;
  let sourceLocation = null;

  const addressId = req.query?.addressId ?? req.body?.addressId;

  if (addressId && req.user?.id) {
    const address = await Address.findOne({
      where: { id: addressId, userId: req.user.id },
    });

    if (address) {
      latitude = getNumericValue(address.latitude);
      longitude = getNumericValue(address.longitude);
      sourceLocation = formatAddressLabel(address);
    }
  }

  if (latitude === null || longitude === null) {
    latitude =
      getNumericValue(req.query?.latitude) ??
      getNumericValue(req.body?.latitude);
    longitude =
      getNumericValue(req.query?.longitude) ??
      getNumericValue(req.body?.longitude);
  }

  if ((latitude === null || longitude === null) && req.user) {
    latitude = getNumericValue(req.user.latitude);
    longitude = getNumericValue(req.user.longitude);
  }

  if (latitude === null || longitude === null) {
    return {
      latitude: null,
      longitude: null,
      matchedArea: null,
      sourceLocation,
    };
  }

  const areas = await ServiceArea.findAll({
    where: { isActive: true },
  });

  const point = turf.point([longitude, latitude]);
  let matchedArea = null;

  for (const area of areas) {
    if (!area?.polygon?.coordinates) continue;

    const polygon = turf.polygon(area.polygon.coordinates);
    if (turf.booleanPointInPolygon(point, polygon)) {
      matchedArea = area;
      break;
    }
  }

  return {
    latitude,
    longitude,
    matchedArea,
    sourceLocation,
  };
};

const getAreaPriceMap = async (serviceIds, areaId) => {
  if (!areaId || !Array.isArray(serviceIds) || serviceIds.length === 0) {
    return new Map();
  }

  const prices = await ServiceAreaPrice.findAll({
    where: {
      areaId,
      serviceId: {
        [Op.in]: serviceIds,
      },
    },
  });

  return new Map(prices.map((item) => [String(item.serviceId), item.price]));
};

const serializeServiceWithAreaPrice = (
  service,
  matchedArea,
  areaPrice,
  relatedAreaPriceMap = null,
) => {
  const plainService = service.get
    ? service.get({ plain: true })
    : { ...service };
  const basePrice = getNumericValue(plainService.price);
  const effectiveAreaPrice = getNumericValue(areaPrice);
  const effectivePrice =
    effectiveAreaPrice !== null ? effectiveAreaPrice : basePrice;

  let relatedServices = plainService.relatedServices;
  if (Array.isArray(relatedServices) && relatedServices.length > 0) {
    relatedServices = relatedServices.map((relatedService) =>
      serializeServiceWithAreaPrice(
        relatedService,
        matchedArea,
        relatedAreaPriceMap?.get(String(relatedService.id)),
      ),
    );
  }

  return {
    ...plainService,
    relatedServices,
    price: effectivePrice,
    basePrice,
    areaPrice: effectiveAreaPrice,
    effectivePrice,
    areaId: matchedArea?.id ?? null,
    areaName: matchedArea?.name ?? null,
  };
};

module.exports = {
  getNumericValue,
  formatAddressLabel,
  resolveServiceAreaContext,
  getAreaPriceMap,
  serializeServiceWithAreaPrice,
};
