import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash,
  MapPin,
  X,
  Star,
  List,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  Briefcase,
  IndianRupee,
  ExternalLink,
  Filter,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Delete from "../../../components/Delete";
import { UserService } from "../../../services/user.service";
import { BookingService } from "../../../services/booking.service";

const ServiceProviders = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("ASC");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    userType: "service_provider",
    status: "active",
  });
  const [submitting, setSubmitting] = useState(false);

  // Provider Detail / Bookings Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [providerBookings, setProviderBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [bookingSearch, setBookingSearch] = useState("");
  const [activeTab, setActiveTab] = useState("summary"); // "summary" | "bookings" | "active"
  const [bookingPage, setBookingPage] = useState(1);
  const bookingLimit = 8;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await UserService.getAllProviders({
          page,
          limit,
          search,
          sort,
          order,
        });
        setUsers(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching providers:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, sort, order, limit]);

  const handleDelete = async () => {
    try {
      setDeletingId(deleteUserId);
      await UserService.delete(deleteUserId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
      setDeleteUserId(null);
    }
  };

  const handleOpenDetails = async (provider, defaultTab = "summary") => {
    try {
      setSelectedProvider(provider);
      setShowDetailsModal(true);
      setActiveTab(defaultTab);
      setStatusFilter("all");
      setBookingSearch("");
      setBookingPage(1);
      setModalLoading(true);

      const res = await BookingService.getAll({
        page: 1,
        limit: 10000,
        providerId: provider.id,
      });

      setProviderBookings(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching provider bookings:", err);
      setProviderBookings([]);
    } finally {
      setModalLoading(false);
    }
  };

  // Calculations for summary statistics
  const stats = useMemo(() => {
    const total = providerBookings.length;
    const completed = providerBookings.filter((b) => b.status === "completed");
    const cancelled = providerBookings.filter((b) => b.status === "cancelled");
    const active = providerBookings.filter(
      (b) =>
        b.status === "confirmed" ||
        b.status === "on_the_way" ||
        b.status === "pending"
    );
    const onTheWay = providerBookings.filter((b) => b.status === "on_the_way");
    const confirmed = providerBookings.filter((b) => b.status === "confirmed");
    const pending = providerBookings.filter((b) => b.status === "pending");

    const totalEarnings = completed.reduce(
      (sum, b) => sum + (Number(b.priceAtBooking) || 0),
      0
    );

    return {
      total,
      completed: completed.length,
      cancelled: cancelled.length,
      active: active.length,
      onTheWay: onTheWay.length,
      confirmed: confirmed.length,
      pending: pending.length,
      totalEarnings,
      activeBookings: active,
    };
  }, [providerBookings]);

  // Filtered bookings for the list tab
  const filteredBookings = useMemo(() => {
    return providerBookings.filter((b) => {
      // Status filter
      if (statusFilter === "active") {
        if (!["confirmed", "on_the_way", "pending"].includes(b.status))
          return false;
      } else if (statusFilter !== "all" && b.status !== statusFilter) {
        return false;
      }

      // Text search inside bookings
      if (bookingSearch.trim()) {
        const q = bookingSearch.toLowerCase();
        const bId = String(b.id || "");
        const sTitle = (b.service?.title || "").toLowerCase();
        const loc = (b.location || "").toLowerCase();
        const cName = (b.user?.name || b.customerName || "").toLowerCase();
        const cPhone = (b.user?.phone || b.customerPhone || "").toLowerCase();
        return (
          bId.includes(q) ||
          sTitle.includes(q) ||
          loc.includes(q) ||
          cName.includes(q) ||
          cPhone.includes(q)
        );
      }

      return true;
    });
  }, [providerBookings, statusFilter, bookingSearch]);

  const groupBookings = (data) => {
    const map = new Map();

    data.forEach((b) => {
      const key = b.groupId ? `group-${b.groupId}` : `single-${b.id}`;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(b);
    });

    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      groupId: items[0]?.groupId || null,
      items,
      isGrouped: !key.startsWith("single-"),
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case "on_the_way":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3" /> On The Way
          </span>
        );
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <AlertCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Service Providers
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage, inspect ratings, and monitor assignments & booking performance
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm border border-blue-100">
                {users.length} Providers on page
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="createdAt">Latest</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Order
              </label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-slate-50/50 hover:bg-white focus:bg-white cursor-pointer"
              >
                <option value="ASC">Ascending (A-Z)</option>
                <option value="DESC">Descending (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-slate-400 text-sm">Loading service providers...</p>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center text-slate-400">
                      No service providers found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        #{u.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {(u.name || "P")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                              {u.name || "N/A"}
                            </p>
                            <p className="text-xs text-slate-400">{u.email || "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {u.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : u.status === "banned"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {u.status || "inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-slate-800 font-bold">
                            {Number(u.averageRating || 0).toFixed(1)}
                          </span>
                          <span className="text-slate-400 text-xs">
                            ({u.totalReviews || 0})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-slate-50/80 p-1 rounded-xl border border-slate-200/60">
                          {/* VIEW DETAILS & SUMMARY BUTTON (Eye icon) */}
                          <button
                            onClick={() => handleOpenDetails(u, "summary")}
                            className="p-1.5 hover:bg-blue-600 hover:text-white rounded-lg text-blue-600 transition-all"
                            title="View Full Profile & Bookings"
                          >
                            <Eye size={17} />
                          </button>

                          {/* MAP LOCATION */}
                          {u.latitude && u.longitude ? (
                            <button
                              onClick={() => {
                                setSelectedProvider(u);
                                setShowMap(true);
                              }}
                              className="p-1.5 hover:bg-emerald-600 hover:text-white rounded-lg text-emerald-600 transition-all"
                              title="View Current Location"
                            >
                              <MapPin size={17} />
                            </button>
                          ) : (
                            <span
                              className="p-1.5 opacity-30 text-slate-400 cursor-not-allowed"
                              title="No Location Data"
                            >
                              <MapPin size={17} />
                            </span>
                          )}

                          {/* REVIEWS */}
                          <button
                            onClick={() => navigate(`/reviews?providerId=${u.id}`)}
                            className="p-1.5 hover:bg-amber-500 hover:text-white rounded-lg text-amber-600 transition-all"
                            title="View Reviews"
                          >
                            <Star size={17} />
                          </button>

                          {/* QUICK BOOKINGS LIST */}
                          <button
                            onClick={() => handleOpenDetails(u, "bookings")}
                            className="p-1.5 hover:bg-indigo-600 hover:text-white rounded-lg text-indigo-600 transition-all"
                            title="All Assigned Bookings"
                          >
                            <List size={17} />
                          </button>

                          {/* EDIT */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setForm({
                                name: u.name ?? "",
                                phone: u.phone ?? "",
                                email: u.email ?? "",
                                userType: u.userType ?? "service_provider",
                                status: u.status ?? "active",
                              });
                              setShowEdit(true);
                            }}
                            className="p-1.5 hover:bg-slate-700 hover:text-white rounded-lg text-slate-600 transition-all"
                            title="Edit Provider"
                          >
                            <Edit size={17} />
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => setDeleteUserId(u.id)}
                            className="p-1.5 hover:bg-rose-600 hover:text-white rounded-lg text-rose-600 transition-all"
                            title="Delete Provider"
                          >
                            <Trash size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium transition-all ${
                  page === 1
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:border-blue-300 shadow-sm"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">
                  Page <span className="text-blue-600 font-bold">{page}</span> of{" "}
                  <span className="text-slate-800 font-bold">{totalPages}</span>
                </span>
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium transition-all ${
                  page === totalPages
                    ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:border-blue-300 shadow-sm"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 COMPREHENSIVE PROVIDER DETAILS & BOOKINGS MODAL (VIEW ICON CLICK)     */}
      {/* ========================================================================= */}
      {showDetailsModal && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col border border-slate-100">
            
            {/* Modal Header Profile Banner */}
            <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white p-6 relative">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pr-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center font-black text-2xl shadow-inner backdrop-blur-md">
                    {(selectedProvider.name || "P")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-2xl font-bold tracking-tight">
                        {selectedProvider.name || "Provider Profile"}
                      </h2>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          selectedProvider.status === "active"
                            ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                            : "bg-white/20 text-white/90"
                        }`}
                      >
                        {selectedProvider.status || "active"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs sm:text-sm text-blue-100/90 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="opacity-80" />
                        {selectedProvider.phone || "No phone"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="opacity-80" />
                        {selectedProvider.email || "No email"}
                      </span>
                      <span className="flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-lg border border-white/10">
                        <Star size={13} className="fill-amber-300 text-amber-300" />
                        <strong className="text-white">
                          {Number(selectedProvider.averageRating || 0).toFixed(1)}
                        </strong>
                        <span className="text-white/70">
                          ({selectedProvider.totalReviews || 0} reviews)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side quick actions */}
                <div className="flex items-center gap-2">
                  {selectedProvider.latitude && selectedProvider.longitude && (
                    <button
                      onClick={() => {
                        setShowMap(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
                    >
                      <MapPin size={14} /> Map Location
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/reviews?providerId=${selectedProvider.id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20"
                  >
                    <Star size={14} /> Reviews
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/15">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "summary"
                      ? "bg-white text-indigo-900 shadow-md"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <TrendingUp size={16} />
                  Overview & Stats
                </button>

                <button
                  onClick={() => setActiveTab("active")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "active"
                      ? "bg-white text-indigo-900 shadow-md"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Clock size={16} />
                  Active / Ongoing
                  {stats.active > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      activeTab === "active" ? "bg-amber-100 text-amber-900" : "bg-amber-400 text-slate-900"
                    }`}>
                      {stats.active}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab("bookings");
                    setStatusFilter("all");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "bookings"
                      ? "bg-white text-indigo-900 shadow-md"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Briefcase size={16} />
                  All Bookings ({stats.total})
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              {modalLoading ? (
                <div className="py-24 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-slate-500 font-medium">Fetching provider's booking history & stats...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: SUMMARY & PERFORMANCE */}
                  {activeTab === "summary" && (
                    <div className="space-y-6">
                      {/* Stat Cards Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Total Assigned */}
                        <div
                          onClick={() => {
                            setActiveTab("bookings");
                            setStatusFilter("all");
                          }}
                          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-600 transition-colors">
                              Total Assigned
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <Briefcase size={16} />
                            </div>
                          </div>
                          <div className="mt-3">
                            <h3 className="text-3xl font-black text-slate-800">
                              {stats.total}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Lifetime assigned jobs</p>
                          </div>
                        </div>

                        {/* Currently Active */}
                        <div
                          onClick={() => setActiveTab("active")}
                          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-amber-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-600 transition-colors">
                              Active / In-Flight
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                              <Clock size={16} />
                            </div>
                          </div>
                          <div className="mt-3">
                            <h3 className="text-3xl font-black text-amber-600">
                              {stats.active}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {stats.onTheWay} on the way, {stats.confirmed} confirmed
                            </p>
                          </div>
                        </div>

                        {/* Completed */}
                        <div
                          onClick={() => {
                            setActiveTab("bookings");
                            setStatusFilter("completed");
                          }}
                          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-600 transition-colors">
                              Completed
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <CheckCircle2 size={16} />
                            </div>
                          </div>
                          <div className="mt-3">
                            <h3 className="text-3xl font-black text-emerald-600">
                              {stats.completed}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {stats.total > 0
                                ? `${Math.round((stats.completed / stats.total) * 100)}% completion rate`
                                : "No bookings"}
                            </p>
                          </div>
                        </div>

                        {/* Cancelled */}
                        <div
                          onClick={() => {
                            setActiveTab("bookings");
                            setStatusFilter("cancelled");
                          }}
                          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs cursor-pointer hover:border-rose-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-rose-600 transition-colors">
                              Cancelled
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                              <XCircle size={16} />
                            </div>
                          </div>
                          <div className="mt-3">
                            <h3 className="text-3xl font-black text-rose-600">
                              {stats.cancelled}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {stats.total > 0
                                ? `${Math.round((stats.cancelled / stats.total) * 100)}% cancel rate`
                                : "No cancellations"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Financial / Earnings Card */}
                      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl">
                            ₹
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Completed Jobs Total Value
                            </p>
                            <h4 className="text-2xl font-black text-slate-800">
                              ₹{stats.totalEarnings.toLocaleString("en-IN")}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setActiveTab("bookings");
                              setStatusFilter("completed");
                            }}
                            className="text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            View Completed Bookings →
                          </button>
                        </div>
                      </div>

                      {/* Active Jobs Highlight Banner if any */}
                      {stats.active > 0 ? (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                              Current Assigned Active Bookings ({stats.active})
                            </div>
                            <button
                              onClick={() => setActiveTab("active")}
                              className="text-xs font-bold text-amber-800 hover:underline"
                            >
                              Inspect All Active ({stats.active}) →
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {stats.activeBookings.slice(0, 2).map((b) => (
                              <div
                                key={b.id}
                                className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs flex flex-col justify-between gap-3"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-slate-900">
                                      Booking #{b.id}
                                    </span>
                                    {getStatusBadge(b.status)}
                                  </div>
                                  <p className="text-sm font-semibold text-indigo-700 mt-1">
                                    🛠 {b.service?.title || "Service"}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <MapPin size={12} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{b.location || "No address"}</span>
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                    <span>📅 {b.bookingDate || "N/A"}</span>
                                    <span>⏰ {b.bookingTime || "N/A"}</span>
                                  </p>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                  <span className="font-bold text-slate-700">
                                    Customer: {b.user?.name || b.customerName || "N/A"}
                                  </span>
                                  <button
                                    onClick={() =>
                                      b.groupId
                                        ? navigate(`/booking/group/${b.groupId}`)
                                        : navigate(`/booking/allbookings/${b.id}`)
                                    }
                                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                                  >
                                    View Admin Details <ExternalLink size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center">
                          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <Clock size={20} />
                          </div>
                          <p className="text-sm font-semibold text-slate-700">
                            No Active Bookings
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            This provider currently has no pending or in-progress jobs.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: ACTIVE BOOKINGS ONLY */}
                  {activeTab === "active" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-bold text-slate-800">
                          Active & Ongoing Bookings ({stats.active})
                        </h4>
                        <span className="text-xs text-slate-500">
                          Jobs with status "confirmed", "on_the_way", or "pending"
                        </span>
                      </div>

                      {stats.active === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                          <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                          <p className="text-slate-700 font-semibold">No active jobs assigned</p>
                          <p className="text-slate-400 text-xs mt-1">
                            Provider is completely free for new assignments.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {stats.activeBookings.map((b) => (
                            <div
                              key={b.id}
                              className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className="font-bold text-slate-900 text-base">
                                      Booking #{b.id}
                                    </span>
                                    {b.groupId && (
                                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                        Group #{b.groupId}
                                      </span>
                                    )}
                                    {getStatusBadge(b.status)}
                                  </div>

                                  <p className="text-sm font-bold text-indigo-700">
                                    🛠 {b.service?.title || "Service Title Unavailable"}
                                  </p>

                                  <div className="flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                                    <span className="flex items-center gap-1">
                                      <MapPin size={13} className="text-slate-400" />
                                      {b.location || "No location"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Calendar size={13} className="text-slate-400" />
                                      {b.bookingDate || "N/A"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={13} className="text-slate-400" />
                                      {b.bookingTime || "N/A"}
                                    </span>
                                  </div>

                                  {/* Customer info */}
                                  <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                                    <span>
                                      👤 Customer:{" "}
                                      <strong>
                                        {b.user?.name || b.customerName || "N/A"}
                                      </strong>
                                    </span>
                                    {(b.user?.phone || b.customerPhone) && (
                                      <span>
                                        📞 {b.user?.phone || b.customerPhone}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                                  <div className="text-right">
                                    <span className="text-xs text-slate-400 block">Amount</span>
                                    <span className="text-xl font-black text-slate-900">
                                      ₹{b.priceAtBooking || 0}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      b.groupId
                                        ? navigate(`/booking/group/${b.groupId}`)
                                        : navigate(`/booking/allbookings/${b.id}`)
                                    }
                                    className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1.5"
                                  >
                                    Manage Booking <ExternalLink size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ALL BOOKINGS WITH FILTERS */}
                  {activeTab === "bookings" && (
                    <div className="space-y-4">
                      {/* Filter Bar */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                        {/* Search inside provider's bookings */}
                        <div className="relative w-full md:w-72">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Filter bookings..."
                            value={bookingSearch}
                            onChange={(e) => {
                              setBookingSearch(e.target.value);
                              setBookingPage(1);
                            }}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>

                        {/* Status Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
                          {[
                            { key: "all", label: `All (${stats.total})` },
                            { key: "active", label: `Active (${stats.active})` },
                            { key: "completed", label: `Completed (${stats.completed})` },
                            { key: "cancelled", label: `Cancelled (${stats.cancelled})` },
                          ].map((tab) => (
                            <button
                              key={tab.key}
                              onClick={() => {
                                setStatusFilter(tab.key);
                                setBookingPage(1);
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                statusFilter === tab.key
                                  ? "bg-slate-900 text-white shadow-xs"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bookings List */}
                      {filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
                          <p className="text-slate-500 font-medium">
                            No bookings found matching filter.
                          </p>
                        </div>
                      ) : (
                        groupBookings(
                          filteredBookings.slice(
                            (bookingPage - 1) * bookingLimit,
                            bookingPage * bookingLimit
                          )
                        ).map(({ key, groupId, items, isGrouped }) => (
                          <div
                            key={key}
                            className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs mb-3"
                          >
                            {/* Group Header */}
                            <div className="bg-slate-50/90 px-5 py-3 border-b border-slate-200/80 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">
                                  {isGrouped ? `Group #${groupId}` : "Single Job"}
                                </span>
                                <span className="text-xs text-slate-500">
                                  ({items.length} item{items.length > 1 ? "s" : ""})
                                </span>
                              </div>

                              {isGrouped && (
                                <button
                                  onClick={() => navigate(`/booking/group/${groupId}`)}
                                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                                >
                                  Open Group Detail <ExternalLink size={12} />
                                </button>
                              )}
                            </div>

                            {/* Bookings within group */}
                            <div className="divide-y divide-slate-100">
                              {items.map((b) => (
                                <div
                                  key={b.id}
                                  className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-sm">
                                        Booking #{b.id}
                                      </span>
                                      {getStatusBadge(b.status)}
                                    </div>

                                    <p className="text-sm font-semibold text-indigo-700">
                                      🛠 {b.service?.title || "Service Title Not Found"}
                                    </p>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                                      <span className="flex items-center gap-1">
                                        <MapPin size={12} className="text-slate-400" />
                                        {b.location || "No address"}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar size={12} className="text-slate-400" />
                                        {b.bookingDate || "N/A"}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock size={12} className="text-slate-400" />
                                        {b.bookingTime || "N/A"}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5">
                                      <span>
                                        👤 {b.user?.name || b.customerName || "Customer"}
                                      </span>
                                      {(b.user?.phone || b.customerPhone) && (
                                        <span>📞 {b.user?.phone || b.customerPhone}</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                    <div className="text-right">
                                      <span className="text-xs text-slate-400 block">Price</span>
                                      <span className="text-base font-bold text-emerald-600">
                                        ₹{b.priceAtBooking || 0}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        b.groupId
                                          ? navigate(`/booking/group/${b.groupId}`)
                                          : navigate(`/booking/allbookings/${b.id}`)
                                      }
                                      className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition-all flex items-center gap-1"
                                    >
                                      View <ExternalLink size={11} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}

                      {/* Pagination for bookings */}
                      {filteredBookings.length > bookingLimit && (
                        <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                          <button
                            onClick={() => setBookingPage((p) => Math.max(1, p - 1))}
                            disabled={bookingPage === 1}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
                          >
                            Previous
                          </button>

                          <span className="font-semibold text-slate-600">
                            Page {bookingPage} of{" "}
                            {Math.ceil(filteredBookings.length / bookingLimit)}
                          </span>

                          <button
                            onClick={() =>
                              setBookingPage((p) =>
                                Math.min(
                                  Math.ceil(filteredBookings.length / bookingLimit),
                                  p + 1
                                )
                              )
                            }
                            disabled={
                              bookingPage ===
                              Math.ceil(filteredBookings.length / bookingLimit)
                            }
                            className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 font-medium"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-200/80 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Provider ID: <span className="font-mono font-bold text-slate-600">#{selectedProvider.id}</span>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMap && selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Provider Location</h3>
                  <p className="text-xs text-white/80">
                    Current location for {selectedProvider.name || "Provider"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMap(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              {selectedProvider.latitude && selectedProvider.longitude ? (
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner h-[500px]">
                  <iframe
                    title="Provider Location"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps?q=${selectedProvider.latitude},${selectedProvider.longitude}&z=15&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium text-lg">
                    Location data not available
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Latitude and longitude are not saved for this provider
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowMap(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <Delete
        open={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleteUserId}
        title="Delete User?"
        description="This user will be permanently removed."
      />

      {/* Edit Provider Modal */}
      {showEdit && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Provider</h3>
              <button onClick={() => setShowEdit(false)}>✕</button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Name"
              />

              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Phone"
              />

              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Email"
              />

              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  try {
                    setSubmitting(true);
                    await UserService.update(selectedUser.id, form);
                    setShowEdit(false);

                    setUsers((prev) =>
                      prev.map((u) =>
                        u.id === selectedUser.id ? { ...u, ...form } : u
                      )
                    );
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {submitting ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceProviders;
