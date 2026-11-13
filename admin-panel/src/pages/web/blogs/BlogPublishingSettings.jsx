import React from "react";
import { SlidersHorizontal } from "lucide-react";

export default function BlogPublishingSettings({ formData, setFormData }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
        Publishing Controls
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Article Status
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500"
          >
            <option value="published">🟢 Published (Live on Website)</option>
            <option value="draft">🟡 Draft (Hidden from Website)</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-800">Featured Guide</p>
            <p className="text-[11px] text-slate-500">Pin to top of blog list</p>
          </div>
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                isFeatured: e.target.checked,
              }))
            }
            className="w-4 h-4 accent-emerald-600 cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Author Byline
          </label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, author: e.target.value }))
            }
            placeholder="Repair Saathi Technical Team"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Estimated Read Time
          </label>
          <input
            type="text"
            value={formData.readTime}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, readTime: e.target.value }))
            }
            placeholder="5 min read"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
          />
        </div>
      </div>
    </div>
  );
}

