// services/ServiceRequestService.js
import api from "./api";

const ServiceRequestService = {
  // Admin
  getAll: () => api.get("/serviceRequest"),

  updateStatus: (id, data) => api.put(`/serviceRequest/${id}/status`, data),

  // User
  create: (data) => api.post("/serviceRequest", data),

  getMy: () => api.get("/serviceRequest/my"),
};

export default ServiceRequestService;
