import React from "react";
import {
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  RotateCcw,
  RotateCw,
  ChevronsUp,
  ArrowUp,
  ArrowDown,
  ChevronsDown,
  Sliders,
  Trash2,
  X,
} from "lucide-react";

export default function BlogImageControlDock({
  selectedImgEl,
  setSelectedImgEl,
  imageConfig,
  updateSelectedImageAttributes,
  handleMoveSelectedImage,
  setImageModalMode,
  setImageModalOpen,
  handleDeleteSelectedImage,
  setOverlayRect,
}) {
  if (!selectedImgEl) return null;

  return (
    <div className="image-control-dock bg-slate-50 border-b border-emerald-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in slide-in-from-top-1 duration-150 sticky top-[48px] z-10 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 text-[11px]">
          <ImageIcon className="w-3 h-3" /> Image Selected ({imageConfig.angle}° | {imageConfig.align.toUpperCase()} | {imageConfig.width}%)
        </span>
      </div>

      {/* Quick Placement / Alignment */}
      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
        <button
          type="button"
          onClick={() => updateSelectedImageAttributes({ align: "left" })}
          className={`px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
            imageConfig.align === "left"
              ? "bg-emerald-600 text-white font-medium"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title="Float Left (Text wraps along right)"
        >
          <AlignLeft className="w-3 h-3" /> Left
        </button>
        <button
          type="button"
          onClick={() => updateSelectedImageAttributes({ align: "center" })}
          className={`px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
            imageConfig.align === "center"
              ? "bg-emerald-600 text-white font-medium"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title="Center Block"
        >
          <AlignCenter className="w-3 h-3" /> Center
        </button>
        <button
          type="button"
          onClick={() => updateSelectedImageAttributes({ align: "right" })}
          className={`px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
            imageConfig.align === "right"
              ? "bg-emerald-600 text-white font-medium"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title="Float Right (Text wraps along left)"
        >
          <AlignRight className="w-3 h-3" /> Right
        </button>
        <button
          type="button"
          onClick={() => updateSelectedImageAttributes({ align: "full" })}
          className={`px-2 py-1 rounded transition flex items-center gap-1 cursor-pointer ${
            imageConfig.align === "full"
              ? "bg-emerald-600 text-white font-medium"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
          title="Full Width Stretch"
        >
          <Maximize2 className="w-3 h-3" /> Full
        </button>
      </div>

      {/* Quick Width Presets */}
      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
        {[25, 50, 75, 100].map((sz) => (
          <button
            key={sz}
            type="button"
            onClick={() => updateSelectedImageAttributes({ width: sz })}
            className={`px-2 py-0.5 rounded transition text-[11px] font-medium cursor-pointer ${
              imageConfig.width === sz
                ? "bg-emerald-600 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
            title={`Width: ${sz}%`}
          >
            {sz}%
          </button>
        ))}
      </div>

      {/* Quick Rotate / Angle */}
      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
        <button
          type="button"
          onClick={() => updateSelectedImageAttributes({ angle: (imageConfig.angle - 15) % 360 })}
          className="p-1 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
          title="Rotate Left -15°"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
        <span className="px-2 font-mono text-emerald-700 font-bold text-[11px]">{imageConfig.angle}°</span>
        <button
          type="button"
          onClick={() => updateSelectedImageAttributes({ angle: (imageConfig.angle + 15) % 360 })}
          className="p-1 rounded text-slate-500 hover:text-slate-800 transition cursor-pointer"
          title="Rotate Right +15°"
        >
          <RotateCw className="w-3 h-3" />
        </button>
        {imageConfig.angle !== 0 && (
          <button
            type="button"
            onClick={() => updateSelectedImageAttributes({ angle: 0 })}
            className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-slate-700 underline cursor-pointer"
            title="Reset angle to 0°"
          >
            0°
          </button>
        )}
      </div>

      {/* Quick 1-Click Move Controls: Top, Up, Down, Bottom */}
      <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
        <button
          type="button"
          onClick={() => handleMoveSelectedImage("top")}
          className="px-2 py-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-1 font-medium text-xs cursor-pointer"
          title="Move Image to Top of article"
        >
          <ChevronsUp className="w-3.5 h-3.5 text-emerald-600" /> Top
        </button>
        <button
          type="button"
          onClick={() => handleMoveSelectedImage("up")}
          className="px-2 py-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-1 font-medium text-xs border-l border-slate-200 cursor-pointer"
          title="Move Image Up (Above previous paragraph)"
        >
          <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> Up
        </button>
        <button
          type="button"
          onClick={() => handleMoveSelectedImage("down")}
          className="px-2 py-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-1 font-medium text-xs border-l border-slate-200 cursor-pointer"
          title="Move Image Down (Below next paragraph)"
        >
          <ArrowDown className="w-3.5 h-3.5 text-emerald-600" /> Down
        </button>
        <button
          type="button"
          onClick={() => handleMoveSelectedImage("bottom")}
          className="px-2 py-1 rounded text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition flex items-center gap-1 font-medium text-xs border-l border-slate-200 cursor-pointer"
          title="Move Image to Bottom of article"
        >
          <ChevronsDown className="w-3.5 h-3.5 text-emerald-600" /> Bottom
        </button>
      </div>

      {/* Full Controls & Delete */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            setImageModalMode("edit");
            setImageModalOpen(true);
          }}
          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium flex items-center gap-1 transition text-xs shadow-xs cursor-pointer"
          title="Open full controls: fine-tune angle slider, width, shadows, caption, replace image"
        >
          <Sliders className="w-3 h-3" /> Sliders &amp; Caption
        </button>

        <button
          type="button"
          onClick={handleDeleteSelectedImage}
          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
          title="Delete this image"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (selectedImgEl) {
              selectedImgEl.style.outline = "";
              selectedImgEl.style.outlineOffset = "";
            }
            setSelectedImgEl(null);
            setOverlayRect(null);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          title="Close / Deselect"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

