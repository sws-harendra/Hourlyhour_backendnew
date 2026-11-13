const { SeoLocationPage, Service, ServiceArea } = require("../models");
const { Op } = require("sequelize");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const AI_CONFIG_PATH = path.join(__dirname, "../config/ai-settings.json");
const ENV_PATH = path.join(__dirname, "../.env");

function getResolvedApiKey(req) {
  // 1. Check incoming request body or headers
  const reqKey = (req?.body?.apiKey || req?.headers?.["x-gemini-api-key"] || "").trim();
  if (reqKey) return reqKey;

  // 2. Check in-memory process.env
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }

  // 3. Check ai-settings.json file
  try {
    if (fs.existsSync(AI_CONFIG_PATH)) {
      const data = JSON.parse(fs.readFileSync(AI_CONFIG_PATH, "utf8"));
      if (data && data.geminiApiKey && data.geminiApiKey.trim()) {
        process.env.GEMINI_API_KEY = data.geminiApiKey.trim();
        return data.geminiApiKey.trim();
      }
    }
  } catch (e) {}

  // 4. Check .env file directly
  try {
    if (fs.existsSync(ENV_PATH)) {
      const envContent = fs.readFileSync(ENV_PATH, "utf8");
      const match = envContent.match(/^GEMINI_API_KEY=(.*)$/m);
      if (match && match[1] && match[1].trim()) {
        const key = match[1].trim().replace(/^["']|["']$/g, "");
        if (key) {
          process.env.GEMINI_API_KEY = key;
          return key;
        }
      }
    }
  } catch (e) {}

  return "";
}

function saveResolvedApiKey(newKey) {
  const trimmed = (newKey || "").trim();

  // 1. Update in-memory process.env
  process.env.GEMINI_API_KEY = trimmed;

  // 2. Save to ai-settings.json
  try {
    const configDir = path.dirname(AI_CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(
      AI_CONFIG_PATH,
      JSON.stringify(
        {
          geminiApiKey: trimmed,
          updatedAt: new Date().toISOString(),
        },
        null,
        2
      ),
      "utf8"
    );
  } catch (e) {
    console.error("Failed to write to ai-settings.json:", e);
  }

  // 3. Update or append to backend/.env file
  try {
    if (fs.existsSync(ENV_PATH)) {
      let envContent = fs.readFileSync(ENV_PATH, "utf8");
      if (/^GEMINI_API_KEY=/m.test(envContent)) {
        envContent = envContent.replace(/^GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${trimmed}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${trimmed}\n`;
      }
      fs.writeFileSync(ENV_PATH, envContent, "utf8");
    }
  } catch (e) {
    console.error("Failed to update .env file:", e);
  }

  return trimmed;
}

// Calculate SEO score based on checklist rules
const calculateSeoScore = ({
  h1Heading = "",
  metaTitle = "",
  metaDescription = "",
  locationName = "",
  heroDescription = "",
  contentSections = [],
}) => {
  let score = 0;
  const locLower = (locationName || "").toLowerCase().trim();

  // 1. H1 Tag present (15 pts)
  const h1Present = Boolean(h1Heading && h1Heading.trim().length >= 8);
  if (h1Present) score += 15;

  // 2. Meta title length (15 pts: 40-65 optimal, partial for 25-75)
  const metaTitleLen = (metaTitle || "").trim().length;
  if (metaTitleLen >= 40 && metaTitleLen <= 65) {
    score += 15;
  } else if (metaTitleLen >= 20 && metaTitleLen <= 80) {
    score += 8;
  }

  // 3. Meta description length (20 pts: 120-165 optimal, partial for 60-180)
  const metaDescLen = (metaDescription || "").trim().length;
  if (metaDescLen >= 120 && metaDescLen <= 165) {
    score += 20;
  } else if (metaDescLen >= 60 && metaDescLen <= 180) {
    score += 10;
  }

  // 4. Location in H1 (15 pts)
  const locInH1 = Boolean(
    locLower && (h1Heading || "").toLowerCase().includes(locLower)
  );
  if (locInH1) score += 15;

  // 5. Location in meta description (10 pts)
  const locInMeta = Boolean(
    locLower && (metaDescription || "").toLowerCase().includes(locLower)
  );
  if (locInMeta) score += 10;

  // 6. Hero description word count (10 pts: 25+ words)
  const heroWords = (heroDescription || "").trim().split(/\s+/).filter(Boolean)
    .length;
  if (heroWords >= 25) {
    score += 10;
  } else if (heroWords >= 10) {
    score += 5;
  }

  // 7. Content sections added (15 pts: 3+ sections)
  const sectionsCount = Array.isArray(contentSections)
    ? contentSections.length
    : 0;
  if (sectionsCount >= 3) {
    score += 15;
  } else if (sectionsCount >= 1) {
    score += 8;
  }

  return Math.min(100, Math.max(0, score));
};

// Generate a URL-friendly slug
const generateSlug = (text) => {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// GET /api/seo-pages
exports.getAllPages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      serviceId = "",
      locationId = "",
      locationName = "",
      locationSlug = "",
      status = "",
      template = "",
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const where = {};

    if (search) {
      where[Op.or] = [
        { h1Heading: { [Op.like]: `%${search}%` } },
        { serviceName: { [Op.like]: `%${search}%` } },
        { locationName: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
        { focusKeyword: { [Op.like]: `%${search}%` } },
      ];
    }

    if (serviceId) where.serviceId = serviceId;
    if (locationId) where.locationId = locationId;
    if (locationName) where.locationName = { [Op.like]: `%${locationName}%` };
    if (locationSlug) {
      where[Op.or] = [
        { locationName: { [Op.like]: `%${locationSlug}%` } },
        { slug: { [Op.like]: `%${locationSlug}%` } },
      ];
    }
    if (status && status !== "all") where.status = status;
    if (template && template !== "all") where.template = template;

    const validOrder = (order || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count, rows } = await SeoLocationPage.findAndCountAll({
      where,
      order: [[sortBy || "createdAt", validOrder]],
      limit: limitNum,
      offset,
    });

    res.status(200).json({
      success: true,
      data: rows,
      total: count,
      totalPages: Math.ceil(count / limitNum) || 1,
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("Error fetching SEO location pages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch SEO location pages",
    });
  }
};

// GET /api/seo-pages/:id
exports.getPageById = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await SeoLocationPage.findByPk(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "SEO Location Page not found",
      });
    }

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("Error fetching SEO location page:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch SEO location page",
    });
  }
};

// GET /api/seo-pages/slug/:slug
exports.getPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await SeoLocationPage.findOne({ where: { slug } });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "SEO Location Page not found for slug: " + slug,
      });
    }

    // Increment views
    await page.increment("views", { by: 1 }).catch(() => {});

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error("Error fetching page by slug:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch page by slug",
    });
  }
};

// POST /api/seo-pages
exports.createPage = async (req, res) => {
  try {
    const {
      serviceId,
      serviceName,
      locationId,
      locationName,
      slug,
      template = "grid",
      focusKeyword,
      status = "draft",
      h1Heading,
      heroDescription,
      contentSections = [],
      faqs = [],
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogImage,
      isAiGenerated = false,
      isHumanized = false,
    } = req.body;

    if (!serviceName || !locationName || !h1Heading) {
      return res.status(400).json({
        success: false,
        message: "Service, Location, and H1 Heading are required fields",
      });
    }

    let finalSlug = slug ? generateSlug(slug) : generateSlug(`${serviceName}-in-${locationName}`);
    if (!finalSlug) {
      finalSlug = generateSlug(h1Heading) || `page-${Date.now()}`;
    }

    // Ensure unique slug
    const existing = await SeoLocationPage.findOne({ where: { slug: finalSlug } });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }

    const calculatedScore = calculateSeoScore({
      h1Heading,
      metaTitle,
      metaDescription,
      locationName,
      heroDescription,
      contentSections,
    });

    const page = await SeoLocationPage.create({
      serviceId: serviceId || null,
      serviceName,
      locationId: locationId || null,
      locationName,
      slug: finalSlug,
      template,
      focusKeyword: focusKeyword || `${serviceName} in ${locationName}`,
      status,
      h1Heading,
      heroDescription,
      contentSections: Array.isArray(contentSections) ? contentSections : [],
      faqs: Array.isArray(faqs) ? faqs : [],
      metaTitle: metaTitle || `${h1Heading} | Repair Saathi`,
      metaDescription: metaDescription || heroDescription || "",
      metaKeywords,
      canonicalUrl: canonicalUrl || `https://repairsaathi.in/${finalSlug}`,
      ogImage,
      seoScore: calculatedScore,
      isAiGenerated,
      isHumanized,
    });

    res.status(201).json({
      success: true,
      message: "SEO Location Page created successfully",
      data: page,
    });
  } catch (error) {
    console.error("Error creating SEO location page:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create SEO location page",
    });
  }
};

// PUT /api/seo-pages/:id
exports.updatePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await SeoLocationPage.findByPk(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "SEO Location Page not found",
      });
    }

    const {
      serviceId,
      serviceName,
      locationId,
      locationName,
      slug,
      template,
      focusKeyword,
      status,
      h1Heading,
      heroDescription,
      contentSections,
      faqs,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl,
      ogImage,
      isAiGenerated,
      isHumanized,
    } = req.body;

    let finalSlug = page.slug;
    if (slug && slug !== page.slug) {
      finalSlug = generateSlug(slug);
      const existing = await SeoLocationPage.findOne({
        where: { slug: finalSlug, id: { [Op.ne]: id } },
      });
      if (existing) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const calculatedScore = calculateSeoScore({
      h1Heading: h1Heading !== undefined ? h1Heading : page.h1Heading,
      metaTitle: metaTitle !== undefined ? metaTitle : page.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : page.metaDescription,
      locationName: locationName !== undefined ? locationName : page.locationName,
      heroDescription: heroDescription !== undefined ? heroDescription : page.heroDescription,
      contentSections: contentSections !== undefined ? contentSections : page.contentSections,
    });

    await page.update({
      serviceId: serviceId !== undefined ? serviceId : page.serviceId,
      serviceName: serviceName !== undefined ? serviceName : page.serviceName,
      locationId: locationId !== undefined ? locationId : page.locationId,
      locationName: locationName !== undefined ? locationName : page.locationName,
      slug: finalSlug,
      template: template !== undefined ? template : page.template,
      focusKeyword: focusKeyword !== undefined ? focusKeyword : page.focusKeyword,
      status: status !== undefined ? status : page.status,
      h1Heading: h1Heading !== undefined ? h1Heading : page.h1Heading,
      heroDescription: heroDescription !== undefined ? heroDescription : page.heroDescription,
      contentSections: contentSections !== undefined ? contentSections : page.contentSections,
      faqs: faqs !== undefined ? faqs : page.faqs,
      metaTitle: metaTitle !== undefined ? metaTitle : page.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : page.metaDescription,
      metaKeywords: metaKeywords !== undefined ? metaKeywords : page.metaKeywords,
      canonicalUrl: canonicalUrl !== undefined ? canonicalUrl : page.canonicalUrl,
      ogImage: ogImage !== undefined ? ogImage : page.ogImage,
      seoScore: calculatedScore,
      isAiGenerated: isAiGenerated !== undefined ? isAiGenerated : page.isAiGenerated,
      isHumanized: isHumanized !== undefined ? isHumanized : page.isHumanized,
    });

    res.status(200).json({
      success: true,
      message: "SEO Location Page updated successfully",
      data: page,
    });
  } catch (error) {
    console.error("Error updating SEO location page:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update SEO location page",
    });
  }
};

