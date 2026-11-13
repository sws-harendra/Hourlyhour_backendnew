import React from "react";
import { Image as ImageIcon, Upload, Trash2, Link2, RefreshCw } from "lucide-react";
import { normalizeImageUrl } from "./blogHelpers";

export default function BlogFeaturedImage({
  formData,
  setFormData,
  uploadingImage,
  fileInputRef,
  handleImageUpload,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          Cover / Featured Image
        </h3>
      </div>

      {/* Always keep file input in DOM so Replace button and Drag-drop always work */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onClick={(e) => e.stopPropagation()}
        onChange={handleImageUpload}
        className="hidden"
      />

      {formData.image ? (
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
            <img
              src={normalizeImageUrl(formData.image)}
              alt="Cover Preview"
              className="w-full h-44 object-cover"
            />
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-200">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, image: "" }));
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          </div>

          {formData.imageLink && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1">
              <Link2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="font-medium truncate">Opens on click: {formData.imageLink}</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const file = e.dataTransfer?.files?.[0];
            if (file) handleImageUpload({ target: { files: [file], value: "" } });
          }}
          className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/70 group"
        >
          {uploadingImage ? (
            <div className="flex flex-col items-center">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mb-2" />
              <p className="text-xs text-slate-500">Uploading image to server...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mb-2 transition" />
              <p className="text-xs font-semibold text-slate-700 group-hover:text-emerald-700">Click to upload cover photo</p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, or WEBP up to 5MB</p>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-emerald-600" />
            Cover Image Click Link (URL to open when clicked):
          </span>
          <span className="text-[10px] text-slate-400 font-normal">Optional</span>
        </label>
        <input
          type="url"
          value={formData.imageLink || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, imageLink: e.target.value }))
          }
          placeholder="https://repairsaathi.in/home-appliance-repair-services-patna/ (or any link)"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 placeholder-slate-400"
        />
        <p className="text-[10px] text-slate-400 mt-1">
          Jab user live website par is cover image par click karega to yeh link new tab me open hoga.
        </p>
      </div>
    </div>
  );
}

