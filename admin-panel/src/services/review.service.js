import API from "./api";

export const ReviewService = {
  getAllReviews: async () => {
    try {
      const response = await API.get("/api/review/admin");
      return response.data;
    } catch (error) {
      console.error("Error fetching all reviews:", error);
      throw error;
    }
  },

  getProviderReviews: async (providerId) => {
    try {
      const response = await API.get(`/api/review/provider/${providerId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching provider reviews:", error);
      throw error;
    }
  },
};
