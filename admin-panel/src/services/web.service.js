// services/web.service.js
import api from "./api";

const WEB_REQUESTS_KEY = "repairsaathi_web_requests";
const WEB_CATEGORIES_KEY = "repairsaathi_web_categories";

const INITIAL_WEB_REQUESTS = [
  {
    id: "WR-1001",
    customerName: "Rahul Sharma",
    phone: "9876543210",
    email: "rahul.sharma@gmail.com",
    serviceName: "AC Not Cooling & Deep Cleaning",
    category: "Air Conditioner",
    city: "Patna",
    address: "Flat 302, Sai Enclave, Kankarbagh",
    message: "Split AC 1.5 ton is not cooling properly and blowing warm air. Need urgent service before weekend.",
    source: "Website Booking Form",
    status: "pending",
    preferredDate: "2026-10-16",
    preferredTime: "10:00 AM - 12:00 PM",
    notes: "Customer requested morning slot.",
    createdAt: "2026-10-15T09:30:00.000Z",
  },
  {
    id: "WR-1002",
    customerName: "Priya Singh",
    phone: "9812345678",
    email: "priya.singh88@gmail.com",
    serviceName: "Washing Machine Drum Vibration",
    category: "Washing Machine",
    city: "Patna",
    address: "Road No. 4, Boring Road",
    message: "LG front load machine is vibrating loudly during high speed spin cycle and water leakage at bottom.",
    source: "Contact Us Page",
    status: "contacted",
    preferredDate: "2026-10-16",
    preferredTime: "02:00 PM - 04:00 PM",
    notes: "Spoke to customer. Technician assign scheduled.",
    createdAt: "2026-10-15T08:15:00.000Z",
  },
  {
    id: "WR-1003",
    customerName: "Amit Verma",
    phone: "9723456789",
    email: "amit.verma@outlook.com",
    serviceName: "Double Door Fridge Cooling Issue",
    category: "Refrigerator",
    city: "Patna",
    address: "Near Pillar 52, Bailey Road",
    message: "Freezer section is making ice but bottom food section is completely warm. Gas leak suspected.",
    source: "Home Page Quick Request",
    status: "in_progress",
    preferredDate: "2026-10-15",
    preferredTime: "04:00 PM - 06:00 PM",
    notes: "Technician Sunil assigned. On the way.",
    createdAt: "2026-10-15T07:45:00.000Z",
  },
  {
    id: "WR-1004",
    customerName: "Sneha Gupta",
    phone: "9834567890",
    email: "sneha.gupta@yahoo.com",
    serviceName: "RO Water Purifier Membrane & Filter",
    category: "Water Purifier",
    city: "Patna",
    address: "H.No. 45, Rajendra Nagar",
    message: "Water taste has changed and waste water is flowing continuously. Need complete filter change.",
    source: "Website Services Page",
    status: "completed",
    preferredDate: "2026-10-14",
    preferredTime: "11:00 AM - 01:00 PM",
    notes: "Service completed by Ravi. Payment received.",
    createdAt: "2026-10-14T11:20:00.000Z",
  },
  {
    id: "WR-1005",
    customerName: "Vikram Kumar",
    phone: "9845678901",
    email: "vikram.k92@gmail.com",
    serviceName: "Microwave Oven Not Heating",
    category: "Microwave",
    city: "Patna",
    address: "Near Railway Station, Danapur Cantt",
    message: "Timer runs and plate rotates but food does not heat at all. Sparks seen inside last night.",
    source: "Website Footer Contact",
    status: "pending",
    preferredDate: "2026-10-16",
    preferredTime: "01:00 PM - 03:00 PM",
    notes: "Urgent check required.",
    createdAt: "2026-10-15T11:05:00.000Z",
  },
];


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
    // Try backend if an API endpoint exists, otherwise fallback to stored data
    try {
      const res = await api.get("/serviceRequest");
      if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        // Map backend format to web request shape if present
        const mapped = res.data.data.map((r, idx) => ({
          id: `WR-${r.id || idx + 100}`,
          customerName: r.name || r.customerName || r.user?.name || "Website Customer",
          phone: r.phone || r.user?.phone || "N/A",
          email: r.email || r.user?.email || "N/A",
          serviceName: r.serviceName || r.service?.name || "General Service Request",
          category: r.category || "Web Inquiry",
          city: r.city || "Patna",
          address: r.address || "Website Submitted",
          message: r.message || r.description || "Inquiry from website",
          source: r.source || "Website",
          status: r.status || "pending",
          preferredDate: r.preferredDate || new Date().toISOString().split("T")[0],
          preferredTime: r.preferredTime || "Anytime",
          notes: r.notes || "",
          createdAt: r.createdAt || new Date().toISOString(),
        }));
        return { success: true, data: mapped };
      }
    } catch {
      // Fallback to local persistence
    }

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
          i.message?.toLowerCase().includes(q)
      );
    }
    return { success: true, data: items };
  },

  createWebRequest: async (data) => {
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
    const items = getStoredItems(WEB_REQUESTS_KEY, INITIAL_WEB_REQUESTS);
    const updated = items.filter((item) => item.id !== id);
    setStoredItems(WEB_REQUESTS_KEY, updated);
    return { success: true };
  },
};

export default WebService;
