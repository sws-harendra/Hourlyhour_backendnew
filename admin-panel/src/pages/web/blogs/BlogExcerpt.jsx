import React from "react";

export default function BlogExcerpt({ excerpt, onChange }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Short Excerpt / Summary
        </label>
        <span className="text-xs text-slate-400">
          {excerpt?.length || 0}/250 characters
        </span>
      </div>
      <textarea
        rows={3}
        value={excerpt}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Brief 2-3 sentence overview displayed on blog cards, search listings, and social shares..."
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
      />
    </div>
  );
}

