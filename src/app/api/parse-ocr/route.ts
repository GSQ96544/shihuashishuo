import { NextResponse } from "next/server";
import { parseOcrText } from "@/lib/deepseek";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText } = body;

    if (!rawText?.trim()) {
      return NextResponse.json(
        { error: "OCR未识别到文字，请重新拍照" },
        { status: 400 }
      );
    }

    const result = await parseOcrText(rawText.trim());
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "文字解析失败，请手动输入商品信息" },
      { status: 500 }
    );
  }
}
