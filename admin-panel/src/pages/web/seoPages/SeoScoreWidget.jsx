import React from "react";
import { TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { evaluateSeo } from "./seoHelpers";

export default function SeoScoreWidget({ formData }) {
  const { score, rating, color, bgDot, items } = evaluateSeo(formData);

  return (
    <div className="w-full lg:w-72 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between shrink-0">
      <div>
        {/* Top Header Card */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex flex-col items-center pl-1">
            <span className={`w-2.5 h-2.5 rounded-full ${bgDot} mb-1`} />
            <div className={`text-3xl font-extrabold tracking-tight ${color}`}>
              {score}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 -mt-1">
              /100
            </span>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 text-slate-700 font-bold text-sm">
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
              <span>SEO Score</span>
            </div>
            <div className={`text-base font-bold ${color}`}>{rating}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Updates live as you type
            </p>
          </div>
        </div>

        {/* Live Checklist */}
        <div className="mt-3.5 space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-1.5 min-w-0 pr-2">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span
                  className={`truncate ${
                    item.passed
                      ? "text-slate-800 font-medium"
                      : "text-slate-500"
                  }`}
                  title={item.label}
                >
                  {item.displayLabel}
                </span>
              </div>
              <span
                className={`font-semibold shrink-0 tabular-nums ${
                  item.passed ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {item.current}/{item.max}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Micro-tip at bottom of widget */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-[10px] text-slate-400 text-center">
          {score >= 85
            ? "✨ Excellent! Ready for Google Top 3 rank"
            : score >= 70
            ? "👍 Good work! Add location in meta to reach 85+"
            : "💡 Complete the checklist to boost Google ranking"}
        </div>
      </div>
    </div>
  );
}

