const MOBILE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const DESKTOP_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Rewrite shop URLs to mobile version for better accessibility
function toMobileUrl(url: string): string {
  const u = new URL(url);
  const host = u.hostname;

  // Taobao item page → mobile Taobao
  if (host.includes("item.taobao.com") || host.includes("detail.tmall.com")) {
    const idMatch = url.match(/[?&]id=(\d+)/);
    if (idMatch) {
      return `https://h5.m.taobao.com/awp/core/detail.htm?id=${idMatch[1]}`;
    }
  }

  // JD item page → mobile JD
  if (host.includes("item.jd.com")) {
    const sku = host.match(/^(\d+)\.item\.jd\.com$/) || url.match(/(\d{8,})/);
    if (sku) {
      return `https://item.m.jd.com/product/${sku[1]}.html`;
    }
  }

  return url; // unchanged
}

async function tryFetch(url: string, ua: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": ua,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      signal: controller.signal,
      redirect: "follow",
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("text/html") && !ct.includes("text/plain")) {
      throw new Error("Not HTML");
    }

    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractFromHtml(html: string): { text: string; title: string } {
  // Title — try og:title first, then <title>
  let title = "";
  const ogTitle = html.match(
    /<meta\s[^>]*property="og:title"\s[^>]*content="([^"]*)"/i
  );
  if (ogTitle) {
    title = ogTitle[1];
  } else {
    const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    title = t ? t[1].replace(/<[^>]+>/g, "").trim() : "";
  }

  // Description meta — often has product details
  let desc = "";
  const ogDesc = html.match(
    /<meta\s[^>]*property="og:description"\s[^>]*content="([^"]*)"/i
  );
  if (ogDesc) {
    desc = ogDesc[1];
  } else {
    const dm = html.match(
      /<meta\s[^>]*name="description"\s[^>]*content="([^"]*)"/i
    );
    if (dm) desc = dm[1];
  }

  // Keywords meta
  const kw = html.match(
    /<meta\s[^>]*name="keywords"\s[^>]*content="([^"]*)"/i
  );
  const keywords = kw ? kw[1] : "";

  // Body text extraction
  let body = html;
  body = body.replace(/<script[\s\S]*?<\/script>/gi, "");
  body = body.replace(/<style[\s\S]*?<\/style>/gi, "");
  body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  body = body.replace(/<head[\s\S]*?<\/head>/gi, "");
  body = body.replace(/<!--[\s\S]*?-->/g, "");
  body = body.replace(/<svg[\s\S]*?<\/svg>/gi, "");

  // Block → newline
  body = body.replace(
    /<\/?(?:br|p|div|li|tr|h[1-6]|section|article|header|footer)[^>]*>/gi,
    "\n"
  );

  body = body.replace(/<[^>]+>/g, "");
  body = body
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x?[0-9a-f]+;/gi, "");

  // Collapse lines, keep meaningful ones only
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  // Combine: title + keywords + description + body (deduplicate)
  const parts = [title, keywords, desc, ...lines];
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const p of parts) {
    const key = p.slice(0, 80);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }

  return {
    text: unique.join("\n").slice(0, 5000),
    title,
  };
}

export async function fetchAndExtract(url: string): Promise<{
  text: string;
  title: string;
}> {
  const mobileUrl = toMobileUrl(url);
  const errors: string[] = [];

  // Strategy 1: Mobile UA on mobile URL
  try {
    const html = await tryFetch(mobileUrl, MOBILE_UA);
    const result = extractFromHtml(html);
    if (result.text.replace(/\s/g, "").length > 20) return result;
    errors.push("mobile: insufficient text");
  } catch (e) {
    errors.push("mobile: " + (e as Error).message);
  }

  // Strategy 2: Desktop UA on original URL
  try {
    const html = await tryFetch(url, DESKTOP_UA);
    const result = extractFromHtml(html);
    if (result.text.replace(/\s/g, "").length > 20) return result;
    errors.push("desktop: insufficient text");
  } catch (e) {
    errors.push("desktop: " + (e as Error).message);
  }

  throw new Error(errors.join(" | "));
}
