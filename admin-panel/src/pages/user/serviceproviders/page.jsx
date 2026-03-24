import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash,
} from "lucide-react";
import { UserService } from "../../../services/user.service";

// Mock UserService for demo

const ServiceProviders = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState("ASC");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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
        setUsers(data.data);
        setTotalPages(data.pagination.totalPages);
        setLoading(false);
      } catch {
        console.log("some error occured");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, search, sort, order, limit]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 p-6">
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
            {/* <button className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium">
              <Plus className="w-5 h-5" />
              Add User
            </button> */}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  onChange={(e) => setSearch(e.target.value)}
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
                onChange={(e) => setSort(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white cursor-pointer"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
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
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            u.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>{" "}
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="inline-flex gap-4">
                          <Eye color="black" />

                          <Edit color="blue" />
                          <Trash color="red" />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium transition-all ${
                  page === 1
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
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg font-medium transition-all ${
                  page === totalPages
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
      </div>
    </div>
  );
};

export default ServiceProviders;
