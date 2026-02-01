import api from "./api";

const CouponService = {
  getAll: () => api.get("coupon/all"),
  getByCode: (code) => api.get(`coupon/code/${encodeURIComponent(code)}`),
  create: (data) => api.post("coupon/create", data),
  remove: (id) => api.delete(`coupon/${id}`),
};

export default CouponService;
