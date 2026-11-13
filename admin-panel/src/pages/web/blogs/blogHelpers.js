// Predefined categories matching website
export const CATEGORIES = [
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

export const SUGGESTED_TAGS = [
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

export const DEFAULT_BLOG_TEMPLATE = `<h2>1. Common Problem Signs</h2>
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
</table>`;

// Base URL for uploads derived directly from environment (VITE_SERVER_URL / VITE_BACKEND_URL / VITE_IMAGE_URL)
export const getUploadBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_IMAGE_URL ||
    import.meta.env.VITE_SERVER_URL ||
    "";

  if (!envUrl) return "";
  let clean = envUrl.trim().replace(/\/+$/, "");
  // If envUrl is like "https://.../api", strip trailing "/api" to get the root server host
  clean = clean.replace(/\/api\/?$/i, "");
  return clean;
};

// Ensure image URLs use the backend upload URL configured in .env
export const normalizeImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") return "";
  if (rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) return rawUrl;

  const url = rawUrl.trim();
  const baseFromEnv = getUploadBaseUrl();

  // If already absolute with http/https
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // If it contains localhost:8008 or 127.0.0.1:8008, and an env URL is available, swap it
    if (baseFromEnv && (url.includes("localhost:8008") || url.includes("127.0.0.1:8008"))) {
      const match = url.match(/(?:\/api)?\/uploads\/[^\s"'>]+/);
      if (match) {
        return `${baseFromEnv}${match[0]}`;
      }
    }
    return url;
  }

  // If it's a relative path starting with /uploads or /api/uploads
  if (url.startsWith("/uploads/") || url.startsWith("/api/uploads/")) {
    return baseFromEnv ? `${baseFromEnv}${url}` : url;
  }

  // If it's just a raw filename (e.g. flaxo-123.png)
  if (!url.includes("/")) {
    return baseFromEnv ? `${baseFromEnv}/uploads/${url}` : `/uploads/${url}`;
  }

  return url;
};

// Sanitize <img> tags in HTML to use the backend upload URL from .env
export const sanitizeContentImages = (html) => {
  if (!html || typeof html !== "string") return html;
  const baseFromEnv = getUploadBaseUrl();

  if (!baseFromEnv) return html;

  return html.replace(
    /src=["'](?:https?:\/\/(?:localhost|127\.0\.0\.1):8008)?(?:\/api)?\/uploads\/([^"'\s>]+)["']/gi,
    (match, filename) => `src="${baseFromEnv}/uploads/${filename}"`
  );
};

// Generate URL slug from title or text
export const generateSlug = (text) => {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Generate HTML for in-content image
export const generateImageHTML = (config) => {
  const { url, alt, caption, align, width, angle, radius, shadow } = config;
  const finalUrl = normalizeImageUrl(url);

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

  const figcaptionHTML =
    caption && caption.trim()
      ? `<figcaption style="font-size: 13px; color: #64748b; margin-top: 8px; text-align: center; font-style: italic;">${caption.trim()}</figcaption>`
      : "";

  return `<figure class="blog-img-box" draggable="false" data-align="${align}" data-width="${width}" data-angle="${angle}" data-radius="${radius}" data-shadow="${shadow}" style="display: ${displayStyle}; float: ${floatStyle}; margin: ${marginStyle}; max-width: ${maxWidth}; width: ${maxWidth}; text-align: center; clear: ${clearStyle}; cursor: pointer; user-select: none;">
  <div style="display: inline-block; width: 100%; text-align: center;">
    <img src="${finalUrl}" draggable="false" alt="${alt || ""}" onerror="if(!this.dataset.retried){this.dataset.retried='1';if(this.src.includes('/api/uploads/')){this.src=this.src.replace('/api/uploads/','/uploads/');}else if(this.src.includes('/uploads/')){this.src=this.src.replace('/uploads/','/api/uploads/');}}" data-angle="${angle}" data-align="${align}" data-width="${width}" data-radius="${radius}" data-shadow="${shadow}" style="width: 100%; height: auto; transform: rotate(${angle}deg); border-radius: ${radius}px; box-shadow: ${shadowCss}; display: block; margin: 0 auto; transition: transform 0.2s;" />
  </div>
  ${figcaptionHTML}
</figure><p><br></p>`;
};

