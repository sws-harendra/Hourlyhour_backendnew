import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Wand2,
  X,
  Plus,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
  ClipboardList,
  Save,
  CheckCircle,
  ExternalLink,
  MapPin,
  Hammer,
  Key,
} from "lucide-react";
import toast from "react-hot-toast";
import SeoLocationPageService from "../../../services/seoLocationPage.service";
import { ServiceService } from "../../../services/services.service";
import { ServiceAreaService } from "../../../services/serviceArea.service";
import SeoScoreWidget from "./SeoScoreWidget";
import QuickAddLocationModal from "./QuickAddLocationModal";
import QuickAddServiceModal from "./QuickAddServiceModal";
import AiSettingsModal from "./AiSettingsModal";
import {
  TEMPLATES,
  INITIAL_SEO_FORM,
  generateSlug,
  evaluateSeo,
} from "./seoHelpers";

export default function CreateSeoPageModal({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState("basic"); // 'basic' | 'content' | 'seo'
  const [formData, setFormData] = useState(INITIAL_SEO_FORM);
  const [servicesList, setServicesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // AI & Action loaders
  const [generatingAi, setGeneratingAi] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quick modals
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);

  // Load services and locations on open
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoadingInitial(true);
      try {
        const [servicesRes, locationsRes] = await Promise.allSettled([
          ServiceService.getAllServices({ limit: 200 }),
          ServiceAreaService.getAll(),
        ]);

        if (servicesRes.status === "fulfilled") {
          const sList =
            servicesRes.value.data?.services ||
            servicesRes.value.data?.data ||
            servicesRes.value.data ||
            [];
          setServicesList(Array.isArray(sList) ? sList : []);
        }

        if (locationsRes.status === "fulfilled") {
          const lList =
            locationsRes.value.data?.data ||
            locationsRes.value.data ||
            locationsRes.value ||
            [];
          setLocationsList(Array.isArray(lList) ? lList : []);
        }
      } catch (err) {
        console.error("Failed to load services/locations:", err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();

    if (initialData) {
      setFormData({
        ...INITIAL_SEO_FORM,
        ...initialData,
        status: initialData.status === "published" ? "publish" : "draft",
      });
    } else {
      setFormData(INITIAL_SEO_FORM);
    }
    setActiveTab("basic");
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const updateField = (key, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };

      // Auto update slug when H1 or service/location changes and user hasn't typed custom slug
      if (key === "h1Heading" && !prev.customSlug) {
        updated.slug = generateSlug(value);
      } else if (
        (key === "serviceName" || key === "locationName") &&
        !prev.h1Heading
      ) {
        const s = key === "serviceName" ? value : prev.serviceName;
        const l = key === "locationName" ? value : prev.locationName;
        if (s && l) {
          updated.h1Heading = `Best ${s} in ${l} | Trusted & Fast`;
          updated.focusKeyword = `${s} in ${l}`;
          updated.metaTitle = `Best ${s} in ${l} - Repair Saathi`;
          updated.slug = generateSlug(`${s}-in-${l}`);
        }
      }

      return updated;
    });
  };

  // Handle Service dropdown change
  const handleServiceChange = (e) => {
    const val = e.target.value;
    if (val === "__add_new__") {
      setShowAddService(true);
      return;
    }
    const selected = servicesList.find((s) => String(s.id) === String(val));
    if (selected) {
      setFormData((prev) => {
        const sName = selected.title || selected.name || "";
        const lName = prev.locationName;
        const next = {
          ...prev,
          serviceId: selected.id,
          serviceName: sName,
        };
        if (sName && lName && !prev.h1Heading) {
          next.h1Heading = `Best ${sName} in ${lName} | Trusted & Fast`;
          next.focusKeyword = `${sName} in ${lName}`;
          next.metaTitle = `Best ${sName} in ${lName} - Repair Saathi`;
          next.slug = generateSlug(`${sName}-in-${lName}`);
        }
        return next;
      });
    }
  };

  // Handle Location dropdown change
  const handleLocationChange = (e) => {
    const val = e.target.value;
    if (val === "__add_new__") {
      setShowAddLocation(true);
      return;
    }
    const selected = locationsList.find((l) => String(l.id) === String(val));
    if (selected) {
      setFormData((prev) => {
        const lName = selected.name || "";
        const sName = prev.serviceName;
        const next = {
          ...prev,
          locationId: selected.id,
          locationName: lName,
        };
        if (sName && lName && !prev.h1Heading) {
          next.h1Heading = `Best ${sName} in ${lName} | Trusted & Fast`;
          next.focusKeyword = `${sName} in ${lName}`;
          next.metaTitle = `Best ${sName} in ${lName} - Repair Saathi`;
          next.slug = generateSlug(`${sName}-in-${lName}`);
        }
        return next;
      });
    }
  };

  // AI Content Generator trigger
  const handleGenerateAi = async () => {
    if (!formData.serviceName || !formData.locationName) {
      toast.error("Please select a Service and Location first!", {
        icon: "⚠️",
      });
      return;
    }

    setGeneratingAi(true);
    const toastId = toast.loading("Gemini AI is writing your SEO page...");

    try {
      const res = await SeoLocationPageService.generateAiContent({
        serviceName: formData.serviceName,
        locationName: formData.locationName,
        focusKeyword: formData.focusKeyword,
        template: formData.template,
      });

      if (res.success && res.data) {
        const d = res.data;
        setFormData((prev) => ({
          ...prev,
          h1Heading: d.h1Heading || prev.h1Heading,
          heroDescription: d.heroDescription || prev.heroDescription,
          focusKeyword: d.focusKeyword || prev.focusKeyword,
          metaTitle: d.metaTitle || prev.metaTitle,
          metaDescription: d.metaDescription || prev.metaDescription,
          metaKeywords: d.metaKeywords || prev.metaKeywords,
          contentSections:
            Array.isArray(d.contentSections) && d.contentSections.length > 0
              ? d.contentSections
              : prev.contentSections,
          faqs: Array.isArray(d.faqs) && d.faqs.length > 0 ? d.faqs : prev.faqs,
          slug: prev.slug || generateSlug(d.h1Heading || `${prev.serviceName}-in-${prev.locationName}`),
          isAiGenerated: true,
        }));

        toast.success(
          res.message || "Page generated successfully with Gemini AI!",
          { id: toastId }
        );
      } else {
        toast.error(res.message || "Failed to generate AI content", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Error generating content",
        { id: toastId }
      );
    } finally {
      setGeneratingAi(false);
    }
  };

  // Humanize (Anti-AI) trigger
  const handleHumanize = async () => {
    if (!formData.heroDescription && (!formData.contentSections || formData.contentSections.length === 0)) {
      toast.error("Generate or add content first before humanizing!");
      return;
    }

    setHumanizing(true);
    const toastId = toast.loading("Humanizing text with Anti-AI tone...");

    try {
      const res = await SeoLocationPageService.humanizeContent({
        h1Heading: formData.h1Heading,
        heroDescription: formData.heroDescription,
        contentSections: formData.contentSections,
        faqs: formData.faqs,
        serviceName: formData.serviceName,
        locationName: formData.locationName,
      });

      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          heroDescription: res.data.heroDescription || prev.heroDescription,
          contentSections: res.data.contentSections || prev.contentSections,
          isHumanized: true,
        }));
        toast.success("Content humanized! 100% natural, anti-AI tone.", {
          id: toastId,
        });
      } else {
        toast.error(res.message || "Could not humanize content", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error("Humanizing completed with local enhancements.", {
        id: toastId,
      });
    } finally {
      setHumanizing(false);
    }
  };

  // Section managers
  const handleAddSection = () => {
    setFormData((prev) => ({
      ...prev,
      contentSections: [
        ...(prev.contentSections || []),
        {
          title: `Why Choose Us in ${prev.locationName || "Your Area"}`,
          badge: "HIGHLIGHT",
          content: `Our technicians provide expert solutions across ${prev.locationName || "the city"} with same-day doorstep assistance.`,
          bulletPoints: [
            "Experienced & certified technicians",
            "Genuine replacement spare parts",
            "Transparent pricing with invoice",
          ],
        },
      ],
    }));
  };

  const handleUpdateSection = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...(prev.contentSections || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, contentSections: updated };
    });
  };

  const handleDeleteSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      contentSections: prev.contentSections.filter((_, i) => i !== index),
    }));
  };

  const handleMoveSection = (index, direction) => {
    setFormData((prev) => {
      const list = [...(prev.contentSections || [])];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return prev;
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, contentSections: list };
    });
  };

  // FAQ managers
  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [
        ...(prev.faqs || []),
        {
          question: `How fast can a technician arrive in ${prev.locationName || "my area"}?`,
          answer: `Our verified technicians usually reach your location within 60 to 90 minutes.`,
        },
      ],
    }));
  };

  const handleUpdateFaq = (index, field, value) => {
    setFormData((prev) => {
      const list = [...(prev.faqs || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, faqs: list };
    });
  };

  const handleDeleteFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  // Submit & Save
  const handleSave = async (forcePublish = false) => {
    if (!formData.serviceName) {
      toast.error("Please select a Service");
      setActiveTab("basic");
      return;
    }
    if (!formData.locationName) {
      toast.error("Please select a Location");
      setActiveTab("basic");
      return;
    }
    if (!formData.h1Heading || !formData.h1Heading.trim()) {
      toast.error("H1 Heading is required");
      setActiveTab("basic");
      return;
    }

    setSaving(true);
    const finalStatus = forcePublish
      ? "published"
      : formData.status === "publish" || formData.status === "published"
      ? "published"
      : "draft";

    const payload = {
      ...formData,
      status: finalStatus,
    };

    try {
      let res;
      if (initialData?.id) {
        res = await SeoLocationPageService.update(initialData.id, payload);
      } else {
        res = await SeoLocationPageService.create(payload);
      }

      if (res.success) {
        toast.success(
          initialData?.id
            ? "SEO Location Page updated successfully!"
            : "SEO Location Page created successfully!"
        );
        onSuccess && onSuccess(res.data);
        onClose();
      } else {
        toast.error(res.message || "Failed to save page");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Error saving page"
      );
    } finally {
      setSaving(false);
    }
  };

  const seoEval = evaluateSeo(formData);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <h2 className="text-base font-bold text-slate-800">
                {initialData?.id ? "Edit SEO Location Page" : "Create SEO Location Page"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={generatingAi}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {generatingAi ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                )}
                <span>AI Generate</span>
              </button>

              <button
                type="button"
                onClick={handleHumanize}
                disabled={humanizing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {humanizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>Humanize (Anti-AI)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 pt-2 border-b border-slate-100 bg-white flex items-center gap-6 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border-b-2 ${
                activeTab === "basic"
                  ? "border-emerald-500 text-emerald-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Basic Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border-b-2 ${
                activeTab === "content"
                  ? "border-emerald-500 text-emerald-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Content Sections</span>
              {formData.contentSections?.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                  {formData.contentSections.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`pb-2.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all border-b-2 ${
                activeTab === "seo"
                  ? "border-emerald-500 text-emerald-600 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>SEO & Meta</span>
            </button>
          </div>

          {/* Body Content & Sidebar */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col lg:flex-row gap-6 bg-slate-50/30">
            {/* Left Main Form Area */}
            <div className="flex-1 space-y-5">
              {/* TAB 1: BASIC INFO */}
              {activeTab === "basic" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Service & Location Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Service <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddService(true)}
                          className="text-[11px] text-blue-600 hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Quick Add
                        </button>
                      </div>
                      <select
                        value={formData.serviceId || ""}
                        onChange={handleServiceChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select service...</option>
                        {servicesList.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title || s.name}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add New Service...</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAddLocation(true)}
                          className="text-[11px] text-emerald-600 hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" /> Quick Add
                        </button>
                      </div>
                      <select
                        value={formData.locationId || ""}
                        onChange={handleLocationChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select location...</option>
                        {locationsList.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add New Location...</option>
                      </select>
                    </div>
                  </div>

                  {/* Gemini AI Auto-Writer Banner */}
                  <div className="bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-800 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Gemini AI Auto-Writer
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowAiSettings(true)}
                            className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold underline flex items-center gap-1 cursor-pointer ml-1.5"
                          >
                            <Key className="w-2.5 h-2.5" />
                            <span>AI Key</span>
                          </button>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                          Select a Service and Location above, then click generate to auto-fill the whole page.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateAi}
                      disabled={generatingAi}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {generatingAi ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Generate with Gemini AI
                        </>
                      )}
                    </button>
                  </div>

                  {/* Page Template Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Page Template
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {TEMPLATES.map((tmpl) => {
                        const isSelected = formData.template === tmpl.id;
                        return (
                          <div
                            key={tmpl.id}
                            onClick={() => updateField("template", tmpl.id)}
                            className={`cursor-pointer rounded-xl p-3 text-center transition-all ${
                              isSelected
                                ? tmpl.activeBorder + " shadow-xs border-2"
                                : "bg-white border border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-full ${tmpl.dotColor} mx-auto mb-2`}
                            />
                            <div className="text-xs font-bold text-slate-800">
                              {tmpl.name}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                              {tmpl.description}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Focus Keyword & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        value={formData.focusKeyword || ""}
                        onChange={(e) => updateField("focusKeyword", e.target.value)}
                        placeholder="e.g. Service in Location"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status
                      </label>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => updateField("status", "draft")}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            formData.status === "draft"
                              ? "bg-white text-slate-800 shadow-xs border border-slate-200"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <span>📝</span>
                          <span>Draft</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateField("status", "publish")}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            formData.status === "publish" || formData.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <span>🚀</span>
                          <span>Publish</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* H1 Heading */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        H1 Heading <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Include both Service and Location name
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.h1Heading || ""}
                      onChange={(e) => updateField("h1Heading", e.target.value)}
                      placeholder="Best Web Development Company in Patna, Bihar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800"
                    />
                  </div>

                  {/* Hero Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Hero Description
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {formData.heroDescription?.trim().split(/\s+/).filter(Boolean).length || 0} words (optimal: 25-50 words)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.heroDescription || ""}
                      onChange={(e) => updateField("heroDescription", e.target.value)}
                      placeholder="Enter engaging conversion-focused hero introduction with service guarantee and local reach..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 placeholder:text-slate-400 leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CONTENT SECTIONS */}
              {activeTab === "content" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Page Content Sections
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Modular content blocks rendered dynamically based on selected template ({formData.template}).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Section
                    </button>
                  </div>

                  {(!formData.contentSections || formData.contentSections.length === 0) ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">No content sections added yet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Click "Generate with Gemini AI" on the Basic Info tab or add manual sections.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-medium cursor-pointer"
                      >
                        + Add First Section
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.contentSections.map((sec, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              Section #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveSection(idx, "up")}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === formData.contentSections.length - 1}
                                onClick={() => handleMoveSection(idx, "down")}
                                className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSection(idx)}
                                className="p-1 rounded text-red-400 hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-semibold text-slate-500 uppercase">
                                Title
                              </label>
                              <input
                                type="text"
                                value={sec.title || ""}
                                onChange={(e) => handleUpdateSection(idx, "title", e.target.value)}
                                placeholder="Section Title..."
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-500 uppercase">
                                Badge / Tag
                              </label>
                              <input
                                type="text"
                                value={sec.badge || ""}
                                onChange={(e) => handleUpdateSection(idx, "badge", e.target.value)}
                                placeholder="e.g. WHY CHOOSE US"
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase">
                              Content
                            </label>
                            <textarea
                              rows={2}
                              value={sec.content || ""}
                              onChange={(e) => handleUpdateSection(idx, "content", e.target.value)}
                              placeholder="Section narrative description..."
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-700"
                            />
                          </div>

                          {/* Bullet points */}
                          <div>
                            <label className="text-[10px] font-semibold text-slate-500 uppercase">
                              Key Highlights / Bullets (One per line)
                            </label>
                            <textarea
                              rows={2}
                              value={(sec.bulletPoints || []).join("\n")}
                              onChange={(e) =>
                                handleUpdateSection(
                                  idx,
                                  "bulletPoints",
                                  e.target.value.split("\n").filter(Boolean)
                                )
                              }
                              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-700 font-mono text-[11px]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Local FAQs Manager */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Frequently Asked Questions (FAQ)
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Structured FAQ schema for rich Google search snippet cards.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Add FAQ
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {(formData.faqs || []).map((faq, fIdx) => (
                        <div
                          key={fIdx}
                          className="bg-white rounded-xl border border-slate-200 p-3 space-y-2 shadow-2xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={faq.question || ""}
                              onChange={(e) => handleUpdateFaq(fIdx, "question", e.target.value)}
                              placeholder="e.g. How much does repair cost in Patna?"
                              className="flex-1 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-semibold text-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteFaq(fIdx)}
                              className="p-1 text-red-400 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={faq.answer || ""}
                            onChange={(e) => handleUpdateFaq(fIdx, "answer", e.target.value)}
                            placeholder="Answer details..."
                            className="w-full px-2.5 py-1 rounded-md border border-slate-200 text-xs text-slate-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SEO & META */}
              {activeTab === "seo" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Google SERP Snippet Preview */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        Google Search Preview (Desktop & Mobile)
                      </span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                        Live SERP Simulation
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 font-sans">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-4 h-4 rounded-full bg-blue-600 text-[9px] text-white font-bold flex items-center justify-center">
                          R
                        </div>
                        <div className="text-[11px] text-slate-600 truncate">
                          https://repairsaathi.in &gt; {formData.slug || "service-location"}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer truncate">
                        {formData.metaTitle || formData.h1Heading || "Best Service in Location - Repair Saathi"}
                      </div>
                      <div className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {formData.metaDescription ||
                          formData.heroDescription ||
                          "Get verified professional doorstep repair with 30-day warranty across the city."}
                      </div>
                    </div>
                  </div>

                  {/* Meta Title */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Meta Title
                      </label>
                      <span
                        className={`text-[11px] ${
                          (formData.metaTitle || "").length >= 40 &&
                          (formData.metaTitle || "").length <= 65
                            ? "text-emerald-600 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {(formData.metaTitle || "").length} / 60 chars (Optimal: 40-65)
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.metaTitle || ""}
                      onChange={(e) => updateField("metaTitle", e.target.value)}
                      placeholder="e.g. Best AC Repair in Patna - Fast 60-min Doorstep Service"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Meta Description
                      </label>
                      <span
                        className={`text-[11px] ${
                          (formData.metaDescription || "").length >= 120 &&
                          (formData.metaDescription || "").length <= 165
                            ? "text-emerald-600 font-medium"
                            : "text-slate-400"
                        }`}
                      >
                        {(formData.metaDescription || "").length} / 160 chars (Optimal: 120-165)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.metaDescription || ""}
                      onChange={(e) => updateField("metaDescription", e.target.value)}
                      placeholder="e.g. Certified doorstep AC repair and maintenance in Patna. 30-day service warranty, genuine OEM spare parts and upfront rates. Book today!"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 leading-relaxed"
                    />
                  </div>

                  {/* Meta Keywords & URL Slug */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={formData.metaKeywords || ""}
                        onChange={(e) => updateField("metaKeywords", e.target.value)}
                        placeholder="ac repair patna, doorstep service, verified experts"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug || ""}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            slug: generateSlug(e.target.value),
                            customSlug: true,
                          }));
                        }}
                        placeholder="best-ac-repair-patna"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  {/* Canonical URL & OG Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Canonical URL
                      </label>
                      <input
                        type="text"
                        value={
                          formData.canonicalUrl ||
                          `https://repairsaathi.in/${formData.slug || ""}`
                        }
                        onChange={(e) => updateField("canonicalUrl", e.target.value)}
                        placeholder="https://repairsaathi.in/page-slug"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        OG / Social Banner Image URL
                      </label>
                      <input
                        type="text"
                        value={formData.ogImage || ""}
                        onChange={(e) => updateField("ogImage", e.target.value)}
                        placeholder="https://.../banner.jpg"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Live SEO Score Widget */}
            <SeoScoreWidget formData={formData} />
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="text-xs font-bold flex items-center gap-2">
              <span className="text-slate-500">SEO Score:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-extrabold ${
                  seoEval.score >= 85
                    ? "bg-emerald-50 text-emerald-700"
                    : seoEval.score >= 70
                    ? "bg-blue-50 text-blue-700"
                    : seoEval.score >= 40
                    ? "bg-amber-50 text-amber-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {seoEval.score}/100 ({seoEval.rating})
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save & Publish</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{initialData?.id ? "Update Page" : "Create Page"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Submodals */}
      <QuickAddLocationModal
        isOpen={showAddLocation}
        onClose={() => setShowAddLocation(false)}
        onSuccess={(newLoc) => {
          setLocationsList((prev) => [newLoc, ...prev]);
          setFormData((prev) => ({
            ...prev,
            locationId: newLoc.id,
            locationName: newLoc.name,
          }));
        }}
      />

      <QuickAddServiceModal
        isOpen={showAddService}
        onClose={() => setShowAddService(false)}
        onSuccess={(newService) => {
          setServicesList((prev) => [newService, ...prev]);
          setFormData((prev) => ({
            ...prev,
            serviceId: newService.id,
            serviceName: newService.title,
          }));
        }}
      />

      <AiSettingsModal
        isOpen={showAiSettings}
        onClose={() => setShowAiSettings(false)}
      />
    </>
  );
}

