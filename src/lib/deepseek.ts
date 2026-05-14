import type { OcrResult, AnalysisResult } from "@/lib/types";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";

// ── Step 1: Parse raw OCR text into structured fields ──

const PARSE_PROMPT = `你是食品包装信息提取专家。从OCR识别的原始文字中提取结构化信息。

如果文字中包含日语（假名/和制汉字）、韩语（谚文）或其他非中文语言，
先将其翻译为中文后再提取字段。

返回严格JSON：
{
  "brand": "品牌名（未找到则空字符串，翻译为中文）",
  "productName": "商品名（翻译为中文，如：100%椰子水、纯牛奶）",
  "claimsText": "包装上的宣传语（翻译为中文，用逗号分隔）",
  "ingredientsText": "配料表（翻译为中文，保留完整顺序）"
}

规则：
- 所有输出字段必须是中文
- productName 是包装上最显眼的商品名
- ingredientsText 保留配料表的含量从高到低顺序
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

const ANALYZE_PROMPT = `你是食品配料与营养成分分析专家。对比商品宣传、配料表和营养成分表，识别虚假宣传。

如果输入包含非中文语言（日语、韩语、英语等），先翻译再分析。

## 配料表分析（国标GB 7718）
1. 商品名暗示单一成分（"100%椰子水"、"纯牛奶"）但配料含其他物质 → 严重
2. 宣传"无糖/0糖/零糖"但配料含白砂糖、蔗糖、果糖、果葡糖浆等 → 严重
3. 宣传"天然/无添加/零添加"但配料含香精、色素、防腐剂等 → 严重
4. 果汁/饮料类第一配料是水而非果汁 → 中等
5. 商品名含"100%"但含多种配料 → 严重

## 营养成分表分析（国标GB 28050）
如果OCR文字中包含"营养成分表"及数值，对照以下标准：
6. 宣传"低脂"但脂肪>3g/100g(固体)或>1.5g/100mL(液体) → 严重
7. 宣传"0脂/零脂/无脂"但脂肪>0.5g/100g → 严重
8. 宣传"低糖"但糖>5g/100g → 严重
9. 宣传"无糖/0糖"但糖>0.5g/100g → 严重
10. 宣传"高蛋白/富含蛋白质"但蛋白质<12g/100g(固)或<6g/100mL(液) → 中等
11. 宣传"高钙/富含钙"但钙<240mg/100g → 中等
12. 宣传"高膳食纤维"但纤维<6g/100g → 中等
13. 宣传"低钠/低盐"但钠>120mg/100g → 中等
14. 宣传"低能量/低卡"但能量>170kJ/100g(固)或>80kJ/100mL(液) → 中等

返回严格JSON：
{
  "productType": "类别",
  "claims": ["宣传关键词"],
  "ingredients": ["配料列表"],
  "warnings": [
    {"ingredient":"配料或营养成分名","issue":"与宣传的冲突描述","severity":"high或medium"}
  ],
  "summary": "面向消费者的总结建议（80字以内，口语化）",
  "riskLevel": "high或medium或low或none",
  "confidence": "high或medium或low"
}
## 特定人群风控（根据userProfile传入）
| 人群 | 高风险成分 |
|------|-----------|
| 孕妇/哺乳期 | 酒精、过量咖啡因(>50mg/份)、薏米/薏苡仁、芦荟/芦荟苷、山楂、马齿苋、未消毒乳制品、高汞鱼类(鲨鱼/旗鱼/金枪鱼) |
| 婴幼儿(0-3岁) | 蜂蜜/蜂胶(1岁以下禁用)、过量添加糖/盐、人工色素/香精/防腐剂过多、咖啡因/茶多酚 |
| 儿童(3-12岁) | 过量糖/盐、咖啡因、含酒精成分、人工甜味剂超标 |
| 老年人 | 高钠(>400mg/100g)、高饱和脂肪、高胆固醇、过量添加糖 |
| 糖尿病 | 添加糖/精制碳水、高GI成分(麦芽糖/葡萄糖浆)、隐藏糖分(果汁浓缩物) |
| 高血压 | 高钠(>400mg/100g)、味精/MSG、酱油/蚝油等咸味调味料含量高 |
| 健身减脂 | 蛋白质<12g/100g却宣传高蛋白、脂肪>10g/100g却宣传低脂、添加糖>5g/100g却宣传健康、代糖/甜味剂过量 |

当userProfile不为"default"时，在warnings中额外检测对应用人群的禁忌成分，
issue中说明"该成分对{人群}不推荐"并说明原因。
summary建议需针对该人群给出个性化提醒。

只输出有问题的项，完全合规时riskLevel为none，不确定时confidence为low`;

export async function callDeepSeek(ocrResult: OcrResult, userProfile?: string): Promise<AnalysisResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const parts = [
    `商品名：${ocrResult.productName}`,
    ocrResult.brand ? `品牌：${ocrResult.brand}` : "",
    ocrResult.claimsText ? `宣传语：${ocrResult.claimsText}` : "",
    `配料表：${ocrResult.ingredientsText}`,
  ];
  if (userProfile && userProfile !== "default") {
    parts.push(`目标人群：${userProfile}（请额外检测该人群的禁忌成分）`);
  }
  const userMessage = parts.filter(Boolean).join("\n");

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
