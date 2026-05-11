import { NextResponse } from "next/server";
import { recognizeText } from "@/lib/baidu-ocr";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageDataUrl } = body;

    if (!imageDataUrl) {
      return NextResponse.json({ error: "未提供图片" }, { status: 400 });
    }

    let text: string;
    try {
      text = await recognizeText(imageDataUrl);
    } catch (err) {
      console.error("Baidu OCR failed:", err);
      return NextResponse.json(
        { error: "文字识别失败，请确认图片清晰后重试" },
        { status: 500 }
      );
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "未识别到文字，请拍摄清晰的配料表照片" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "OCR识别失败" }, { status: 500 });
  }
}