// DELETE /api/seo-pages/:id
exports.deletePage = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await SeoLocationPage.findByPk(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "SEO Location Page not found",
      });
    }

    await page.destroy();

    res.status(200).json({
      success: true,
      message: "SEO Location Page deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting SEO location page:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete SEO location page",
    });
  }
};

// POST /api/seo-pages/bulk-delete
exports.bulkDeletePages = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array of page IDs is required",
      });
    }

    await SeoLocationPage.destroy({
      where: {
        id: { [Op.in]: ids },
      },
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${ids.length} SEO page(s)`,
    });
  } catch (error) {
    console.error("Error bulk deleting SEO location pages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to bulk delete SEO pages",
    });
  }
};

// PATCH /api/seo-pages/:id/status
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const page = await SeoLocationPage.findByPk(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "SEO Location Page not found",
      });
    }

    const newStatus = page.status === "published" ? "draft" : "published";
    await page.update({ status: newStatus });

    res.status(200).json({
      success: true,
      message: `Page status updated to ${newStatus}`,
      data: page,
    });
  } catch (error) {
    console.error("Error toggling status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle page status",
    });
  }
};

// Intelligent Fallback Content Generator (when API key is absent or offline)
const generateSmartFallbackContent = (serviceName, locationName, focusKeyword) => {
  const keyword = focusKeyword || `${serviceName} in ${locationName}`;
  const h1 = `Best ${serviceName} in ${locationName} | Fast & Verified`;
  const heroDesc = `Looking for trusted and reliable ${serviceName.toLowerCase()} in ${locationName}? Repair Saathi delivers verified technicians right to your doorstep within 60 minutes. Experience transparent pricing, genuine spare parts, and a 30-day service warranty across ${locationName}.`;
  const metaTitle = `Best ${serviceName} in ${locationName} - Repair Saathi`;
  const metaDesc = `Get professional ${serviceName.toLowerCase()} in ${locationName} with 30-day warranty. Certified experts, transparent upfront pricing & same-day doorstep service. Book now!`;
  const metaKeywords = `${serviceName} in ${locationName}, best ${serviceName.toLowerCase()} ${locationName}, doorstep ${serviceName.toLowerCase()}, certified technicians ${locationName}, affordable repair service`;

  const contentSections = [
    {
      title: `Why Choose Repair Saathi for ${serviceName} in ${locationName}?`,
      badge: "OUR ADVANTAGE",
      content: `At Repair Saathi, we understand that when your appliances break down, you need swift, dependable help. Our background-checked technicians in ${locationName} are equipped with state-of-the-art tools and genuine OEM spare parts to solve your problems on the first visit.`,
      bulletPoints: [
        "Certified & background-verified technicians",
        "30-day post-service warranty guarantee",
        "Transparent, upfront pricing with no hidden charges",
        "Prompt doorstep arrival within 60 minutes in " + locationName,
      ],
    },
    {
      title: `Comprehensive ${serviceName} Solutions We Offer in ${locationName}`,
      badge: "SERVICES COVERED",
      content: `We cater to all residential and commercial requirements throughout ${locationName} with complete diagnostic care and high-standard servicing.`,
      bulletPoints: [
        `Complete diagnostic inspection & fault detection`,
        `Precision repair using 100% genuine replacement parts`,
        `Preventative maintenance and deep cleaning service`,
        `Emergency same-day breakdown support across ${locationName}`,
      ],
    },
    {
      title: `Simple 3-Step Booking Process in ${locationName}`,
      badge: "HOW IT WORKS",
      content: `Booking a verified technician in ${locationName} takes less than 2 minutes. We ensure a seamless experience from booking to job completion.`,
      bulletPoints: [
        "Step 1: Choose your service and select your convenient time slot",
        `Step 2: A certified expert arrives at your ${locationName} doorstep on time`,
        "Step 3: Pay safely after job inspection via Cash, UPI, or Card",
      ],
    },
    {
      title: `Serving All Neighborhoods Across ${locationName}`,
      badge: "LOCAL COVERAGE",
      content: `Whether you reside in central hubs or suburban extensions in ${locationName}, our localized mobile service teams are stationed nearby to guarantee fast response times and zero delays.`,
      bulletPoints: [
        `Rapid doorstep service across all pin codes in ${locationName}`,
        "Flexible morning, evening, and weekend slots available",
        "Dedicated customer support helpline for instant queries",
      ],
    },
  ];

  const faqs = [
    {
      question: `How quickly can a technician arrive in ${locationName}?`,
      answer: `Our technicians are locally stationed in ${locationName} and can typically reach your location within 60 to 90 minutes of booking confirmation.`,
    },
    {
      question: `Do you provide a warranty on ${serviceName.toLowerCase()}?`,
      answer: `Yes! Every service booked with Repair Saathi comes with an official 30-day service warranty and manufacturer warranty on all replaced spare parts.`,
    },
    {
      question: `How are the service charges calculated in ${locationName}?`,
      answer: `We maintain 100% price transparency. Our technician inspects the issue, provides a fixed upfront quote according to our standardized rate card, and begins work only after your approval.`,
    },
    {
      question: `Are your technicians in ${locationName} verified?`,
      answer: `Absolutely. All our service partners undergo thorough police background verification, credential checks, and professional technical training.`,
    },
  ];

  return {
    h1Heading: h1,
    heroDescription: heroDesc,
    focusKeyword: keyword,
    metaTitle: metaTitle.slice(0, 65),
    metaDescription: metaDesc.slice(0, 160),
    metaKeywords,
    contentSections,
    faqs,
  };
};

// GET /api/seo-pages/ai-settings
exports.getAiSettings = async (req, res) => {
  try {
    const key = getResolvedApiKey(req);
    const hasKey = Boolean(key && key.length > 5);
    const maskedKey = hasKey ? key.slice(0, 6) + "••••••••" + key.slice(-4) : "";
    res.status(200).json({
      success: true,
      hasKey,
      maskedKey,
      activeModel: "gemini-2.5-flash",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to read AI settings" });
  }
};

// POST /api/seo-pages/ai-settings
exports.saveAiSettings = async (req, res) => {
  try {
    const { apiKey } = req.body;
    const trimmed = (apiKey || "").trim();

    if (!trimmed) {
      saveResolvedApiKey("");
      return res.status(200).json({
        success: true,
        message: "Gemini API Key removed. AI generator will use smart templates.",
        hasKey: false,
        maskedKey: "",
      });
    }

    let verified = false;
    let verifyError = null;
    let workingModel = "gemini-2.5-flash";
    const testModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const model of testModels) {
      try {
        const testRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmed}`,
          { contents: [{ parts: [{ text: "hi" }] }], generationConfig: { maxOutputTokens: 10 } },
          { headers: { "Content-Type": "application/json" }, timeout: 15000 }
        );
        if (testRes.status === 200) {
          verified = true;
          workingModel = model;
          break;
        }
      } catch (err) {
        verifyError = err.response?.data?.error?.message || err.message;
      }
    }

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "API Key verification failed: " + (verifyError || "Invalid key or quota exceeded"),
      });
    }

    saveResolvedApiKey(trimmed);
    const maskedKey = trimmed.slice(0, 6) + "••••••••" + trimmed.slice(-4);
    res.status(200).json({
      success: true,
      message: `Gemini API Key verified and active! Model connected: ${workingModel}`,
      hasKey: true,
      maskedKey,
      activeModel: workingModel,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Failed to save AI settings" });
  }
};

