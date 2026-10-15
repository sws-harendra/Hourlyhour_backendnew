import React, { useEffect, useState } from "react";
import {
  Layers,
  Plus,
  Search,
  Grid3X3,
  List as ListIcon,
  Star,
  CheckCircle2,
  Edit2,
  Trash2,
  ExternalLink,
  Wind,
  Snowflake,
  Shirt,
  Droplets,
  Flame,
  Zap,
  Globe,
} from "lucide-react";
import WebService from "../../services/web.service";
import Delete from "../../components/Delete";
import toast from "react-hot-toast";

const ICON_MAP = {
  Wind: Wind,
  Snowflake: Snowflake,
  Shirt: Shirt,
  Droplets: Droplets,
  Flame: Flame,
  Zap: Zap,
  Layers: Layers,
};

export default function WebCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [openModal, setOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    icon: "Layers",
    image: "",
    displayOrder: 1,
    isFeatured: true,
    status: "active",
    metaTitle: "",
    metaDescription: "",
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await WebService.getWebCategories({
        status: statusFilter,
        search,
      });
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCategories();
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      tagline: "",
      description: "",
      icon: "Layers",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
      displayOrder: categories.length + 1,
      isFeatured: true,
      status: "active",
      metaTitle: "",
      metaDescription: "",
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      tagline: cat.tagline || "",
      description: cat.description || "",
      icon: cat.icon || "Layers",
      image: cat.image || "",
      displayOrder: cat.displayOrder || 1,
      isFeatured: !!cat.isFeatured,
      status: cat.status || "active",
      metaTitle: cat.metaTitle || "",
      metaDescription: cat.metaDescription || "",
    });
    setOpenModal(true);
  };

  // Auto-generate slug when name changes
  const handleNameChange = (e) => {
    const val = e.target.value;
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: editingCategory ? prev.slug : autoSlug,
      metaTitle: editingCategory ? prev.metaTitle : `${val} Repair & Service in Patna | Repair Saathi`,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (editingCategory) {
        await WebService.updateWebCategory(editingCategory.id, formData);
        toast.success("Category updated successfully!");
        setCategories((prev) =>
          prev.map((c) => (c.id === editingCategory.id ? { ...c, ...formData } : c))
        );
      } else {
        const res = await WebService.createWebCategory(formData);
        toast.success("New web category created!");
        setCategories((prev) => [...prev, res.data]);
      }
      setOpenModal(false);
    } catch {
      toast.error("Failed to save category");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await WebService.deleteWebCategory(deleteId);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleFeatured = async (cat) => {
    try {
      await WebService.toggleCategoryFeatured(cat.id);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isFeatured: !c.isFeatured } : c))
      );
      toast.success(
        cat.isFeatured ? "Removed from Featured" : "Added to Featured on Website"
      );
    } catch {
      toast.error("Could not toggle featured");
    }
  };

  const toggleStatus = async (cat) => {
    try {
      await WebService.toggleCategoryStatus(cat.id);
      const newStatus = cat.status === "active" ? "inactive" : "active";
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, status: newStatus } : c))
      );
      toast.success(`Category is now ${newStatus}`);
    } catch {
      toast.error("Could not toggle status");
    }
  };

  // Stats
  const totalCount = categories.length;
  const activeCount = categories.filter((c) => c.status === "active").length;
  const featuredCount = categories.filter((c) => c.isFeatured).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Web Categories
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Website
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage appliance categories displayed on the customer-facing website and navigation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 transition text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Web Category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{totalCount}</span>
            <span className="text-xs text-slate-400">Web App Sections</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Active on Website
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{activeCount}</span>
            <span className="text-xs text-emerald-300/70">Publicly Visible</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Featured on Homepage
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400">{featuredCount}</span>
            <span className="text-xs text-amber-300/70">Highlighted</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { key: "all", label: "All Categories" },
            { key: "active", label: "Active Only" },
            { key: "inactive", label: "Inactive" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === tab.key
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search category name, slug..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 transition outline-none"
          />
        </form>
      </div>

      {/* Main Content Area: Grid or Table */}
      {loading ? (
        <div className="p-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
          <Layers className="w-8 h-8 text-emerald-500 animate-pulse mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading web categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/50 rounded-2xl border border-slate-800">
          <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">
            No web categories found
          </h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1 mb-4">
            Get started by creating your first category for the website.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition"
          >
            Create Category
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Layers;

            return (
              <div
                key={cat.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col"
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-900 to-slate-800">
                      <IconComponent className="w-12 h-12 text-slate-600" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-950/80 backdrop-blur text-slate-300 border border-white/10">
                      Order: #{cat.displayOrder || 1}
                    </span>

                    <button
                      onClick={() => toggleFeatured(cat)}
                      title={cat.isFeatured ? "Featured on Home" : "Click to feature"}
                      className={`p-1.5 rounded-full backdrop-blur transition ${
                        cat.isFeatured
                          ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30"
                          : "bg-slate-950/70 text-slate-400 hover:text-white"
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Category Floating Icon */}
                  <div className="absolute bottom-3 left-4 w-12 h-12 rounded-2xl bg-slate-900/90 backdrop-blur border border-white/10 flex items-center justify-center text-emerald-400 shadow-xl">
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs font-mono text-emerald-500 mt-0.5">
                        /{cat.slug}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleStatus(cat)}
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                        cat.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {cat.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {cat.tagline && (
                    <p className="text-xs font-medium text-slate-300 mt-2">
                      {cat.tagline}
                    </p>
                  )}

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed flex-1">
                    {cat.description || "No description provided."}
                  </p>

                  {/* Meta Tag Badge */}
                  {cat.metaTitle && (
                    <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-500 truncate max-w-[200px]" title={cat.metaTitle}>
                        <Globe className="w-3 h-3 text-blue-400" />
                        SEO Configured
                      </span>
                      <span className="text-slate-500">{cat.totalServices || 0} services</span>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <a
                      href={`http://localhost:3000/category/${cat.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
                    >
                      Preview on Web
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-4">Order</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Slug</th>
                  <th className="px-5 py-4">Featured</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-800/30 transition">
                    <td className="px-5 py-4 font-mono text-xs text-slate-400 font-semibold">
                      #{cat.displayOrder || 1}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                            <Layers className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white">{cat.name}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {cat.tagline || cat.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-emerald-400">
                      /{cat.slug}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleFeatured(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          cat.isFeatured
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {cat.isFeatured ? "Featured" : "Standard"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleStatus(cat)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          cat.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {cat.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(cat.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
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
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingCategory ? "Edit Web Category" : "Add New Web Category"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure how this service category appears on the customer website
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="overflow-y-auto py-5 space-y-4 flex-1 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Air Conditioner (AC)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    URL Slug *
                  </label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-400 focus-within:border-emerald-500">
                    <span className="text-xs text-slate-500 font-mono">/category/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="air-conditioner-repair"
                      className="w-full bg-transparent border-none text-emerald-400 font-mono text-xs outline-none ml-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Catchy Tagline / Short Title
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="e.g. Expert doorstep cooling & heating appliance repair"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of services covered under this category..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Banner Image URL & Preview */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Category Banner Image URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  />
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                  )}
                </div>
              </div>

              {/* Icon & Display Order & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Icon Theme
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    <option value="Wind">💨 Wind / AC</option>
                    <option value="Snowflake">❄️ Snowflake / Fridge</option>
                    <option value="Shirt">👕 Shirt / Washing Machine</option>
                    <option value="Droplets">💧 Droplets / Water Purifier</option>
                    <option value="Flame">🔥 Flame / Microwave</option>
                    <option value="Zap">⚡ Zap / Geyser & Electric</option>
                    <option value="Layers">📁 Layers / General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Display Sequence Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="inactive">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              {/* Featured Switch */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="featuredToggle" className="text-xs text-slate-200 cursor-pointer">
                  <span className="font-semibold text-white block">Feature on Website Homepage</span>
                  Highlight this category in the popular services grid on the website
                </label>
              </div>

              {/* SEO Meta Information */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-400" /> Website SEO & Meta Tags
                </h4>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Page Meta Title</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="e.g. Best AC Repair & Gas Refill in Patna | Repair Saathi"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Page Meta Description</label>
                  <textarea
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Brief SEO description for search engines..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 transition"
                >
                  {editingCategory ? "Update Category" : "Save Web Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Delete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Web Category?"
        description="Are you sure you want to delete this category from the website? Linked web pages may become inactive."
      />
    </div>
  );
}
