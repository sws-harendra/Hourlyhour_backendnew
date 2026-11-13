import React from "react";
import { CheckCircle2, Check, Clock, Trash2, X, Sparkles } from "lucide-react";

export default function BlogBulkActionsBar({
  selectedIds,
  totalFilteredCount,
  onSelectAllFiltered,
  onClearSelection,
  onBulkPublish,
  onBulkDraft,
  onBulkDelete,
  bulkLoading,
}) {
  if (!selectedIds || selectedIds.length === 0) return null;

  const allFilteredSelected =
    totalFilteredCount > 0 && selectedIds.length === totalFilteredCount;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-auto max-w-4xl px-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/50 rounded-2xl shadow-2xl p-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 text-sm text-white">
        {/* Left Info Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wide">
                {selectedIds.length}
              </span>
              <span className="text-slate-300 text-xs sm:text-sm">
                {selectedIds.length === 1 ? "article selected" : "articles selected"}
              </span>
            </div>
            {!allFilteredSelected && totalFilteredCount > selectedIds.length && (
              <button
                type="button"
                onClick={onSelectAllFiltered}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
              >
                Select all {totalFilteredCount} matching articles
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onBulkPublish}
            disabled={bulkLoading}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Mark all selected articles as Published (Live)"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish Selected</span>
          </button>

          <button
            type="button"
            onClick={onBulkDraft}
            disabled={bulkLoading}
            className="px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Move all selected articles to Drafts"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Draft Selected</span>
          </button>

          <button
            type="button"
            onClick={onBulkDelete}
            disabled={bulkLoading}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
            title="Delete all selected articles"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>

          <div className="w-[1px] h-6 bg-slate-700 mx-1 hidden sm:block" />

          {/* Deselect All */}
          <button
            type="button"
            onClick={onClearSelection}
            disabled={bulkLoading}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Deselect All"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

