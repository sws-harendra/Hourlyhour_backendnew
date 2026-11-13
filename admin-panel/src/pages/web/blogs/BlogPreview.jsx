import React from "react";
import { CheckCircle2 } from "lucide-react";
import { normalizeImageUrl } from "./blogHelpers";

export default function BlogPreview({ formData }) {
  return (
    <div className="bg-white text-slate-900 rounded-2xl p-6 md:p-10 shadow-sm border border-slate-200 space-y-6">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Website Visitor Live Preview
        </span>
        <span>Category: {formData.category} • {formData.readTime}</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
        {formData.title || "Untitled Blog Post"}
      </h1>

      <div className="flex items-center gap-3 text-sm text-slate-600">
        <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
          RS
        </div>
        <div>
          <p className="font-semibold text-slate-900">{formData.author}</p>
          <p className="text-xs text-slate-500">
            Published on {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • Repair Saathi Patna
          </p>
        </div>
      </div>

      {formData.image && (
        <div className="rounded-xl overflow-hidden shadow-md max-h-[420px]">
          <img
            src={normalizeImageUrl(formData.image)}
            alt={formData.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {formData.excerpt && (
        <p className="text-lg italic text-slate-600 border-l-4 border-emerald-500 pl-4 py-1">
          {formData.excerpt}
        </p>
      )}

      <div
        className="prose prose-slate max-w-none text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formData.content }}
      />
    </div>
  );
}

