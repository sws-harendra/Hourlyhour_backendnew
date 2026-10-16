// controllers/blog.controller.js
const db = require("../models");
const Blog = db.Blog;
const { Op } = require("sequelize");

// Helper to slugify string
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Calculate read time
function calculateReadTime(text) {
  const words = (text || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

// 1. GET ALL BLOGS
exports.getAllBlogs = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 50 } = req.query;
    const where = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (category && category !== "All" && category !== "all") {
      where.category = category;
    }

    if (search && search.trim() !== "") {
      const q = `%${search.trim()}%`;
      where[Op.or] = [
        { title: { [Op.like]: q } },
        { excerpt: { [Op.like]: q } },
        { slug: { [Op.like]: q } },
        { category: { [Op.like]: q } },
        { author: { [Op.like]: q } },
      ];
    }

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { count, rows } = await Blog.findAndCountAll({
      where,
      order: [
        ["isFeatured", "DESC"],
        ["publishedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit: parseInt(limit, 10),
      offset,
    });

    res.json({
      success: true,
      data: rows,
      total: count,
      page: parseInt(page, 10),
      totalPages: Math.ceil(count / parseInt(limit, 10)),
    });
  } catch (err) {
    console.error("Error in getAllBlogs:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. GET SINGLE BLOG (BY SLUG OR ID)
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const where = {};

    if (!isNaN(slug)) {
      where[Op.or] = [{ id: parseInt(slug, 10) }, { slug }];
    } else {
      where.slug = slug;
    }

    const blog = await Blog.findOne({ where });
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Increment view count
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.json({ success: true, data: blog });
  } catch (err) {
    console.error("Error in getBlogBySlug:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. CREATE BLOG
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      slug: customSlug,
      author,
      category,
      tags,
      readTime,
      image,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      isFeatured,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Blog title is required" });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Blog content is required" });
    }

    // Generate or format slug
    let finalSlug = slugify(customSlug || title);
    if (!finalSlug) finalSlug = `post-${Date.now()}`;

    // Ensure slug is unique
    let existing = await Blog.findOne({ where: { slug: finalSlug } });
    let counter = 1;
    while (existing) {
      finalSlug = `${slugify(customSlug || title)}-${counter}`;
      existing = await Blog.findOne({ where: { slug: finalSlug } });
      counter++;
    }

    const calculatedTime = readTime || calculateReadTime(content);

    const newBlog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      author: author ? author.trim() : "Repair Saathi Expert",
      category: category ? category.trim() : "Home Appliance",
      tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
      readTime: calculatedTime,
      image: image || null,
      excerpt: excerpt ? excerpt.trim() : null,
      content,
      metaTitle: metaTitle ? metaTitle.trim() : title.trim(),
      metaDescription: metaDescription ? metaDescription.trim() : (excerpt ? excerpt.trim() : null),
      metaKeywords: metaKeywords ? metaKeywords.trim() : null,
      status: status || "published",
      isFeatured: !!isFeatured,
      views: 0,
      publishedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: newBlog,
    });
  } catch (err) {
    console.error("Error in createBlog:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. UPDATE BLOG
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    const {
      title,
      slug: customSlug,
      author,
      category,
      tags,
      readTime,
      image,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      isFeatured,
    } = req.body;

    if (title) blog.title = title.trim();

    if (customSlug && customSlug.trim() !== blog.slug) {
      let candidateSlug = slugify(customSlug);
      // Check collision with another blog
      const existing = await Blog.findOne({
        where: { slug: candidateSlug, id: { [Op.ne]: id } },
      });
      if (existing) {
        candidateSlug = `${candidateSlug}-${Date.now().toString().slice(-4)}`;
      }
      blog.slug = candidateSlug;
    }

    if (author !== undefined) blog.author = author.trim();
    if (category !== undefined) blog.category = category.trim();
    if (tags !== undefined) blog.tags = Array.isArray(tags) ? tags : [tags];
    if (image !== undefined) blog.image = image;
    if (excerpt !== undefined) blog.excerpt = excerpt ? excerpt.trim() : null;
    if (content !== undefined) {
      blog.content = content;
      blog.readTime = readTime || calculateReadTime(content);
    } else if (readTime !== undefined) {
      blog.readTime = readTime;
    }

    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;
    if (status !== undefined) blog.status = status;
    if (isFeatured !== undefined) blog.isFeatured = !!isFeatured;

    await blog.save();

    res.json({
      success: true,
      message: "Blog updated successfully",
      data: blog,
    });
  } catch (err) {
    console.error("Error in updateBlog:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. DELETE BLOG
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await blog.destroy();
    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error in deleteBlog:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. TOGGLE STATUS (PUBLISHED / DRAFT)
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    blog.status = blog.status === "published" ? "draft" : "published";
    await blog.save();

    res.json({
      success: true,
      message: `Blog marked as ${blog.status}`,
      data: blog,
    });
  } catch (err) {
    console.error("Error in toggleStatus:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
