import { NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/deepseek";
import { mockAnalyze } from "@/lib/mock-data";
import type { OcrResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, ingredientsText, claimsText, brand, userProfile } = body;

    if (!productName || !ingredientsText) {
      return NextResponse.json(
        { error: "请至少提供商品名和配料表" },
        { status: 400 }
      );
    }

    const ocrResult: OcrResult = {
      brand: brand || "",
      productName,
      claimsText: claimsText || "",
      ingredientsText,
    };

    // Try real AI first, fall back to mock
    let result;
    try {
      result = await callDeepSeek(ocrResult, userProfile);
    } catch (aiErr) {
      console.warn("DeepSeek unavailable, using mock:", aiErr);
      result = mockAnalyze(ocrResult);
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "AI分析失败，请重试" }, { status: 500 });
  }
}
