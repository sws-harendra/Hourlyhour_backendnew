export const TEMPLATES = [
  {
    id: "grid",
    name: "Grid",
    dotColor: "bg-blue-500",
    activeBorder: "border-blue-400 bg-blue-50/50",
    description: "Card grid layout, clean & structured",
  },
  {
    id: "timeline",
    name: "Timeline",
    dotColor: "bg-emerald-500",
    activeBorder: "border-emerald-400 bg-emerald-50/50",
    description: "Vertical timeline, story-driven flow",
  },
  {
    id: "card",
    name: "Card",
    dotColor: "bg-purple-500",
    activeBorder: "border-purple-400 bg-purple-50/50",
    description: "Glassmorphism cards, modern feel",
  },
  {
    id: "split",
    name: "Split",
    dotColor: "bg-amber-500",
    activeBorder: "border-amber-400 bg-amber-50/50",
    description: "50/50 split sections, bold contrasts",
  },
];

export const generateSlug = (text = "") => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Calculates live SEO score (0-100) and provides individual checklist item status
 */
export const evaluateSeo = (formData) => {
  const {
    h1Heading = "",
    metaTitle = "",
    metaDescription = "",
    locationName = "",
    heroDescription = "",
    contentSections = [],
  } = formData;

  const locLower = (locationName || "").toLowerCase().trim();
  const items = [];
  let totalScore = 0;

  // 1. H1 Tag present (15 max)
  const h1Trimmed = (h1Heading || "").trim();
  const h1Valid = h1Trimmed.length >= 8;
  const h1Points = h1Valid ? 15 : 0;
  items.push({
    id: "h1_present",
    label: "H1 Tag present",
    displayLabel: "H1 Tag present",
    current: h1Points,
    max: 15,
    passed: h1Valid,
  });
  totalScore += h1Points;

  // 2. Meta title length (15 max) (optimal 40-65 chars)
  const metaTitleLen = (metaTitle || "").trim().length;
  let metaTitlePoints = 0;
  let metaTitlePassed = false;
  if (metaTitleLen >= 40 && metaTitleLen <= 65) {
    metaTitlePoints = 15;
    metaTitlePassed = true;
  } else if (metaTitleLen >= 20 && metaTitleLen <= 75) {
    metaTitlePoints = 8;
  }
  items.push({
    id: "meta_title_len",
    label: `Meta title length (${metaTitleLen} chars)`,
    displayLabel: `Meta title length (${metaTitleLen} c...`,
    current: metaTitlePoints,
    max: 15,
    passed: metaTitlePassed,
  });
  totalScore += metaTitlePoints;

  // 3. Meta description length (20 max) (optimal 120-165 chars)
  const metaDescLen = (metaDescription || "").trim().length;
  let metaDescPoints = 0;
  let metaDescPassed = false;
  if (metaDescLen >= 120 && metaDescLen <= 165) {
    metaDescPoints = 20;
    metaDescPassed = true;
  } else if (metaDescLen >= 60 && metaDescLen <= 180) {
    metaDescPoints = 10;
  }
  items.push({
    id: "meta_desc_len",
    label: `Meta description length (${metaDescLen} chars)`,
    displayLabel: `Meta description leng...`,
    current: metaDescPoints,
    max: 20,
    passed: metaDescPassed,
  });
  totalScore += metaDescPoints;

  // 4. Location in H1 (15 max)
  const locInH1 = Boolean(
    locLower && (h1Heading || "").toLowerCase().includes(locLower)
  );
  const locInH1Points = locInH1 ? 15 : 0;
  items.push({
    id: "loc_in_h1",
    label: "Location in H1",
    displayLabel: "Location in H1",
    current: locInH1Points,
    max: 15,
    passed: locInH1,
  });
  totalScore += locInH1Points;

  // 5. Location in meta description (10 max)
  const locInMeta = Boolean(
    locLower && (metaDescription || "").toLowerCase().includes(locLower)
  );
  const locInMetaPoints = locInMeta ? 10 : 0;
  items.push({
    id: "loc_in_meta",
    label: "Location in meta description",
    displayLabel: "Location in meta des...",
    current: locInMetaPoints,
    max: 10,
    passed: locInMeta,
  });
  totalScore += locInMetaPoints;

  // 6. Hero description word count (10 max) (optimal 25+ words)
  const heroWords = (heroDescription || "").trim().split(/\s+/).filter(Boolean)
    .length;
  let heroPoints = 0;
  let heroPassed = false;
  if (heroWords >= 25) {
    heroPoints = 10;
    heroPassed = true;
  } else if (heroWords >= 10) {
    heroPoints = 5;
  }
  items.push({
    id: "hero_words",
    label: `Hero description (${heroWords} words)`,
    displayLabel: `Hero description (${heroWords} w...`,
    current: heroPoints,
    max: 10,
    passed: heroPassed,
  });
  totalScore += heroPoints;

  // 7. Content sections added (15 max) (3+ sections)
  const sectionsCount = Array.isArray(contentSections)
    ? contentSections.length
    : 0;
  let secPoints = 0;
  let secPassed = false;
  if (sectionsCount >= 3) {
    secPoints = 15;
    secPassed = true;
  } else if (sectionsCount >= 1) {
    secPoints = 8;
  }
  items.push({
    id: "sections_count",
    label: `Content sections added (${sectionsCount})`,
    displayLabel: `Content sections add...`,
    current: secPoints,
    max: 15,
    passed: secPassed,
  });
  totalScore += secPoints;

  // Rating and Color
  let rating = "Poor";
  let color = "text-red-500";
  let bgDot = "bg-red-500";

  if (totalScore >= 85) {
    rating = "Excellent";
    color = "text-emerald-600";
    bgDot = "bg-emerald-500";
  } else if (totalScore >= 70) {
    rating = "Good";
    color = "text-blue-600";
    bgDot = "bg-blue-500";
  } else if (totalScore >= 40) {
    rating = "Fair";
    color = "text-amber-500";
    bgDot = "bg-amber-500";
  }

  return {
    score: totalScore,
    rating,
    color,
    bgDot,
    items,
  };
};

export const INITIAL_SEO_FORM = {
  serviceId: "",
  serviceName: "",
  locationId: "",
  locationName: "",
  template: "grid",
  focusKeyword: "",
  status: "publish", // default Publish as in screenshot
  h1Heading: "",
  heroDescription: "",
  contentSections: [],
  faqs: [],
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
  ogImage: "",
};

