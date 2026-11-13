import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  X,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Zap,
  ClipboardPaste,
} from "lucide-react";
import toast from "react-hot-toast";
import SeoLocationPageService from "../../../services/seoLocationPage.service";

export default function AiSettingsModal({ isOpen, onClose, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState({
    hasKey: false,
    maskedKey: "",
    activeModel: "gemini-2.5-flash",
  });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await SeoLocationPageService.getAiSettings();
      if (res.success) {
        setStatus({
          hasKey: res.hasKey,
          maskedKey: res.maskedKey,
          activeModel: res.activeModel || "gemini-2.5-flash",
        });
      }
    } catch (err) {
      console.error("Failed to load AI settings:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setApiKey(text.trim());
        toast.success("API Key pasted from clipboard!");
      }
    } catch {
      toast.error("Unable to read clipboard. Please paste manually (Ctrl+V)");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      toast.error("Please enter a valid Gemini API key!");
      return;
    }

    setVerifying(true);
    const toastId = toast.loading("Verifying API key with Google Gemini...");

    try {
      const res = await SeoLocationPageService.saveAiSettings({
        apiKey: apiKey.trim(),
      });

      if (res.success) {
        toast.success(res.message || "Gemini API Key successfully verified and saved!", {
          id: toastId,
        });
        setStatus({
          hasKey: true,
          maskedKey: res.maskedKey,
          activeModel: res.activeModel || "gemini-2.5-flash",
        });
        setApiKey("");
        if (onKeyUpdated) onKeyUpdated(true);
        setTimeout(() => onClose(), 800);
      } else {
        toast.error(res.message || "API key verification failed", {
          id: toastId,
        });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to verify API key",
        { id: toastId }
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveKey = async () => {
    if (!window.confirm("Are you sure you want to remove the saved Gemini API key?")) {
      return;
    }

    try {
      const res = await SeoLocationPageService.saveAiSettings({ apiKey: "" });
      if (res.success) {
        toast.success("API key removed");
        setStatus({ hasKey: false, maskedKey: "", activeModel: "" });
        if (onKeyUpdated) onKeyUpdated(false);
      }
    } catch {
      toast.error("Failed to remove key");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/90 shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-purple-50 via-indigo-50/60 to-white border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Gemini AI API Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Set your Google Gemini API key once — works live without editing .env!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status Banner */}
          {status.hasKey ? (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    Gemini AI Active & Connected
                  </h4>
                  <button
                    type="button"
                    onClick={handleRemoveKey}
                    className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-emerald-700 mt-1 font-mono">
                  Active Key: {status.maskedKey}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 text-[11px] font-semibold">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Model: {status.activeModel} (Live Generation Ready)
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  No Live AI Key Connected
                </h4>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  Enter your Google Gemini API key below to unlock 1-click SEO content writing and natural anti-AI humanization.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Google Gemini API Key</span>
                </label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                >
                  <ClipboardPaste className="w-3 h-3" />
                  <span>Paste Key</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy... or AQ.Ab8...)"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-xs sm:text-sm font-mono transition-all"
                  autoComplete="off"
                />

                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Auto-verified with Google & saved permanently
                </span>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Get Free Key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={verifying || !apiKey.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {verifying ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying with Google...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test & Save API Key</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

