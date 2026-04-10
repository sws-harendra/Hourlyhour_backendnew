import api from "./api";

export const WarrantyService = {
  createWarranty: async (data) => {
    return await api.post("/warranty/admin", data);
  },
  getAllWarranties: async () => {
    return await api.get("/warranty/admin");
  },
  updateWarranty: async (id, data) => {
    return await api.put(`/warranty/admin/${id}`, data);
  },
  deleteWarranty: async (id) => {
    return await api.delete(`/warranty/admin/${id}`);
  },
  getByService: async (serviceId) => {
    return await api.get(`/warranty/service/${serviceId}`);
  },
};
