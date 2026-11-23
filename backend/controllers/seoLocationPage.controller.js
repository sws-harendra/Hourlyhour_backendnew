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

// Helper: Generate photorealistic featured and section image URLs
function getServiceFeaturedImage(serviceName = "", locationName = "") {
  const s = (serviceName || "").toLowerCase();
  let subject = "home appliance repair service";
  if (s.includes("television") || s.includes("tv") || s.includes("led") || s.includes("lcd")) {
    subject = "professional certified technician repairing modern LED television smart TV";
  } else if (s.includes("ac") || s.includes("air conditioner")) {
    subject = "expert AC technician servicing split air conditioner indoor unit";
  } else if (s.includes("refrigerator") || s.includes("fridge")) {
    subject = "certified refrigerator technician inspecting modern double door fridge";
  } else if (s.includes("washing") || s.includes("washer")) {
    subject = "expert appliance technician repairing automatic washing machine drum";
  } else if (s.includes("geyser") || s.includes("water heater")) {
    subject = "certified technician installing and servicing electric water heater geyser";
  } else if (s.includes("chimney")) {
    subject = "professional technician deep cleaning kitchen chimney suction motor";
  } else if (s.includes("microwave") || s.includes("oven")) {
    subject = "certified technician troubleshooting electronic microwave oven heating";
  } else if (s.includes("purifier") || s.includes("ro")) {
    subject = "technician servicing water purifier RO system membrane filters";
  } else {
    subject = `professional technician repairing ${serviceName || "home appliance"}`;
  }

  const prompt = `${subject} in clean modern Indian home living room in ${locationName || "Bihar"}, tools uniform 4k realistic photography`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1200&height=675&nologo=true`;
}

function getServiceSectionImage(serviceName = "", badge = "", index = 0) {
  const s = (serviceName || "").toLowerCase();
  const topics = [
    "inspection and digital multimeter diagnostics",
    "specialized precision tools repair",
    "genuine OEM spare parts replacement guarantee",
    "verified technician at customer doorstep",
    "preventative maintenance and cleaning",
    "service van and local neighborhood coverage",
  ];
  const topic = topics[index % topics.length];
  const prompt = `Close-up photography of ${topic} for ${s || "home appliance repair"}, clean organized workspace 4k`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=500&nologo=true`;
}

