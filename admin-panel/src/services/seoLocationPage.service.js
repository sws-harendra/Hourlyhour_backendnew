import api from "./api";

export const SeoLocationPageService = {
  // Get all SEO location pages with search/filter/pagination
  getAll: async (params = {}) => {
    const res = await api.get("/seo-pages", { params });
    return res.data;
  },

  // Get single SEO page by ID
  getById: async (id) => {
    const res = await api.get(`/seo-pages/${id}`);
    return res.data;
  },

  // Get single page by slug
  getBySlug: async (slug) => {
    const res = await api.get(`/seo-pages/slug/${slug}`);
    return res.data;
  },

  // Create page
  create: async (payload) => {
    const res = await api.post("/seo-pages", payload);
    return res.data;
  },

  // Update page
  update: async (id, payload) => {
    const res = await api.put(`/seo-pages/${id}`, payload);
    return res.data;
  },

  // Delete page
  delete: async (id) => {
    const res = await api.delete(`/seo-pages/${id}`);
    return res.data;
  },

  // Bulk delete
  bulkDelete: async (ids) => {
    const res = await api.post("/seo-pages/bulk-delete", { ids });
    return res.data;
  },

  // Toggle publish/draft status
  toggleStatus: async (id) => {
    const res = await api.patch(`/seo-pages/${id}/status`);
    return res.data;
  },

  // AI Settings endpoints
  getAiSettings: async () => {
    const res = await api.get("/seo-pages/ai-settings");
    return res.data;
  },

  saveAiSettings: async (payload) => {
    const res = await api.post("/seo-pages/ai-settings", payload);
    return res.data;
  },

  // Generate content using Gemini AI
  generateAiContent: async (payload) => {
    const res = await api.post("/seo-pages/generate-ai", payload);
    return res.data;
  },

  // Humanize content (Anti-AI)
  humanizeContent: async (payload) => {
    const res = await api.post("/seo-pages/humanize", payload);
    return res.data;
  },

  // Quick add location to ServiceArea
  quickAddLocation: async (payload) => {
    const res = await api.post("/seo-pages/locations", payload);
    return res.data;
  },

  // Quick add service
  quickAddService: async (payload) => {
    const res = await api.post("/seo-pages/services", payload);
    return res.data;
  },

  // Get stats overview
  getStats: async () => {
    const res = await api.get("/seo-pages/stats");
    return res.data;
  },
};

export default SeoLocationPageService;
