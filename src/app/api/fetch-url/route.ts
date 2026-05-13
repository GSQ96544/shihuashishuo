import { NextResponse } from "next/server";
import { fetchAndExtract } from "@/lib/url-fetcher";
import { parseOcrText } from "@/lib/deepseek";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url?.trim()) {
      return NextResponse.json({ error: "请提供URL" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      return NextResponse.json({ error: "链接格式不正确" }, { status: 400 });
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "仅支持 http/https 链接" }, { status: 400 });
    }

    const hostname = parsed.hostname;
    if (
      hostname === "localhost" || hostname === "127.0.0.1" ||
      hostname.startsWith("10.") || hostname.startsWith("172.16.") ||
      hostname.startsWith("192.168.") || hostname.startsWith("0.")
    ) {
      return NextResponse.json({ error: "不支持该地址" }, { status: 403 });
    }

    // Step 1: Fetch and extract text from URL
    const { text, title } = await fetchAndExtract(url.trim());

    if (!text.trim()) {
      return NextResponse.json(
        { error: "无法从该页面提取有效文字，请尝试手动输入" },
        { status: 422 }
      );
    }

    // Step 2: Use DeepSeek to parse page text into structured fields
    let result;
    try {
      result = await parseOcrText(text);
    } catch {
      // Fallback: use title as product name, put raw text in claims/ingredients
      result = {
        brand: "",
        productName: title || "",
        claimsText: text.slice(0, 1000),
        ingredientsText: text.slice(0, 3000),
      };
    }

    return NextResponse.json({
      ...result,
      sourceUrl: url.trim(),
      pageTitle: title,
    });
  } catch {
    return NextResponse.json(
      { error: "无法抓取该页面。淘宝等平台可能限制访问，请尝试手动输入。" },
      { status: 500 }
    );
  }
}
