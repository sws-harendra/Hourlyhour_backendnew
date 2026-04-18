// services/service.service.js
import api from "./api";

export const ServiceService = {
  // CREATE SERVICE
  addService: async (data) => {
    return await api.post("/service/add-service", data);
  },
  getAll: (params) => api.get("/service/all-services", { params }),

  // GET SERVICES BY CATEGORY WITH PAGINATION
  getServicesByCategory: async (categoryId, page = 1, limit = 10) => {
    return await api.get(`/service/category/${categoryId}/services`, {
      params: { page, limit },
    });
  },
  getAllServices: async (params = {}) => {
    return await api.get("/service/all-services", { params });
  }, // DELETE SERVICE
  deleteService: async (id) => {
    return await api.delete(`/service/delete-service/${id}`);
  },

  // UPDATE SERVICE
  updateService: async (id, data) => {
    return await api.put(`/service/edit-service/${id}`, data);
  },
  popularServices: async (data) => {
    return await api.get("/service/popular-services", data);
  },
  getByService(serviceId) {
    return api.get(`/service/rate-list/service/${serviceId}`);
  },

  // CREATE RATE
  addRate: async (data) => {
    return await api.post("/service/add-rate-list", data);
  },

  // UPDATE RATE
  updateRate: async (id, data) => {
    return await api.put(`/service/rate-list/${id}`, data);
  },

  // DELETE RATE
  deleteRate: async (id) => {
    return await api.delete(`/service/rate-list/${id}`);
  },

  // BULK ACTIONS
  syncRatesToCategory: async (serviceId, mode = "replace") => {
    return await api.post(`/service/rate-list/sync-to-category/${serviceId}`, {
      mode,
    });
  },
  bulkAddRate: async (data) => {
    return await api.post("/service/rate-list/bulk-add", data);
  },
  bulkUpdateRate: async (data) => {
    return await api.put("/service/rate-list/bulk-update", data);
  },
  bulkDeleteRate: async (data) => {
    return await api.post("/service/rate-list/bulk-delete", data);
  },
};
