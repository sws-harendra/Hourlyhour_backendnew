import React from "react";
import { Layers, X } from "lucide-react";
import { CATEGORIES, SUGGESTED_TAGS } from "./blogHelpers";

export default function BlogCategoryTags({
  formData,
  setFormData,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  handleAddSuggestedTag,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
        <Layers className="w-4 h-4 text-emerald-600" />
        Category &amp; Tags
      </h3>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Appliance Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Tags (Press Enter or comma to add)
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          placeholder="Type tag and press Enter..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
        />

        {/* Tag Suggestions */}
        <div className="mt-2.5">
          <p className="text-[11px] text-slate-500 mb-1">Suggestions:</p>
          <div className="flex flex-wrap gap-1">
            {SUGGESTED_TAGS.filter((t) => !formData.tags.includes(t))
              .slice(0, 5)
              .map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleAddSuggestedTag(sug)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition cursor-pointer"
                >
                  +{sug}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

