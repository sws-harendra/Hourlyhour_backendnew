import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  Clock,
  Calendar,
  User,
  Tag,
  Sparkles,
  RefreshCw,
  X,
  ChevronDown,
  Globe,
  SlidersHorizontal,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Table,
  Minus,
  RotateCcw,
  RotateCw,
  Code2,
  AlertTriangle,
  Lightbulb,
  Eraser,
  Wand2,
  CheckCircle2,
  Share2,
  FileText,
  Star,
  Layers,
  ArrowUpDown,
  MoreVertical,
  Highlighter,
  Subscript,
  Superscript,
  Indent,
  Outdent,
  Maximize2,
  Sliders,
  Palette,
  Type,
} from "lucide-react";
import BlogService from "../../services/blog.service";
import Delete from "../../components/Delete";
import toast from "react-hot-toast";

// Predefined categories matching website
const CATEGORIES = [
  "AC Service",
  "Refrigerator",
  "Washing Machine",
  "Geyser Service",
  "Microwave",
  "Water Purifier",
  "Maintenance Tips",
  "Repair Cost Guides",
  "Troubleshooting",
];

const SUGGESTED_TAGS = [
  "Patna",
  "Danapur",
  "Doorstep Repair",
  "AC Gas Refill",
  "Fridge Cooling Fix",
  "PCB Repair",
  "Seasonal Care",
  "DIY Tips",
  "Cost Guide",
  "Warranty",
];

