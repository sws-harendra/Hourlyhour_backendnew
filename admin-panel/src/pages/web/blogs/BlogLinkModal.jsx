import React from "react";
import { Link2, X } from "lucide-react";

export default function BlogLinkModal({
  isOpen,
  onClose,
  linkUrl,
  setLinkUrl,
  linkText,
  setLinkText,
  onInsert,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-emerald-600" /> Insert Web Link
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Link Text (Optional if text is selected)
          </label>
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="e.g. Book AC Repair in Patna"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            URL Destination <span className="text-emerald-600">*</span>
          </label>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://repairsaathi.in/..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onInsert}
            disabled={!linkUrl}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
}

