import React from "react";
import { Globe, Wand2, Copy } from "lucide-react";
import toast from "react-hot-toast";

export default function BlogTitleSlug({
  title,
  handleTitleChange,
  slug,
  handleSlugInputChange,
  handleSlugInputBlur,
  handleAutoSlug,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
        Blog Headline / Title <span className="text-emerald-500">*</span>
      </label>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="e.g. 7 Warning Signs Your Refrigerator Needs Immediate Repair in Patna"
        className="w-full text-xl md:text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
      />

      {/* URL SLUG BAR WITH LIVE WEBSITE LINK */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden flex-1">
          <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-slate-500 shrink-0 font-mono">
            repairsaathi.in/home-appliance-repair-blog/
          </span>
          <input
            type="text"
            value={slug}
            onChange={handleSlugInputChange}
            onBlur={handleSlugInputBlur}
            placeholder="my-blog-post-url-slug"
            className="bg-transparent font-mono text-emerald-700 font-semibold focus:outline-none border-b border-dashed border-emerald-500/50 px-1 flex-1 min-w-[120px]"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleAutoSlug}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1 transition cursor-pointer"
            title="Auto Generate Slug from Title"
          >
            <Wand2 className="w-3 h-3 text-emerald-600" /> Auto-Slug
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                `https://repairsaathi.in/home-appliance-repair-blog/${slug}`
              );
              toast.success("URL copied!");
            }}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs flex items-center gap-1 transition cursor-pointer"
            title="Copy Full Live URL"
          >
            <Copy className="w-3 h-3" /> Copy
          </button>
        </div>
      </div>
    </div>
  );
}

