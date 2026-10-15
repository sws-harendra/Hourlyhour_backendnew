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

const INITIAL_WEB_CATEGORIES = [
  {
    id: "WC-1",
    name: "Air Conditioner (AC)",
    slug: "air-conditioner-repair",
    tagline: "Cooling & Heating Appliance Expert",
    description: "Split & window AC repair, installation, gas refilling, and deep power-jet chemical servicing.",
    icon: "Wind",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=60",
    displayOrder: 1,
    isFeatured: true,
    status: "active",
    totalServices: 12,
    metaTitle: "Best AC Repair & Service in Patna | Repair Saathi",
    metaDescription: "Professional AC repair, gas charging, jet servicing at doorstep in Patna.",
    createdAt: "2026-10-01T10:00:00.000Z",
  },
  {
    id: "WC-2",
    name: "Refrigerator",
    slug: "refrigerator-repair",
    tagline: "Single, Double Door & Side-by-Side Care",
    description: "Expert fridge cooling fault repair, compressor replacement, thermostat & gas leak fixing.",
    icon: "Snowflake",
    image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&auto=format&fit=crop&q=60",
    displayOrder: 2,
    isFeatured: true,
    status: "active",
    totalServices: 8,
    metaTitle: "Refrigerator Repair & Gas Refill in Patna | Doorstep Service",
    metaDescription: "Fast, reliable fridge repair for all brands including LG, Samsung, Whirlpool.",
    createdAt: "2026-10-02T10:00:00.000Z",
  },
  {
    id: "WC-3",
    name: "Washing Machine",
    slug: "washing-machine-repair",
    tagline: "Top Load, Front Load & Semi-Automatic",
    description: "Drum vibration repair, PCB motherboard fixing, inlet valve, motor and drainage service.",
    icon: "Shirt",
    image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&auto=format&fit=crop&q=60",
    displayOrder: 3,
    isFeatured: true,
    status: "active",
    totalServices: 10,
    metaTitle: "Washing Machine Repair in Patna | Top & Front Load Service",
    metaDescription: "Expert doorstep washing machine repair with genuine spare parts.",
    createdAt: "2026-10-03T10:00:00.000Z",
  },
  {
    id: "WC-4",
    name: "RO Water Purifier",
    slug: "water-purifier-service",
    tagline: "Pure, Safe & Healthy Drinking Water",
    description: "Multi-stage RO filter replacement, membrane change, UV lamp fix, TDS tuning & pump overhaul.",
    icon: "Droplets",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=60",
    displayOrder: 4,
    isFeatured: true,
    status: "active",
    totalServices: 6,
    metaTitle: "RO Water Purifier Service & Filter Change in Patna",
    metaDescription: "Affordable RO servicing and original membrane filter installation.",
    createdAt: "2026-10-04T10:00:00.000Z",
  },
  {
    id: "WC-5",
    name: "Microwave & Oven",
    slug: "microwave-oven-repair",
    tagline: "Solo, Grill & Convection Microwave Care",
    description: "Heating issue fix, magnetron replacement, touch keypad membrane repair, sparking resolution.",
    icon: "Flame",
    image: "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=500&auto=format&fit=crop&q=60",
    displayOrder: 5,
    isFeatured: false,
    status: "active",
    totalServices: 5,
    metaTitle: "Microwave Oven Repair in Patna | Doorstep Fixing",
    metaDescription: "Same day microwave oven technician visit at your doorstep.",
    createdAt: "2026-10-05T10:00:00.000Z",
  },
  {
    id: "WC-6",
    name: "Geyser & Water Heater",
    slug: "geyser-water-heater-repair",
    tagline: "Instant & Storage Geysers Repair",
    description: "Heating element change, thermostat replacement, water leakage fix, and tank descaling.",
    icon: "Zap",
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=500&auto=format&fit=crop&q=60",
    displayOrder: 6,
    isFeatured: false,
    status: "active",
    totalServices: 4,
    metaTitle: "Geyser & Water Heater Repair in Patna | Safe Installation",
    metaDescription: "Fast geyser repair service with warranty on replaced spare parts.",
    createdAt: "2026-10-06T10:00:00.000Z",
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

  // ===================== WEB CATEGORIES =====================
  getWebCategories: async (filters = {}) => {
    let items = getStoredItems(WEB_CATEGORIES_KEY, INITIAL_WEB_CATEGORIES);
    if (filters.status && filters.status !== "all") {
      items = items.filter((i) => i.status === filters.status);
    }
    if (filters.featuredOnly) {
      items = items.filter((i) => i.isFeatured);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name?.toLowerCase().includes(q) ||
          i.slug?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }
    // Sort by displayOrder
    items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return { success: true, data: items };
  },

  createWebCategory: async (categoryData) => {
    const items = getStoredItems(WEB_CATEGORIES_KEY, INITIAL_WEB_CATEGORIES);
    const slug =
      categoryData.slug ||
      categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const newCategory = {
      id: `WC-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      displayOrder: items.length + 1,
      isFeatured: false,
      status: "active",
      totalServices: 0,
      ...categoryData,
      slug,
    };
    const updated = [...items, newCategory];
    setStoredItems(WEB_CATEGORIES_KEY, updated);
    return { success: true, data: newCategory };
  },

  updateWebCategory: async (id, updatedFields) => {
    const items = getStoredItems(WEB_CATEGORIES_KEY, INITIAL_WEB_CATEGORIES);
    const updated = items.map((cat) => {
      if (cat.id === id) {
        return {
          ...cat,
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        };
      }
      return cat;
    });
    setStoredItems(WEB_CATEGORIES_KEY, updated);
    return { success: true };
  },

  deleteWebCategory: async (id) => {
    const items = getStoredItems(WEB_CATEGORIES_KEY, INITIAL_WEB_CATEGORIES);
    const updated = items.filter((cat) => cat.id !== id);
    setStoredItems(WEB_CATEGORIES_KEY, updated);
    return { success: true };
  },

  toggleCategoryFeatured: async (id) => {
    const items = getStoredItems(WEB_CATEGORIES_KEY, INITIAL_WEB_CATEGORIES);
    const updated = items.map((cat) =>
      cat.id === id ? { ...cat, isFeatured: !cat.isFeatured } : cat
    );
    setStoredItems(WEB_CATEGORIES_KEY, updated);
    return { success: true };
  },

  toggleCategoryStatus: async (id) => {
    const items = getStoredItems(WEB_CATEGORIES_KEY, INITIAL_WEB_CATEGORIES);
    const updated = items.map((cat) =>
      cat.id === id
        ? { ...cat, status: cat.status === "active" ? "inactive" : "active" }
        : cat
    );
    setStoredItems(WEB_CATEGORIES_KEY, updated);
    return { success: true };
  },
};

export default WebService;
