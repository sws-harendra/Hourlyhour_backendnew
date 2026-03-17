// services/categoryService.js

import api from "./api";
export const CategoryService = {
  // CREATE
  addCategory: async (data) => {
    return await api.post("/category/add-category", data);
  },

  // UPDATE
  updateCategory: async (data) => {
    return await api.put("/category/update-category", data);
  },

  // DELETE
  deleteCategory: async (id) => {
    return await api.delete(`/category/delete-category/${id}`);
  },

  // GET ALL
  getAllCategories: async () => {
    return await api.get("/category/get-all-categories?limit=1000");
  },
};
