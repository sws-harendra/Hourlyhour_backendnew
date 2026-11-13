import React from "react";
import {
  BookOpen,
  Edit3,
  Code2,
  Eye,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

export default function BlogEditorHeader({
  editingBlog,
  status,
  stats,
  activeTab,
  setActiveTab,
  saving,
  onClose,
  onSubmit,
}) {
  return (
    <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {editingBlog ? "Edit Blog Article" : "Create New Blog Article"}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                status === "published"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {status.toUpperCase()}
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            {stats.words} words • {stats.chars} chars • {stats.readTime}
          </p>
        </div>
      </div>

      {/* Mode Switchers & Actions */}
      <div className="flex items-center gap-3">
        {/* Tab Mode Toggle */}
        <div className="hidden sm:flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "editor"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" /> Word Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("html")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "html"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> HTML Source
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === "preview"
                ? "bg-white text-emerald-600 font-semibold shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Live Web Preview
          </button>
        </div>

        {/* Action Buttons */}
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSubmit("draft")}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => onSubmit("published")}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>{editingBlog ? "Update & Publish" : "Publish to Website"}</span>
        </button>
      </div>
    </div>
  );
}

