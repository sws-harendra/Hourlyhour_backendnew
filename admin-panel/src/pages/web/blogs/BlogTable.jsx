import React, { useRef, useEffect } from "react";
import {
  BookOpen,
  Plus,
  RefreshCw,
  Image as ImageIcon,
  Star,
  Copy,
  Check,
  Layers,
  User,
  Clock,
  Eye,
  ExternalLink,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { normalizeImageUrl } from "./blogHelpers";

export default function BlogTable({
  loading,
  blogs,
  totalFilteredCount,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  search,
  categoryFilter,
  statusFilter,
  selectedIds,
  onToggleSelectRow,
  onToggleSelectPage,
  onOpenCreate,
  onOpenEdit,
  onToggleStatus,
  onDeleteClick,
  onCopyUrl,
  copiedId,
}) {
  const headerCheckboxRef = useRef(null);

  // Check if all rows on this page are selected
  const currentPageIds = blogs.map((b) => b.id);
  const isAllPageSelected =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedIds.includes(id));
  const isSomePageSelected =
    currentPageIds.some((id) => selectedIds.includes(id)) && !isAllPageSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomePageSelected;
    }
  }, [isSomePageSelected]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center text-slate-400">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
          <p className="text-sm">Loading blog articles from database...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Blog Articles Found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
            {search || categoryFilter !== "all" || statusFilter !== "all"
              ? "No blogs matched your search criteria. Try resetting the filters."
              : "You haven't published any repair guides yet. Create your first blog post to attract customers from Google search!"}
          </p>
          <button
            onClick={onOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write Your First Blog</span>
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  {/* Select All Checkbox */}
                  <th className="py-3.5 px-4 w-12 text-center">
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={onToggleSelectPage}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 accent-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                      title={isAllPageSelected ? "Deselect all on this page" : "Select all on this page"}
                    />
                  </th>
                  <th className="py-3.5 px-4 font-semibold">Article &amp; URL Slug</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Author &amp; Read Time</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Views</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {blogs.map((blog) => {
                  const isSelected = selectedIds.includes(blog.id);

                  return (
                    <tr
                      key={blog.id}
                      className={`transition group ${
                        isSelected
                          ? "bg-emerald-500/10 hover:bg-emerald-500/15"
                          : "hover:bg-slate-800/40"
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelectRow(blog.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 accent-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                        />
                      </td>

                      {/* Image & Title */}
                      <td className="py-4 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/60 shrink-0">
                            {blog.image ? (
                              <img
                                src={normalizeImageUrl(blog.image)}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white group-hover:text-emerald-400 transition truncate">
                                {blog.title}
                              </h4>
                              {blog.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <Star className="w-2.5 h-2.5 fill-amber-300" /> Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono text-emerald-400/90 truncate max-w-[260px]">
                                /{blog.slug}
                              </span>
                              <button
                                onClick={() => onCopyUrl(blog.slug, blog.id)}
                                className="text-slate-500 hover:text-slate-300 transition cursor-pointer"
                                title="Copy URL"
                              >
                                {copiedId === blog.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                          <Layers className="w-3 h-3 text-emerald-400" />
                          {blog.category}
                        </span>
                      </td>

                      {/* Author & Read Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs text-slate-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{blog.author || "Tech Team"}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{blog.readTime || "5 min read"}</span>
                        </div>
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-xs font-semibold text-slate-300 border border-slate-700/50">
                          <Eye className="w-3 h-3 text-purple-400" />
                          {blog.views || 0}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus(blog)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border cursor-pointer ${
                            blog.status === "published"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              blog.status === "published"
                                ? "bg-emerald-400 animate-pulse"
                                : "bg-amber-400"
                            }`}
                          />
                          {blog.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://repairsaathi.in/home-appliance-repair-blog/${blog.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="View on Live Website"
                          >
                            <ExternalLink className="w-4 h-4 text-emerald-400" />
                          </a>
                          <button
                            onClick={() => onOpenEdit(blog)}
                            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Edit Blog"
                          >
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => onDeleteClick(blog.id)}
                            className="p-2 rounded-lg bg-slate-800/60 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition cursor-pointer"
                            title="Delete Blog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modern Pagination Footer (Matching AllBookings screenshot) */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              Showing{" "}
              <strong className="text-white">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-white">
                {Math.min(currentPage * pageSize, totalFilteredCount)}
              </strong>{" "}
              of <strong className="text-white">{totalFilteredCount}</strong> records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-300 transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 font-medium text-slate-300">
                Page <span className="text-emerald-400 font-bold">{currentPage}</span> of{" "}
                <span>{totalPages || 1}</span>
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-slate-900 disabled:hover:text-slate-300 transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

