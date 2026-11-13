import React from "react";
import BlogEditorHeader from "./BlogEditorHeader";
import BlogTitleSlug from "./BlogTitleSlug";
import BlogEditorToolbar from "./BlogEditorToolbar";
import BlogImageControlDock from "./BlogImageControlDock";
import BlogImageOverlay from "./BlogImageOverlay";
import BlogHtmlEditor from "./BlogHtmlEditor";
import BlogPreview from "./BlogPreview";
import BlogExcerpt from "./BlogExcerpt";
import BlogPublishingSettings from "./BlogPublishingSettings";
import BlogCategoryTags from "./BlogCategoryTags";
import BlogFeaturedImage from "./BlogFeaturedImage";
import BlogSeoSettings from "./BlogSeoSettings";

export default function BlogEditorModal({
  isOpen,
  onClose,
  editingBlog,
  formData,
  setFormData,
  stats,
  saving,
  activeTab,
  setActiveTab,
  onSubmit,
  handleTitleChange,
  handleSlugInputChange,
  handleSlugInputBlur,
  handleAutoSlug,
  execCmd,
  applyFontFamily,
  applyFontSize,
  stepFontSize,
  customFontSize,
  setCustomFontSize,
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
  selectedImgEl,
  setSelectedImgEl,
  imageConfig,
  updateSelectedImageAttributes,
  handleMoveSelectedImage,
  setImageModalMode,
  setImageModalOpen,
  handleDeleteSelectedImage,
  setOverlayRect,
  editorRef,
  editorWrapperRef,
  handleEditorInput,
  handleEditorClick,
  handleEditorDoubleClick,
  handleEditorKeyDown,
  handleEditorPaste,
  handleEditorDragStart,
  handleEditorDragEnd,
  handleEditorDragOver,
  handleEditorDragLeave,
  handleEditorDrop,
  dropIndicator,
  isDraggingImage,
  dragCursorPos,
  overlayRect,
  isResizing,
  handleStartMoveDrag,
  handleResizeMouseDown,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
  handleAddSuggestedTag,
  uploadingImage,
  fileInputRef,
  handleImageUpload,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* TOP BAR / RIBBON HEADER */}
      <BlogEditorHeader
        editingBlog={editingBlog}
        status={formData.status}
        stats={stats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        saving={saving}
        onClose={onClose}
        onSubmit={onSubmit}
      />

      {/* MAIN SCROLLABLE EDITOR CONTAINER */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLUMNS: MAIN WRITING AREA */}
          <div className="lg:col-span-8 space-y-5">
            {/* 1. ARTICLE TITLE & SLUG */}
            <BlogTitleSlug
              title={formData.title}
              handleTitleChange={handleTitleChange}
              slug={formData.slug}
              handleSlugInputChange={handleSlugInputChange}
              handleSlugInputBlur={handleSlugInputBlur}
              handleAutoSlug={handleAutoSlug}
            />

            {/* 2. WORD-LIKE FORMATTING TOOLBAR RIBBON & CANVAS */}
            {activeTab === "editor" && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm relative">
                {/* TOOLBAR */}
                <BlogEditorToolbar
                  execCmd={execCmd}
                  applyFontFamily={applyFontFamily}
                  customFontSize={customFontSize}
                  setCustomFontSize={setCustomFontSize}
                  applyFontSize={applyFontSize}
                  stepFontSize={stepFontSize}
                  showColorPicker={showColorPicker}
                  setShowColorPicker={setShowColorPicker}
                  activeTextColor={activeTextColor}
                  applyTextColor={applyTextColor}
                  showHighlightPicker={showHighlightPicker}
                  setShowHighlightPicker={setShowHighlightPicker}
                  activeHighlightColor={activeHighlightColor}
                  applyHighlightColor={applyHighlightColor}
                  quickUploadInputRef={quickUploadInputRef}
                  handleQuickImageUpload={handleQuickImageUpload}
                  saveCurrentSelection={saveCurrentSelection}
                  handleOpenInsertImage={handleOpenInsertImage}
                  insertCallout={insertCallout}
                  insertTable={insertTable}
                  setShowLinkModal={setShowLinkModal}
                />

                {/* DYNAMIC IMAGE CONTROL DOCK */}
                <BlogImageControlDock
                  selectedImgEl={selectedImgEl}
                  setSelectedImgEl={setSelectedImgEl}
                  imageConfig={imageConfig}
                  updateSelectedImageAttributes={updateSelectedImageAttributes}
                  handleMoveSelectedImage={handleMoveSelectedImage}
                  setImageModalMode={setImageModalMode}
                  setImageModalOpen={setImageModalOpen}
                  handleDeleteSelectedImage={handleDeleteSelectedImage}
                  setOverlayRect={setOverlayRect}
                />

                {/* EDITABLE DOCUMENT CANVAS WRAPPER */}
                <div ref={editorWrapperRef} className="relative">
                  {/* EDITABLE DOCUMENT CANVAS */}
                  <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleEditorInput}
                    onClick={handleEditorClick}
                    onDoubleClick={handleEditorDoubleClick}
                    onKeyDown={handleEditorKeyDown}
                    onKeyUp={saveCurrentSelection}
                    onMouseUp={saveCurrentSelection}
                    onPaste={handleEditorPaste}
                    onDragStart={handleEditorDragStart}
                    onDragEnd={handleEditorDragEnd}
                    onDragOver={handleEditorDragOver}
                    onDragLeave={handleEditorDragLeave}
                    onDrop={handleEditorDrop}
                    className="min-h-[500px] p-8 md:p-10 bg-white text-slate-800 text-base leading-relaxed focus:outline-none focus:ring-0 font-sans selection:bg-emerald-100 overflow-y-auto"
                    style={{ minHeight: "520px" }}
                  />

                  {/* FLOATING IMAGE RESIZE & MOVE OVERLAY */}
                  <BlogImageOverlay
                    dropIndicator={dropIndicator}
                    isDraggingImage={isDraggingImage}
                    dragCursorPos={dragCursorPos}
                    selectedImgEl={selectedImgEl}
                    setSelectedImgEl={setSelectedImgEl}
                    overlayRect={overlayRect}
                    setOverlayRect={setOverlayRect}
                    imageConfig={imageConfig}
                    isResizing={isResizing}
                    handleStartMoveDrag={handleStartMoveDrag}
                    handleMoveSelectedImage={handleMoveSelectedImage}
                    handleResizeMouseDown={handleResizeMouseDown}
                  />
                </div>

                {/* EDITOR FOOTER STATUS BAR */}
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 rounded-b-2xl flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span>Words: <strong className="text-slate-800">{stats.words}</strong></span>
                    <span>Characters: <strong className="text-slate-800">{stats.chars}</strong></span>
                    <span>Estimated Read: <strong className="text-emerald-700">{stats.readTime}</strong></span>
                  </div>
                  <div className="text-slate-400">
                    Rich HTML WYSIWYG Mode
                  </div>
                </div>
              </div>
            )}

            {/* RAW HTML MODE */}
            {activeTab === "html" && (
              <BlogHtmlEditor
                content={formData.content}
                onChange={(val) => setFormData((prev) => ({ ...prev, content: val }))}
              />
            )}

            {/* LIVE WEB PREVIEW TAB */}
            {activeTab === "preview" && (
              <BlogPreview formData={formData} />
            )}

            {/* SHORT EXCERPT / SUMMARY */}
            <BlogExcerpt
              excerpt={formData.excerpt}
              onChange={(val) => setFormData((prev) => ({ ...prev, excerpt: val }))}
            />
          </div>

          {/* RIGHT 4 COLUMNS: SETTINGS, SEO & MEDIA */}
          <div className="lg:col-span-4 space-y-5">
            <BlogPublishingSettings
              formData={formData}
              setFormData={setFormData}
            />

            <BlogCategoryTags
              formData={formData}
              setFormData={setFormData}
              tagInput={tagInput}
              setTagInput={setTagInput}
              handleAddTag={handleAddTag}
              handleRemoveTag={handleRemoveTag}
              handleAddSuggestedTag={handleAddSuggestedTag}
            />

            <BlogFeaturedImage
              formData={formData}
              setFormData={setFormData}
              uploadingImage={uploadingImage}
              fileInputRef={fileInputRef}
              handleImageUpload={handleImageUpload}
            />

            <BlogSeoSettings
              formData={formData}
              setFormData={setFormData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

