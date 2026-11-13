import React, { useRef } from "react";
import {
  X,
  Upload,
  Globe,
  Eye,
  RotateCw,
  SlidersHorizontal,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
  Check,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { normalizeImageUrl } from "./blogHelpers";

export default function BlogImageModal({
  isOpen,
  onClose,
  imageModalMode,
  imageTab,
  setImageTab,
  imageConfig,
  setImageConfig,
  imageUploading,
  selectedImgEl,
  onModalImageUpload,
  updateSelectedImageAttributes,
  onInsertImage,
  onSaveImageChanges,
  onDeleteSelectedImage,
}) {
  const inContentFileInputRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto image-modal-container animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-200">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                {imageModalMode === "insert" ? "Insert Image into Blog" : "Adjust Image Angles & Styling"}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
                  {imageConfig.angle}° • {imageConfig.align.toUpperCase()}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Adjust exact position, angle/rotation, size, and styling
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-white">
          {/* SOURCE TABS */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
            <button
              type="button"
              onClick={() => setImageTab("upload")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                imageTab === "upload"
                  ? "bg-white text-slate-800 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload className="w-3.5 h-3.5" /> Upload from Computer
            </button>
            <button
              type="button"
              onClick={() => setImageTab("url")}
              className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 cursor-pointer ${
                imageTab === "url"
                  ? "bg-white text-slate-800 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Image Web Link (URL)
            </button>
          </div>

          {/* TAB 1: UPLOAD BOX */}
          {imageTab === "upload" && (
            <div
              onClick={() => inContentFileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer?.files?.[0];
                if (file) onModalImageUpload(file);
              }}
              className="border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50/70 rounded-xl p-5 text-center cursor-pointer transition group"
            >
              <input
                ref={inContentFileInputRef}
                type="file"
                accept="image/*"
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onModalImageUpload(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
              {imageUploading ? (
                <div className="py-3 flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
                  <span className="text-xs text-slate-700 font-medium">Uploading image to server...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-500 group-hover:text-slate-700">
                  <div className="p-2.5 rounded-full bg-white group-hover:bg-cyan-50 text-slate-500 group-hover:text-cyan-600 shadow-xs border border-slate-200 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-700 group-hover:text-cyan-700">
                    Click or drag &amp; drop to upload image (PNG, JPG, WEBP)
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {imageConfig.url ? "File selected: Click to replace" : "High-resolution photos supported"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: URL INPUT */}
          {imageTab === "url" && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Image Direct URL
              </label>
              <input
                type="text"
                value={imageConfig.url}
                onChange={(e) => {
                  const next = { ...imageConfig, url: e.target.value };
                  setImageConfig(next);
                  if (imageModalMode === "edit" && selectedImgEl) {
                    updateSelectedImageAttributes({ url: e.target.value });
                  }
                }}
                placeholder="https://images.unsplash.com/... or https://..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-cyan-500"
              />
            </div>
          )}

          {/* LIVE TRANSFORMATION PREVIEW CANVAS */}
          {imageConfig.url && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-200 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-cyan-600">
                  <Eye className="w-3.5 h-3.5" /> Live Transformation Preview
                </span>
                <span className="font-mono text-slate-500">
                  Rotation: {imageConfig.angle}° | Width: {imageConfig.width}%
                </span>
              </div>

              <div
                style={{
                  maxWidth: `${imageConfig.width}%`,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                className="transition-all duration-150"
              >
                <div style={{ display: "inline-block", maxWidth: "100%" }}>
                  <img
                    src={normalizeImageUrl(imageConfig.url)}
                    alt={imageConfig.alt || "Preview"}
                    style={{
                      transform: `rotate(${imageConfig.angle}deg)`,
                      borderRadius: `${imageConfig.radius}px`,
                      boxShadow:
                        imageConfig.shadow === "soft"
                          ? "0 4px 15px rgba(0,0,0,0.12)"
                          : imageConfig.shadow === "medium"
                          ? "0 10px 25px -5px rgba(0,0,0,0.2)"
                          : imageConfig.shadow === "hard"
                          ? "0 20px 35px -5px rgba(0,0,0,0.3)"
                          : "none",
                      maxHeight: "220px",
                      objectFit: "contain",
                    }}
                    className="transition-transform duration-100 ease-out"
                  />
                </div>

                {imageConfig.caption && (
                  <p className="text-xs text-slate-600 italic text-center mt-3">
                    {imageConfig.caption}
                  </p>
                )}

                {imageModalMode === "insert" && (
                  <button
                    type="button"
                    onClick={onInsertImage}
                    className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" /> Insert This Image into Blog Article Now
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ANGLE / ROTATION ADJUSTMENT */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-cyan-600" /> Image Angle &amp; Rotation
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-bold border border-cyan-200">
                  {imageConfig.angle}°
                </span>
                {imageConfig.angle !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = { ...imageConfig, angle: 0 };
                      setImageConfig(next);
                      if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ angle: 0 });
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-700 underline cursor-pointer"
                  >
                    Reset to 0°
                  </button>
                )}
              </div>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={imageConfig.angle}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                const next = { ...imageConfig, angle: val };
                setImageConfig(next);
                if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ angle: val });
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />

            {/* Angle Preset Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[
                { label: "0° (Normal)", deg: 0 },
                { label: "-6° (Tilt Left)", deg: -6 },
                { label: "+6° (Tilt Right)", deg: 6 },
                { label: "90° (Quarter CW)", deg: 90 },
                { label: "180° (Invert)", deg: 180 },
                { label: "270° (Counter CW)", deg: 270 },
              ].map((preset) => (
                <button
                  key={preset.deg}
                  type="button"
                  onClick={() => {
                    const next = { ...imageConfig, angle: preset.deg };
                    setImageConfig(next);
                    if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ angle: preset.deg });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    imageConfig.angle === preset.deg
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* PLACEMENT & ALIGNMENT */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" /> Placement &amp; Alignment
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "left", label: "Float Left", desc: "Text wraps along right", icon: AlignLeft },
                { id: "center", label: "Center Block", desc: "Standalone center block", icon: AlignCenter },
                { id: "right", label: "Float Right", desc: "Text wraps along left", icon: AlignRight },
                { id: "full", label: "Full Width", desc: "100% full stretch", icon: Maximize2 },
              ].map((pos) => {
                const Icon = pos.icon;
                const isSelected = imageConfig.align === pos.id;
                return (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => {
                      const next = { ...imageConfig, align: pos.id };
                      setImageConfig(next);
                      if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ align: pos.id });
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-cyan-50 border-cyan-500 text-cyan-800 shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{pos.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 leading-tight">{pos.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIZE & WIDTH SLIDER */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-600" /> Width &amp; Scaling
              </label>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white text-cyan-700 font-bold border border-slate-200 shadow-xs">
                {imageConfig.width}%
              </span>
            </div>

            <input
              type="range"
              min="15"
              max="100"
              step="5"
              value={imageConfig.width}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                const next = { ...imageConfig, width: val };
                setImageConfig(next);
                if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ width: val });
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
            />

            <div className="flex items-center gap-2">
              {[
                { label: "25% (Small)", val: 25 },
                { label: "50% (Medium)", val: 50 },
                { label: "75% (Large)", val: 75 },
                { label: "100% (Full)", val: 100 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => {
                    const next = { ...imageConfig, width: preset.val };
                    setImageConfig(next);
                    if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ width: preset.val });
                  }}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                    imageConfig.width === preset.val
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* CORNERS & SHADOW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Corner Radius */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Corner Style (Rounded)
              </label>
              <div className="flex gap-1.5">
                {[
                  { label: "Square", val: 0 },
                  { label: "Soft", val: 8 },
                  { label: "Rounded", val: 16 },
                  { label: "Large", val: 24 },
                  { label: "Circle/Pill", val: 9999 },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => {
                      const next = { ...imageConfig, radius: r.val };
                      setImageConfig(next);
                      if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ radius: r.val });
                    }}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      imageConfig.radius === r.val
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-white"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Shadow &amp; Depth
              </label>
              <div className="flex gap-1.5">
                {[
                  { label: "None", val: "none" },
                  { label: "Soft", val: "soft" },
                  { label: "3D Medium", val: "medium" },
                  { label: "High Depth", val: "hard" },
                ].map((sh) => (
                  <button
                    key={sh.val}
                    type="button"
                    onClick={() => {
                      const next = { ...imageConfig, shadow: sh.val };
                      setImageConfig(next);
                      if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ shadow: sh.val });
                    }}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      imageConfig.shadow === sh.val
                        ? "bg-cyan-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 border border-slate-200 hover:bg-white"
                    }`}
                  >
                    {sh.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CAPTION & ALT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Image Caption (Displayed under image)
              </label>
              <input
                type="text"
                value={imageConfig.caption}
                onChange={(e) => {
                  const next = { ...imageConfig, caption: e.target.value };
                  setImageConfig(next);
                  if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ caption: e.target.value });
                }}
                placeholder="e.g. Technician troubleshooting AC system in Patna"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Alt Text (SEO &amp; Accessibility)
              </label>
              <input
                type="text"
                value={imageConfig.alt}
                onChange={(e) => {
                  const next = { ...imageConfig, alt: e.target.value };
                  setImageConfig(next);
                  if (imageModalMode === "edit" && selectedImgEl) updateSelectedImageAttributes({ alt: e.target.value });
                }}
                placeholder="e.g. AC service repair Patna"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-cyan-500 placeholder-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          {imageModalMode === "edit" ? (
            <button
              type="button"
              onClick={onDeleteSelectedImage}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Image
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
            >
              Cancel
            </button>

            {imageModalMode === "insert" ? (
              <button
                type="button"
                onClick={onInsertImage}
                disabled={!imageConfig.url}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Insert into Article
              </button>
            ) : (
              <button
                type="button"
                onClick={onSaveImageChanges}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Save Adjustments
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