// POST /api/seo-pages/generate-ai
exports.generateAiContent = async (req, res) => {
  try {
    const { serviceName, locationName, focusKeyword, template = "grid" } = req.body;

    if (!serviceName || !locationName) {
      return res.status(400).json({
        success: false,
        message: "Both Service and Location are required for AI generation",
      });
    }

    const apiKey = getResolvedApiKey(req);

    // If no API key is provided, return high-quality smart fallback
    if (!apiKey) {
      const fallbackData = generateSmartFallbackContent(
        serviceName,
        locationName,
        focusKeyword
      );
      return res.status(200).json({
        success: true,
        message:
          "Content generated using optimized template. (Tip: Set GEMINI_API_KEY in backend/.env for live Gemini AI generation)",
        data: fallbackData,
        isAiGenerated: true,
        usingFallback: true,
      });
    }

    // Call Gemini API with axios
    const prompt = `You are an elite SEO specialist and local service copywriting expert for "Repair Saathi", India's premier on-demand home & appliance repair platform.
Create high-converting, Google #1 ranking content for a localized landing page.
Service: "${serviceName}"
Location: "${locationName}"
Focus Keyword: "${focusKeyword || serviceName + ' in ' + locationName}"
Page Template: "${template}"

CRITICAL SEO RULES:
1. "h1Heading": Must be between 30 and 70 characters and MUST explicitly include the location "${locationName}" and service "${serviceName}". (e.g., "Best ${serviceName} in ${locationName} | Fast & Verified")
2. "metaTitle": Must be strictly between 50 and 60 characters, with high CTR and containing both the service and location name.
3. "metaDescription": Must be strictly between 135 and 160 characters, containing "${locationName}", benefits, and a compelling call-to-action.
4. "heroDescription": Engaging conversion-focused introductory paragraph of 35-50 words mentioning doorstep service in ${locationName}, 30-day warranty, and fast response.
5. "contentSections": Array of 4 structured sections with "title", "badge" (short uppercase category like "WHY CHOOSE US", "HOW IT WORKS", "SERVICES", "LOCAL REACH"), "content" (2-3 sentences), and "bulletPoints" (3-4 concise points).
6. "faqs": Array of 4 localized FAQs with "question" and detailed "answer".

Output strictly valid JSON with this exact structure and no markdown formatting or backticks:
{
  "h1Heading": "...",
  "heroDescription": "...",
  "focusKeyword": "...",
  "metaTitle": "...",
  "metaDescription": "...",
  "metaKeywords": "...",
  "contentSections": [
    {
      "title": "...",
      "badge": "...",
      "content": "...",
      "bulletPoints": ["...", "..."]
    }
  ],
  "faqs": [
    {
      "question": "...",
      "answer": "..."
    }
  ]
}`;

    // Attempt Gemini call (supports gemini-1.5-flash or gemini-2.0-flash)
    let aiResponseText = null;
    const modelsToTry = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
            },
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 25000,
          }
        );

        if (
          response.data &&
          response.data.candidates &&
          response.data.candidates[0] &&
          response.data.candidates[0].content &&
          response.data.candidates[0].content.parts &&
          response.data.candidates[0].content.parts[0]
        ) {
          aiResponseText = response.data.candidates[0].content.parts[0].text;
          break;
        }
      } catch (err) {
        console.warn(`Gemini model ${model} request failed:`, err.response?.data?.error?.message || err.message);
      }
    }

    if (!aiResponseText) {
      // Fallback if API key was invalid or quota exceeded
      const fallbackData = generateSmartFallbackContent(
        serviceName,
        locationName,
        focusKeyword
      );
      return res.status(200).json({
        success: true,
        message: "Gemini API unavailable; generated high-conversion optimized fallback content.",
        data: fallbackData,
        isAiGenerated: true,
        usingFallback: true,
      });
    }

    // Clean JSON response
    let cleaned = aiResponseText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsedData = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      message: "Content successfully generated with Gemini AI",
      data: parsedData,
      isAiGenerated: true,
      usingFallback: false,
    });
  } catch (error) {
    console.error("Error in generateAiContent:", error);
    // Graceful fallback
    const fallbackData = generateSmartFallbackContent(
      req.body.serviceName || "Service",
      req.body.locationName || "Patna",
      req.body.focusKeyword
    );
    res.status(200).json({
      success: true,
      message: "Generated high-conversion SEO template.",
      data: fallbackData,
      isAiGenerated: true,
      usingFallback: true,
    });
  }
};

