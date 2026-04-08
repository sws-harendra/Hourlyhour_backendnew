import api from "./api";

export const UserService = {
  adminme: async () => {
    const { data } = await api.get("/auth/admin-me");
    return data;
  },

  getAll: async (params) => {
    const { data } = await api.get("/auth/all-users", { params });
    return data;
  },

  getAllProviders: async (params) => {
    const { data } = await api.get("/auth/all-service-provider", { params });
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/auth/users", payload);
    return data;
  },
  login: async (email, password) => {
    const payload = {
      email,
      password,
    };
    const res = await api.post(`/auth/login`, payload);

    if (!res.status == 200) throw new Error(res.message || "Login failed");

    // Store token and user info
    localStorage.setItem("token", res.data.token);
    // localStorage.setItem("user", JSON.stringify(res.data.user));
    console.log("res=>", res);

    return res;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/auth/users/${id}`);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/auth/admin/user/${id}`, payload);
    return data;
  },

  logout() {
    localStorage.removeItem("token");
  },

  getToken() {
    return localStorage.getItem("token");
  },

  removeToken() {
    return localStorage.removeItem("token");
  },
  getUserDetailLoggedin: async () => {
    const { data } = await api.post("/auth/userdetail");
    return data;
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  },
};
