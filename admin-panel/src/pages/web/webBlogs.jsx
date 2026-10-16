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

  // Synchronize contentEditable div with formData.content
  useEffect(() => {
    if (isEditorOpen && editorRef.current && activeTab === "editor") {
      if (editorRef.current.innerHTML !== formData.content) {
        editorRef.current.innerHTML = formData.content || "";
      }
    }
  }, [isEditorOpen, activeTab]);

  // Handle contentEditable changes
  const handleEditorInput = () => {
    if (editorRef.current) {
      setFormData((prev) => ({ ...prev, content: editorRef.current.innerHTML }));
    }
  };

  // Rich Text Commands (Word-like ribbon formatting)
  const execCmd = (command, value = null) => {
    if (activeTab !== "editor") setActiveTab("editor");
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
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

    // Default image if empty
    const finalImage =
      formData.image ||
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80";

    const payload = {
      ...formData,
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
                    {/* TOOLBAR */}
                    <div className="bg-slate-950/90 border-b border-slate-800 p-2.5 flex flex-wrap items-center gap-1.5 text-slate-300 sticky top-0 z-10 backdrop-blur-sm">
                      {/* Undo / Redo */}
                      <button
                        type="button"
                        onClick={() => execCmd("undo")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Undo (Ctrl+Z)"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("redo")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Redo (Ctrl+Y)"
                      >
                        <RotateCw className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Headings Selector */}
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "p") execCmd("formatBlock", "<p>");
                          else execCmd("formatBlock", `<${val}>`);
                          e.target.value = "";
                        }}
                        className="bg-slate-900 border border-slate-800 text-xs rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-emerald-500/50"
                        title="Text Formatting / Headings"
                      >
                        <option value="">Text Style...</option>
                        <option value="p">Paragraph (Normal)</option>
                        <option value="h1">Heading 1 (Main Title)</option>
                        <option value="h2">Heading 2 (Section)</option>
                        <option value="h3">Heading 3 (Sub-section)</option>
                      </select>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Basic Formatting Group */}
                      <button
                        type="button"
                        onClick={() => execCmd("bold")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition font-bold"
                        title="Bold (Ctrl+B)"
                      >
                        <Bold className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("italic")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition italic"
                        title="Italic (Ctrl+I)"
                      >
                        <Italic className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("underline")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition underline"
                        title="Underline (Ctrl+U)"
                      >
                        <Underline className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("strikeThrough")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Alignments */}
                      <button
                        type="button"
                        onClick={() => execCmd("justifyLeft")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("justifyCenter")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("justifyRight")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("justifyFull")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Justify"
                      >
                        <AlignJustify className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Lists */}
                      <button
                        type="button"
                        onClick={() => execCmd("insertUnorderedList")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("insertOrderedList")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Special Blocks */}
                      <button
                        type="button"
                        onClick={() => insertCallout("tip")}
                        className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-1 transition"
                        title="Insert Pro Tip Callout Box"
                      >
                        <Lightbulb className="w-3.5 h-3.5" /> + Pro Tip
                      </button>
                      <button
                        type="button"
                        onClick={() => insertCallout("warning")}
                        className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs flex items-center gap-1 transition"
                        title="Insert Warning Box"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> + Warning
                      </button>
                      <button
                        type="button"
                        onClick={insertTable}
                        className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-xs flex items-center gap-1 transition"
                        title="Insert Pricing / Comparison Table"
                      >
                        <Table className="w-3.5 h-3.5" /> + Table
                      </button>

                      <div className="w-[1px] h-5 bg-slate-800 mx-1" />

                      {/* Link & Clear */}
                      <button
                        type="button"
                        onClick={() => setShowLinkModal(true)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Insert Web Link"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("insertHorizontalRule")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Horizontal Divider"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => execCmd("removeFormat")}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                        title="Clear Formatting"
                      >
                        <Eraser className="w-4 h-4" />
                      </button>
                    </div>

                    {/* EDITABLE DOCUMENT CANVAS */}
                    <div
                      ref={editorRef}
                      contentEditable
                      onInput={handleEditorInput}
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
