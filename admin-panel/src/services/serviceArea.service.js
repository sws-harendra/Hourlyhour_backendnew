import api from "./api";

export const ServiceAreaService = {
  getAll: async () => {
    const { data } = await api.get(`/service-area`);
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/service-area/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post(`/service-area`, payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/service-area/${id}`, payload);
    return data;
  },

  delete: async (id) => {
    const { data } = await api.delete(`/service-area/${id}`);
    return data;
  },
};