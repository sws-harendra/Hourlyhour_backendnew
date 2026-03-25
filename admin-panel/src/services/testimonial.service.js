import api from "./api";

const TestimonialService = {
  getAll: () => api.get("/testimonial"),
  getById: (id) => api.get(`/testimonial/${id}`),
  create: (data) => api.post("/testimonial", data),
  update: (id, data) => api.put(`/testimonial/${id}`, data),
  remove: (id) => api.delete(`/testimonial/${id}`),
};

export default TestimonialService;
