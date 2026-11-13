import React from "react";

export default function BlogHtmlEditor({ content, onChange }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-xs text-slate-500">
        <span className="font-mono text-emerald-600 font-semibold">&lt;HTML Source Editor /&gt;</span>
        <span>Edit raw HTML tags directly for custom structures</span>
      </div>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        rows={22}
        className="w-full mt-3 bg-slate-900 text-emerald-300 font-mono text-sm p-4 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
      />
    </div>
  );
}