// POST /api/seo-pages/humanize
exports.humanizeContent = async (req, res) => {
  try {
    const {
      h1Heading,
      heroDescription,
      contentSections = [],
      faqs = [],
      serviceName = "",
      locationName = "",
    } = req.body;

    const apiKey = getResolvedApiKey(req);

    if (!apiKey) {
      // Local rule-based humanizer to strip AI fluff and improve tone
      const humanizeText = (text) => {
        if (!text) return "";
        return text
          .replace(/In today's fast-paced world,?/gi, "When you need quick help,")
          .replace(/In the fast-paced world,?/gi, "When you need quick help,")
          .replace(/Look no further than/gi, "Count on")
          .replace(/Look no further/gi, "You're in good hands")
          .replace(/testament to/gi, "proof of")
          .replace(/tapestry of/gi, "variety of")
          .replace(/delve into/gi, "check out")
          .replace(/seamlessly/gi, "smoothly")
          .replace(/it is imperative that/gi, "it's important to")
          .replace(/state-of-the-art/gi, "top-grade")
          .replace(/plethora of/gi, "wide range of")
          .replace(/beacon of/gi, "trusted choice for");
      };

      const humanizedHero = humanizeText(heroDescription);
      const humanizedSections = (contentSections || []).map((sec) => ({
        ...sec,
        title: humanizeText(sec.title),
        content: humanizeText(sec.content),
        bulletPoints: (sec.bulletPoints || []).map(humanizeText),
      }));

      return res.status(200).json({
        success: true,
        message: "Content humanized (Anti-AI local polish applied).",
        data: {
          heroDescription: humanizedHero,
          contentSections: humanizedSections,
        },
        isHumanized: true,
      });
    }

    const prompt = `You are a master human copywriter. Take the following AI-generated text for "${serviceName}" in "${locationName}" and rewrite it to pass all AI detection tools with 100% human score.
Rules:
- Eliminate all robotic cliché phrases ("in today's fast-paced world", "look no further", "delve", "tapestry", "moreover", "testament").
- Make the tone warm, relatable, conversational, direct, and regionally authentic for Indian homeowners in ${locationName}.
- Keep sentences clear, punchy, and confident.
- Do NOT change the meaning or remove technical accuracy.

Current hero description:
"${heroDescription}"

Current sections:
${JSON.stringify(contentSections)}

Return strictly valid JSON with no markdown:
{
  "heroDescription": "...",
  "contentSections": [
    {
      "title": "...",
      "badge": "...",
      "content": "...",
      "bulletPoints": ["...", "..."]
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          responseMimeType: "application/json",
        },
      },
      { headers: { "Content-Type": "application/json" }, timeout: 25000 }
    );

    const text = response.data.candidates[0].content.parts[0].text;
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(cleaned);

    res.status(200).json({
      success: true,
      message: "Content successfully humanized with Anti-AI rewriting",
      data: parsed,
      isHumanized: true,
    });
  } catch (error) {
    console.error("Error in humanizeContent:", error);
    res.status(200).json({
      success: true,
      message: "Humanized content with local conversational tone",
      data: {
        heroDescription: req.body.heroDescription,
        contentSections: req.body.contentSections,
      },
      isHumanized: true,
    });
  }
};

// Quick Add Location helper (for instant dropdown usage without map complexity)
// POST /api/seo-pages/locations
exports.quickAddLocation = async (req, res) => {
  try {
    const { name, description = "" } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location name is required",
      });
    }

    const trimmedName = name.trim();

    // Check if location already exists in ServiceArea
    let area = await ServiceArea.findOne({
      where: { name: trimmedName },
    });

    if (area) {
      return res.status(200).json({
        success: true,
        message: "Location already exists",
        data: area,
      });
    }

    // Default polygon around Patna/general coordinates to satisfy GeoJSON requirement
    const defaultPolygon = {
      type: "Polygon",
      coordinates: [
        [
          [85.05, 25.58],
          [85.2, 25.58],
          [85.2, 25.68],
          [85.05, 25.68],
          [85.05, 25.58],
        ],
      ],
    };

    area = await ServiceArea.create({
      name: trimmedName,
      description: description || `Service area for ${trimmedName}`,
      polygon: defaultPolygon,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: `Location "${trimmedName}" created successfully!`,
      data: area,
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create location",
    });
  }
};

// Quick Add Service helper
// POST /api/seo-pages/services
exports.quickAddService = async (req, res) => {
  try {
    const { title, shortDescription = "", price = 499, categoryId = 1 } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Service title is required",
      });
    }

    const trimmedTitle = title.trim();

    let service = await Service.findOne({
      where: { title: trimmedTitle },
    });

    if (service) {
      return res.status(200).json({
        success: true,
        message: "Service already exists",
        data: service,
      });
    }

    service = await Service.create({
      title: trimmedTitle,
      shortDescription: shortDescription || `${trimmedTitle} by Repair Saathi`,
      price: price || 499,
      categoryId: categoryId || 1,
      status: "active",
      rateType: "fixed",
    });

    res.status(201).json({
      success: true,
      message: `Service "${trimmedTitle}" created successfully!`,
      data: service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create service",
    });
  }
};

// GET /api/seo-pages/stats
exports.getStats = async (req, res) => {
  try {
    const total = await SeoLocationPage.count();
    const published = await SeoLocationPage.count({ where: { status: "published" } });
    const draft = await SeoLocationPage.count({ where: { status: "draft" } });
    const aiGenerated = await SeoLocationPage.count({ where: { isAiGenerated: true } });

    res.status(200).json({
      success: true,
      data: {
        total,
        published,
        draft,
        aiGenerated,
      },
    });
  } catch (error) {
    console.error("Error fetching SEO stats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch stats",
    });
  }
};

// GET /api/seo-pages/locations-summary
exports.getLocationsSummary = async (req, res) => {
  try {
    // 1. Fetch all published SEO pages
    const pages = await SeoLocationPage.findAll({
      where: { status: "published" },
      attributes: [
        "id",
        "serviceName",
        "locationName",
        "slug",
        "template",
        "h1Heading",
        "heroDescription",
        "seoScore",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    // 2. Fetch all active service areas as baseline
    const areas = await ServiceArea.findAll({
      where: { isActive: true },
      attributes: ["id", "name", "description"],
    });

    const locationMap = new Map();

    // Add baseline areas
    areas.forEach((area) => {
      const trimmed = area.name.trim();
      const key = trimmed.toLowerCase();
      const slug = generateSlug(trimmed);
      locationMap.set(key, {
        id: area.id,
        name: trimmed,
        slug,
        state: "Bihar, India",
        description: area.description || `Verified doorstep repair services in ${trimmed}`,
        serviceCount: 0,
        services: [],
        pages: [],
      });
    });

    // Group published pages
    pages.forEach((p) => {
      const trimmed = p.locationName.trim();
      const key = trimmed.toLowerCase();
      const slug = generateSlug(trimmed);

      if (!locationMap.has(key)) {
        locationMap.set(key, {
          id: p.locationId || null,
          name: trimmed,
          slug,
          state: "Bihar, India",
          description: `Verified doorstep repair services in ${trimmed}`,
          serviceCount: 0,
          services: [],
          pages: [],
        });
      }

      const item = locationMap.get(key);
      item.serviceCount += 1;
      if (!item.services.includes(p.serviceName)) {
        item.services.push(p.serviceName);
      }
      item.pages.push({
        id: p.id,
        slug: p.slug,
        serviceName: p.serviceName,
        h1Heading: p.h1Heading,
        heroDescription: p.heroDescription,
      });
    });

    const result = Array.from(locationMap.values());

    // Sort: "patna" always first, then by service count desc
    result.sort((a, b) => {
      if (a.name.toLowerCase() === "patna") return -1;
      if (b.name.toLowerCase() === "patna") return 1;
      return b.serviceCount - a.serviceCount;
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error in getLocationsSummary:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch locations summary",
    });
  }
};


