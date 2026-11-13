import React, { useEffect, useState, useRef, useMemo } from "react";
import { BookOpen, Plus, RefreshCw, ExternalLink } from "lucide-react";
import BlogService from "../../services/blog.service";
import Delete from "../../components/Delete";
import toast from "react-hot-toast";

// Helpers & Constants
import {
  CATEGORIES,
  DEFAULT_BLOG_TEMPLATE,
  normalizeImageUrl,
  sanitizeContentImages,
  generateSlug,
  generateImageHTML,
} from "./blogs/blogHelpers";

// Subcomponents
import BlogStatsCards from "./blogs/BlogStatsCards";
import BlogFilterBar from "./blogs/BlogFilterBar";
import BlogTable from "./blogs/BlogTable";
import BlogBulkActionsBar from "./blogs/BlogBulkActionsBar";
import BlogEditorModal from "./blogs/BlogEditorModal";
import BlogLinkModal from "./blogs/BlogLinkModal";
import BlogImageModal from "./blogs/BlogImageModal";

export default function WebBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters, Sorting & Pagination State
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Multi-Select & Bulk Actions State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' | 'preview' | 'html'
  const [copiedId, setCopiedId] = useState(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Link insert modal state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  // Word Typography & Styling State
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTextColor, setActiveTextColor] = useState("#0f172a");
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState("#fef08a");
  const [customFontSize, setCustomFontSize] = useState("16");

  // In-Content Image Management State
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalMode, setImageModalMode] = useState("insert"); // "insert" | "edit"
  const [imageTab, setImageTab] = useState("upload"); // "upload" | "url"
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImgEl, setSelectedImgEl] = useState(null);
  const [imageConfig, setImageConfig] = useState({
    url: "",
    alt: "",
    caption: "",
    align: "center", // "center" | "left" | "right" | "full"
    width: 60, // percentage (15 to 100)
    angle: 0, // degrees (-180 to 180)
    radius: 12, // px
    shadow: "medium", // "none" | "soft" | "medium" | "hard"
  });

  const savedRangeRef = useRef(null);
  const quickUploadInputRef = useRef(null);
  const editorRef = useRef(null);
  const editorWrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  const draggedFigureRef = useRef(null);
  const dropTargetBlockRef = useRef(null);

  // Floating Image Mouse-Resize & Drag-to-Move State
  const [overlayRect, setOverlayRect] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragCursorPos, setDragCursorPos] = useState({ x: 0, y: 0 });
  const [dropIndicator, setDropIndicator] = useState(null);
  const pendingDropTargetRef = useRef(null);

  // Tag input state
  const [tagInput, setTagInput] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);

  // Editor form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    author: "Repair Saathi Technical Team",
    category: "AC Service",
    tags: ["Patna", "Doorstep Repair"],
    readTime: "5 min read",
    image: "",
    imageLink: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "published",
    isFeatured: false,
  });

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await BlogService.getAll();
      const rawList =
        res.data && res.data.success
          ? res.data.data || []
          : Array.isArray(res.data)
          ? res.data
          : [];
      const normalizedList = rawList.map((b) => ({
        ...b,
        image: normalizeImageUrl(b.image),
        content: sanitizeContentImages(b.content),
      }));
      setBlogs(normalizedList);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter, sortBy, sortOrder, pageSize]);

  // Clean selected IDs that no longer exist
  useEffect(() => {
    if (selectedIds.length > 0 && blogs.length > 0) {
      const existingIds = new Set(blogs.map((b) => b.id));
      setSelectedIds((prev) => prev.filter((id) => existingIds.has(id)));
    }
  }, [blogs]);

  // Filtered & Sorted Blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchSearch =
        search.trim() === "" ||
        b.title?.toLowerCase().includes(search.toLowerCase()) ||
        b.slug?.toLowerCase().includes(search.toLowerCase()) ||
        b.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));

      const matchCat = categoryFilter === "all" || b.category === categoryFilter;
      const matchStatus = statusFilter === "all" || b.status === statusFilter;

      return matchSearch && matchCat && matchStatus;
    });
  }, [blogs, search, categoryFilter, statusFilter]);

  // Sorted Blogs
  const sortedBlogs = useMemo(() => {
    const list = [...filteredBlogs];
    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "title") {
        comparison = (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "views") {
        comparison = (a.views || 0) - (b.views || 0);
      } else if (sortBy === "id") {
        comparison = (a.id || 0) - (b.id || 0);
      } else {
        // Default: createdAt
        const dateA = new Date(a.createdAt || a.publishedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.publishedAt || 0).getTime();
        comparison = dateA - dateB;
      }
      return sortOrder === "DESC" ? -comparison : comparison;
    });
    return list;
  }, [filteredBlogs, sortBy, sortOrder]);

  // Paginated Blogs
  const totalPages = Math.ceil(sortedBlogs.length / pageSize) || 1;
  const paginatedBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedBlogs.slice(startIndex, startIndex + pageSize);
  }, [sortedBlogs, currentPage, pageSize]);

  // Status statistics
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const draftCount = blogs.filter((b) => b.status === "draft").length;
  const totalViews = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);

  // Selection Handlers
  const handleToggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectPage = () => {
    const pageIds = paginatedBlogs.map((b) => b.id);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Deselect all on current page
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSelectAllFiltered = () => {
    setSelectedIds(filteredBlogs.map((b) => b.id));
    toast.success(`Selected all ${filteredBlogs.length} articles!`);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Bulk Actions Handlers
  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Publishing ${selectedIds.length} articles...`);
    try {
      setBulkLoading(true);
      await Promise.all(
        selectedIds.map((id) => BlogService.update(id, { status: "published" }))
      );
      toast.success(`${selectedIds.length} articles published live!`, { id: toastId });
      setSelectedIds([]);
      fetchBlogs();
    } catch (err) {
      console.error("Bulk publish error:", err);
      toast.error("Failed to publish selected articles", { id: toastId });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDraft = async () => {
    if (selectedIds.length === 0) return;
    const toastId = toast.loading(`Moving ${selectedIds.length} articles to draft...`);
    try {
      setBulkLoading(true);
      await Promise.all(
        selectedIds.map((id) => BlogService.update(id, { status: "draft" }))
      );
      toast.success(`${selectedIds.length} articles moved to drafts!`, { id: toastId });
      setSelectedIds([]);
      fetchBlogs();
    } catch (err) {
      console.error("Bulk draft error:", err);
      toast.error("Failed to update status for selected articles", { id: toastId });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    const toastId = toast.loading(`Deleting ${count} articles...`);
    try {
      setBulkLoading(true);
      await Promise.all(selectedIds.map((id) => BlogService.remove(id)));
      toast.success(`${count} articles deleted successfully!`, { id: toastId });
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
      fetchBlogs();
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Failed to delete selected articles", { id: toastId });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      const shouldAutoSlug = !isSlugManual;
      return {
        ...prev,
        title: val,
        slug: shouldAutoSlug ? generateSlug(val) : prev.slug,
        metaTitle:
          prev.metaTitle && prev.metaTitle !== `${prev.title} | Repair Saathi Patna`
            ? prev.metaTitle
            : val
            ? `${val} | Repair Saathi Patna`
            : "",
      };
    });
  };

  const handleSlugInputChange = (e) => {
    setIsSlugManual(true);
    const raw = e.target.value;
    const sanitized = raw
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
    setFormData((prev) => ({
      ...prev,
      slug: sanitized,
    }));
  };

  const handleSlugInputBlur = () => {
    setFormData((prev) => ({
      ...prev,
      slug: (prev.slug || "").replace(/^-+|-+$/g, ""),
    }));
  };

  const handleAutoSlug = () => {
    setIsSlugManual(false);
    const newSlug = generateSlug(formData.title);
    setFormData((prev) => ({
      ...prev,
      slug: newSlug,
    }));
    toast.success("Slug auto-generated from title!");
  };

  // Word count & Read time calculation
  const stats = useMemo(() => {
    const text = formData.content ? formData.content.replace(/<[^>]*>/g, " ") : "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const min = Math.max(1, Math.ceil(words / 200));
    return { words, chars, readTime: `${min} min read` };
  }, [formData.content]);

  // Auto update readTime when words change
  useEffect(() => {
    if (stats.words > 0 && (!formData.readTime || formData.readTime.endsWith("min read"))) {
      setFormData((prev) => ({ ...prev, readTime: stats.readTime }));
    }
  }, [stats.readTime]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingBlog(null);
    setIsSlugManual(false);
    setFormData({
      title: "",
      slug: "",
      author: "Repair Saathi Technical Team",
      category: "AC Service",
      tags: ["Patna", "Doorstep Repair"],
      readTime: "5 min read",
      image: "",
      imageLink: "",
      excerpt: "",
      content: DEFAULT_BLOG_TEMPLATE,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "patna appliance repair, doorstep repair patna, technician",
      status: "published",
      isFeatured: false,
    });
    setActiveTab("editor");
    setIsEditorOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setIsSlugManual(true);
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      author: blog.author || "Repair Saathi Technical Team",
      category: blog.category || "AC Service",
      tags: Array.isArray(blog.tags) ? blog.tags : (typeof blog.tags === "string" ? JSON.parse(blog.tags || "[]") : []),
      readTime: blog.readTime || "5 min read",
      image: normalizeImageUrl(blog.image || ""),
      imageLink: blog.imageLink || "",
      excerpt: blog.excerpt || "",
      content: sanitizeContentImages(blog.content || ""),
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      metaKeywords: blog.metaKeywords || "",
      status: blog.status || "published",
      isFeatured: !!blog.isFeatured,
    });
    setActiveTab("editor");
    setIsEditorOpen(true);
  };

  // Helper to extract computed font size of current selection
  const updateActiveFontSizeFromSelection = () => {
    try {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
      const range = sel.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) return;

      let el = range.commonAncestorContainer;
      if (el.nodeType === Node.TEXT_NODE) {
        el = el.parentElement;
      }
      if (el && el instanceof Element) {
        const computed = window.getComputedStyle(el);
        if (computed && computed.fontSize) {
          const num = parseInt(computed.fontSize, 10);
          if (num && !isNaN(num) && num > 0) {
            setCustomFontSize(String(num));
          }
        }
      }
    } catch (e) {}
  };

  // Continuous selection range tracker
  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
        updateActiveFontSizeFromSelection();
      }
    }
  };

  const restoreSelection = () => {
    if (savedRangeRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  // Synchronize contentEditable div with formData.content
  useEffect(() => {
    if (isEditorOpen && editorRef.current && activeTab === "editor") {
      if (editorRef.current.innerHTML !== formData.content) {
        editorRef.current.innerHTML = formData.content || "";
      }
      try {
        document.execCommand("styleWithCSS", false, true);
      } catch (e) {}
    }
  }, [isEditorOpen, activeTab]);

  // Global listeners for selection and popover clicks
  useEffect(() => {
    const handleSelectionChange = () => {
      saveCurrentSelection();
    };
    const handleClickOutsidePickers = (e) => {
      if (showColorPicker && !e.target.closest(".color-picker-container")) {
        setShowColorPicker(false);
      }
      if (showHighlightPicker && !e.target.closest(".highlight-picker-container")) {
        setShowHighlightPicker(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("mousedown", handleClickOutsidePickers);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("mousedown", handleClickOutsidePickers);
    };
  }, [showColorPicker, showHighlightPicker]);

  // Handle contentEditable changes
  const handleEditorInput = () => {
    if (editorRef.current) {
      setFormData((prev) => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  };

  // Rich Text Commands
  const execCmd = (command, value = null) => {
    if (activeTab !== "editor") setActiveTab("editor");
    if (editorRef.current) editorRef.current.focus();
    restoreSelection();
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  // Font Family Selector
  const applyFontFamily = (family) => {
    if (activeTab !== "editor") setActiveTab("editor");
    if (editorRef.current) editorRef.current.focus();
    restoreSelection();
    document.execCommand("fontName", false, family);
    if (editorRef.current) {
      const fontTags = editorRef.current.querySelectorAll(`font[face="${family}"]`);
      fontTags.forEach((el) => {
        const span = document.createElement("span");
        span.style.fontFamily = family;
        span.innerHTML = el.innerHTML;
        el.parentNode.replaceChild(span, el);
      });
      handleEditorInput();
    }
  };

  // Font Size Selector
  const applyFontSize = (size) => {
    if (!size) return;
    let cleanVal = String(size).trim();
    if (!cleanVal) return;
    const num = parseInt(cleanVal, 10);
    if (isNaN(num) || num <= 0) return;
    const pxVal = `${num}px`;
    setCustomFontSize(String(num));

    if (activeTab !== "editor") setActiveTab("editor");
    if (editorRef.current) editorRef.current.focus();
    restoreSelection();

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
      const span = document.createElement("span");
      span.style.fontSize = pxVal;
      span.innerHTML = "&#8203;";
      const range = sel.getRangeAt(0);
      range.insertNode(span);
      range.selectNodeContents(span);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
      handleEditorInput();
      saveCurrentSelection();
      return;
    }

    document.execCommand("fontSize", false, "7");
    if (editorRef.current) {
      const fontTags = editorRef.current.querySelectorAll('font[size="7"]');
      fontTags.forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = pxVal;
        span.innerHTML = el.innerHTML;
        el.parentNode.replaceChild(span, el);
      });
      const spanTags = editorRef.current.querySelectorAll(
        'span[style*="xxx-large"], span[style*="font-size: 7"]'
      );
      spanTags.forEach((el) => {
        el.style.fontSize = pxVal;
      });
      handleEditorInput();
      saveCurrentSelection();
    }
  };

  const stepFontSize = (delta) => {
    const current = parseInt(customFontSize, 10) || 16;
    const newSize = Math.max(6, Math.min(144, current + delta));
    applyFontSize(newSize);
  };

  const applyTextColor = (color) => {
    if (activeTab !== "editor") setActiveTab("editor");
    if (editorRef.current) editorRef.current.focus();
    restoreSelection();
    document.execCommand("foreColor", false, color);
    setActiveTextColor(color);
    setShowColorPicker(false);
    handleEditorInput();
  };

  const applyHighlightColor = (color) => {
    if (activeTab !== "editor") setActiveTab("editor");
    if (editorRef.current) editorRef.current.focus();
    restoreSelection();
    if (!color || color === "transparent") {
      document.execCommand("removeFormat", false, null);
    } else {
      if (!document.execCommand("hiliteColor", false, color)) {
        document.execCommand("backColor", false, color);
      }
    }
    setActiveHighlightColor(color);
    setShowHighlightPicker(false);
    handleEditorInput();
  };

  // Bulletproof DOM Insertion for Images at Current Cursor
  const insertImageAtCursor = (config) => {
    if (!editorRef.current || !config?.url) return false;

    let targetRange = savedRangeRef.current ? savedRangeRef.current.cloneRange() : null;

    if (!targetRange) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.getRangeAt(0).commonAncestorContainer)) {
        targetRange = sel.getRangeAt(0).cloneRange();
      }
    }

    const normalizedUrl = normalizeImageUrl(config.url);
    const html = generateImageHTML({ ...config, url: normalizedUrl });

    let inserted = false;

    if (targetRange && editorRef.current.contains(targetRange.commonAncestorContainer)) {
      try {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(targetRange);

        if (document.queryCommandSupported && document.queryCommandSupported("insertHTML")) {
          inserted = document.execCommand("insertHTML", false, html);
        }

        if (!inserted) {
          targetRange.deleteContents();
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html.trim();
          const frag = document.createDocumentFragment();
          let lastNode = null;
          while (tempDiv.firstChild) {
            lastNode = tempDiv.firstChild;
            frag.appendChild(tempDiv.firstChild);
          }
          targetRange.insertNode(frag);

          if (lastNode) {
            const nextRange = document.createRange();
            nextRange.setStartAfter(lastNode);
            nextRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(nextRange);
            savedRangeRef.current = nextRange.cloneRange();
          }
          inserted = true;
        }
      } catch (rangeErr) {
        console.warn("Cursor image insert error:", rangeErr);
      }
    }

    if (!inserted) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html.trim();
      const frag = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        frag.appendChild(tempDiv.firstChild);
      }
      editorRef.current.appendChild(frag);
    }

    handleEditorInput();
    saveCurrentSelection();
    return true;
  };

  const handleOpenInsertImage = () => {
    saveCurrentSelection();
    setImageModalMode("insert");
    setImageTab("upload");
    setImageConfig({
      url: "",
      alt: "",
      caption: "",
      align: "center",
      width: 60,
      angle: 0,
      radius: 12,
      shadow: "medium",
    });
    setImageModalOpen(true);
  };

  const handleInsertImage = () => {
    if (!imageConfig.url) {
      toast.error("Please upload an image or provide an image URL");
      return;
    }

    insertImageAtCursor(imageConfig);
    setImageModalOpen(false);
    toast.success("Image added to blog article!");
  };

  const handleQuickImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    const toastId = toast.loading("Uploading and adding image...");
    try {
      const res = await BlogService.uploadImage(file);
      const rawUrl = res?.url || res?.data?.url || res?.fileUrl || (res?.filename ? `/uploads/${res.filename}` : "");
      if (rawUrl) {
        const finalUrl = normalizeImageUrl(rawUrl);
        insertImageAtCursor({
          url: finalUrl,
          alt: file.name.split(".")[0] || "Blog image",
          caption: "",
          align: "center",
          width: 75,
          angle: 0,
          radius: 12,
          shadow: "medium",
        });
        toast.success("Image added to blog article!", { id: toastId });
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (err) {
      console.warn("Quick upload server error, falling back to data URL:", err);
      try {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const dataUrl = uploadEvent.target.result;
          insertImageAtCursor({
            url: dataUrl,
            alt: file.name.split(".")[0] || "Blog image",
            caption: "",
            align: "center",
            width: 75,
            angle: 0,
            radius: 12,
            shadow: "medium",
          });
          toast.success("Image added to blog article!", { id: toastId });
        };
        reader.readAsDataURL(file);
      } catch (fallbackErr) {
        toast.error("Failed to add image", { id: toastId });
      }
    } finally {
      e.target.value = "";
    }
  };

  const handleSaveImageChanges = () => {
    if (selectedImgEl) {
      updateSelectedImageAttributes(imageConfig);
      toast.success("Image adjustments updated!");
    }
    setImageModalOpen(false);
  };

  const updateSelectedImageAttributes = (newAttrs) => {
    if (!selectedImgEl) return;
    const merged = { ...imageConfig, ...newAttrs };
    setImageConfig(merged);

    const figure = selectedImgEl.closest("figure.blog-img-box");
    const target = selectedImgEl;

    target.setAttribute("data-angle", merged.angle);
    target.setAttribute("data-align", merged.align);
    target.setAttribute("data-width", merged.width);
    target.setAttribute("data-radius", merged.radius);
    target.setAttribute("data-shadow", merged.shadow);
    target.style.transform = `rotate(${merged.angle}deg)`;
    target.style.borderRadius = `${merged.radius}px`;

    let shadowCss = "none";
    if (merged.shadow === "soft") shadowCss = "0 4px 15px rgba(0,0,0,0.15)";
    else if (merged.shadow === "medium") shadowCss = "0 10px 25px -5px rgba(0,0,0,0.3)";
    else if (merged.shadow === "hard") shadowCss = "0 20px 35px -5px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)";
    target.style.boxShadow = shadowCss;

    if (merged.alt !== undefined) target.alt = merged.alt;
    if (merged.url && target.src !== merged.url) target.src = merged.url;

    if (figure) {
      figure.setAttribute("data-align", merged.align);
      figure.setAttribute("data-width", merged.width);
      figure.setAttribute("data-angle", merged.angle);
      figure.setAttribute("data-radius", merged.radius);
      figure.setAttribute("data-shadow", merged.shadow);

      let maxWidth = `${merged.width}%`;
      if (merged.align === "left") {
        figure.style.float = "left";
        figure.style.margin = "10px 24px 16px 0";
        figure.style.clear = "none";
        maxWidth = `${Math.min(merged.width, 50)}%`;
      } else if (merged.align === "right") {
        figure.style.float = "right";
        figure.style.margin = "10px 0 16px 24px";
        figure.style.clear = "none";
        maxWidth = `${Math.min(merged.width, 50)}%`;
      } else if (merged.align === "full") {
        figure.style.float = "none";
        figure.style.margin = "24px 0";
        figure.style.clear = "both";
        maxWidth = "100%";
      } else {
        figure.style.float = "none";
        figure.style.margin = "20px auto";
        figure.style.clear = "both";
        maxWidth = `${merged.width}%`;
      }

      figure.style.maxWidth = maxWidth;
      figure.style.width = maxWidth;
      figure.style.display = "block";
      figure.style.textAlign = "center";

      let figcaption = figure.querySelector("figcaption");
      if (merged.caption && merged.caption.trim()) {
        if (!figcaption) {
          figcaption = document.createElement("figcaption");
          figcaption.style.fontSize = "13px";
          figcaption.style.color = "#94a3b8";
          figcaption.style.marginTop = "8px";
          figcaption.style.textAlign = "center";
          figcaption.style.fontStyle = "italic";
          figure.appendChild(figcaption);
        }
        figcaption.innerText = merged.caption.trim();
      } else if (figcaption) {
        figcaption.remove();
      }
    }

    handleEditorInput();
    setTimeout(() => updateOverlayRect(), 20);
  };

  const updateOverlayRect = () => {
    if (!selectedImgEl || !editorWrapperRef.current) {
      setOverlayRect(null);
      return;
    }
    const imgRect = selectedImgEl.getBoundingClientRect();
    const wrapperRect = editorWrapperRef.current.getBoundingClientRect();

    setOverlayRect({
      top: imgRect.top - wrapperRect.top,
      left: imgRect.left - wrapperRect.left,
      width: imgRect.width,
      height: imgRect.height,
    });
  };

  useEffect(() => {
    if (selectedImgEl) {
      updateOverlayRect();
      const handleScrollOrResize = () => {
        updateOverlayRect();
      };
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize);
      return () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize);
      };
    } else {
      setOverlayRect(null);
    }
  }, [selectedImgEl]);

  const handleResizeMouseDown = (e, handle) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedImgEl || !editorRef.current) return;
    setIsResizing(true);

    const startX = e.clientX;
    const figure = selectedImgEl.closest("figure.blog-img-box");
    const editorWidth = editorRef.current.clientWidth || 800;
    const startRect = selectedImgEl.getBoundingClientRect();
    const startWidth = startRect.width;
    const align = figure?.getAttribute("data-align") || imageConfig.align || "center";

    const onMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      let deltaX = moveEvent.clientX - startX;

      if (handle.includes("w")) {
        deltaX = -deltaX;
      }

      const multiplier = align === "center" ? 2 : 1;
      let targetWidthPx = startWidth + deltaX * multiplier;

      const minPx = Math.max(80, editorWidth * 0.15);
      const maxPx = editorWidth;
      targetWidthPx = Math.max(minPx, Math.min(maxPx, targetWidthPx));

      const newPct = Math.max(15, Math.min(100, Math.round((targetWidthPx / editorWidth) * 100)));

      if (figure) {
        figure.style.width = `${newPct}%`;
        figure.style.maxWidth = align === "left" || align === "right" ? `${Math.min(newPct, 50)}%` : `${newPct}%`;
        figure.setAttribute("data-width", String(newPct));
      }
      selectedImgEl.setAttribute("data-width", String(newPct));

      setImageConfig((prev) => ({ ...prev, width: newPct }));
      updateOverlayRect();
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      handleEditorInput();
      updateOverlayRect();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleMoveSelectedImage = (direction) => {
    if (!selectedImgEl || !editorRef.current) return;
    const figure = selectedImgEl.closest("figure.blog-img-box");
    if (!figure || !figure.parentNode) return;

    if (direction === "top") {
      const firstChild = editorRef.current.firstChild;
      if (firstChild && firstChild !== figure) {
        editorRef.current.insertBefore(figure, firstChild);
        handleEditorInput();
        setTimeout(updateOverlayRect, 30);
        toast.success("Image moved to top of article ⏫");
      } else {
        toast("Image is already at the top", { icon: "ℹ️" });
      }
      return;
    }

    if (direction === "bottom") {
      editorRef.current.appendChild(figure);
      handleEditorInput();
      setTimeout(updateOverlayRect, 30);
      toast.success("Image moved to bottom of article ⏬");
      return;
    }

    if (direction === "up") {
      let target = figure.previousElementSibling;
      while (target && target.tagName === "P" && (target.innerHTML.trim() === "<br>" || target.innerHTML.trim() === "")) {
        target = target.previousElementSibling;
      }
      if (target) {
        figure.parentNode.insertBefore(figure, target);
        handleEditorInput();
        setTimeout(updateOverlayRect, 30);
        toast.success("Image moved up ⬆");
      } else {
        toast("Image is already at the top", { icon: "ℹ️" });
      }
      return;
    }

    if (direction === "down") {
      let target = figure.nextElementSibling;
      while (target && target.tagName === "P" && (target.innerHTML.trim() === "<br>" || target.innerHTML.trim() === "")) {
        target = target.nextElementSibling;
      }
      if (target) {
        figure.parentNode.insertBefore(figure, target.nextElementSibling);
        handleEditorInput();
        setTimeout(updateOverlayRect, 30);
        toast.success("Image moved down ⬇");
      } else {
        toast("Image is already at the bottom", { icon: "ℹ️" });
      }
      return;
    }
  };

  const handleStartMoveDrag = (e, figureEl = null) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const figure = figureEl || (selectedImgEl ? selectedImgEl.closest("figure.blog-img-box") : null);
    if (!figure || !editorRef.current || !editorWrapperRef.current) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let hasMoved = false;

    const getTargetUnderCursor = (clientX, clientY) => {
      const wrapperRect = editorWrapperRef.current.getBoundingClientRect();
      const allChildren = Array.from(editorRef.current.children).filter(
        (c) => c !== figure && !c.classList.contains("image-resize-overlay") && !c.classList.contains("drop-indicator-line")
      );

      if (allChildren.length === 0) {
        return { target: null, position: "append", top: 10, left: 10, width: editorRef.current.clientWidth - 20 };
      }

      const firstRect = allChildren[0].getBoundingClientRect();
      if (clientY <= firstRect.top + 15) {
        return {
          target: allChildren[0],
          position: "before",
          top: Math.max(0, firstRect.top - wrapperRect.top),
          left: Math.max(0, firstRect.left - wrapperRect.left),
          width: firstRect.width || editorRef.current.clientWidth,
        };
      }

      const lastRect = allChildren[allChildren.length - 1].getBoundingClientRect();
      if (clientY >= lastRect.bottom - 15) {
        return {
          target: allChildren[allChildren.length - 1],
          position: "after",
          top: Math.max(0, lastRect.bottom - wrapperRect.top),
          left: Math.max(0, lastRect.left - wrapperRect.left),
          width: lastRect.width || editorRef.current.clientWidth,
        };
      }

      if (document.caretRangeFromPoint) {
        const range = document.caretRangeFromPoint(clientX, clientY);
        if (range && editorRef.current.contains(range.commonAncestorContainer)) {
          let node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
          while (node && node.parentElement && node.parentElement !== editorRef.current) {
            node = node.parentElement;
          }
          if (node && node !== figure && editorRef.current.contains(node)) {
            const rect = node.getBoundingClientRect();
            const isBefore = clientY < (rect.top + rect.height / 2);
            return {
              target: node,
              position: isBefore ? "before" : "after",
              top: Math.max(0, (isBefore ? rect.top : rect.bottom) - wrapperRect.top),
              left: Math.max(0, rect.left - wrapperRect.left),
              width: rect.width || editorRef.current.clientWidth,
            };
          }
        }
      }

      let closest = allChildren[0];
      let minDist = Infinity;
      let pos = "after";
      let closestRect = allChildren[0].getBoundingClientRect();

      for (const child of allChildren) {
        const rect = child.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const dist = Math.abs(clientY - midY);
        if (dist < minDist) {
          minDist = dist;
          closest = child;
          closestRect = rect;
          pos = clientY < midY ? "before" : "after";
        }
      }

      return {
        target: closest,
        position: pos,
        top: Math.max(0, (pos === "before" ? closestRect.top : closestRect.bottom) - wrapperRect.top),
        left: Math.max(0, closestRect.left - wrapperRect.left),
        width: closestRect.width || editorRef.current.clientWidth,
      };
    };

    const onMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      const dist = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);

      if (!hasMoved && dist > 5) {
        hasMoved = true;
        setIsDraggingImage(true);
        figure.style.opacity = "0.35";
        figure.style.transition = "opacity 0.2s";
      }

      if (hasMoved) {
        setDragCursorPos({ x: moveEvent.clientX, y: moveEvent.clientY });
        const dropInfo = getTargetUnderCursor(moveEvent.clientX, moveEvent.clientY);
        if (dropInfo) {
          pendingDropTargetRef.current = dropInfo;
          setDropIndicator({
            top: dropInfo.top,
            left: dropInfo.left,
            width: dropInfo.width,
          });
        }
      }
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      if (hasMoved) {
        figure.style.opacity = "1";
        setIsDraggingImage(false);
        setDropIndicator(null);

        const dropInfo = pendingDropTargetRef.current;
        pendingDropTargetRef.current = null;

        if (dropInfo && dropInfo.target && dropInfo.target !== figure) {
          if (dropInfo.position === "before") {
            editorRef.current.insertBefore(figure, dropInfo.target);
          } else {
            editorRef.current.insertBefore(figure, dropInfo.target.nextSibling);
          }
          handleEditorInput();
          setTimeout(() => updateOverlayRect(), 40);
          toast.success("Image moved to new position!");
        } else if (dropInfo && dropInfo.position === "append") {
          editorRef.current.appendChild(figure);
          handleEditorInput();
          setTimeout(() => updateOverlayRect(), 40);
          toast.success("Image moved to bottom of article!");
        }
      } else {
        const img = figure.querySelector("img");
        if (img) setSelectedImgEl(img);
        updateOverlayRect();
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleEditorClick = (e) => {
    const target = e.target;
    if (target && target.tagName === "IMG") {
      let figure = target.closest("figure.blog-img-box");
      if (!figure) {
        figure = document.createElement("figure");
        figure.className = "blog-img-box";
        figure.style.display = "block";
        figure.style.margin = "20px auto";
        figure.style.maxWidth = "60%";
        figure.style.width = "60%";
        figure.style.textAlign = "center";
        figure.style.clear = "both";

        const div = document.createElement("div");
        div.style.display = "inline-block";
        div.style.width = "100%";
        div.style.textAlign = "center";

        target.parentNode.insertBefore(figure, target);
        div.appendChild(target);
        figure.appendChild(div);
      }

      figure.setAttribute("draggable", "false");
      target.setAttribute("draggable", "false");

      const angle = parseInt(target.getAttribute("data-angle") || "0", 10);
      const align = target.getAttribute("data-align") || (figure?.style.float === "left" ? "left" : figure?.style.float === "right" ? "right" : figure?.style.width === "100%" ? "full" : "center");
      const width = parseInt(target.getAttribute("data-width") || (figure ? parseInt(figure.style.width, 10) || "60" : "60"), 10);
      const radius = parseInt(target.getAttribute("data-radius") || parseInt(target.style.borderRadius, 10) || "12", 10);
      const shadow = target.getAttribute("data-shadow") || "medium";
      const alt = target.alt || "";
      const figcaption = figure ? figure.querySelector("figcaption") : null;
      const caption = figcaption ? figcaption.innerText : "";

      if (editorRef.current) {
        editorRef.current.querySelectorAll("img").forEach((img) => {
          img.style.outline = "";
          img.style.outlineOffset = "";
        });
      }

      target.style.outline = "2px solid #10b981";
      target.style.outlineOffset = "3px";

      setSelectedImgEl(target);
      setImageConfig({
        url: target.src,
        alt,
        caption,
        align: align || "center",
        width: width || 60,
        angle: isNaN(angle) ? 0 : angle,
        radius: isNaN(radius) ? 12 : radius,
        shadow: shadow || "medium",
      });
      setTimeout(() => updateOverlayRect(), 20);
      handleEditorInput();
    } else {
      if (
        selectedImgEl &&
        !e.target.closest(".image-control-dock") &&
        !e.target.closest(".image-modal-container") &&
        !e.target.closest(".image-resize-overlay")
      ) {
        selectedImgEl.style.outline = "";
        selectedImgEl.style.outlineOffset = "";
        setSelectedImgEl(null);
        setOverlayRect(null);
      }
    }
  };

  const handleEditorDoubleClick = (e) => {
    if (e.target && e.target.tagName === "IMG") {
      setImageModalMode("edit");
      setImageModalOpen(true);
    }
  };

  const handleEditorKeyDown = (e) => {
    if (selectedImgEl && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault();
      handleDeleteSelectedImage();
    }
  };

  const handleDeleteSelectedImage = () => {
    if (!selectedImgEl) return;
    const figure = selectedImgEl.closest("figure.blog-img-box");
    if (figure) {
      figure.remove();
    } else {
      selectedImgEl.remove();
    }
    setSelectedImgEl(null);
    setOverlayRect(null);
    handleEditorInput();
    setImageModalOpen(false);
    toast.success("Image removed from article");
  };

  const handleModalImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    try {
      setImageUploading(true);
      const res = await BlogService.uploadImage(file);
      const rawUrl = res?.url || res?.data?.url || res?.fileUrl || (res?.filename ? `/uploads/${res.filename}` : "");
      if (rawUrl) {
        const finalUrl = normalizeImageUrl(rawUrl);
        setImageConfig((prev) => ({ ...prev, url: finalUrl }));
        if (selectedImgEl && imageModalMode === "edit") {
          updateSelectedImageAttributes({ url: finalUrl });
        }
        toast.success("Image uploaded!");
      } else {
        toast.error("Failed to get uploaded image URL");
      }
    } catch (err) {
      console.error("Modal image upload error:", err);
      try {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const dataUrl = uploadEvent.target.result;
          setImageConfig((prev) => ({ ...prev, url: dataUrl }));
          if (selectedImgEl && imageModalMode === "edit") {
            updateSelectedImageAttributes({ url: dataUrl });
          }
          toast.success("Image loaded!");
        };
        reader.readAsDataURL(file);
      } catch (fallbackErr) {
        toast.error("Could not load image");
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleEditorPaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (!file) continue;

        const toastId = toast.loading("Uploading pasted image...");
        try {
          const res = await BlogService.uploadImage(file);
          const rawUrl = res?.url || res?.data?.url || res?.fileUrl || (res?.filename ? `/uploads/${res.filename}` : "");
          if (rawUrl) {
            const finalUrl = normalizeImageUrl(rawUrl);
            insertImageAtCursor({
              url: finalUrl,
              alt: "Pasted image",
              caption: "",
              align: "center",
              width: 75,
              angle: 0,
              radius: 12,
              shadow: "medium",
            });
            toast.success("Image pasted into article!", { id: toastId });
          } else {
            throw new Error("No URL returned");
          }
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (uploadEvent) => {
            insertImageAtCursor({
              url: uploadEvent.target.result,
              alt: "Pasted image",
              caption: "",
              align: "center",
              width: 75,
              angle: 0,
              radius: 12,
              shadow: "medium",
            });
            toast.success("Image pasted into article!", { id: toastId });
          };
          reader.readAsDataURL(file);
        }
        return;
      }
    }
  };

  const handleEditorDragStart = (e) => {
    const target = e.target;
    const figure = target.closest ? target.closest("figure.blog-img-box") : null;
    if (figure) {
      draggedFigureRef.current = figure;
      e.dataTransfer.setData("text/plain", "RS_FIGURE_DRAG");
      e.dataTransfer.effectAllowed = "move";
      figure.style.opacity = "0.4";
      const img = figure.querySelector("img");
      if (img) setSelectedImgEl(img);
    }
  };

  const handleEditorDragEnd = () => {
    if (draggedFigureRef.current) {
      draggedFigureRef.current.style.opacity = "1";
      draggedFigureRef.current = null;
    }
    dropTargetBlockRef.current = null;
    setDropIndicator(null);
    setTimeout(() => updateOverlayRect(), 50);
  };

  const handleEditorDragLeave = (e) => {
    if (!editorRef.current?.contains(e.relatedTarget)) {
      setDropIndicator(null);
    }
  };

  const handleEditorDragOver = (e) => {
    e.preventDefault();

    if (e.dataTransfer?.types?.includes("Files")) {
      e.dataTransfer.dropEffect = "copy";
      return;
    }

    if (draggedFigureRef.current && editorWrapperRef.current && editorRef.current) {
      e.dataTransfer.dropEffect = "move";
      const wrapperRect = editorWrapperRef.current.getBoundingClientRect();

      const children = Array.from(editorRef.current.children).filter(
        (el) => el !== draggedFigureRef.current && !el.classList.contains("image-resize-overlay")
      );

      if (children.length === 0) return;

      let closestBlock = null;
      let insertPosition = "after";
      let minDistance = Infinity;
      let targetTop = 0;
      let targetLeft = 0;
      let targetWidth = editorRef.current.clientWidth;

      for (const child of children) {
        const rect = child.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const dist = Math.abs(e.clientY - midY);

        if (dist < minDistance) {
          minDistance = dist;
          closestBlock = child;
          insertPosition = e.clientY < midY ? "before" : "after";
          targetTop = (insertPosition === "before" ? rect.top : rect.bottom) - wrapperRect.top;
          targetLeft = rect.left - wrapperRect.left;
          targetWidth = rect.width;
        }
      }

      if (closestBlock) {
        dropTargetBlockRef.current = { block: closestBlock, position: insertPosition };
        setDropIndicator({
          top: Math.max(0, targetTop),
          left: Math.max(0, targetLeft),
          width: targetWidth || editorRef.current.clientWidth,
        });
      }
    }
  };

  const handleEditorDrop = async (e) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith("image/")) {
      e.preventDefault();

      if (document.caretRangeFromPoint) {
        const dropRange = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (dropRange) savedRangeRef.current = dropRange.cloneRange();
      } else if (e.rangeParent) {
        const dropRange = document.createRange();
        dropRange.setStart(e.rangeParent, e.rangeOffset);
        savedRangeRef.current = dropRange.cloneRange();
      }

      const file = files[0];
      const toastId = toast.loading("Uploading dropped image...");
      try {
        const res = await BlogService.uploadImage(file);
        const rawUrl = res?.url || res?.data?.url || res?.fileUrl || (res?.filename ? `/uploads/${res.filename}` : "");
        if (rawUrl) {
          const finalUrl = normalizeImageUrl(rawUrl);
          insertImageAtCursor({
            url: finalUrl,
            alt: file.name.split(".")[0] || "Dropped image",
            caption: "",
            align: "center",
            width: 75,
            angle: 0,
            radius: 12,
            shadow: "medium",
          });
          toast.success("Image dropped & added to article!", { id: toastId });
        } else {
          throw new Error("No URL returned");
        }
      } catch (err) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          insertImageAtCursor({
            url: uploadEvent.target.result,
            alt: file.name.split(".")[0] || "Dropped image",
            caption: "",
            align: "center",
            width: 75,
            angle: 0,
            radius: 12,
            shadow: "medium",
          });
          toast.success("Image added to article!", { id: toastId });
        };
        reader.readAsDataURL(file);
      }
      return;
    }

    if (draggedFigureRef.current && dropTargetBlockRef.current) {
      e.preventDefault();
      e.stopPropagation();

      const { block, position } = dropTargetBlockRef.current;
      const figure = draggedFigureRef.current;

      if (block && figure && block !== figure) {
        if (position === "before") {
          block.parentNode.insertBefore(figure, block);
        } else {
          block.parentNode.insertBefore(figure, block.nextSibling);
        }

        figure.style.opacity = "1";
        draggedFigureRef.current = null;
        dropTargetBlockRef.current = null;
        setDropIndicator(null);

        handleEditorInput();

        const img = figure.querySelector("img");
        if (img) {
          setSelectedImgEl(img);
          setTimeout(() => updateOverlayRect(), 50);
        }

        toast.success("Image moved to new position!");
        return;
      }
    }

    if (draggedFigureRef.current) {
      draggedFigureRef.current.style.opacity = "1";
      draggedFigureRef.current = null;
    }
    dropTargetBlockRef.current = null;
    setDropIndicator(null);
  };

  const insertCallout = (type = "tip") => {
    if (type === "tip") {
      const html = `<div class="tip-callout" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 8px; margin: 18px 0; color: inherit;">
        <strong>💡 Pro Tip:</strong> Always verify technician credentials and ask for an itemized estimate before approving repairs.
      </div><p><br></p>`;
      execCmd("insertHTML", html);
    } else {
      const html = `<div class="warning-callout" style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 8px; margin: 18px 0; color: inherit;">
        <strong>⚠️ Safety Warning:</strong> Turn off electrical main power before opening internal panels to prevent electric shock.
      </div><p><br></p>`;
      execCmd("insertHTML", html);
    }
  };

  const insertTable = () => {
    const html = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background: #f1f5f9; color: #0f172a; text-align: left;">
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Appliance Issue</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">DIY Possible?</th>
          <th style="padding: 10px; border: 1px solid #cbd5e1;">Pro Recommendation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Clogged Drainage / Filter</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Yes (Clean with brush)</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Low risk</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Compressor / Motor Failure</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">No</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Call certified technician</td>
        </tr>
      </tbody>
    </table><p><br></p>`;
    execCmd("insertHTML", html);
  };

  const handleInsertLink = () => {
    if (!linkUrl) return;
    const finalUrl = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    if (linkText) {
      const html = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: underline;">${linkText}</a>`;
      execCmd("insertHTML", html);
    } else {
      execCmd("createLink", finalUrl);
    }
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP)");
      return;
    }

    try {
      setUploadingImage(true);
      const res = await BlogService.uploadImage(file);
      const rawUrl = res?.url || res?.data?.url || res?.fileUrl || (res?.filename ? `/uploads/${res.filename}` : "");
      if (rawUrl) {
        const finalUrl = normalizeImageUrl(rawUrl);
        setFormData((prev) => ({ ...prev, image: finalUrl }));
        toast.success("Featured image uploaded!");
      } else {
        toast.error("Failed to get uploaded image URL");
      }
    } catch (err) {
      console.error("Upload error:", err);
      try {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFormData((prev) => ({ ...prev, image: ev.target.result }));
          toast.success("Featured image loaded!");
        };
        reader.readAsDataURL(file);
      } catch (fbErr) {
        toast.error("Failed to upload image. Please try again.");
      }
    } finally {
      setUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,+|,+$/g, "");
      if (val && !formData.tags.includes(val)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, val] }));
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleAddSuggestedTag = (tag) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleSubmit = async (targetStatus = null) => {
    if (!formData.title.trim()) {
      toast.error("Blog title is required");
      return;
    }
    const cleanedSlug = (formData.slug || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/^-+|-+$/g, "");

    if (!cleanedSlug) {
      toast.error("URL slug is required");
      return;
    }

    if (editorRef.current) {
      editorRef.current.querySelectorAll("img").forEach((img) => {
        img.style.outline = "";
        img.style.outlineOffset = "";
      });
    }
    setSelectedImgEl(null);

    const latestContent = editorRef.current ? editorRef.current.innerHTML : formData.content;

    const finalImage =
      formData.image ||
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80";

    const payload = {
      ...formData,
      slug: cleanedSlug,
      content: sanitizeContentImages(latestContent),
      image: normalizeImageUrl(finalImage),
      status: targetStatus || formData.status,
    };

    try {
      setSaving(true);
      if (editingBlog) {
        await BlogService.update(editingBlog.id, payload);
        toast.success("Blog updated successfully!");
      } else {
        await BlogService.create(payload);
        toast.success("Blog published successfully!");
      }
      setIsEditorOpen(false);
      fetchBlogs();
    } catch (err) {
      console.error("Save blog error:", err);
      toast.error(err.response?.data?.message || "Failed to save blog");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (blog) => {
    try {
      await BlogService.toggleStatus(blog.id);
      toast.success(
        blog.status === "published"
          ? "Blog moved to Drafts"
          : "Blog published live to website!"
      );
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to change blog status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await BlogService.remove(deleteId);
      toast.success("Blog deleted successfully");
      setDeleteId(null);
      fetchBlogs();
    } catch (err) {
      toast.error("Failed to delete blog");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyUrl = (slug, id) => {
    const fullUrl = `https://repairsaathi.in/home-appliance-repair-blog/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success("Blog URL copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* TOP HEADER */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  Website Blog Management
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Live Web
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Write, edit, and publish rich SEO-optimized repair guides directly to the Repair Saathi website.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBlogs}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Refresh Blogs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
            <a
              href="https://repairsaathi.in/home-appliance-repair-blog"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-sm font-medium flex items-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>View Live Blog</span>
            </a>
            <button
              onClick={handleOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Blog</span>
            </button>
          </div>
        </div>

        {/* METRICS STATS CARDS */}
        <BlogStatsCards
          totalCount={totalCount}
          publishedCount={publishedCount}
          draftCount={draftCount}
          totalViews={totalViews}
        />

        {/* SEARCH, FILTER & ACTION BAR */}
        <BlogFilterBar
          search={search}
          setSearch={setSearch}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          pageSize={pageSize}
          setPageSize={setPageSize}
          filteredCount={filteredBlogs.length}
          totalCount={blogs.length}
        />

        {/* BLOGS LIST TABLE WITH SELECTION & PAGINATION */}
        <BlogTable
          loading={loading}
          blogs={paginatedBlogs}
          totalFilteredCount={filteredBlogs.length}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          search={search}
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          selectedIds={selectedIds}
          onToggleSelectRow={handleToggleSelectRow}
          onToggleSelectPage={handleToggleSelectPage}
          onOpenCreate={handleOpenCreate}
          onOpenEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
          onDeleteClick={(id) => setDeleteId(id)}
          onCopyUrl={handleCopyUrl}
          copiedId={copiedId}
        />
      </div>

      {/* FLOATING BULK ACTIONS BAR (When 1 or more items are selected) */}
      <BlogBulkActionsBar
        selectedIds={selectedIds}
        totalFilteredCount={filteredBlogs.length}
        onSelectAllFiltered={handleSelectAllFiltered}
        onClearSelection={handleClearSelection}
        onBulkPublish={handleBulkPublish}
        onBulkDraft={handleBulkDraft}
        onBulkDelete={() => setBulkDeleteModalOpen(true)}
        bulkLoading={bulkLoading}
      />

      {/* FULL-SCREEN PROFESSIONAL WORD-LIKE RICH BLOG EDITOR MODAL */}
      <BlogEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        editingBlog={editingBlog}
        formData={formData}
        setFormData={setFormData}
        stats={stats}
        saving={saving}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSubmit={handleSubmit}
        handleTitleChange={handleTitleChange}
        handleSlugInputChange={handleSlugInputChange}
        handleSlugInputBlur={handleSlugInputBlur}
        handleAutoSlug={handleAutoSlug}
        execCmd={execCmd}
        applyFontFamily={applyFontFamily}
        applyFontSize={applyFontSize}
        stepFontSize={stepFontSize}
        customFontSize={customFontSize}
        setCustomFontSize={setCustomFontSize}
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
        selectedImgEl={selectedImgEl}
        setSelectedImgEl={setSelectedImgEl}
        imageConfig={imageConfig}
        updateSelectedImageAttributes={updateSelectedImageAttributes}
        handleMoveSelectedImage={handleMoveSelectedImage}
        setImageModalMode={setImageModalMode}
        setImageModalOpen={setImageModalOpen}
        handleDeleteSelectedImage={handleDeleteSelectedImage}
        setOverlayRect={setOverlayRect}
        editorRef={editorRef}
        editorWrapperRef={editorWrapperRef}
        handleEditorInput={handleEditorInput}
        handleEditorClick={handleEditorClick}
        handleEditorDoubleClick={handleEditorDoubleClick}
        handleEditorKeyDown={handleEditorKeyDown}
        handleEditorPaste={handleEditorPaste}
        handleEditorDragStart={handleEditorDragStart}
        handleEditorDragEnd={handleEditorDragEnd}
        handleEditorDragOver={handleEditorDragOver}
        handleEditorDragLeave={handleEditorDragLeave}
        handleEditorDrop={handleEditorDrop}
        dropIndicator={dropIndicator}
        isDraggingImage={isDraggingImage}
        dragCursorPos={dragCursorPos}
        overlayRect={overlayRect}
        isResizing={isResizing}
        handleStartMoveDrag={handleStartMoveDrag}
        handleResizeMouseDown={handleResizeMouseDown}
        tagInput={tagInput}
        setTagInput={setTagInput}
        handleAddTag={handleAddTag}
        handleRemoveTag={handleRemoveTag}
        handleAddSuggestedTag={handleAddSuggestedTag}
        uploadingImage={uploadingImage}
        fileInputRef={fileInputRef}
        handleImageUpload={handleImageUpload}
      />

      {/* INSERT LINK MODAL POPUP */}
      <BlogLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        linkText={linkText}
        setLinkText={setLinkText}
        onInsert={handleInsertLink}
      />

      {/* INSERT / CUSTOMIZE IN-CONTENT IMAGE MODAL */}
      <BlogImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageModalMode={imageModalMode}
        imageTab={imageTab}
        setImageTab={setImageTab}
        imageConfig={imageConfig}
        setImageConfig={setImageConfig}
        imageUploading={imageUploading}
        selectedImgEl={selectedImgEl}
        onModalImageUpload={handleModalImageUpload}
        updateSelectedImageAttributes={updateSelectedImageAttributes}
        onInsertImage={handleInsertImage}
        onSaveImageChanges={handleSaveImageChanges}
        onDeleteSelectedImage={handleDeleteSelectedImage}
      />

      {/* SINGLE DELETE CONFIRMATION MODAL */}
      <Delete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Blog Article?"
        description="This will permanently delete this article and remove it from the public website."
      />

      {/* BULK DELETE CONFIRMATION MODAL */}
      <Delete
        open={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        loading={bulkLoading}
        title={`Delete ${selectedIds.length} Selected Articles?`}
        description={`This will permanently delete ${selectedIds.length} selected articles from the database and remove them from the public website.`}
      />
    </div>
  );
}
