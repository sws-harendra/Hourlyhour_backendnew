import React, { useEffect, useState, useMemo } from "react";
import {
  Globe,
  Plus,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Pencil,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  MapPin,
  Hammer,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileText,
  Key,
} from "lucide-react";
import toast from "react-hot-toast";
import SeoLocationPageService from "../../../services/seoLocationPage.service";
import CreateSeoPageModal from "./CreateSeoPageModal";
import SeoPagePreviewModal from "./SeoPagePreviewModal";
import QuickAddLocationModal from "./QuickAddLocationModal";
import QuickAddServiceModal from "./QuickAddServiceModal";
import AiSettingsModal from "./AiSettingsModal";
import Delete from "../../../components/Delete";
import { TEMPLATES } from "./seoHelpers";

export default function SeoLocationPagesList() {
  const [pages, setPages] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    aiGenerated: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [templateFilter, setTemplateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Multi-Select
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [previewPage, setPreviewPage] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [hasAiKey, setHasAiKey] = useState(false);

  // Copy URL state
  const [copiedId, setCopiedId] = useState(null);

  // Fetch stats and pages
  const loadData = async () => {
    setLoading(true);
    try {
      const [pagesRes, statsRes, aiRes] = await Promise.allSettled([
        SeoLocationPageService.getAll({
          page: currentPage,
          limit: 10,
          search,
          status: statusFilter,
          template: templateFilter,
          sortBy,
          order,
        }),
        SeoLocationPageService.getStats(),
        SeoLocationPageService.getAiSettings(),
      ]);

      if (pagesRes.status === "fulfilled" && pagesRes.value.success) {
        setPages(pagesRes.value.data || []);
        setTotalPages(pagesRes.value.totalPages || 1);
        setTotalCount(pagesRes.value.total || 0);
      }

      if (statsRes.status === "fulfilled" && statsRes.value.success) {
        setStats(statsRes.value.data);
      }

      if (aiRes.status === "fulfilled" && aiRes.value.success) {
        setHasAiKey(aiRes.value.hasKey);
      }
    } catch (err) {
      console.error("Error loading SEO pages:", err);
      toast.error("Failed to load SEO Location Pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, statusFilter, templateFilter, sortBy, order]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Multi-select helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(pages.map((p) => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle status single
  const handleToggleStatus = async (page) => {
    try {
      const res = await SeoLocationPageService.toggleStatus(page.id);
      if (res.success) {
        toast.success(
          `Page ${res.data.status === "published" ? "Published" : "Moved to Draft"}`
        );
        loadData();
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Delete single page
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await SeoLocationPageService.delete(deleteId);
      if (res.success) {
        toast.success("SEO Location Page deleted successfully");
        setDeleteId(null);
        loadData();
      } else {
        toast.error(res.message || "Failed to delete page");
      }
    } catch (err) {
      toast.error("Error deleting page");
    } finally {
      setDeleting(false);
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected pages?`)) {
      return;
    }

    try {
      const res = await SeoLocationPageService.bulkDelete(selectedIds);
      if (res.success) {
        toast.success(res.message || "Pages deleted successfully");
        setSelectedIds([]);
        loadData();
      }
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };

  // Copy slug / URL
  const handleCopyLink = (page) => {
    const url = `https://repairsaathi.in/${page.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(page.id);
    toast.success("Page URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI-Powered Local Landing Pages
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            SEO Location Pages
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build, optimize, and rank high-converting city and area landing pages with Gemini AI.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              hasAiKey
                ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
                : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 animate-pulse"
            }`}
            title="Configure Google Gemini API Key"
          >
            <Key className="w-3.5 h-3.5 text-purple-600" />
            <span>{hasAiKey ? "AI Key Active" : "Enter AI API Key"}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasAiKey ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => setShowAddLocation(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Location</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddService(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Hammer className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Service</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingPage(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create SEO Location Page</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Total SEO Pages</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {stats.total || pages.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Published Live</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {stats.published || pages.filter((p) => p.status === "published").length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">Drafts Pending</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5">
              {stats.draft || pages.filter((p) => p.status === "draft").length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 font-medium">AI Auto-Written</div>
            <div className="text-2xl font-extrabold text-purple-600 mt-0.5">
              {stats.aiGenerated || pages.filter((p) => p.isAiGenerated).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by H1, Service, Location, or Slug..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Template Filter */}
          <select
            value={templateFilter}
            onChange={(e) => setTemplateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Templates</option>
            <option value="grid">Grid</option>
            <option value="timeline">Timeline</option>
            <option value="card">Card</option>
            <option value="split">Split</option>
          </select>

          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="createdAt">Date Created</option>
            <option value="seoScore">SEO Score</option>
            <option value="h1Heading">Heading</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            title="Refresh"
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Pages Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 pl-4 pr-2 w-8">
                  <input
                    type="checkbox"
                    checked={
                      pages.length > 0 && selectedIds.length === pages.length
                    }
                    onChange={handleSelectAll}
                    className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3">Page Heading & Focus</th>
                <th className="py-3.5 px-3">Service & Location</th>
                <th className="py-3.5 px-3">Template</th>
                <th className="py-3.5 px-3">SEO Score</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pr-4 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading SEO Location Pages...
                  </td>
                </tr>
              ) : pages.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-14 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        No SEO Location Pages Found
                      </div>
                      <p className="text-xs text-slate-500">
                        Create your first localized landing page with Gemini AI auto-writing.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPage(null);
                          setIsCreateModalOpen(true);
                        }}
                        className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create First Page</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                pages.map((page) => {
                  const tmpl =
                    TEMPLATES.find((t) => t.id === page.template) ||
                    TEMPLATES[0];
                  const isSelected = selectedIds.includes(page.id);

                  return (
                    <tr
                      key={page.id}
                      className={`hover:bg-slate-50/60 transition-colors ${
                        isSelected ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      <td className="py-3.5 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(page.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Heading & Slug */}
                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-bold text-slate-800 truncate" title={page.h1Heading}>
                          {page.h1Heading}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 font-mono text-[11px]">
                          <span className="truncate text-slate-500">
                            /{page.slug}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(page)}
                            className="hover:text-slate-800 cursor-pointer p-0.5 rounded"
                            title="Copy link"
                          >
                            {copiedId === page.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Service & Location */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">
                            <Hammer className="w-3 h-3" />
                            {page.serviceName}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            <MapPin className="w-3 h-3" />
                            {page.locationName}
                          </span>
                        </div>
                      </td>

                      {/* Template */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-700 bg-white shadow-2xs">
                          <span
                            className={`w-2 h-2 rounded-full ${tmpl.dotColor}`}
                          />
                          <span>{tmpl.name}</span>
                        </span>
                      </td>

                      {/* SEO Score Badge */}
                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-100 shadow-2xs">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              page.seoScore >= 85
                                ? "bg-emerald-500"
                                : page.seoScore >= 70
                                ? "bg-blue-500"
                                : page.seoScore >= 40
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span
                            className={
                              page.seoScore >= 85
                                ? "text-emerald-700"
                                : page.seoScore >= 70
                                ? "text-blue-700"
                                : page.seoScore >= 40
                                ? "text-amber-700"
                                : "text-red-600"
                            }
                          >
                            {page.seoScore}/100
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(page)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                            page.status === "published"
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {page.status === "published" ? "● Published" : "○ Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-4 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewPage(page)}
                            title="Preview Page"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingPage(page);
                              setIsCreateModalOpen(true);
                            }}
                            title="Edit Page"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteId(page.id)}
                            title="Delete Page"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pages.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {pages.length} of {totalCount} records
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <span className="font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-200 border border-slate-800">
          <span className="text-xs font-semibold">
            {selectedIds.length} page(s) selected
          </span>

          <div className="h-4 w-px bg-slate-700" />

          <button
            type="button"
            onClick={handleBulkDelete}
            className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Selected
          </button>

          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-xs text-slate-400 hover:text-white cursor-pointer ml-1"
          >
            Clear
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateSeoPageModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPage(null);
        }}
        initialData={editingPage}
        onSuccess={() => loadData()}
      />

      <SeoPagePreviewModal
        isOpen={Boolean(previewPage)}
        onClose={() => setPreviewPage(null)}
        page={previewPage}
      />

      <QuickAddLocationModal
        isOpen={showAddLocation}
        onClose={() => setShowAddLocation(false)}
        onSuccess={() => loadData()}
      />

      <QuickAddServiceModal
        isOpen={showAddService}
        onClose={() => setShowAddService(false)}
        onSuccess={() => loadData()}
      />

      <AiSettingsModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onKeyUpdated={(active) => setHasAiKey(active)}
      />

      <Delete
        isOpen={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete SEO Location Page"
        message="Are you sure you want to permanently delete this SEO location page?"
      />
    </div>
  );
}

