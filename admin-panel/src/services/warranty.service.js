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
  // Warranty Claims Management
  getAllClaims: async (filters = {}) => {
    return await api.get("/warranty/claims/all", { params: filters });
  },
  updateClaimStatus: async (claimId, data) => {
    return await api.put(`/warranty/claim/${claimId}/status`, data);
  },
  getClaimById: async (claimId) => {
    return await api.get(`/warranty/claim/${claimId}`);
  },
};
