import React, { useEffect, useState } from "react";
import {
  Inbox,
  Search,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  Trash2,
  Download,
  Plus,
  RefreshCw,
  MessageSquare,
  Send,
  User,
  Sparkles,
} from "lucide-react";
import WebService from "../../services/web.service";
import Delete from "../../components/Delete";
import toast from "react-hot-toast";

export default function WebRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // New request form state
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    serviceName: "",
    category: "Air Conditioner",
    city: "Patna",
    address: "",
    message: "",
    preferredDate: "",
    preferredTime: "10:00 AM - 01:00 PM",
    notes: "",
  });

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await WebService.getWebRequests({
        status: statusFilter,
        search,
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load web requests", err);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRequests();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await WebService.updateWebRequestStatus(id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (selectedRequest?.id === id) {
        setSelectedRequest((prev) => ({ ...prev, status: newStatus }));
      }
    } catch {
      toast.error("Could not update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await WebService.deleteWebRequest(deleteId);
      toast.success("Web request deleted");
      setRequests((prev) => prev.filter((r) => r.id !== deleteId));
      if (selectedRequest?.id === deleteId) {
        setShowDetailModal(false);
      }
    } catch {
      toast.error("Failed to delete request");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.serviceName) {
      toast.error("Please fill Name, Phone, and Service Name");
      return;
    }
    try {
      const res = await WebService.createWebRequest(formData);
      toast.success("New web request added!");
      setRequests((prev) => [res.data, ...prev]);
      setShowCreateModal(false);
      setFormData({
        customerName: "",
        phone: "",
        email: "",
        serviceName: "",
        category: "Air Conditioner",
        city: "Patna",
        address: "",
        message: "",
        preferredDate: "",
        preferredTime: "10:00 AM - 01:00 PM",
        notes: "",
      });
    } catch {
      toast.error("Failed to create request");
    }
  };

  const exportToCSV = () => {
    if (!requests.length) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "ID",
      "Customer Name",
      "Phone",
      "Email",
      "Service Requested",
      "Category",
      "City",
      "Address",
      "Preferred Date",
      "Preferred Time",
      "Status",
      "Source",
      "Created At",
    ];

    const rows = requests.map((r) => [
      r.id,
      `"${r.customerName || ""}"`,
      r.phone || "",
      r.email || "",
      `"${r.serviceName || ""}"`,
      r.category || "",
      r.city || "",
      `"${r.address || ""}"`,
      r.preferredDate || "",
      r.preferredTime || "",
      r.status || "",
      r.source || "",
      r.createdAt ? new Date(r.createdAt).toLocaleString() : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `web_requests_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported to CSV successfully!");
  };

  // Status counters
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const inProgressCount = requests.filter(
    (r) => r.status === "in_progress" || r.status === "contacted"
  ).length;
  const completedCount = requests.filter((r) => r.status === "completed").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock3 className="w-3.5 h-3.5" /> Pending
          </span>
        );
      case "contacted":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Phone className="w-3.5 h-3.5" /> Contacted
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Requests from Web
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Live
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage, review, and follow up customer service inquiries coming from the website
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadRequests}
            title="Refresh"
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 hover:border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl border border-slate-800 hover:border-slate-700 transition text-sm font-medium"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export CSV
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-blue-600/30 transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Request
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Inquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalCount}</span>
            <span className="text-xs text-slate-400">Web Form Submissions</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Pending Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400">{pendingCount}</span>
            <span className="text-xs text-amber-300/70">Action Required</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              In Follow-Up
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-purple-400">{inProgressCount}</span>
            <span className="text-xs text-purple-300/70">Contacted / Scheduled</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Resolved
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{completedCount}</span>
            <span className="text-xs text-emerald-300/70">Completed</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "contacted", label: "Contacted" },
            { key: "in_progress", label: "In Progress" },
            { key: "completed", label: "Completed" },
            { key: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === tab.key
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-full md:w-80"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, phone, service..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 transition outline-none"
          />
        </form>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Loading web requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center">
            <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">
              No web requests found
            </h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
              There are currently no customer inquiries matching your filter. New submissions from your website will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Inquiry ID</th>
                  <th className="px-5 py-4">Customer Details</th>
                  <th className="px-5 py-4">Service Requested</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Preferred Slot</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-blue-400 font-semibold whitespace-nowrap">
                      {req.id}
                      <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                        {req.source || "Website"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">
                        {req.customerName}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-400">
                        <a
                          href={`tel:${req.phone}`}
                          className="flex items-center gap-1.5 hover:text-blue-400 transition"
                        >
                          <Phone className="w-3 h-3 text-slate-500" />
                          {req.phone}
                        </a>
                        {req.email && (
                          <a
                            href={`mailto:${req.email}`}
                            className="flex items-center gap-1.5 hover:text-blue-400 transition"
                          >
                            <Mail className="w-3 h-3 text-slate-500" />
                            {req.email}
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-medium text-slate-200 truncate">
                        {req.serviceName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                          {req.category || "Service"}
                        </span>
                        {req.message && (
                          <span
                            title={req.message}
                            className="text-xs text-slate-400 truncate max-w-[180px]"
                          >
                            {req.message}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="font-medium text-xs">{req.city || "Patna"}</span>
                      </div>
                      {req.address && (
                        <p className="text-[11px] text-slate-500 mt-0.5 max-w-[160px] truncate" title={req.address}>
                          {req.address}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        <span>{req.preferredDate || "Any Date"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{req.preferredTime || "Flexible"}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <select
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value)}
                        className="bg-slate-950 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-200 outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="pending">⏳ Pending</option>
                        <option value="contacted">📞 Contacted</option>
                        <option value="in_progress">⚙️ In Progress</option>
                        <option value="completed">✅ Completed</option>
                        <option value="cancelled">❌ Cancelled</option>
                      </select>
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setShowDetailModal(true);
                          }}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700/60 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <a
                          href={`https://wa.me/91${req.phone?.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                            req.customerName
                          )},%20we%20received%20your%20request%20for%20${encodeURIComponent(
                            req.serviceName
                          )}%20at%20Repair%20Saathi.`}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp Customer"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                        >
                          <Send className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setDeleteId(req.id)}
                          title="Delete Request"
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      Request #{selectedRequest.id}
                    </h3>
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Source: {selectedRequest.source || "Website Form"} • Submitted:{" "}
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-5 space-y-5 flex-1 pr-2">
              {/* Customer Info Box */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-blue-400" /> Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500">Name</span>
                    <p className="font-semibold text-white">{selectedRequest.customerName}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Phone Number</span>
                    <p className="font-semibold text-white flex items-center gap-2">
                      {selectedRequest.phone}
                      <a
                        href={`tel:${selectedRequest.phone}`}
                        className="text-xs px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                      >
                        Call
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Email Address</span>
                    <p className="text-slate-300">{selectedRequest.email || "Not Provided"}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">City & Area</span>
                    <p className="text-slate-300">
                      {selectedRequest.city || "Patna"}
                      {selectedRequest.address ? `, ${selectedRequest.address}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service & Issue Details */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Service Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex-1">
                      <span className="text-xs text-slate-500">Requested Appliance / Service</span>
                      <p className="font-bold text-white text-base">{selectedRequest.serviceName}</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Category: {selectedRequest.category}
                    </span>
                  </div>

                  {/* Multi-Appliance Cart Breakdown if available */}
                  {(() => {
                    let apps = [];
                    if (Array.isArray(selectedRequest.appliances)) {
                      apps = selectedRequest.appliances;
                    } else if (typeof selectedRequest.appliances === "string") {
                      try { apps = JSON.parse(selectedRequest.appliances); } catch {}
                    }
                    if (!apps || apps.length === 0) return null;

                    return (
                      <div className="mt-2 pt-3 border-t border-slate-800">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                          Selected Appliances &amp; Requirements ({apps.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {apps.map((app, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                              <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                                {app.name || "Appliance"}
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {(app.requirements || []).map((req, rIdx) => (
                                  <span key={rIdx} className="text-[11px] px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30 font-medium">
                                    ✓ {req}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <span className="text-xs text-slate-500">Problem Description / Message</span>
                    <div className="mt-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm whitespace-pre-line">
                      {selectedRequest.message || "No additional message provided."}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-xs text-slate-500">Preferred Date</span>
                      <p className="text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-400" />
                        {selectedRequest.preferredDate || "Immediate / Any"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Preferred Time Slot</span>
                      <p className="text-slate-300 font-medium flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {selectedRequest.preferredTime || "Flexible"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Follow-up */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Follow-Up Status & Notes
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Update Request Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "pending", label: "Pending" },
                        { key: "contacted", label: "Contacted" },
                        { key: "in_progress", label: "In Progress" },
                        { key: "completed", label: "Completed" },
                        { key: "cancelled", label: "Cancelled" },
                      ].map((st) => (
                        <button
                          key={st.key}
                          type="button"
                          onClick={() => handleStatusChange(selectedRequest.id, st.key)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                            selectedRequest.status === st.key
                              ? "bg-blue-600 text-white border-blue-500"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      Internal Admin Notes
                    </label>
                    <textarea
                      rows={2}
                      defaultValue={selectedRequest.notes}
                      onBlur={(e) =>
                        WebService.updateWebRequestStatus(
                          selectedRequest.id,
                          selectedRequest.status,
                          e.target.value
                        ).then(() => toast.success("Notes saved"))
                      }
                      placeholder="Add notes about customer conversation, technician assignment..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <a
                href={`https://wa.me/91${selectedRequest.phone?.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                  selectedRequest.customerName
                )},%20we%20have%20received%20your%20request%20on%20Repair%20Saathi%20for%20${encodeURIComponent(
                  selectedRequest.serviceName
                )}.`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition"
              >
                <Send className="w-3.5 h-3.5" />
                Contact via WhatsApp
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create New Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Web Request</h3>
                  <p className="text-xs text-slate-400">Record an inquiry received through web or phone</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="overflow-y-auto py-5 space-y-4 flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Ramesh Singh"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-blue-500"
                  >
                    <option value="Air Conditioner">Air Conditioner (AC)</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Washing Machine">Washing Machine</option>
                    <option value="Water Purifier">RO Water Purifier</option>
                    <option value="Microwave">Microwave & Oven</option>
                    <option value="Geyser">Geyser & Water Heater</option>
                    <option value="Other">Other Appliances</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Service / Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  placeholder="e.g. AC Gas Refill & Cooling Inspection"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Patna"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Full Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, Landmark, Area"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Message / Problem Details
                </label>
                <textarea
                  rows={2}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Brief description of the appliance problem..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition"
                >
                  Save Web Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Delete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Web Request?"
        description="Are you sure you want to delete this web request inquiry? This cannot be undone."
      />
    </div>
  );
}
