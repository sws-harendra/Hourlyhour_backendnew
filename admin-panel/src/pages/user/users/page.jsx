import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash,
  Eye,
  Download,
  CalendarDays,
  List,
} from "lucide-react";
import { UserService } from "../../../services/user.service";
import Delete from "../../../components/Delete";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BookingService } from "../../../services/booking.service";

// Mock UserService for demo

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [userFilter, setUserFilter] = useState("user");
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("ASC");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    userType: "user",
    status: "active",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [exportScope, setExportScope] = useState("page");
  const [showBookings, setShowBookings] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingTotalPages, setBookingTotalPages] = useState(1);
  const bookingLimit = 10;
  const [selectedBookingUser, setSelectedBookingUser] = useState(null);
  const isProvider =
    selectedUser?.userType?.toLowerCase()?.includes("provider");

  const fetchUsers = async () => {
    setLoading(true);
    const data = await UserService.getAll({
      page,
      limit,
      search,
      sort,
      order,
      userType: userFilter === "all" ? "" : userFilter,
    });
    setUsers(data.data);
    setTotalPages(data.pagination.totalPages);
    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      setDeletingId(deleteUserId);
      await UserService.delete(deleteUserId);
      await fetchUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
      setDeleteUserId(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, sort, order, limit, userFilter]);

  useEffect(() => {
    if (!message) return;

    const t = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(t);
  }, [message]);

  {/**-------------------------------- */ }
  const handleExport = async () => {
    try {
      let dataToExport = [];

      if (exportScope === "page") {
        dataToExport = users;
      } else {
        const res = await UserService.getAll({
          page: 1,
          limit: 10000,
          search,
          sort,
          order,
        });
        dataToExport = res.data;
      }

      // 🔥 FILTER TYPE
      if (exportType === "user") {
        dataToExport = dataToExport.filter((u) => u.userType === "user");
      } else if (exportType === "provider") {
        dataToExport = dataToExport.filter(
          (u) => u.userType === "service_provider"
        );
      }

      if (!dataToExport.length) {
        setMessage("No data to export");
        return;
      }

      const formatted = dataToExport.map((u) => ({
        ID: u.id,
        Name: u.name,
        Phone: u.phone,
        Email: u.email,
        Type: u.userType,
        Status: u.status,
      }));

      const ws = XLSX.utils.json_to_sheet(formatted);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");

      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      const blob = new Blob([buffer], {
        type: "application/octet-stream",
      });

      saveAs(blob, "users.xlsx");

      setShowExport(false);
    } catch (err) {
      console.error(err);
      setMessage("Export failed");
    }
  };

  const fetchBookings = async (id, type, currentPage = 1) => {
    try {
      setBookingLoading(true);

      const params = {
        page: currentPage,
        limit: bookingLimit,
      };

      if (type?.toLowerCase()?.includes("provider")) {
        params.providerId = id;
      } else {
        params.userId = id;
      }

      const res = await BookingService.getAll(params);

      setBookings(res?.data?.data || []);
      setBookingTotalPages(res?.data?.totalPages || 1);

    } catch (err) {
      console.error(err);
      setBookings([]);
      setBookingTotalPages(1);
    } finally {
      setBookingLoading(false);
    }
  };
  const handleViewBookings = async (user) => {
    setSelectedUser(user);
    setSelectedBookingUser(user);

    setShowBookings(true);
    setBookingPage(1);

    await fetchBookings(user.id, user.userType, 1);
  };
  const groupBookings = (data) => {
    const map = new Map();

    data.forEach((b) => {
      const key = b.groupId || `single-${b.id}`;

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(b);
    });

    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      items,
      isGrouped: String(key).startsWith("single-") ? false : true,
    }));
  };



  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Users Management
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage and monitor all users
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">

              {/* EXPORT BUTTON */}
              <button onClick={() => setShowExport(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700"
              >
                <Download className="w-5 h-5" />
                Export Data
              </button>

              {/* ADD USER */}
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" />
                Add User
              </button>

            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 mb-6">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{/* User Type Filter */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Users
              </label>

              <div className="flex flex-wrap gap-3">

                <button
                  onClick={() => {
                    setUserFilter("user");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${userFilter === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Users
                </button>

                <button
                  onClick={() => {
                    setUserFilter("service_provider");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${userFilter === "service_provider"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  Service Providers
                </button>

                <button
                  onClick={() => {
                    setUserFilter("all");
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${userFilter === "all"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  All
                </button>

              </div>
            </div>
            {/* Search */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="phone">Phone</option>
                <option value="createdAt">Latest</option>
              </select>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
              >
                <option value="ASC">Ascending</option>
                <option value="DESC">Descending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        #{u.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {u.name ?? "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {u.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${u.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="inline-flex gap-4">
                          <Eye
                            className="cursor-pointer text-gray-600 hover:scale-110"
                            onClick={() => {
                              setSelectedUser(u);
                              setShowView(true);
                            }}
                          />

                          <Edit
                            className="cursor-pointer text-blue-600 hover:scale-110"
                            onClick={() => {
                              setSelectedUser(u);
                              setForm({
                                name: u.name ?? "",
                                phone: u.phone ?? "",
                                email: u.email ?? "",
                                userType: u.userType ?? "user",
                                status: u.status ?? "active",
                              });
                              setShowEdit(true);
                            }}
                          />

                          <Trash
                            className="cursor-pointer text-red-600 hover:scale-110"
                            onClick={() => {
                              setDeleteUserId(u.id);
                            }}
                          />
                          <List
                            className="cursor-pointer text-blue-600 hover:scale-110"
                            onClick={() => handleViewBookings(u)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {showEdit && selectedUser && (
            <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/50">
              <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Edit User
                  </h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowEdit(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={form.userType}
                      onChange={(e) =>
                        setForm({ ...form, userType: e.target.value })
                      }
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="user">User</option>
                      <option value="service_provider">Service Provider</option>
                    </select>

                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="px-3 py-2 border rounded-lg"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
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
                        await fetchUsers();
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setSubmitting(false);
                      }
                    }}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                  >
                    {submitting ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {showView && selectedUser && (
            <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                      {isProvider
                        ? "Provider Details"
                        : "User Details"}
                    </h2>
                    <button
                      onClick={() => setShowView(false)}
                      className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  {isProvider && (
                    <div className="mb-2 flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 px-4 py-3">
                      <div>
                        <p className="text-sm text-purple-700 font-medium">
                          Service Provider Account
                        </p>
                        <p className="text-xs text-purple-500">
                          Can accept & complete bookings
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
                        PROVIDER
                      </span>
                    </div>
                  )}
                  {isProvider && (
                    <div className="grid grid-cols-2 gap-3 mb-2">

                      <div className="rounded-xl border bg-blue-50 p-4">
                        <p className="text-xs text-blue-600 font-medium">
                          Total Bookings
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                          <span className="font-semibold text-black">
                            {bookingTotalPages * bookingLimit}
                          </span>
                        </p>
                      </div>

                      <div className="rounded-xl border bg-green-50 p-4">
                        <p className="text-xs text-green-600 font-medium">
                          Completed
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                          {
                            bookings.filter(
                              (b) => b.status === "completed"
                            ).length
                          }
                        </p>
                      </div>

                    </div>
                  )}
                  {/* User ID */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">ID</p>
                      <p className="text-gray-900 font-mono">
                        #{selectedUser.id}
                      </p>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Name</p>
                      <p className="text-gray-900 font-semibold">
                        {selectedUser.name}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <p className="text-gray-900">{selectedUser.phone}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <p className="text-gray-900">
                        {selectedUser.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* User Type */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">Type</p>
                      <p className="text-gray-900 capitalize">
                        {selectedUser.userType}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                      <svg
                        className="w-5 h-5 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 font-medium">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <button
                    onClick={() => setShowView(false)}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium transition-all ${page === 1
                  ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Page <span className="text-blue-600">{page}</span> of{" "}
                  <span className="text-blue-600">{totalPages}</span>
                </span>
              </div>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium transition-all ${page === totalPages
                  ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                  : "bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300"
                  }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Add User
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowAdd(false)}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={form.userType}
                      onChange={(e) =>
                        setForm({ ...form, userType: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="user">User</option>
                      <option value="service_provider">Service Provider</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!form.phone) return;
                    try {
                      setSubmitting(true);
                      await UserService.create(form);
                      setShowAdd(false);
                      setForm({
                        name: "",
                        phone: "",
                        email: "",
                        userType: "user",
                        status: "active",
                      });
                      await fetchUsers();
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  disabled={submitting || !form.phone}
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Delete
        open={!!deleteUserId}
        onClose={() => setDeleteUserId(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleteUserId}
        title="Delete User?"
        description="This user will be permanently removed."
      />
      {showExport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[350px] shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Export Options</h2>

            {/* Scope */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Scope</p>
              <select
                value={exportScope}
                onChange={(e) => setExportScope(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value="page">Current Page</option>
                <option value="full">Full Data</option>
              </select>
            </div>

            {/* Type */}
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">User Type</p>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value="all">All</option>
                <option value="user">Users</option>
                <option value="provider">Providers</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowExport(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
      {/*Bookings */}
      {showBookings && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50">

          <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl">
            <div className="mb-4  p-3 text-sm text-gray-600">
              {isProvider
                ? "Total Jobs:"
                : "Total Bookings:"} <span className="font-semibold text-black">
                {((bookingTotalPages - 1) * bookingLimit) + bookings.length}
              </span>
            </div>
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                {isProvider
                  ? `Provider Jobs - ${selectedUser?.name}`
                  : `User Bookings - ${selectedUser?.name}`}
              </h2>

              <button
                onClick={() => {
                  setShowBookings(false);
                  setBookings([]);
                  setBookingPage(1);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="p-6 max-h-[400px] overflow-y-auto">

              {/* TEMP EMPTY */}
              {bookingLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : bookings.length === 0 ? (
                <p className="text-gray-500 text-center">No bookings found</p>
              ) : (
                groupBookings(bookings).map(({ key, items, isGrouped }) => (
                  <div key={key} className="mb-4 border rounded-xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-blue-50 px-4 py-3 border-b flex justify-between items-center">
                      <div className="font-semibold text-gray-800">
                        {isGrouped ? `Group #${key}` : `Single Booking`}
                      </div>

                      <div className="text-sm text-gray-500">
                        {items.length} Booking{items.length > 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="divide-y">
                      {items.map((b, i) => (
                        <div key={i} className="p-4 bg-white">

                          <div className="flex justify-between items-start gap-4">

                            {/* Left */}
                            <div>
                              <p className="font-medium text-gray-800">
                                Booking #{b.id}
                              </p>
                              <p className="text-sm font-semibold text-purple-600 mt-1">
                                🛠 {b.service?.title || b.service?.name || b.serviceName || "Service Not Available"}
                              </p>

                              <p className="text-sm text-gray-500 mt-1">
                                📍 {b.location || "No location"}
                              </p>

                              <p className="text-sm text-gray-500">
                                📅 {b.bookingDate} | ⏰ {b.bookingTime}
                              </p>
                            </div>

                            {/* Right */}
                            <div className="text-right">

                              <p className="font-semibold text-green-600">
                                ₹{b.priceAtBooking || 0}
                              </p>

                              <span
                                className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium
                ${b.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : b.status === "cancelled"
                                      ? "bg-red-100 text-red-700"
                                      : b.status === "pending"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-blue-100 text-blue-700"
                                  }`}
                              >
                                {b.status}
                              </span>

                            </div>

                          </div>

                        </div>
                      ))}
                    </div>

                  </div>
                ))
              )}

            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t flex items-center justify-between">

              {/* Pagination */}
              <div className="flex items-center gap-3">

                <button
                  onClick={async () => {
                    const newPage = bookingPage - 1;

                    if (newPage < 1) return;

                    setBookingPage(newPage);

                    await fetchBookings(
                      selectedBookingUser.id,
                      selectedBookingUser.userType,
                      newPage
                    );
                  }}
                  disabled={bookingPage === 1}
                  className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>

                <span className="text-sm text-gray-600">
                  Page {bookingPage} of {bookingTotalPages}
                </span>

                <button
                  onClick={async () => {
                    const newPage = bookingPage + 1;

                    if (newPage > bookingTotalPages) return;

                    setBookingPage(newPage);

                    await fetchBookings(
                      selectedBookingUser.id,
                      selectedBookingUser.userType,
                      newPage
                    );
                  }}
                  disabled={bookingPage === bookingTotalPages || bookingTotalPages === 0}
                  className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>

              </div>

              {/* Close */}
              <button
                onClick={() => {
                  setShowBookings(false);
                  setBookings([]);
                  setBookingPage(1);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {message && (
        <div className="fixed top-5 right-5 z-[6000] bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {message}
        </div>
      )}
    </div>
  );
};

export default Users;
