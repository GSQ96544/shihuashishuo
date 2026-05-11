import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "请提供URL" }, { status: 400 });
    }

    // Validate URL protocol
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "仅支持 http/https 链接" }, { status: 400 });
    }

    // Mock mode: return simulated page content
    // TODO: Replace with real fetch + text extraction
    return NextResponse.json({
      text: `商品名称：100%纯椰子水\n品牌：椰田\n\n宣传语：100%纯天然椰子水，无添加，原汁原味，清爽解渴\n\n配料表：水、椰子水、白砂糖、食用香精、柠檬酸\n\n营养成分表：能量 120kJ/100mL，碳水化合物 6.5g/100mL`,
      title: "椰田100%椰子水 - 商品详情",
    });
  } catch {
    return NextResponse.json(
      { error: "网页抓取失败，请检查链接或切换手动输入" },
      { status: 500 }
    );
  }
}
