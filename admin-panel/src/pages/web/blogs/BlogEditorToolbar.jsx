import React from "react";
import {
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Highlighter,
  Check,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Outdent,
  Indent,
  Quote,
  Upload,
  Image as ImageIcon,
  Lightbulb,
  AlertTriangle,
  Table,
  Link2,
  Minus,
  Eraser,
} from "lucide-react";

export default function BlogEditorToolbar({
  execCmd,
  applyFontFamily,
  customFontSize,
  setCustomFontSize,
  applyFontSize,
  stepFontSize,
  showColorPicker,
  setShowColorPicker,
  activeTextColor,
  applyTextColor,
  showHighlightPicker,
  setShowHighlightPicker,
  activeHighlightColor,
  applyHighlightColor,
  quickUploadInputRef,
  handleQuickImageUpload,
  saveCurrentSelection,
  handleOpenInsertImage,
  insertCallout,
  insertTable,
  setShowLinkModal,
}) {
  return (
    <div className="bg-slate-50 border-b border-slate-200 p-2 rounded-t-2xl flex flex-wrap items-center gap-1.5 text-slate-700 sticky top-0 z-20 backdrop-blur-md">
      {/* Undo / Redo */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("undo")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Undo (Ctrl+Z)"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("redo")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Redo (Ctrl+Y)"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

      {/* Headings & Text Styles */}
      <select
        onChange={(e) => {
          const val = e.target.value;
          if (!val) return;
          if (val === "p") execCmd("formatBlock", "<p>");
          else execCmd("formatBlock", `<${val}>`);
          e.target.value = "";
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
        title="Text Formatting / Headings"
      >
        <option value="">Text Style...</option>
        <option value="p">Paragraph (Normal)</option>
        <option value="h1">Heading 1 (Main Title)</option>
        <option value="h2">Heading 2 (Section)</option>
        <option value="h3">Heading 3 (Sub-section)</option>
        <option value="h4">Heading 4 (Minor)</option>
        <option value="blockquote">Quote Block</option>
        <option value="pre">Code Block</option>
      </select>

      {/* Font Family / Design Selector */}
      <select
        onChange={(e) => {
          const val = e.target.value;
          if (val) applyFontFamily(val);
          e.target.value = "";
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 text-xs rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer max-w-[130px] shadow-xs"
        title="Font Design (Family)"
      >
        <option value="">Font Style...</option>
        <option value="Inter, sans-serif" style={{ fontFamily: "Inter, sans-serif" }}>Inter (Clean Sans)</option>
        <option value="Roboto, sans-serif" style={{ fontFamily: "Roboto, sans-serif" }}>Roboto (Modern)</option>
        <option value="Poppins, sans-serif" style={{ fontFamily: "Poppins, sans-serif" }}>Poppins (Geometric)</option>
        <option value="Montserrat, sans-serif" style={{ fontFamily: "Montserrat, sans-serif" }}>Montserrat (Executive)</option>
        <option value="'Open Sans', sans-serif" style={{ fontFamily: "'Open Sans', sans-serif" }}>Open Sans (Neutral)</option>
        <option value="Georgia, serif" style={{ fontFamily: "Georgia, serif" }}>Georgia (Classic Serif)</option>
        <option value="Merriweather, serif" style={{ fontFamily: "Merriweather, serif" }}>Merriweather (Editorial)</option>
        <option value="'Playfair Display', serif" style={{ fontFamily: "'Playfair Display', serif" }}>Playfair Display (Luxury)</option>
        <option value="'Times New Roman', serif" style={{ fontFamily: "'Times New Roman', serif" }}>Times New Roman</option>
        <option value="'JetBrains Mono', monospace" style={{ fontFamily: "'JetBrains Mono', monospace" }}>JetBrains Mono (Code)</option>
        <option value="'Courier New', monospace" style={{ fontFamily: "'Courier New', monospace" }}>Courier New (Typewriter)</option>
        <option value="'Comic Sans MS', cursive" style={{ fontFamily: "'Comic Sans MS', cursive" }}>Comic Sans (Playful)</option>
        <option value="Impact, sans-serif" style={{ fontFamily: "Impact, sans-serif" }}>Impact (Headline)</option>
      </select>

      {/* MS Word-like Font Size (Manual Number Entry + Preset Dropdown + Grow/Shrink) */}
      <div className="flex items-center gap-1" title="Font Size (select text and type custom size)">
        <div className="flex items-center bg-white border border-slate-200 hover:border-slate-300 focus-within:border-emerald-500 rounded-lg shadow-xs overflow-hidden transition">
          <input
            type="text"
            inputMode="numeric"
            value={customFontSize}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/[^0-9]/g, "");
              setCustomFontSize(cleaned);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (customFontSize) applyFontSize(customFontSize);
              }
            }}
            onBlur={() => {
              if (customFontSize) applyFontSize(customFontSize);
            }}
            className="w-9 text-center text-xs font-semibold text-slate-800 bg-white py-1 px-1 focus:outline-none focus:bg-emerald-50/40"
            title="Type custom font size (e.g. 18, 22) & press Enter"
            placeholder="16"
          />
          <select
            value={customFontSize}
            onChange={(e) => {
              const val = e.target.value;
              if (val) applyFontSize(val);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-xs py-1 px-1 text-slate-600 focus:outline-none cursor-pointer"
            title="Choose font size preset"
          >
            <option value="" disabled hidden>
              ▾
            </option>
            {[8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 56, 64, 72].map(
              (s) => (
                <option key={s} value={String(s)}>
                  {s}
                </option>
              )
            )}
          </select>
        </div>

        {/* MS Word Grow Font Button (A▲) */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            stepFontSize(2);
          }}
          className="p-1 px-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition flex items-center justify-center font-bold cursor-pointer"
          title="Grow Font (Increase +2px)"
        >
          <span className="text-xs font-extrabold leading-none">A</span>
          <span className="text-[8px] -mt-1 font-black leading-none ml-0.5">▲</span>
        </button>

        {/* MS Word Shrink Font Button (A▼) */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            stepFontSize(-2);
          }}
          className="p-1 px-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition flex items-center justify-center font-bold cursor-pointer"
          title="Shrink Font (Decrease -2px)"
        >
          <span className="text-[10px] font-bold leading-none">A</span>
          <span className="text-[8px] mt-1 font-black leading-none ml-0.5">▼</span>
        </button>
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

      {/* Basic Typography Group */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("bold")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition font-bold cursor-pointer"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("italic")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition italic cursor-pointer"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("underline")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition underline cursor-pointer"
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("strikeThrough")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition cursor-pointer"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("subscript")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition cursor-pointer"
        title="Subscript (X₂)"
      >
        <Subscript className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("superscript")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition cursor-pointer"
        title="Superscript (X²)"
      >
        <Superscript className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

      {/* Word-like Text Color Picker */}
      <div className="relative color-picker-container">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            setShowHighlightPicker(false);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition flex flex-col items-center justify-center relative cursor-pointer"
          title="Font Text Color"
        >
          <span className="font-bold text-sm leading-none">A</span>
          <span
            className="w-3.5 h-1 rounded-sm mt-0.5 shadow-xs"
            style={{ backgroundColor: activeTextColor }}
          />
        </button>

        {showColorPicker && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-full right-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xl w-64 space-y-3 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-200">
              <span>Font Text Color</span>
              <button
                type="button"
                onClick={() => setShowColorPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Palette Swatches */}
            <div className="grid grid-cols-6 gap-1.5">
              {[
                "#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#ffffff",
                "#10b981", "#059669", "#06b6d4", "#0284c7", "#3b82f6", "#1d4ed8",
                "#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#ef4444", "#dc2626",
                "#f97316", "#eab308", "#14b8a6", "#84cc16", "#78716c", "#475569",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyTextColor(c)}
                  className="w-7 h-7 rounded-lg border border-slate-200 hover:scale-110 transition flex items-center justify-center relative shadow-xs cursor-pointer"
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {activeTextColor === c && (
                    <Check className={`w-3.5 h-3.5 ${c === "#ffffff" || c === "#cbd5e1" || c === "#eab308" ? "text-slate-900" : "text-white"}`} />
                  )}
                </button>
              ))}
            </div>

            {/* Custom Color Input */}
            <div className="pt-2.5 border-t border-slate-200 flex items-center gap-2.5">
              <input
                type="color"
                value={activeTextColor}
                onChange={(e) => applyTextColor(e.target.value)}
                className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer bg-transparent p-0.5"
                title="Pick Custom Color"
              />
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-800 uppercase">{activeTextColor}</span>
                <span className="text-[11px] text-slate-400">Hex Code</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Word-like Text Highlighter */}
      <div className="relative highlight-picker-container">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowHighlightPicker(!showHighlightPicker);
            setShowColorPicker(false);
          }}
          className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-700 hover:text-slate-900 transition flex flex-col items-center justify-center relative cursor-pointer"
          title="Highlight Color"
        >
          <Highlighter className="w-3.5 h-3.5" />
          <span
            className="w-3.5 h-1 rounded-sm mt-0.5 shadow-xs"
            style={{ backgroundColor: activeHighlightColor }}
          />
        </button>

        {showHighlightPicker && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-full right-0 mt-2 z-50 bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xl w-56 space-y-3 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800 pb-1.5 border-b border-slate-200">
              <span>Highlight Text</span>
              <button
                type="button"
                onClick={() => setShowHighlightPicker(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Swatches */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { name: "Yellow", color: "#fef08a" },
                { name: "Green", color: "#bbf7d0" },
                { name: "Cyan", color: "#a5f3fc" },
                { name: "Pink", color: "#fbcfe8" },
                { name: "Orange", color: "#fed7aa" },
                { name: "Purple", color: "#e9d5ff" },
                { name: "Emerald", color: "#a7f3d0" },
              ].map((h) => (
                <button
                  key={h.color}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyHighlightColor(h.color)}
                  className="h-7 rounded-lg border border-slate-200 hover:scale-105 transition flex items-center justify-center shadow-xs cursor-pointer"
                  style={{ backgroundColor: h.color }}
                  title={h.name}
                >
                  {activeHighlightColor === h.color && <Check className="w-3.5 h-3.5 text-slate-900" />}
                </button>
              ))}
            </div>

            {/* Clear Highlight button */}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyHighlightColor("transparent")}
              className="w-full py-1 text-xs text-slate-600 hover:text-slate-900 rounded border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
            >
              Remove Highlight
            </button>
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

      {/* Alignments */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("justifyLeft")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("justifyCenter")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("justifyRight")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("justifyFull")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

      {/* Lists & Indentation */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("insertUnorderedList")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("insertOrderedList")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("outdent")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Decrease Indent"
      >
        <Outdent className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("indent")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Increase Indent"
      >
        <Indent className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("formatBlock", "<blockquote>")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

      {/* In-Content Insert Objects */}
      {/* 🖼️ DIRECT QUICK UPLOAD BUTTON */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          saveCurrentSelection();
        }}
        onClick={() => {
          saveCurrentSelection();
          quickUploadInputRef.current?.click();
        }}
        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-1.5 transition font-semibold shadow-xs cursor-pointer"
        title="Upload Image directly from computer and insert at cursor"
      >
        <Upload className="w-3.5 h-3.5 text-emerald-600" /> Upload Image
      </button>
      <input
        ref={quickUploadInputRef}
        type="file"
        accept="image/*"
        onClick={(e) => e.stopPropagation()}
        onChange={handleQuickImageUpload}
        className="hidden"
      />

      {/* 🖼️ ADVANCED IMAGE MODAL BUTTON (Angle / Styling) */}
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          saveCurrentSelection();
        }}
        onClick={() => {
          saveCurrentSelection();
          handleOpenInsertImage();
        }}
        className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border border-cyan-200 text-xs flex items-center gap-1.5 transition font-semibold shadow-xs cursor-pointer"
        title="Insert Image (Upload or Web URL with full Angle, Shadow & Position control)"
      >
        <ImageIcon className="w-3.5 h-3.5" /> + Image (Angles)
      </button>

      {/* Special Blocks */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => insertCallout("tip")}
        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-1 transition font-medium shadow-xs cursor-pointer"
        title="Insert Pro Tip Callout Box"
      >
        <Lightbulb className="w-3.5 h-3.5" /> + Pro Tip
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => insertCallout("warning")}
        className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs flex items-center gap-1 transition font-medium shadow-xs cursor-pointer"
        title="Insert Warning Box"
      >
        <AlertTriangle className="w-3.5 h-3.5" /> + Warning
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={insertTable}
        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs flex items-center gap-1 transition font-medium shadow-xs cursor-pointer"
        title="Insert Pricing / Comparison Table"
      >
        <Table className="w-3.5 h-3.5" /> + Table
      </button>

      <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />

      {/* Link & Clear */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          saveCurrentSelection();
          setShowLinkModal(true);
        }}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Insert Web Link"
      >
        <Link2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("insertHorizontalRule")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-slate-900 transition cursor-pointer"
        title="Horizontal Divider"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => execCmd("removeFormat")}
        className="p-1.5 rounded-lg hover:bg-slate-200/70 text-slate-600 hover:text-rose-600 transition cursor-pointer"
        title="Clear Formatting"
      >
        <Eraser className="w-4 h-4" />
      </button>
    </div>
  );
}

