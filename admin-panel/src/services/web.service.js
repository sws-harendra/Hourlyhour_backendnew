// services/web.service.js
import api from "./api";

const WEB_REQUESTS_KEY = "repairsaathi_web_requests";

const INITIAL_WEB_REQUESTS = [];

// Helper to get from storage or initialize
const getStoredItems = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
};

const setStoredItems = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
};

export const WebService = {
  // ===================== WEB REQUESTS =====================
  getWebRequests: async (filters = {}) => {
    // 1. Try backend API first for live dynamic database data
    try {
      const res = await api.get("/web-requests", { params: filters });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStoredItems(WEB_REQUESTS_KEY, res.data.data);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      console.warn("Backend /web-requests fetch failed, falling back to local cache:", err.message);
    }

    // 2. Fallback to local storage if network or offline
    let items = getStoredItems(WEB_REQUESTS_KEY, INITIAL_WEB_REQUESTS);
    if (filters.status && filters.status !== "all") {
      items = items.filter((i) => i.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.customerName?.toLowerCase().includes(q) ||
          i.phone?.includes(q) ||
          i.email?.toLowerCase().includes(q) ||
          i.serviceName?.toLowerCase().includes(q) ||
          i.message?.toLowerCase().includes(q) ||
          i.id?.toLowerCase().includes(q)
      );
    }
    return { success: true, data: items };
  },

  createWebRequest: async (data) => {
    try {
      const res = await api.post("/web-requests", data);
      if (res.data?.success && res.data.data) {
        const items = getStoredItems(WEB_REQUESTS_KEY, INITIAL_WEB_REQUESTS);
        setStoredItems(WEB_REQUESTS_KEY, [res.data.data, ...items]);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      console.warn("Backend /web-requests post failed, saving to local cache:", err.message);
    }

    const items = getStoredItems(WEB_REQUESTS_KEY, INITIAL_WEB_REQUESTS);
    const newItem = {
      id: `WR-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      status: "pending",
      source: "Manual Entry (Admin)",
      ...data,
    };
    const updated = [newItem, ...items];
    setStoredItems(WEB_REQUESTS_KEY, updated);
    return { success: true, data: newItem };
  },

  updateWebRequestStatus: async (id, status, notes = null) => {
    try {
      await api.put(`/web-requests/${id}/status`, { status, notes });
    } catch (err) {
      console.warn("Backend /web-requests update failed, updating local cache:", err.message);
    }

    const items = getStoredItems(WEB_REQUESTS_KEY, INITIAL_WEB_REQUESTS);
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          ...(notes !== null ? { notes } : {}),
          updatedAt: new Date().toISOString(),
        };
      }
      return item;
    });
    setStoredItems(WEB_REQUESTS_KEY, updated);
    return { success: true };
  },

  deleteWebRequest: async (id) => {
    try {
      await api.delete(`/web-requests/${id}`);
    } catch (err) {
      console.warn("Backend /web-requests delete failed, updating local cache:", err.message);
    }

    const items = getStoredItems(WEB_REQUESTS_KEY, INITIAL_WEB_REQUESTS);
    const updated = items.filter((item) => item.id !== id);
    setStoredItems(WEB_REQUESTS_KEY, updated);
    return { success: true };
  },
};

export default WebService;
