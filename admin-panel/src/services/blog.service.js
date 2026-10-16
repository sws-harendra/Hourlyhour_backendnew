import api from "./api";

const BlogService = {
  // Get all blogs with optional filtering (status, category, search, page, limit)
  getAll: (params = {}) => api.get("/blogs", { params }),

  // Get single blog by slug or ID
  getBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  getById: (id) => api.get(`/blogs/${id}`),

  // Create new blog
  create: (data) => api.post("/blogs", data),

  // Update existing blog
  update: (id, data) => api.put(`/blogs/${id}`, data),

  // Delete blog
  remove: (id) => api.delete(`/blogs/${id}`),

  // Quick toggle status (draft <-> published)
  toggleStatus: (id) => api.patch(`/blogs/${id}/status`),

  // Upload blog image to media storage
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload-media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default BlogService;
