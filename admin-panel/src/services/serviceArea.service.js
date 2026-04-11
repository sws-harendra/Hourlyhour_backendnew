import api from "./api";

export const ServiceAreaService = {
  getById: async (id) => {
    const { data } = await api.get(`/service-area/${id}`);
    return data;
  },
};
