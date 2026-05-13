import { NextResponse } from "next/server";
import { fetchAndExtract } from "@/lib/url-fetcher";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url?.trim()) {
      return NextResponse.json({ error: "请提供URL" }, { status: 400 });
    }

    // Validate URL protocol
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "链接格式不正确" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "仅支持 http/https 链接" }, { status: 400 });
    }

    // Block private IPs (SSRF prevention)
    const hostname = parsed.hostname;
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.16.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("0.")
    ) {
      return NextResponse.json({ error: "不支持该地址" }, { status: 403 });
    }

    const result = await fetchAndExtract(url.trim());
    return NextResponse.json(result);
  } catch (err) {
    console.error("URL fetch failed:", err);
    return NextResponse.json(
      {
        error:
          "无法抓取该页面内容。部分网站（如淘宝）可能限制访问，请尝试手动输入商品信息。",
      },
      { status: 500 }
    );
  }
}
