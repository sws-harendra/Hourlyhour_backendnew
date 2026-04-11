import api from "./api";

export const ServiceAreaPriceService = {
  getByArea: async (areaId) => {
    return await api.get(`/service-area-price/area/${areaId}`);
  },

  saveBulk: async (areaId, prices) => {
    return await api.post(`/service-area-price/area/${areaId}/bulk`, {
      prices,
    });
  },

  deletePrice: async (areaId, id) => {
    return await api.delete(`/service-area-price/area/${areaId}/${id}`);
  },

  getByService: async (serviceId) => {
    return await api.get(`/service-area-price/service/${serviceId}`);
  },

  saveByService: async (serviceId, prices) => {
    return await api.post(`/service-area-price/service/${serviceId}/bulk`, {
      prices,
    });
  },
};