export default function WebBlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

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
  const [activeTextColor, setActiveTextColor] = useState("#ffffff");
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState("#fef08a");

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
  const inContentFileInputRef = useRef(null);

  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Editor form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    author: "Repair Saathi Technical Team",
    category: "AC Service",
    tags: ["Patna", "Doorstep Repair"],
    readTime: "5 min read",
    image: "",
    excerpt: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    status: "published",
    isFeatured: false,
  });

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await BlogService.getAll();
      if (res.data && res.data.success) {
        setBlogs(res.data.data || []);
      } else if (Array.isArray(res.data)) {
        setBlogs(res.data);
      }
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

  // Filtered blogs
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

  // Status statistics
  const totalCount = blogs.length;
  const publishedCount = blogs.filter((b) => b.status === "published").length;
  const draftCount = blogs.filter((b) => b.status === "draft").length;
  const totalViews = blogs.reduce((acc, curr) => acc + (curr.views || 0), 0);

  // Generate URL slug from title
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^ws-]/g, "")
      .replace(/[s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => {
      // Auto update slug if it was empty or matched previous auto slug
      const shouldAutoSlug = !editingBlog || !prev.slug || prev.slug === generateSlug(prev.title);
      return {
        ...prev,
        title: val,
        slug: shouldAutoSlug ? generateSlug(val) : prev.slug,
        metaTitle: prev.metaTitle ? prev.metaTitle : `${val} | Repair Saathi Patna`,
      };
    });
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
    setFormData({
      title: "",
      slug: "",
      author: "Repair Saathi Technical Team",
      category: "AC Service",
      tags: ["Patna", "Doorstep Repair"],
      readTime: "5 min read",
      image: "",
      excerpt: "",
      content: `<h2>1. Common Problem Signs</h2>
<p>Most home appliances exhibit subtle signs before breaking down completely. Recognizing these early can save you significant repair costs.</p>
<ul>
  <li>Unusual buzzing, rattling, or grinding noises during operation.</li>
  <li>Sudden increase in electricity consumption without extra usage.</li>
  <li>Inefficient heating or cooling cycles.</li>
</ul>

<div class="tip-callout" style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 8px; margin: 18px 0;">
  <strong>💡 Expert Pro Tip:</strong> Never ignore electrical sparks or burning smells. Disconnect the main socket immediately and book a verified technician.
</div>

<h2>2. Step-by-Step Troubleshooting Guide</h2>
<p>Follow these safe diagnostic measures before calling an engineer:</p>
<ol>
  <li>Inspect the power supply socket and circuit breaker.</li>
  <li>Clean exterior dust filters and ventilation grills.</li>
  <li>Check for water supply or hose blockages.</li>
</ol>

<h2>3. Estimated Repair Costs in Patna</h2>
<p>Standard benchmark rates by certified technicians:</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <thead>
    <tr style="background: #1e293b; color: #f8fafc; text-align: left;">
      <th style="padding: 10px; border: 1px solid #334155;">Service Type</th>
      <th style="padding: 10px; border: 1px solid #334155;">Average Time</th>
      <th style="padding: 10px; border: 1px solid #334155;">Warranty Included</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #334155;">Basic Inspection &amp; Tuning</td>
      <td style="padding: 10px; border: 1px solid #334155;">30 - 45 mins</td>
      <td style="padding: 10px; border: 1px solid #334155;">30 Days</td>
    </tr>
    <tr>
      <td style="padding: 10px; border: 1px solid #334155;">Major Part Replacement</td>
      <td style="padding: 10px; border: 1px solid #334155;">1 - 2 hours</td>
      <td style="padding: 10px; border: 1px solid #334155;">90 Days Part Guarantee</td>
    </tr>
  </tbody>
</table>`,
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
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      author: blog.author || "Repair Saathi Technical Team",
      category: blog.category || "AC Service",
      tags: Array.isArray(blog.tags) ? blog.tags : (typeof blog.tags === "string" ? JSON.parse(blog.tags || "[]") : []),
      readTime: blog.readTime || "5 min read",
      image: blog.image || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      metaKeywords: blog.metaKeywords || "",
      status: blog.status || "published",
      isFeatured: !!blog.isFeatured,
    });
    setActiveTab("editor");
    setIsEditorOpen(true);
  };

  // Continuous selection range tracker
  const saveCurrentSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
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

  // Rich Text Commands (Word-like ribbon formatting)
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

  // Word-like Font Family Selector
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

  // Word-like Font Size Selector
  const applyFontSize = (size) => {
    if (activeTab !== "editor") setActiveTab("editor");
    if (editorRef.current) editorRef.current.focus();
    restoreSelection();
    document.execCommand("fontSize", false, "7");
    if (editorRef.current) {
      const fontTags = editorRef.current.querySelectorAll('font[size="7"]');
      fontTags.forEach((el) => {
        const span = document.createElement("span");
        span.style.fontSize = size;
        span.innerHTML = el.innerHTML;
        el.parentNode.replaceChild(span, el);
      });
      const spanTags = editorRef.current.querySelectorAll('span[style*="xxx-large"]');
      spanTags.forEach((el) => {
        el.style.fontSize = size;
      });
      handleEditorInput();
    }
  };

  // Word-like Font Color Picker
  const applyTextColor = (color) => {
    if (activeTab !== "editor") setActiveTab("editor");
    if (editorRef.current) editorRef.current.focus();
    restoreSelection();
    document.execCommand("foreColor", false, color);
    setActiveTextColor(color);
    setShowColorPicker(false);
    handleEditorInput();
  };

  // Word-like Text Highlighter
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

  // Generate HTML for in-content image
  const generateImageHTML = (config) => {
    const { url, alt, caption, align, width, angle, radius, shadow } = config;

    let floatStyle = "none";
    let marginStyle = "20px auto";
    let displayStyle = "block";
    let clearStyle = "both";
    let maxWidth = `${width}%`;

    if (align === "left") {
      floatStyle = "left";
      marginStyle = "10px 24px 16px 0";
      clearStyle = "none";
      maxWidth = `${Math.min(width, 50)}%`;
    } else if (align === "right") {
      floatStyle = "right";
      marginStyle = "10px 0 16px 24px";
      clearStyle = "none";
      maxWidth = `${Math.min(width, 50)}%`;
    } else if (align === "full") {
      floatStyle = "none";
      marginStyle = "24px 0";
      clearStyle = "both";
      maxWidth = "100%";
    } else {
      floatStyle = "none";
      marginStyle = "20px auto";
      clearStyle = "both";
      maxWidth = `${width}%`;
    }

    let shadowCss = "none";
    if (shadow === "soft") shadowCss = "0 4px 15px rgba(0,0,0,0.15)";
    else if (shadow === "medium") shadowCss = "0 10px 25px -5px rgba(0,0,0,0.3)";
    else if (shadow === "hard") shadowCss = "0 20px 35px -5px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)";

    const figcaptionHTML = caption && caption.trim()
      ? `<figcaption style="font-size: 13px; color: #94a3b8; margin-top: 8px; text-align: center; font-style: italic;">${caption.trim()}</figcaption>`
      : "";

    return `<figure class="blog-img-box" data-align="${align}" data-width="${width}" data-angle="${angle}" data-radius="${radius}" data-shadow="${shadow}" style="display: ${displayStyle}; float: ${floatStyle}; margin: ${marginStyle}; max-width: ${maxWidth}; width: ${maxWidth}; text-align: center; clear: ${clearStyle};">
  <div style="display: inline-block; width: 100%; text-align: center;">
    <img src="${url}" alt="${alt || ""}" data-angle="${angle}" data-align="${align}" data-width="${width}" data-radius="${radius}" data-shadow="${shadow}" style="width: 100%; height: auto; transform: rotate(${angle}deg); border-radius: ${radius}px; box-shadow: ${shadowCss}; display: block; margin: 0 auto; transition: transform 0.2s;" />
  </div>
  ${figcaptionHTML}
</figure><p><br></p>`;
  };

  // Open modal to insert new image
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

  // Insert image at current cursor selection
  const handleInsertImage = () => {
    if (!imageConfig.url) {
      toast.error("Please upload an image or provide an image URL");
      return;
    }

    if (editorRef.current) {
      editorRef.current.focus();
      let inserted = false;
      if (savedRangeRef.current) {
        try {
          restoreSelection();
          const html = generateImageHTML(imageConfig);
          inserted = document.execCommand("insertHTML", false, html);
        } catch (e) {
          console.warn("Could not insert at range, appending to end", e);
        }
      }

      if (!inserted) {
        const html = generateImageHTML(imageConfig);
        editorRef.current.innerHTML += html;
      }

      handleEditorInput();
    }

    setImageModalOpen(false);
    toast.success("Image added to blog article!");
  };

  // Save modal changes to selected image
  const handleSaveImageChanges = () => {
    if (selectedImgEl) {
      updateSelectedImageAttributes(imageConfig);
      toast.success("Image adjustments updated!");
    }
    setImageModalOpen(false);
  };

  // Update existing image attributes dynamically
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
  };

  // Handle clicking inside the editor canvas
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

      target.style.outline = "3px solid #10b981";
      target.style.outlineOffset = "4px";

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
      handleEditorInput();
    } else {
      if (selectedImgEl && !e.target.closest(".image-control-dock") && !e.target.closest(".image-modal-container")) {
        selectedImgEl.style.outline = "";
        selectedImgEl.style.outlineOffset = "";
        setSelectedImgEl(null);
      }
    }
  };

  // Double click image to open modal directly
  const handleEditorDoubleClick = (e) => {
    if (e.target && e.target.tagName === "IMG") {
      setImageModalMode("edit");
      setImageModalOpen(true);
    }
  };

  // Pressing delete or backspace when an image is selected
  const handleEditorKeyDown = (e) => {
    if (selectedImgEl && (e.key === "Delete" || e.key === "Backspace")) {
      e.preventDefault();
      handleDeleteSelectedImage();
    }
  };

  // Delete selected image
  const handleDeleteSelectedImage = () => {
    if (!selectedImgEl) return;
    const figure = selectedImgEl.closest("figure.blog-img-box");
    if (figure) {
      figure.remove();
    } else {
      selectedImgEl.remove();
    }
    setSelectedImgEl(null);
    handleEditorInput();
    setImageModalOpen(false);
    toast.success("Image removed from article");
  };

  // Upload image in modal
  const handleModalImageUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    try {
      setImageUploading(true);
      const res = await BlogService.uploadImage(file);
      if (res && res.url) {
        setImageConfig((prev) => ({ ...prev, url: res.url }));
        if (selectedImgEl && imageModalMode === "edit") {
          updateSelectedImageAttributes({ url: res.url });
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

  // Insert Custom Callout Box
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

  // Insert Table
  const insertTable = () => {
    const html = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background: #1e293b; color: #f8fafc; text-align: left;">
          <th style="padding: 10px; border: 1px solid #334155;">Appliance Issue</th>
          <th style="padding: 10px; border: 1px solid #334155;">DIY Possible?</th>
          <th style="padding: 10px; border: 1px solid #334155;">Pro Recommendation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 10px; border: 1px solid #334155;">Clogged Drainage / Filter</td>
          <td style="padding: 10px; border: 1px solid #334155;">Yes (Clean with brush)</td>
          <td style="padding: 10px; border: 1px solid #334155;">Low risk</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #334155;">Compressor / Motor Failure</td>
          <td style="padding: 10px; border: 1px solid #334155;">No</td>
          <td style="padding: 10px; border: 1px solid #334155;">Call certified technician</td>
        </tr>
      </tbody>
    </table><p><br></p>`;
    execCmd("insertHTML", html);
  };

  // Insert Link Modal Handler
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

  // Image Upload handler (for featured image or in-content)
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
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        toast.success("Featured image uploaded!");
      } else {
        toast.error("Failed to get uploaded image URL");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image. You can also paste an image URL directly.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Tag chip add
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

  // Submit Save or Update
  const handleSubmit = async (targetStatus = null) => {
    if (!formData.title.trim()) {
      toast.error("Blog title is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("URL slug is required");
      return;
    }

    // Clean any temporary editor selection styling on images
    if (editorRef.current) {
      editorRef.current.querySelectorAll("img").forEach((img) => {
        img.style.outline = "";
        img.style.outlineOffset = "";
      });
    }
    setSelectedImgEl(null);

    const latestContent = editorRef.current ? editorRef.current.innerHTML : formData.content;

    // Default image if empty
    const finalImage =
      formData.image ||
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80";

    const payload = {
      ...formData,
      content: latestContent,
      image: finalImage,
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

  // Toggle publish status quick switch
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

  // Delete Blog
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

  // Copy blog URL to clipboard
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
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Write New Blog</span>
            </button>
          </div>
        </div>

        {/* METRICS STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Articles</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Created across categories</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Published Live</p>
              <h3 className="text-2xl font-bold text-white mt-1">{publishedCount}</h3>
              <p className="text-xs text-emerald-500/80 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active on repairsaathi.in
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Drafts &amp; Staging</p>
              <h3 className="text-2xl font-bold text-white mt-1">{draftCount}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Unpublished guides</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">Total Readers</p>
              <h3 className="text-2xl font-bold text-white mt-1">{totalViews.toLocaleString()}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated page views</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Eye className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & ACTION BAR */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, slug, tag, or excerpt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full sm:w-auto px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    statusFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setStatusFilter("published")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    statusFilter === "published"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Published
                </button>
                <button
                  onClick={() => setStatusFilter("draft")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    statusFilter === "draft"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Drafts
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
            <span>Showing {filteredBlogs.length} of {blogs.length} articles</span>
          </div>
        </div>

        {/* BLOGS LIST TABLE */}
        <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
              <p className="text-sm">Loading blog articles from database...</p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-400 mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-white">No Blog Articles Found</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mt-1 mb-6">
                {search || categoryFilter !== "all" || statusFilter !== "all"
                  ? "No blogs matched your search criteria. Try resetting the filters."
                  : "You haven't published any repair guides yet. Create your first blog post to attract customers from Google search!"}
              </p>
              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm inline-flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Write Your First Blog</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Article &amp; URL Slug</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Author &amp; Read Time</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Views</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredBlogs.map((blog) => (
                    <tr
                      key={blog.id}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      {/* Image & Title */}
                      <td className="py-4 px-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/60 shrink-0">
                            {blog.image ? (
                              <img
                                src={blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white group-hover:text-emerald-400 transition truncate">
                                {blog.title}
                              </h4>
                              {blog.isFeatured && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  <Star className="w-2.5 h-2.5 fill-amber-300" /> Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono text-emerald-400/90 truncate max-w-[260px]">
                                /{blog.slug}
                              </span>
                              <button
                                onClick={() => handleCopyUrl(blog.slug, blog.id)}
                                className="text-slate-500 hover:text-slate-300 transition"
                                title="Copy URL"
                              >
                                {copiedId === blog.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                          <Layers className="w-3 h-3 text-emerald-400" />
                          {blog.category}
                        </span>
                      </td>

                      {/* Author & Read Time */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="text-xs text-slate-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{blog.author || "Tech Team"}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{blog.readTime || "5 min read"}</span>
                        </div>
                      </td>

                      {/* Views */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 text-xs font-semibold text-slate-300 border border-slate-700/50">
                          <Eye className="w-3 h-3 text-purple-400" />
                          {blog.views || 0}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(blog)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition border ${
                            blog.status === "published"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              blog.status === "published"
                                ? "bg-emerald-400 animate-pulse"
                                : "bg-amber-400"
                            }`}
                          />
                          {blog.status === "published" ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://repairsaathi.in/home-appliance-repair-blog/${blog.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="View on Live Website"
                          >
                            <ExternalLink className="w-4 h-4 text-emerald-400" />
                          </a>
                          <button
                            onClick={() => handleOpenEdit(blog)}
                            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Edit Blog"
                          >
                            <Edit3 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => setDeleteId(blog.id)}
                            className="p-2 rounded-lg bg-slate-800/60 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition"
                            title="Delete Blog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          FULL-SCREEN PROFESSIONAL WORD-LIKE RICH BLOG EDITOR MODAL
      ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* TOP BAR / RIBBON HEADER */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  {editingBlog ? "Edit Blog Article" : "Create New Blog Article"}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      formData.status === "published"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {formData.status.toUpperCase()}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  {stats.words} words • {stats.chars} chars • {stats.readTime}
                </p>
              </div>
            </div>

            {/* Mode Switchers & Actions */}
            <div className="flex items-center gap-3">
              {/* Tab Mode Toggle */}
              <div className="hidden sm:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    activeTab === "editor"
                      ? "bg-emerald-600 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Word Editor
                </button>
                <button
                  onClick={() => setActiveTab("html")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    activeTab === "html"
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" /> HTML Source
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                    activeTab === "preview"
                      ? "bg-slate-800 text-emerald-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> Live Web Preview
                </button>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("draft")}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/20 text-xs font-semibold transition disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSubmit("published")}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{editingBlog ? "Update &amp; Publish" : "Publish to Website"}</span>
              </button>
            </div>
          </div>

          {/* MAIN SCROLLABLE EDITOR CONTAINER */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT 8 COLUMNS: MAIN WRITING AREA */}
              <div className="lg:col-span-8 space-y-5">
                {/* 1. ARTICLE TITLE */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                    Blog Headline / Title <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="e.g. 7 Warning Signs Your Refrigerator Needs Immediate Repair in Patna"
                    className="w-full text-xl md:text-2xl font-bold bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                  />

                  {/* 2. URL SLUG BAR WITH LIVE WEBSITE LINK */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 overflow-hidden flex-1">
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="text-slate-500 shrink-0 font-mono">
                        repairsaathi.in/home-appliance-repair-blog/
                      </span>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: generateSlug(e.target.value),
                          }))
                        }
                        placeholder="my-blog-post-url-slug"
                        className="bg-transparent font-mono text-emerald-400 font-semibold focus:outline-none border-b border-dashed border-emerald-500/40 px-1 flex-1 min-w-[120px]"
                      />
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            slug: generateSlug(prev.title),
                          }))
                        }
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                        title="Auto Generate Slug from Title"
                      >
                        <Wand2 className="w-3 h-3 text-emerald-400" /> Auto-Slug
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://repairsaathi.in/home-appliance-repair-blog/${formData.slug}`
                          );
                          toast.success("URL copied!");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 transition"
                        title="Copy Full Live URL"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. WORD-LIKE FORMATTING TOOLBAR RIBBON */}
                {activeTab === "editor" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    {/* TOOLBAR (PROFESSIONAL WORD-LIKE RIBBON) */}
                    <div className="bg-slate-950/95 border-b border-slate-800 p-2 flex flex-wrap items-center gap-1.5 text-slate-300 sticky top-0 z-20 backdrop-blur-md">
                      {/* Undo / Redo */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("undo")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Undo (Ctrl+Z)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("redo")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Redo (Ctrl+Y)"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

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
                        className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
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
                        className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer max-w-[130px]"
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

                      {/* Font Size Selector */}
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) applyFontSize(val);
                          e.target.value = "";
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
                        title="Font Size"
                      >
                        <option value="">Size...</option>
                        <option value="11px">11px - Fine Print</option>
                        <option value="12px">12px - Small</option>
                        <option value="14px">14px - Compact</option>
                        <option value="16px">16px - Normal (Body)</option>
                        <option value="18px">18px - Medium</option>
                        <option value="20px">20px - Large Body</option>
                        <option value="24px">24px - Sub-heading</option>
                        <option value="28px">28px - Heading 3</option>
                        <option value="32px">32px - Heading 2</option>
                        <option value="36px">36px - Heading 1</option>
                        <option value="44px">44px - Hero Display</option>
                      </select>

                      <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

                      {/* Basic Typography Group */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("bold")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition font-bold"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("italic")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition italic"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("underline")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition underline"
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("strikeThrough")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("subscript")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Subscript (X₂)"
                      >
                        <Subscript className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("superscript")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Superscript (X²)"
                      >
                        <Superscript className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

                      {/* Word-like Text Color Picker */}
                      <div className="relative color-picker-container">
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setShowColorPicker(!showColorPicker);
                            setShowHighlightPicker(false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition flex flex-col items-center justify-center relative"
                          title="Font Text Color"
                        >
                          <span className="font-bold text-sm leading-none">A</span>
                          <span
                            className="w-3.5 h-1 rounded-sm mt-0.5 shadow-sm"
                            style={{ backgroundColor: activeTextColor }}
                          />
                        </button>

                        {showColorPicker && (
                          <div
                            onMouseDown={(e) => e.stopPropagation()}
                            className="absolute top-full left-0 mt-2 z-40 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl w-56 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-slate-800">
                              <span>Font Text Color</span>
                              <button
                                type="button"
                                onClick={() => setShowColorPicker(false)}
                                className="text-slate-500 hover:text-slate-300"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Palette Swatches */}
                            <div className="grid grid-cols-6 gap-1.5">
                              {[
                                "#ffffff", "#f1f5f9", "#94a3b8", "#1e293b", "#000000",
                                "#10b981", "#059669", "#06b6d4", "#0284c7", "#3b82f6",
                                "#6366f1", "#8b5cf6", "#ec4899", "#ef4444", "#f97316",
                                "#eab308", "#14b8a6", "#84cc16",
                              ].map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => applyTextColor(c)}
                                  className="w-6 h-6 rounded-md border border-slate-700/80 hover:scale-110 transition flex items-center justify-center relative shadow-sm"
                                  style={{ backgroundColor: c }}
                                  title={c}
                                >
                                  {activeTextColor === c && (
                                    <Check className={`w-3 h-3 ${c === "#ffffff" || c === "#f1f5f9" || c === "#eab308" ? "text-slate-900" : "text-white"}`} />
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Custom Color Input */}
                            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                              <input
                                type="color"
                                value={activeTextColor}
                                onChange={(e) => applyTextColor(e.target.value)}
                                className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                                title="Pick Custom Color"
                              />
                              <span className="text-xs font-mono text-slate-400 uppercase flex-1">{activeTextColor}</span>
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
                          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition flex flex-col items-center justify-center relative"
                          title="Highlight Color"
                        >
                          <Highlighter className="w-3.5 h-3.5" />
                          <span
                            className="w-3.5 h-1 rounded-sm mt-0.5 shadow-sm"
                            style={{ backgroundColor: activeHighlightColor }}
                          />
                        </button>

                        {showHighlightPicker && (
                          <div
                            onMouseDown={(e) => e.stopPropagation()}
                            className="absolute top-full left-0 mt-2 z-40 bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl w-52 space-y-2.5 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 pb-1 border-b border-slate-800">
                              <span>Highlight Text</span>
                              <button
                                type="button"
                                onClick={() => setShowHighlightPicker(false)}
                                className="text-slate-500 hover:text-slate-300"
                              >
                                <X className="w-3 h-3" />
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
                                  className="h-6 rounded-md border border-slate-700 hover:scale-105 transition flex items-center justify-center shadow-sm"
                                  style={{ backgroundColor: h.color }}
                                  title={h.name}
                                >
                                  {activeHighlightColor === h.color && <Check className="w-3 h-3 text-slate-900" />}
                                </button>
                              ))}
                            </div>

                            {/* Clear Highlight button */}
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => applyHighlightColor("transparent")}
                              className="w-full py-1 text-xs text-slate-400 hover:text-white rounded border border-slate-800 hover:bg-slate-800 transition"
                            >
                              Remove Highlight
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

                      {/* Alignments */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("justifyLeft")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("justifyCenter")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("justifyRight")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("justifyFull")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Justify"
                      >
                        <AlignJustify className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

                      {/* Lists & Indentation */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("insertUnorderedList")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("insertOrderedList")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("outdent")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Decrease Indent"
                      >
                        <Outdent className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("indent")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Increase Indent"
                      >
                        <Indent className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("formatBlock", "<blockquote>")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Blockquote"
                      >
                        <Quote className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

                      {/* In-Content Insert Objects */}
                      {/* 🖼️ INSERT IMAGE BUTTON */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleOpenInsertImage}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 text-xs flex items-center gap-1.5 transition font-semibold shadow-sm"
                        title="Insert Image (Upload or Web URL with full Angle & Position control)"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> + Image
                      </button>

                      {/* Special Blocks */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertCallout("tip")}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-1 transition"
                        title="Insert Pro Tip Callout Box"
                      >
                        <Lightbulb className="w-3.5 h-3.5" /> + Pro Tip
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => insertCallout("warning")}
                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs flex items-center gap-1 transition"
                        title="Insert Warning Box"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> + Warning
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={insertTable}
                        className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs flex items-center gap-1 transition"
                        title="Insert Pricing / Comparison Table"
                      >
                        <Table className="w-3.5 h-3.5" /> + Table
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-0.5" />

                      {/* Link & Clear */}
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          saveCurrentSelection();
                          setShowLinkModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Insert Web Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("insertHorizontalRule")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Horizontal Divider"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd("removeFormat")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                        title="Clear Formatting"
                      >
                        <Eraser className="w-4 h-4" />
                      </button>
                    </div>

                    {/* DYNAMIC IMAGE CONTROL DOCK (APPEARS WHEN AN IMAGE IS SELECTED IN CANVAS) */}
                    {selectedImgEl && (
                      <div className="image-control-dock bg-slate-950 border-b border-emerald-500/30 px-3 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-in slide-in-from-top-1 duration-150 sticky top-[48px] z-10 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 text-[11px]">
                            <ImageIcon className="w-3 h-3" /> Image Selected ({imageConfig.angle}° | {imageConfig.align.toUpperCase()} | {imageConfig.width}%)
                          </span>
                        </div>

                        {/* Quick Placement / Alignment */}
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateSelectedImageAttributes({ align: "left" })}
                            className={`px-2 py-1 rounded transition flex items-center gap-1 ${imageConfig.align === "left" ? "bg-emerald-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                            title="Float Left (Text wraps along right)"
                          >
                            <AlignLeft className="w-3 h-3" /> Left
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSelectedImageAttributes({ align: "center" })}
                            className={`px-2 py-1 rounded transition flex items-center gap-1 ${imageConfig.align === "center" ? "bg-emerald-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                            title="Center Block"
                          >
                            <AlignCenter className="w-3 h-3" /> Center
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSelectedImageAttributes({ align: "right" })}
                            className={`px-2 py-1 rounded transition flex items-center gap-1 ${imageConfig.align === "right" ? "bg-emerald-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                            title="Float Right (Text wraps along left)"
                          >
                            <AlignRight className="w-3 h-3" /> Right
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSelectedImageAttributes({ align: "full" })}
                            className={`px-2 py-1 rounded transition flex items-center gap-1 ${imageConfig.align === "full" ? "bg-emerald-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                            title="Full Width Stretch"
                          >
                            <Maximize2 className="w-3 h-3" /> Full
                          </button>
                        </div>

                        {/* Quick Width Presets */}
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          {[25, 50, 75, 100].map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => updateSelectedImageAttributes({ width: sz })}
                              className={`px-2 py-0.5 rounded transition text-[11px] font-medium ${imageConfig.width === sz ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
                              title={`Width: ${sz}%`}
                            >
                              {sz}%
                            </button>
                          ))}
                        </div>

                        {/* Quick Rotate / Angle */}
                        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateSelectedImageAttributes({ angle: (imageConfig.angle - 15) % 360 })}
                            className="p-1 rounded text-slate-400 hover:text-white transition"
                            title="Rotate Left -15°"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono text-emerald-400 font-bold text-[11px]">{imageConfig.angle}°</span>
                          <button
                            type="button"
                            onClick={() => updateSelectedImageAttributes({ angle: (imageConfig.angle + 15) % 360 })}
                            className="p-1 rounded text-slate-400 hover:text-white transition"
                            title="Rotate Right +15°"
                          >
                            <RotateCw className="w-3 h-3" />
                          </button>
                          {imageConfig.angle !== 0 && (
                            <button
                              type="button"
                              onClick={() => updateSelectedImageAttributes({ angle: 0 })}
                              className="px-1.5 py-0.5 text-[10px] text-slate-500 hover:text-slate-300 underline"
                              title="Reset angle to 0°"
                            >
                              0°
                            </button>
                          )}
                        </div>

                        {/* Full Controls & Delete */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setImageModalMode("edit");
                              setImageModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1 transition text-xs"
                            title="Open full controls: fine-tune angle slider, width, shadows, caption, replace image"
                          >
                            <Sliders className="w-3 h-3" /> Sliders &amp; Caption
                          </button>

                          <button
                            type="button"
                            onClick={handleDeleteSelectedImage}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition"
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
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Close / Deselect"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

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
                      className="min-h-[500px] p-8 md:p-10 bg-slate-900 text-slate-100 text-base leading-relaxed focus:outline-none focus:ring-0 font-sans selection:bg-emerald-500/30 overflow-y-auto"
                      style={{ minHeight: "520px" }}
                    />

                    {/* EDITOR FOOTER STATUS BAR */}
                    <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <span>Words: <strong className="text-white">{stats.words}</strong></span>
                        <span>Characters: <strong className="text-white">{stats.chars}</strong></span>
                        <span>Estimated Read: <strong className="text-emerald-400">{stats.readTime}</strong></span>
                      </div>
                      <div className="text-slate-500">
                        Rich HTML WYSIWYG Mode
                      </div>
                    </div>
                  </div>
                )}

                {/* RAW HTML MODE */}
                {activeTab === "html" && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
                      <span className="font-mono text-emerald-400">&lt;HTML Source Editor /&gt;</span>
                      <span>Edit raw HTML tags directly for custom structures</span>
                    </div>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, content: e.target.value }))
                      }
                      rows={22}
                      className="w-full mt-3 bg-slate-950 text-emerald-300 font-mono text-sm p-4 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500/60 leading-relaxed"
                    />
                  </div>
                )}

                {/* LIVE WEB PREVIEW TAB */}
                {activeTab === "preview" && (
                  <div className="bg-white text-slate-900 rounded-2xl p-6 md:p-10 shadow-2xl space-y-6">
                    <div className="border-b border-slate-200 pb-4 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Website Visitor Live Preview
                      </span>
                      <span>Category: {formData.category} • {formData.readTime}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                      {formData.title || "Untitled Blog Post"}
                    </h1>

                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        RS
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{formData.author}</p>
                        <p className="text-xs text-slate-500">Published on {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • Repair Saathi Patna</p>
                      </div>
                    </div>

                    {formData.image && (
                      <div className="rounded-xl overflow-hidden shadow-md max-h-[420px]">
                        <img
                          src={formData.image}
                          alt={formData.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {formData.excerpt && (
                      <p className="text-lg italic text-slate-600 border-l-4 border-emerald-500 pl-4 py-1">
                        {formData.excerpt}
                      </p>
                    )}

                    <div
                      className="prose prose-slate max-w-none text-base leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formData.content }}
                    />
                  </div>
                )}

                {/* 4. SHORT EXCERPT / SUMMARY */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Short Excerpt / Summary
                    </label>
                    <span className="text-xs text-slate-500">
                      {formData.excerpt?.length || 0}/250 characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                    }
                    placeholder="Brief 2-3 sentence overview displayed on blog cards, search listings, and social shares..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              {/* RIGHT 4 COLUMNS: SETTINGS, SEO & MEDIA */}
              <div className="lg:col-span-4 space-y-5">
                {/* 1. PUBLISHING STATUS BOX */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                    Publishing Controls
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Article Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, status: e.target.value }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="published">🟢 Published (Live on Website)</option>
                        <option value="draft">🟡 Draft (Hidden from Website)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <div>
                        <p className="text-xs font-semibold text-white">Featured Guide</p>
                        <p className="text-[11px] text-slate-400">Pin to top of blog list</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isFeatured: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Author Byline
                      </label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, author: e.target.value }))
                        }
                        placeholder="Repair Saathi Technical Team"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Estimated Read Time
                      </label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, readTime: e.target.value }))
                        }
                        placeholder="5 min read"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. CATEGORY & TAGS */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Category &amp; Tags
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Appliance Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, category: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Tags (Press Enter or comma to add)
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-emerald-400 hover:text-emerald-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Type tag and press Enter..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />

                    {/* Tag Suggestions */}
                    <div className="mt-2.5">
                      <p className="text-[11px] text-slate-500 mb-1">Suggestions:</p>
                      <div className="flex flex-wrap gap-1">
                        {SUGGESTED_TAGS.filter((t) => !formData.tags.includes(t))
                          .slice(0, 5)
                          .map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleAddSuggestedTag(sug)}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                            >
                              +{sug}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. FEATURED IMAGE (FILE UPLOAD + URL) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    Cover / Featured Image
                  </h3>

                  {formData.image ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-44 object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition duration-200">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 shadow"
                        >
                          <Upload className="w-3.5 h-3.5" /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shadow"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 text-center cursor-pointer transition bg-slate-950/60 group"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center">
                          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mb-2" />
                          <p className="text-xs text-slate-400">Uploading image to server...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 mb-2 transition" />
                          <p className="text-xs font-semibold text-slate-300">Click to upload cover photo</p>
                          <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, or WEBP up to 5MB</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Or paste direct image URL:
                    </label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, image: e.target.value }))
                      }
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 4. SEO & GOOGLE SERP PREVIEW */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Google SEO &amp; SERP Snippet
                  </h3>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-400">
                        Meta Title
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {formData.metaTitle?.length || 0}/60
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))
                      }
                      placeholder={formData.title ? `${formData.title} | Repair Saathi` : "SEO Page Title"}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-400">
                        Meta Description
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {formData.metaDescription?.length || 0}/160
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }))
                      }
                      placeholder="Short meta summary for Google search snippet results..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          metaKeywords: e.target.value,
                        }))
                      }
                      placeholder="patna ac repair, technician, geyser service"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* GOOGLE SERP PREVIEW BOX */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-[8px] text-white font-bold">
                        R
                      </div>
                      <span className="font-sans">repairsaathi.in › home-appliance-repair-blog › {formData.slug || "article-slug"}</span>
                    </div>
                    <p className="text-sm font-medium text-blue-400 hover:underline cursor-pointer line-clamp-1">
                      {formData.metaTitle || formData.title || "Blog Title on Google Search"}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {formData.metaDescription ||
                        formData.excerpt ||
                        "Expert home appliance repair and maintenance guide written by certified Repair Saathi technicians in Patna."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSERT LINK MODAL POPUP */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-400" /> Insert Web Link
              </h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Link Text (Optional if text is selected)
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Book AC Repair in Patna"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                URL Destination <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://repairsaathi.in/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleInsertLink}
                disabled={!linkUrl}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSERT / CUSTOMIZE IN-CONTENT IMAGE MODAL */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto image-modal-container animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {imageModalMode === "insert" ? "Insert Image into Blog" : "Adjust Image Angles & Styling"}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                      {imageConfig.angle}° • {imageConfig.align.toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Adjust exact position, angle/rotation, size, and styling
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* SOURCE TABS */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setImageTab("upload")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                    imageTab === "upload"
                      ? "bg-slate-800 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload from Computer
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("url")}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition flex items-center justify-center gap-1.5 ${
                    imageTab === "url"
                      ? "bg-slate-800 text-white shadow"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" /> Image Web Link (URL)
                </button>
              </div>

              {/* TAB 1: UPLOAD BOX */}
              {imageTab === "upload" && (
                <div
                  onClick={() => inContentFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 rounded-xl p-5 text-center cursor-pointer transition group"
                >
                  <input
                    ref={inContentFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleModalImageUpload(file);
                    }}
                    className="hidden"
                  />
                  {imageUploading ? (
                    <div className="py-3 flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      <span className="text-xs text-slate-300 font-medium">Uploading image to server...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-slate-300">
                      <div className="p-2.5 rounded-full bg-slate-900 group-hover:bg-cyan-500/10 text-slate-400 group-hover:text-cyan-400 transition">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium">
                        Click or drag &amp; drop to upload image (PNG, JPG, WEBP)
                      </p>
                      <span className="text-[11px] text-slate-500">
                        {imageConfig.url ? "File selected: Click to replace" : "High-resolution photos supported"}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: URL INPUT */}
              {imageTab === "url" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              {/* LIVE TRANSFORMATION PREVIEW CANVAS */}
              {imageConfig.url && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800/90 p-5 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
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
                        src={imageConfig.url}
                        alt={imageConfig.alt || "Preview"}
                        style={{
                          transform: `rotate(${imageConfig.angle}deg)`,
                          borderRadius: `${imageConfig.radius}px`,
                          boxShadow:
                            imageConfig.shadow === "soft"
                              ? "0 4px 15px rgba(0,0,0,0.3)"
                              : imageConfig.shadow === "medium"
                              ? "0 10px 25px -5px rgba(0,0,0,0.5)"
                              : imageConfig.shadow === "hard"
                              ? "0 20px 35px -5px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.1)"
                              : "none",
                          maxHeight: "220px",
                          objectFit: "contain",
                        }}
                        className="transition-transform duration-100 ease-out"
                      />
                    </div>

                    {imageConfig.caption && (
                      <p className="text-xs text-slate-400 italic text-center mt-3">
                        {imageConfig.caption}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ANGLE / ROTATION ADJUSTMENT */}
              <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-cyan-400" /> Image Angle &amp; Rotation
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
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
                        className="text-[11px] text-slate-500 hover:text-slate-300 underline"
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        imageConfig.angle === preset.deg
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PLACEMENT & ALIGNMENT */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" /> Placement &amp; Alignment
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
                        className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm"
                            : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
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
              <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Width &amp; Scaling
                  </label>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-bold border border-slate-700">
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
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
                      className={`flex-1 py-1 rounded-lg text-xs font-medium transition ${
                        imageConfig.width === preset.val
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
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
                  <label className="text-xs font-semibold text-slate-400">
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
                        className={`flex-1 py-1 rounded-lg text-xs font-medium transition ${
                          imageConfig.radius === r.val
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shadow */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">
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
                        className={`flex-1 py-1 rounded-lg text-xs font-medium transition ${
                          imageConfig.shadow === sh.val
                            ? "bg-cyan-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:text-white"
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
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 placeholder-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-5 py-3.5 border-t border-slate-800 flex items-center justify-between shrink-0">
              {imageModalMode === "edit" ? (
                <button
                  type="button"
                  onClick={handleDeleteSelectedImage}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Image
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>

                {imageModalMode === "insert" ? (
                  <button
                    type="button"
                    onClick={handleInsertImage}
                    disabled={!imageConfig.url}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Insert into Article
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveImageChanges}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Adjustments
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <Delete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Blog Article?"
        description="This will permanently delete this article and remove it from the public website."
      />
    </div>
  );
}
