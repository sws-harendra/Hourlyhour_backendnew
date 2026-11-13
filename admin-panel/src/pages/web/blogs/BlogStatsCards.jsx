import React from "react";
import { FileText, CheckCircle2, Clock, Eye } from "lucide-react";

export default function BlogStatsCards({
  totalCount,
  publishedCount,
  draftCount,
  totalViews,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Articles</p>
          <h3 className="text-2xl font-bold text-white mt-1">{totalCount}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Created across categories</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <FileText className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Published Live</p>
          <h3 className="text-2xl font-bold text-white mt-1">{publishedCount}</h3>
          <p className="text-xs text-emerald-500/80 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active on repairsaathi.in
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Drafts &amp; Staging</p>
          <h3 className="text-2xl font-bold text-white mt-1">{draftCount}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Unpublished guides</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">Total Readers</p>
          <h3 className="text-2xl font-bold text-white mt-1">{totalViews.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Aggregated page views</p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
          <Eye className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

