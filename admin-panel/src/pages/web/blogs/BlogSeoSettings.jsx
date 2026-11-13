import React from "react";
import { Sparkles } from "lucide-react";

export default function BlogSeoSettings({ formData, setFormData }) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        Google SEO &amp; SERP Snippet
      </h3>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-600">
            Meta Title
          </label>
          <span className="text-[11px] text-slate-400">
            {formData.metaTitle?.length || 0}/60
          </span>
        </div>
        <input
          type="text"
          value={formData.metaTitle}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
          }
          placeholder={formData.title ? `${formData.title} | Repair Saathi` : "SEO Page Title"}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold text-slate-600">
            Meta Description
          </label>
          <span className="text-[11px] text-slate-400">
            {formData.metaDescription?.length || 0}/160
          </span>
        </div>
        <textarea
          rows={2}
          value={formData.metaDescription}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              metaDescription: e.target.value,
            }))
          }
          placeholder="Short meta summary for Google search snippet results..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Meta Keywords
        </label>
        <input
          type="text"
          value={formData.metaKeywords}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              metaKeywords: e.target.value,
            }))
          }
          placeholder="patna ac repair, technician, geyser service"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
        />
      </div>

      {/* GOOGLE SERP PREVIEW BOX */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex items-center justify-center text-[8px] text-white font-bold">
            R
          </div>
          <span className="font-sans">repairsaathi.in › home-appliance-repair-blog › {formData.slug || "article-slug"}</span>
        </div>
        <p className="text-sm font-medium text-blue-700 hover:underline cursor-pointer line-clamp-1">
          {formData.metaTitle || formData.title || "Blog Title on Google Search"}
        </p>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {formData.metaDescription ||
            formData.excerpt ||
            "Expert home appliance repair and maintenance guide written by certified Repair Saathi technicians in Patna."}
        </p>
      </div>
    </div>
  );
}

