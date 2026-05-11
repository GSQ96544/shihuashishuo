import { NextResponse } from "next/server";
import { mockOcrFromImages } from "@/lib/mock-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageDataUrl } = body;

    if (!imageDataUrl) {
      return NextResponse.json({ error: "未提供图片" }, { status: 400 });
    }

    // Mock mode: return simulated OCR result
    // TODO: Replace with real Baidu OCR API call
    const result = mockOcrFromImages(imageDataUrl, imageDataUrl);

    return NextResponse.json({ text: JSON.stringify(result) });
  } catch {
    return NextResponse.json({ error: "OCR识别失败" }, { status: 500 });
  }
}
