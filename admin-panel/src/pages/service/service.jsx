import { useEffect, useState } from "react";
import { ServiceService } from "../../services/services.service";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
  Tag,
  Shield,
} from "lucide-react";
import ServiceForm from "./serviceAdd";
import { Pencil, Trash2, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null); // for edit later

  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("DESC");

  const load = async () => {
    setLoading(true);
    const res = await ServiceService.getAll({
      search,
      page,
      limit: 10,
      sortBy,
      order,
    });

    setServices(res.data.data);
    setTotalPages(res.data.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    const fetchServices = async () => {
      await load();
    };
    fetchServices();
  }, [search, page, sortBy, order]);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center gap-3">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Services</h1>
                <p className="text-sm text-gray-600">
                  Total:{" "}
                  <span className="font-bold text-gray-900">
                    {services.length}
                  </span>{" "}
                  services
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setOpenForm(true);
              }}
              className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Services
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Search services..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
              </div>

              <select
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-gray-700 cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="id">ID</option>
                <option value="title">Title</option>
                <option value="price">Price</option>
              </select>

              <select
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-gray-700 cursor-pointer"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rate Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-5 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                          <Briefcase className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          No services found
                        </h3>
                        <p className="text-gray-600">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  services.map((srv) => (
                    <tr
                      key={srv.id}
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          #{srv.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {srv.mainimage ? (
                          <img
                            src={srv.mainimage}
                            alt={srv.title}
                            className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {srv.title}
                          </div>
                          {srv.shortDescription && (
                            <div className="text-xs text-gray-500 truncate mt-1">
                              {srv.shortDescription}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">
                            {srv?.category?.name || "No Category"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                          <IndianRupee className="w-4 h-4" />
                          {srv.price?.toLocaleString("en-IN") || "N/A"}
                        </div>
                        {srv.discount > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {srv.discount}% off
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 capitalize">
                          {srv.rateType?.replace("_", " ") || "Fixed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {srv.duration || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            srv.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {srv.status || "inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {srv.isFeatured && (
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigate(`/services/${srv.id}/rates`)}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                            title="Service Rate List"
                          >
                            <List className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/services/${srv.id}/area-prices`)}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700"
                            title="Area Wise Price"
                          >
                            <IndianRupee className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/services/${srv.id}/warranties`)}
                            className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600"
                            title="Service Warranty List"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          {/* Edit */}
                          <button
                            onClick={() => {
                              setSelected(srv);
                              setOpenForm(true);
                            }}
                            className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={async () => {
                              if (
                                !confirm(
                                  "Are you sure you want to delete this service?"
                                )
                              )
                                return;
                              await ServiceService.deleteService(srv.id);
                              load();
                            }}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
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
      <ServiceForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        data={selected}
        reload={load}
      />
    </div>
  );
}
