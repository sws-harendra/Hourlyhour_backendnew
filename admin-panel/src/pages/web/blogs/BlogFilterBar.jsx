import React from "react";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { CATEGORIES } from "./blogHelpers";

export default function BlogFilterBar({
  search,
  setSearch,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  pageSize,
  setPageSize,
  filteredCount,
  totalCount,
}) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search & Filter Left Group */}
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, slug, tag, or excerpt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Status Pills */}
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusFilter === "published"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  statusFilter === "draft"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Drafts
              </button>
            </div>
          </div>
        </div>

        {/* Sort & Order Controls (Matching AllBookings style) */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="createdAt" className="bg-slate-900 text-white">Date Added</option>
              <option value="title" className="bg-slate-900 text-white">Title (A-Z)</option>
              <option value="views" className="bg-slate-900 text-white">Views</option>
              <option value="id" className="bg-slate-900 text-white">ID</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "DESC" ? "ASC" : "DESC")}
              className="flex items-center gap-1 font-mono font-semibold px-1.5 py-0.5 rounded hover:bg-slate-800 text-emerald-400 transition cursor-pointer"
              title={`Sort ${sortOrder === "DESC" ? "Descending" : "Ascending"} - Click to toggle`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{sortOrder}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-slate-500 text-[11px]">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value={10} className="bg-slate-900 text-white">10 / page</option>
              <option value={20} className="bg-slate-900 text-white">20 / page</option>
              <option value={50} className="bg-slate-900 text-white">50 / page</option>
              <option value={100} className="bg-slate-900 text-white">100 / page</option>
            </select>
          </div>

          <span className="hidden sm:inline">Showing {filteredCount} of {totalCount}</span>
        </div>
      </div>
    </div>
  );
}

