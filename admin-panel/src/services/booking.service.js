import api from "./api";

export const BookingService = {
  getAll: (params) => api.get("/service/all-bookings", { params }),
  getBookingDetail: async (id) => {
    const { data } = await api.get(`/service/booking/${id}`);
    return { data };
  },

  assignProvider: async (id, providerId) => {
    const { data } = await api.post(`/service/booking/${id}/assign-provider`, {
      providerId,
    });
    return data;
  },
  updateStatus: async (id, status) => {
    return await api.put(`/service/booking/${id}/status`, { status });
  },
  downloadSingleInvoice: async (bookingId) => {
    const response = await api.get(`/invoice/admin/${bookingId}`, {
      responseType: "blob",
    });
    return response;
  },

  downloadGroupInvoice: async (groupId) => {
    const response = await api.get(`/invoice/admin/group/${groupId}`, {
      responseType: "blob",
    });
    return response;
  },
  getGroupBookings(groupId) {
    return api.get(`/service/booking/group/${groupId}`);
  },

  assignProviderToGroup(groupId, providerId) {
    return api.put(`/service/booking/group/${groupId}/assign`, { providerId });
  },
  updateGroupStatus(groupId, status) {
    return api.put(`/service/booking/group/${groupId}/status`, { status });
  },
  deleteBooking: async (id) => {
    return await api.delete(`/booking/${id}`);
  },
};