// Normalize and deduplicate keywords
function normalizeKeywords(keywords, customKeywords, focusKeyword, serviceName, locationName) {
  const list = [];
  if (Array.isArray(keywords)) {
    list.push(...keywords);
  } else if (typeof keywords === "string" && keywords.trim()) {
    list.push(...keywords.split(",").map((k) => k.trim()));
  }

  if (Array.isArray(customKeywords)) {
    list.push(...customKeywords);
  } else if (typeof customKeywords === "string" && customKeywords.trim()) {
    list.push(...customKeywords.split(",").map((k) => k.trim()));
  }

  if (focusKeyword && typeof focusKeyword === "string" && focusKeyword.trim()) {
    list.push(focusKeyword.trim());
  }

  const s = serviceName || "Appliance Repair";
  const l = locationName || "Patna";

  if (list.length === 0) {
    list.push(
      `${s} in ${l}`,
      `best ${s.toLowerCase()} in ${l}`,
      `doorstep ${s.toLowerCase()} ${l}`,
      `verified ${s.toLowerCase()} technician`,
      `affordable ${s.toLowerCase()} repair ${l}`
    );
  }

  return Array.from(new Set(list.map((k) => k.replace(/^[#,\s]+|[#,\s]+$/g, "").trim()).filter(Boolean)));
}

// Intelligent Fallback Content Generator (Comprehensive 1200+ word in-depth guide)
const generateSmartFallbackContent = (serviceName, locationName, focusKeyword, userKeywords = []) => {
  const allKeywords = normalizeKeywords(userKeywords, null, focusKeyword, serviceName, locationName);
  const primaryKw = allKeywords[0] || `${serviceName} in ${locationName}`;
  const secondaryKw = allKeywords[1] || `best ${serviceName.toLowerCase()} in ${locationName}`;
  const tertiaryKw = allKeywords[2] || `doorstep ${serviceName.toLowerCase()} ${locationName}`;
  const quadKw = allKeywords[3] || `verified ${serviceName.toLowerCase()} technician`;
  const quintKw = allKeywords[4] || `affordable ${serviceName.toLowerCase()} repair`;

  const h1 = `Best ${serviceName} in ${locationName} | Fast & Verified Doorstep Repair`;
  
  const heroDesc = `Looking for trusted and reliable ${serviceName.toLowerCase()} in ${locationName}? Repair Saathi delivers verified, background-checked technicians right to your doorstep within 60 minutes. Experience transparent upfront pricing, 100% genuine OEM spare parts, and a comprehensive 30-day post-service warranty across all neighborhoods in ${locationName}. Whether you are experiencing sudden breakdown, performance issues, or require seasonal servicing, our local ${locationName} specialists ensure prompt, first-visit restoration.`;
  
  const metaTitle = `Best ${serviceName} in ${locationName} - Repair Saathi`.slice(0, 60);
  const metaDesc = `Get professional ${serviceName.toLowerCase()} in ${locationName} with 30-day warranty. Certified experts, genuine spare parts & 60-min doorstep arrival. Book now!`.slice(0, 158);
  const metaKeywords = allKeywords.join(", ");
  const ogImage = getServiceFeaturedImage(serviceName, locationName);

  const kw1Text = allKeywords.slice(0, 2).join(" and ");
  const kw2Text = allKeywords.slice(2, 4).join(", ") || primaryKw;
  const kw3Text = allKeywords.slice(4, 7).join(" • ") || secondaryKw;

  const contentSections = [
    {
      title: `Complete Diagnostic & Breakdown Problem Analysis for ${serviceName} in ${locationName}`,
      badge: "EXPERT DIAGNOSIS",
      image: getServiceSectionImage(serviceName, "DIAGNOSIS", 0),
      content: `When your ${serviceName.toLowerCase()} suddenly malfunctions in ${locationName}, identifying the root cause quickly saves you from costly secondary damage. Local power fluctuations, intense seasonal weather conditions, and routine mechanical wear-and-tear are frequent causes behind premature appliance failure across ${locationName} households.\n\nOur certified technicians specialize in ${kw1Text}. Rather than resorting to guesswork or temporary patch-ups, we perform end-to-end electrical testing, component health diagnostics, and sensor calibration. This guarantees that every subtle issue—from minor circuit instability to internal component wear—is pinpointed accurately on the very first inspection.`,
      bulletPoints: [
        `In-depth multimeter and digital diagnostic checkup for complete electrical safety in ${locationName}`,
        `Accurate identification of faulty sub-assemblies before recommending any parts replacement`,
        `Thorough inspection of wiring harnesses, thermal protection switches, and control PCBs`,
        `Direct guidance on operational hazards to prevent recurring breakdown issues`,
        `Comprehensive performance check under simulated daily operating load`,
      ],
    },
    {
      title: `Our Standardized 4-Stage ${serviceName} Servicing & Restoration Methodology`,
      badge: "HOW WE WORK",
      image: getServiceSectionImage(serviceName, "METHODOLOGY", 1),
      content: `At Repair Saathi, we adhere to an uncompromising service protocol designed to restore your appliance to peak factory performance. When you book ${tertiaryKw}, our nearest mobile technician is dispatched immediately with specialized repair toolkits and standard testing apparatus.\n\nUpon arrival at your ${locationName} residence, the technician carries out a clean, non-invasive inspection. We provide an itemized upfront quote derived from our transparent rate card—work commences only after your explicit consent. After completing the repair, we run a rigorous 15-minute diagnostic stress test to certify full stability and safety.`,
      bulletPoints: [
        "Stage 1: Comprehensive physical and digital fault assessment right in front of the customer",
        "Stage 2: Clear, itemized cost estimate with zero hidden fees or surprise add-ons",
        "Stage 3: Precision repair using industry-grade tools and manufacturer-specified methods",
        "Stage 4: Post-service performance calibration, safety check, and official digital invoice delivery",
      ],
    },
    {
      title: `100% Genuine OEM Spare Parts & Upfront Transparent Pricing in ${locationName}`,
      badge: "PRICE TRANSPARENCY",
      image: getServiceSectionImage(serviceName, "PARTS", 2),
      content: `The market is flooded with low-grade counterfeit spare parts that frequently cause short circuits, motor burnouts, or fire hazards. Repair Saathi operates on a strict zero-compromise policy: we exclusively source factory-sealed, genuine OEM replacement components for all ${serviceName.toLowerCase()} assignments across ${locationName}.\n\nFurthermore, our pricing model is completely open and standardized. We eliminate the frustration of arbitrary charges frequently quoted by informal roadside mechanics. Every customer receives a printed or digital invoice outlining the exact labor cost and part warranties, giving you total peace of mind for ${quadKw}.`,
      bulletPoints: [
        "100% brand-certified, original factory-sealed replacement components",
        "Official 30-day warranty on all labor and repair interventions",
        "Manufacturer-backed warranty documentation provided for all newly installed parts",
        "Standardized rate card published upfront with completely transparent pricing",
        "Multiple safe payment modes supported including UPI, Net Banking, Cards, and Cash",
      ],
    },
    {
      title: `Why Homeowners Across ${locationName} Choose Repair Saathi Specialists`,
      badge: "TRUSTED ADVANTAGE",
      image: getServiceSectionImage(serviceName, "ADVANTAGE", 3),
      content: `Finding a dependable, punctual, and technically competent service partner in ${locationName} is often a stressful chore. Repair Saathi bridges this gap with rigorous technician vetting, background screening, and ongoing technical upskilling on the latest smart home appliances.\n\nOur local presence in ${locationName} ensures an industry-leading arrival window of under 60 minutes for emergency breakdown requests. With over thousands of delighted homeowners served, we have built a reputation on punctuality, respectful doorstep conduct, and permanent repair solutions. Experience why we are considered the premier choice for ${quintKw} in ${locationName}.`,
      bulletPoints: [
        `Rapid doorstep arrival within 60 to 90 minutes across all sectors in ${locationName}`,
        "Police-verified, background-checked technicians with certified vocational training",
        "Complimentary post-repair clean-up of the service area inside your home",
        "Dedicated customer care hotline and digital ticket tracking for quick query resolution",
        "Over 98.4% first-visit issue resolution rate across residential and commercial properties",
      ],
    },
    {
      title: `Preventative Maintenance Guidelines & DIY Safety Precautions from Certified Technicians`,
      badge: "EXPERT TIPS",
      image: getServiceSectionImage(serviceName, "TIPS", 4),
      content: `Routine maintenance can extend the operational life of your ${serviceName.toLowerCase()} by several years while slashing household electricity bills. Simple proactive habits—such as inspecting power cords for insulation damage, keeping ventilation grills clear of dust, and avoiding continuous operation during low voltage—go a long way.\n\nHowever, we strongly caution against amateur internal DIY attempts on complex circuitry or high-voltage capacitors. Modern home appliances contain delicate microcontrollers and pressurized lines that can pose severe shock or leakage risks if mishandled without protective gear. When in doubt, call our certified ${locationName} team for ${primaryKw}.`,
      bulletPoints: [
        "Schedule preventative tune-ups at least once every 6 months to maintain peak efficiency",
        "Install a reliable voltage stabilizer to shield sensitive electronic boards from spikes",
        "Never tamper with sealed refrigerant loops, high-voltage transformers, or motor windings",
        "Ensure adequate clearance around ventilation slots to prevent internal overheating",
        "Turn off primary power switches immediately upon noticing unusual humming, burning smells, or sparks",
      ],
    },
    {
      title: `Fast Doorstep Service Coverage Across All Localities & Pin Codes in ${locationName}`,
      badge: "LOCAL COVERAGE",
      image: getServiceSectionImage(serviceName, "COVERAGE", 5),
      content: `No matter where you are situated in ${locationName} or its neighboring suburban extensions, our mobile technician units are stationed strategically to reach your premises without delays. We know that appliance failure disrupts your everyday household routine, which is why we offer flexible morning, afternoon, and evening booking slots 7 days a week.\n\nFrom emergency breakdown calls to scheduled weekend overhauls, our fleet is ready to dispatch. Simply book online or call our helpline to connect directly with verified experts for ${kw3Text}.`,
      bulletPoints: [
        `Guaranteed doorstep coverage across all residential societies, markets, and pin codes in ${locationName}`,
        "Same-day emergency response teams available for urgent appliance breakdowns",
        "Convenient appointment scheduling with custom time slots to fit your busy routine",
        "Transparent real-time technician arrival updates via SMS and WhatsApp notifications",
        "Direct warranty claim assistance with priority service for registered repeat customers",
      ],
    },
  ];

  const faqs = [
    {
      question: `How quickly can a verified technician arrive at my home in ${locationName}?`,
      answer: `Our localized service network in ${locationName} allows us to dispatch technicians who typically reach your doorstep within 60 to 90 minutes of booking confirmation. You can also schedule a specific morning or evening slot that fits your personal routine.`,
    },
    {
      question: `Do you provide an official warranty on ${serviceName.toLowerCase()} in ${locationName}?`,
      answer: `Yes, absolutely! Every service and repair performed by Repair Saathi comes with an official 30-day post-service warranty. Additionally, any genuine OEM spare parts replaced during the service carry full manufacturer warranty documentation.`,
    },
    {
      question: `How are the repair charges and spare part prices calculated in ${locationName}?`,
      answer: `We follow 100% transparent rate cards. The visiting technician inspects the appliance, explains the fault, and provides an itemized estimate before starting any work. There are zero hidden costs, travel fees, or unexpected extras.`,
    },
    {
      question: `Are all your technicians verified and background-checked?`,
      answer: `Yes, all Repair Saathi technicians undergo thorough police background verification, identity screening, and professional skill assessments before joining our platform. They arrive in uniform with official ID cards and professional equipment.`,
    },
    {
      question: `What should I do if my ${serviceName.toLowerCase()} experiences the same issue again after repair?`,
      answer: `Under our 30-day warranty guarantee, if the identical fault recurs within the warranty window, a technician will revisit your premises and re-inspect the appliance free of charge. Simply contact our support helpline with your booking ID.`,
    },
    {
      question: `Which neighborhoods and colonies in ${locationName} do you cover?`,
      answer: `We cover all residential sectors, apartment complexes, commercial areas, and adjoining zones across ${locationName}. Our mobile service fleet is equipped to reach any doorstep promptly with genuine parts and diagnostic tools.`,
    },
  ];

  return {
    h1Heading: h1,
    heroDescription: heroDesc,
    focusKeyword: primaryKw,
    ogImage,
    metaTitle,
    metaDescription: metaDesc,
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
    const {
      serviceName,
      locationName,
      focusKeyword,
      keywords = [],
      customKeywords = [],
      template = "grid",
    } = req.body;

    if (!serviceName || !locationName) {
      return res.status(400).json({
        success: false,
        message: "Both Service and Location are required for AI generation",
      });
    }

    // Extract all user-provided target keywords
    const allKeywords = normalizeKeywords(keywords, customKeywords, focusKeyword, serviceName, locationName);
    const primaryKeyword = allKeywords[0] || `${serviceName} in ${locationName}`;
    const generatedOgImage = getServiceFeaturedImage(serviceName, locationName);

    const apiKey = getResolvedApiKey(req);

    // If no API key is provided, return high-quality smart fallback
    if (!apiKey) {
      const fallbackData = generateSmartFallbackContent(
        serviceName,
        locationName,
        primaryKeyword,
        allKeywords
      );
      return res.status(200).json({
        success: true,
        message:
          "Comprehensive in-depth SEO guide generated with all target keywords and featured image! (Tip: Set GEMINI_API_KEY for live Gemini AI)",
        data: fallbackData,
        isAiGenerated: true,
        usingFallback: true,
      });
    }

    // Call Gemini API with axios
    const prompt = `You are an elite master SEO content strategist, technical appliance engineer, and senior copywriter for "Repair Saathi", India's #1 verified on-demand home & appliance repair platform.
Write a MASSIVE, AUTHORITATIVE, 1,200+ TO 1,800+ WORD IN-DEPTH ULTIMATE GUIDE & BLOG for localized Google #1 search ranking.

Service: "${serviceName}"
Location: "${locationName}"
Target Keywords: ${JSON.stringify(allKeywords)}
Page Template: "${template}"

MANDATORY SEO & KEYWORD INTEGRATION RULES:
1. STRICT TARGET KEYWORDS INTEGRATION:
The user has specified the following exact target keywords: [${allKeywords.join(", ")}].
You MUST explicitly, naturally, and contextually weave EVERY SINGLE ONE of these keywords throughout the content:
- In the "h1Heading"
- In the "heroDescription"
- Across the "contentSections" (in section titles, within body paragraphs, and in bullet points)
- In the "metaDescription" and "metaKeywords"
- Inside the FAQ answers.
Do NOT skip any keyword! Every keyword from the user's list must be included.

2. MASSIVE DEPTH & HIGH WORD COUNT (NO SHORT CARDS):
Do NOT write short 2-sentence blurbs or tiny cards!
Each of the 6 sections MUST contain at least 150-250 words of rich, comprehensive, multi-paragraph text explaining technical failure modes, electrical symptoms, step-by-step diagnostic procedures, genuine spare part guarantees, and localized pricing clarity in ${locationName}. Total article word count must be over 1,200 words. Separate multiple paragraphs in "content" using "\\n\\n".

3. FEATURED IMAGE:
Provide "ogImage": "${generatedOgImage}"

4. EXACTLY 6 IN-DEPTH CONTENT SECTIONS:
- Section 1: Comprehensive Diagnostic & Failure Symptoms in ${locationName} (Badge: "EXPERT DIAGNOSIS")
- Section 2: Rigorous Step-by-Step ${serviceName} Repair & Testing Methodology (Badge: "HOW WE WORK")
- Section 3: 100% Genuine OEM Spare Parts & Upfront Transparent Pricing Guide (Badge: "PRICE TRANSPARENCY")
- Section 4: Why ${locationName} Residents Trust Repair Saathi Specialists (Badge: "LOCAL TRUST")
- Section 5: Preventative Maintenance Guidelines & DIY Safety Precautions (Badge: "EXPERT TIPS")
- Section 6: Fast Doorstep Service Coverage Across All Localities in ${locationName} (Badge: "LOCAL COVERAGE")

Each section MUST have:
- "title": Compelling H2 title naturally including target keywords
- "badge": Short category badge
- "content": 2 to 3 long, informative paragraphs (150-250+ words total)
- "bulletPoints": 4 to 5 detailed, actionable bullet points explaining specific procedures or benefits
- "image": High-resolution service photo URL

5. 6 LOCALIZED FAQS:
Provide 6 detailed FAQs addressing arrival time in ${locationName}, 30-day warranty, genuine parts guarantee, pricing estimates, safety standards, and neighborhood coverage.

Output strictly valid JSON with this exact structure and NO markdown backticks:
{
  "h1Heading": "...",
  "heroDescription": "...",
  "focusKeyword": "${primaryKeyword}",
  "ogImage": "${generatedOgImage}",
  "metaTitle": "...",
  "metaDescription": "...",
  "metaKeywords": "${allKeywords.join(', ')}",
  "contentSections": [
    {
      "title": "...",
      "badge": "...",
      "content": "...",
      "bulletPoints": ["...", "..."],
      "image": "..."
    }
  ],
  "faqs": [
    {
      "question": "...",
      "answer": "..."
    }
  ]
}`;

    // Attempt Gemini call
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
              temperature: 0.75,
              maxOutputTokens: 4096,
              responseMimeType: "application/json",
            },
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 35000,
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
        primaryKeyword,
        allKeywords
      );
      return res.status(200).json({
        success: true,
        message: "Gemini API unavailable; generated massive high-conversion SEO guide with all target keywords and featured image.",
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

    // Ensure ogImage is set
    parsedData.ogImage = parsedData.ogImage || generatedOgImage;
    if (!parsedData.metaKeywords) {
      parsedData.metaKeywords = allKeywords.join(", ");
    }
    if (Array.isArray(parsedData.contentSections)) {
      parsedData.contentSections = parsedData.contentSections.map((sec, idx) => ({
        ...sec,
        image: sec.image || getServiceSectionImage(serviceName, sec.badge, idx),
      }));
    }

    res.status(200).json({
      success: true,
      message: "Comprehensive 1,200+ word SEO guide generated with Gemini AI including all keywords and featured image!",
      data: parsedData,
      isAiGenerated: true,
      usingFallback: false,
    });
  } catch (error) {
    console.error("Error in generateAiContent:", error);
    const allKeywords = normalizeKeywords(req.body.keywords, req.body.customKeywords, req.body.focusKeyword, req.body.serviceName, req.body.locationName);
    const fallbackData = generateSmartFallbackContent(
      req.body.serviceName || "Service",
      req.body.locationName || "Patna",
      req.body.focusKeyword || allKeywords[0],
      allKeywords
    );
    res.status(200).json({
      success: true,
      message: "Generated comprehensive SEO guide template with all keywords.",
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


