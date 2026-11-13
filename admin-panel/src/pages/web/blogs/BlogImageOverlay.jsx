import React from "react";
import {
  Move,
  ChevronsUp,
  ArrowUp,
  ArrowDown,
  ChevronsDown,
  X,
} from "lucide-react";

export default function BlogImageOverlay({
  dropIndicator,
  isDraggingImage,
  dragCursorPos,
  selectedImgEl,
  setSelectedImgEl,
  overlayRect,
  setOverlayRect,
  imageConfig,
  isResizing,
  handleStartMoveDrag,
  handleMoveSelectedImage,
  handleResizeMouseDown,
}) {
  return (
    <>
      {/* VISUAL DROP INDICATOR LINE (SHOWS EXACT DROP SPOT WHEN MOVING IMAGE) */}
      {dropIndicator && (
        <div
          className="pointer-events-none absolute z-30 transition-all duration-75"
          style={{
            top: `${dropIndicator.top}px`,
            left: `${dropIndicator.left}px`,
            width: `${dropIndicator.width}px`,
            height: "3px",
            backgroundColor: "#10b981",
            borderRadius: "9999px",
            boxShadow: "0 0 10px #10b981, 0 0 20px rgba(16, 185, 129, 0.4)",
          }}
        >
          <div className="absolute -left-1.5 -top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md ring-2 ring-white" />
          <div className="absolute -right-1.5 -top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-md ring-2 ring-white" />
        </div>
      )}

      {/* FLOATING CURSOR BADGE WHILE DRAGGING IMAGE WITH MOUSE */}
      {isDraggingImage && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 text-white px-3.5 py-1.5 rounded-full shadow-2xl border border-emerald-500/60 flex items-center gap-2 text-xs font-semibold backdrop-blur-md animate-in fade-in zoom-in-95 duration-75 select-none"
          style={{ left: `${dragCursorPos.x}px`, top: `${dragCursorPos.y}px` }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Move className="w-3.5 h-3.5 text-emerald-400" />
          <span>Moving Image • Release anywhere to drop</span>
        </div>
      )}

      {/* FLOATING INTERACTIVE RESIZE & MOVE OVERLAY (OUTSIDE CONTENTEDITABLE DOM) */}
      {selectedImgEl && overlayRect && (
        <div
          className="image-resize-overlay absolute z-20 pointer-events-none transition-none"
          style={{
            top: `${overlayRect.top}px`,
            left: `${overlayRect.left}px`,
            width: `${overlayRect.width}px`,
            height: `${overlayRect.height}px`,
          }}
        >
          {/* Outer Border Frame (Click and drag to move freely!) */}
          <div
            onMouseDown={(e) => handleStartMoveDrag(e)}
            className="absolute inset-0 border-2 border-emerald-500 rounded-lg pointer-events-auto cursor-grab active:cursor-grabbing shadow-xs bg-emerald-500/5 hover:bg-emerald-500/15 transition-colors"
            title="Click and drag with mouse to freely move this image anywhere in the article"
          />

          {/* Top Floating Control Toolbar Bar */}
          <div
            className="absolute -top-10 left-1/2 -translate-x-1/2 pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-xl border border-slate-700/80 flex items-center gap-2 text-[11px] whitespace-nowrap select-none animate-in fade-in zoom-in-95 duration-100"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Drag to Move handle */}
            <div
              onMouseDown={(e) => handleStartMoveDrag(e)}
              className="px-2.5 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 cursor-grab active:cursor-grabbing transition"
              title="Click and drag with mouse to freely move this image anywhere"
            >
              <Move className="w-3 h-3" />
              <span>Drag to Move</span>
            </div>

            {/* 1-Click Move Top */}
            <button
              type="button"
              onClick={() => handleMoveSelectedImage("top")}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-emerald-400 transition flex items-center gap-0.5 cursor-pointer"
              title="Move to top of article"
            >
              <ChevronsUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[10px]">Top</span>
            </button>

            {/* 1-Click Move Up */}
            <button
              type="button"
              onClick={() => handleMoveSelectedImage("up")}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
              title="Move above previous paragraph"
            >
              <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[10px]">Up</span>
            </button>

            {/* 1-Click Move Down */}
            <button
              type="button"
              onClick={() => handleMoveSelectedImage("down")}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition flex items-center gap-0.5 cursor-pointer"
              title="Move below next paragraph"
            >
              <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[10px]">Down</span>
            </button>

            {/* 1-Click Move Bottom */}
            <button
              type="button"
              onClick={() => handleMoveSelectedImage("bottom")}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-emerald-400 transition flex items-center gap-0.5 cursor-pointer"
              title="Move to bottom of article"
            >
              <ChevronsDown className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-[10px]">Bottom</span>
            </button>

            <div className="w-[1px] h-3.5 bg-slate-700" />

            {/* Live Size Badge */}
            <span className="font-mono text-emerald-400 font-bold px-1">
              {imageConfig.width}% • {Math.round(overlayRect.width)}px
            </span>

            <div className="w-[1px] h-3.5 bg-slate-700" />

            {/* Deselect / Close */}
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
              className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-full transition cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 8 Resize Handles (NW, N, NE, E, SE, S, SW, W) */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "nw")}
            className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-nw-resize hover:bg-emerald-500 hover:scale-125 transition-transform"
            title="Drag with mouse to resize (Top-Left)"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "n")}
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-n-resize hover:bg-emerald-500 hover:scale-125 transition-transform"
            title="Drag with mouse to resize"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "ne")}
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-ne-resize hover:bg-emerald-500 hover:scale-125 transition-transform"
            title="Drag with mouse to resize (Top-Right)"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "e")}
            className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-e-resize hover:bg-emerald-500 hover:scale-125 transition-transform"
            title="Drag with mouse to resize width (Right Edge)"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "se")}
            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-se-resize hover:bg-emerald-500 hover:scale-125 transition-transform"
            title="Drag with mouse to resize (Bottom-Right)"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "s")}
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-s-resize hover:bg-emerald-500 hover:scale-125 transition-transform"
            title="Drag with mouse to resize"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "sw")}
            className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-sw-resize hover:bg-emerald-500 hover:scale-125 transition-transform"
            title="Drag with mouse to resize (Bottom-Left)"
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, "w")}
            className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md pointer-events-auto cursor-w-resize hover:bg-emerald-500 hover:scale-125 transition-transform"
            title="Drag with mouse to resize width (Left Edge)"
          />

          {isResizing && (
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-lg pointer-events-none border border-slate-700 whitespace-nowrap">
              ↔ Resizing: {imageConfig.width}% ({Math.round(overlayRect.width)}px)
            </div>
          )}
        </div>
      )}
    </>
  );
}

