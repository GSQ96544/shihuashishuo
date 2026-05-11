import type { OcrResult, AnalysisResult } from "@/lib/types";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";

// ── Step 1: Parse raw OCR text into structured fields ──

const PARSE_PROMPT = `你是食品包装信息提取专家。从OCR识别的原始文字中提取结构化信息。

返回严格JSON：
{
  "brand": "品牌名（未找到则空字符串）",
  "productName": "商品名（如：100%椰子水、纯牛奶）",
  "claimsText": "包装上的宣传语（如：无添加、天然、0糖等），用逗号分隔",
  "ingredientsText": "配料表原文（通常以'配料：'或'配料表：'开头的那段）"
}

规则：
- productName 是包装上最显眼的商品名，不是配料表里的内容
- ingredientsText 要保留配料表的完整顺序（含量从高到低）
- 如果文字中找不到某项，返回空字符串`;

export async function parseOcrText(rawText: string): Promise<OcrResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  const res = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: PARSE_PROMPT },
        { role: "user", content: rawText.slice(0, 3000) },
      ],
      response_format: { type: "json_object" },
      max_tokens: 512,
      temperature: 0,
    }),
  });

  if (!res.ok) throw new Error(`DeepSeek parse failed: ${res.status}`);
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty parse response");

  const p = JSON.parse(content);
  return {
    brand: p.brand || "",
    productName: p.productName || "",
    claimsText: p.claimsText || "",
    ingredientsText: p.ingredientsText || "",
  };
}

// ── Step 2: Analyze product claims vs ingredients ──

const ANALYZE_PROMPT = `你是食品配料分析专家。你的任务是对比商品宣传信息与配料表，识别虚假宣传。

分析规则：
1. 商品名暗示单一成分（如"100%椰子水"、"纯牛奶"），但配料含其他非该成分的物质 → 严重问题
2. 宣传"无糖/0糖/零糖"，但配料含白砂糖、蔗糖、果糖、果葡糖浆等 → 严重问题
3. 宣传"天然/无添加/零添加"，但配料含香精、色素、防腐剂等 → 严重问题
4. 果汁/饮料类产品，配料第一是水而非果汁 → 中等问题
5. 商品名含"100%"但含多种配料 → 严重问题

你必须返回严格符合以下结构的JSON：
{
  "productType": "商品类别（如：椰子水饮料、乳制品、烘焙食品）",
  "claims": ["提取的宣传关键词"],
  "ingredients": ["解析出的配料列表"],
  "warnings": [
    {
      "ingredient": "具体配料名",
      "issue": "该配料与宣传的冲突点（一句话中文描述）",
      "severity": "high或medium"
    }
  ],
  "summary": "面向消费者的易懂总结建议（50字以内）",
  "riskLevel": "high或medium或low或none",
  "confidence": "high或medium或low"
}

注意：
- 只输出确实有问题的项，warnings可空数组
- 配料表完全合规时 riskLevel 为 none
- 不确定时 confidence 为 low
- 总结建议口语化、通俗易懂`;

export async function callDeepSeek(ocrResult: OcrResult): Promise<AnalysisResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const userMessage = [
    `商品名：${ocrResult.productName}`,
    ocrResult.brand ? `品牌：${ocrResult.brand}` : "",
    ocrResult.claimsText ? `宣传语：${ocrResult.claimsText}` : "",
    `配料表：${ocrResult.ingredientsText}`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: ANALYZE_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek returned empty response");
  }

  const parsed = JSON.parse(content);

  // Validate and normalize
  return {
    productType: parsed.productType || "食品",
    claims: parsed.claims || [],
    ingredients: parsed.ingredients || [],
    warnings: parsed.warnings || [],
    summary: parsed.summary || "无法生成总结",
    riskLevel: ["high", "medium", "low", "none"].includes(parsed.riskLevel)
      ? parsed.riskLevel
      : "none",
    confidence: ["high", "medium", "low"].includes(parsed.confidence)
      ? parsed.confidence
      : "medium",
  };
}
