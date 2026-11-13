import React from "react";
import {
  X,
  ExternalLink,
  MapPin,
  CheckCircle,
  Shield,
  Clock,
  Sparkles,
  Phone,
  HelpCircle,
  Layers,
} from "lucide-react";

export default function SeoPagePreviewModal({ isOpen, onClose, page }) {
  if (!isOpen || !page) return null;

  const {
    serviceName = "Service",
    locationName = "Patna",
    h1Heading = "",
    heroDescription = "",
    template = "grid",
    contentSections = [],
    faqs = [],
    status = "published",
    seoScore = 0,
    slug = "",
  } = page;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Preview Bar */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">
              Live Landing Page Preview
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[11px] text-slate-500">
              Template: {template.toUpperCase()}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                status === "published"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              SEO Score: {seoScore}/100
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Preview Body */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-8 space-y-8 font-sans">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" /> Certified Doorstep Service in {locationName}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {h1Heading || `Best ${serviceName} in ${locationName}`}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {heroDescription}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Book Technician Now
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <Shield className="w-4 h-4 text-emerald-400" /> 30-Day Warranty Guaranteed
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Template-Based Content Sections */}
          <div className="space-y-6">
            {/* GRID TEMPLATE */}
            {template === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentSections.map((sec, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all space-y-3"
                  >
                    {sec.badge && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 tracking-wider">
                        {sec.badge}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-800">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sec.content}
                    </p>
                    {Array.isArray(sec.bulletPoints) && sec.bulletPoints.length > 0 && (
                      <ul className="space-y-1.5 pt-1">
                        {sec.bulletPoints.map((b, bi) => (
                          <li
                            key={bi}
                            className="text-xs text-slate-700 flex items-start gap-2"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TIMELINE TEMPLATE */}
            {template === "timeline" && (
              <div className="relative border-l-2 border-emerald-400 ml-4 pl-6 space-y-6">
                {contentSections.map((sec, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white shadow-xs" />
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
                      {sec.badge && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                          {sec.badge}
                        </span>
                      )}
                      <h3 className="text-base font-bold text-slate-800">
                        {sec.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {sec.content}
                      </p>
                      {Array.isArray(sec.bulletPoints) && (
                        <ul className="space-y-1 pt-1">
                          {sec.bulletPoints.map((b, bi) => (
                            <li
                              key={bi}
                              className="text-xs text-slate-700 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CARD TEMPLATE */}
            {template === "card" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {contentSections.map((sec, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-6 bg-gradient-to-br from-white via-purple-50/20 to-white border border-purple-100 shadow-sm space-y-3"
                  >
                    {sec.badge && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                        {sec.badge}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900">
                      {sec.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {sec.content}
                    </p>
                    {Array.isArray(sec.bulletPoints) && (
                      <div className="space-y-1.5 pt-2">
                        {sec.bulletPoints.map((b, bi) => (
                          <div
                            key={bi}
                            className="p-2 rounded-lg bg-slate-50 text-xs text-slate-800 font-medium flex items-center gap-2"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* SPLIT TEMPLATE */}
            {template === "split" && (
              <div className="space-y-6">
                {contentSections.map((sec, i) => {
                  const isEven = i % 2 === 0;
                  return (
                    <div
                      key={i}
                      className={`grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-white rounded-2xl p-6 border border-slate-200 shadow-xs ${
                        isEven ? "" : "md:flex-row-reverse"
                      }`}
                    >
                      <div className="space-y-3">
                        {sec.badge && (
                          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            {sec.badge}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-800">
                          {sec.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {sec.content}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
                        <div className="text-xs font-bold text-slate-700">
                          Key Benefits in {locationName}:
                        </div>
                        {Array.isArray(sec.bulletPoints) &&
                          sec.bulletPoints.map((b, bi) => (
                            <div
                              key={bi}
                              className="text-xs text-slate-600 flex items-center gap-2"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{b}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Localized FAQs Accordion */}
          {faqs.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Frequently Asked Questions in {locationName}
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {faqs.map((faq, fi) => (
                  <div key={fi} className="py-3 space-y-1">
                    <div className="text-xs sm:text-sm font-semibold text-slate-800">
                      {faq.question}
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

