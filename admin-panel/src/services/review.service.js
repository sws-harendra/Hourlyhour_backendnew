import API from "./api";

export const ReviewService = {
  getAllReviews: async (params = {}) => {
    try {
      const { page = 1, limit = 10, search = "", providerId = "" } = params;
      const response = await API.get("/review/admin", {
        params: { page, limit, search, providerId },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      throw error;
    }
  },

  getProviderReviews: async (providerId) => {
    try {
      const response = await API.get(`/review/provider/${providerId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching provider reviews:", error);
      throw error;
    }
  },
};
