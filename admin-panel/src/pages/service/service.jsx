import { useEffect, useState, useMemo } from "react";
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
  Receipt,
  Layers,
  X,
} from "lucide-react";
import ServiceForm from "./serviceAdd";
import RateCardModal from "./RateCardModal";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Delete from "../../components/Delete";

export default function Services() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("services"); // "services" | "rateCards"
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Rate Cards state
  const [rateCards, setRateCards] = useState([]);
  const [rateCardsLoading, setRateCardsLoading] = useState(false);
  const [openRateCardModal, setOpenRateCardModal] = useState(false);
  const [selectedRateCard, setSelectedRateCard] = useState(null);
  const [selectedRateCardCategory, setSelectedRateCardCategory] = useState(null);

  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("DESC");
  const [selectedRateCardFilter, setSelectedRateCardFilter] = useState("");

  const rateCardOptions = useMemo(() => {
    const set = new Set();
    rateCards.forEach((c) => {
      if (c.rateListHeading?.trim()) set.add(c.rateListHeading.trim());
    });
    services.forEach((s) => {
      if (s.rateListHeading?.trim()) set.add(s.rateListHeading.trim());
    });
    return Array.from(set);
  }, [rateCards, services]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ServiceService.getAll({
        search,
        page,
        limit: 10,
        sortBy,
        order,
        rateCard: selectedRateCardFilter || undefined,
      });

      setServices(res.data?.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRateCards = async () => {
    try {
      setRateCardsLoading(true);
      const res = await ServiceService.getRateCardsOverview();
      setRateCards(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load rate cards:", err);
    } finally {
      setRateCardsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, page, sortBy, order, selectedRateCardFilter]);

  useEffect(() => {
    loadRateCards();
  }, []);

  const handleDelete = async () => {
    try {
      await ServiceService.deleteService(deleteId);
      setDeleteId(null);
      load();
      loadRateCards();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Services &amp; Rate Cards</h1>
                <p className="text-sm text-gray-600">
                  Total: <span className="font-bold text-gray-900">{services.length}</span> services across <span className="font-bold text-gray-900">{rateCards.length}</span> categories
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => navigate("/rate-cards")}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-all shadow-xs font-semibold text-sm cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-blue-600" />
                Rate Cards
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setOpenForm(true);
                }}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Services
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "services"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Services List ({services.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("rateCards");
                loadRateCards();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === "rateCards"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Receipt className="w-4 h-4" />
              Category Rate Cards ({rateCards.length})
            </button>
          </div>
        </div>

        {activeTab === "rateCards" ? (
          /* RATE CARDS TAB */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Category Rate Cards</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Select a category to set up its Rate Card, then click &quot;Manage Rate List&quot; to configure its pricing components.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedRateCard(null);
                  setSelectedRateCardCategory(null);
                  setOpenRateCardModal(true);
                }}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-all self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create New Rate Card
              </button>
            </div>

            {rateCardsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : rateCards.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">No Rate Cards Found</h4>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  Create your first category rate card to define clear and upfront component prices for customers.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRateCard(null);
                    setSelectedRateCardCategory(null);
                    setOpenRateCardModal(true);
                  }}
                  className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Create First Rate Card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rateCards.map((rc) => {
                  const hasRates = rc.rates && rc.rates.length > 0;
                  return (
                    <div
                      key={rc.categoryId}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Category & Badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            {rc.categoryImage ? (
                              <img
                                src={rc.categoryImage}
                                alt={rc.categoryName}
                                className="w-10 h-10 object-cover rounded-xl border border-gray-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold">
                                {rc.categoryName?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-gray-900 text-base">
                                {rc.categoryName}
                              </h4>
                              <span className="text-xs text-gray-500">
                                {rc.servicesCount} services linked
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              hasRates
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {hasRates ? `${rc.rates.length} Items` : "No Items"}
                          </span>
                        </div>

                        {/* Rate Card Heading */}
                        <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">
                            Rate Card Heading:
                          </span>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                            {rc.rateListHeading || "Standard Rate Card (Not configured)"}
                          </p>
                        </div>

                        {/* Preview Rates */}
                        <div className="mt-4">
                          <span className="text-xs font-bold text-gray-600 block mb-2">
                            Rate List Preview:
                          </span>
                          {hasRates ? (
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                              {rc.rates.slice(0, 4).map((rate, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-gray-50 text-gray-700"
                                >
                                  <span className="truncate max-w-[170px] font-medium">
                                    {rate.title}
                                  </span>
                                  <span className="font-bold text-blue-700 shrink-0">
                                    ₹{rate.price}
                                  </span>
                                </div>
                              ))}
                              {rc.rates.length > 4 && (
                                <p className="text-[11px] text-gray-400 text-center pt-1">
                                  + {rc.rates.length - 4} more items inside
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic py-3 text-center bg-gray-50/60 rounded-lg">
                              No items in rate list yet. Click &quot;Manage Rate List&quot; to add.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Card Action */}
                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/rate-cards?category=${rc.categoryId}`);
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Manage Rate List
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* SERVICES TAB */
          <div>
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

                {/* Rate Card Filter */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                    <Receipt className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                      Rate Card:
                    </span>
                  </div>

                  <select
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium text-gray-700 cursor-pointer text-sm"
                    value={selectedRateCardFilter}
                    onChange={(e) => {
                      setPage(1);
                      setSelectedRateCardFilter(e.target.value);
                    }}
                  >
                    <option value="">All Rate Cards</option>
                    {rateCardOptions.map((rc, idx) => (
                      <option key={idx} value={rc}>
                        {rc}
                      </option>
                    ))}
                  </select>

                  {selectedRateCardFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setPage(1);
                        setSelectedRateCardFilter("");
                      }}
                      className="p-2.5 text-xs font-bold text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Clear Rate Card filter"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
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
                        Warranty (in Days)
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
                        <td colSpan="11" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                              <Briefcase className="w-10 h-10 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {selectedRateCardFilter
                                ? `No services found in "${selectedRateCardFilter}" Rate Card`
                                : "No services found"}
                            </h3>
                            <p className="text-gray-600">
                              {selectedRateCardFilter
                                ? "Try clearing the Rate Card filter or adding a service to this card."
                                : "Try adjusting your search or filters"}
                            </p>
                            {selectedRateCardFilter && (
                              <button
                                type="button"
                                onClick={() => setSelectedRateCardFilter("")}
                                className="mt-3 px-4 py-2 bg-blue-50 text-blue-700 font-semibold text-xs rounded-xl hover:bg-blue-100 transition-all cursor-pointer"
                              >
                                Clear Rate Card Filter
                              </button>
                            )}
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
                                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {srv.title}
                              </p>
                              {srv.rateListHeading && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                  <Receipt className="w-3 h-3 text-blue-500" />
                                  {srv.rateListHeading}
                                </span>
                              )}
                              {srv.shortDescription && (
                                <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                                  {srv.shortDescription}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {srv.category?.name || "Uncategorized"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">
                              ₹{srv.price}
                            </span>
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
                            <span className="text-sm text-gray-700">
                              {srv.warranty || "-"}
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
                              {/* Open Rate Card for this category */}
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/rate-cards?category=${srv.categoryId}`);
                                }}
                                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer"
                                title="Manage Rate Card & Rate List"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(`/services/${srv.id}/area-prices`)
                                }
                                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer"
                                title="Area Wise Price"
                              >
                                <IndianRupee className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelected(srv);
                                  setOpenForm(true);
                                }}
                                className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => setDeleteId(srv.id)}
                                className="cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
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
                    type="button"
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
                    type="button"
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
        )}
      </div>

      <ServiceForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        data={selected}
        reload={() => {
          load();
          loadRateCards();
        }}
      />

      <RateCardModal
        open={openRateCardModal}
        onClose={() => setOpenRateCardModal(false)}
        initialCategoryId={selectedRateCardCategory}
        initialData={selectedRateCard}
        reload={() => {
          load();
          loadRateCards();
        }}
      />

      <Delete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Service?"
        description="This service will be permanently removed."
      />
    </div>
  );
}
