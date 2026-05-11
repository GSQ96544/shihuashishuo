import type { AnalysisResult, OcrResult, Warning } from "@/lib/types";

// Demo mode: return sample data for camera capture (can't do real OCR without Baidu API)
export function mockOcrFromImages(
  _frontImage: string | null,
  _labelImage: string | null
): OcrResult {
  return {
    brand: "",
    productName: "",
    claimsText: "",
    ingredientsText: "",
  };
}

// Simple keyword-based rule engine for demo mode
export function mockAnalyze(ocrResult: OcrResult): AnalysisResult {
  const productName = ocrResult.productName.trim();
  const claimsText = ocrResult.claimsText.trim();
  const ingredientsText = ocrResult.ingredientsText.trim();

  // Parse ingredients
  const ingredients = parseIngredients(ingredientsText);
  const warnings: Warning[] = [];

  // Combine product name + claims for keyword detection
  const allClaims = productName + " " + claimsText;

  // Rule 1: Product name implies single ingredient (contains "100%" or "纯")
  if (/100%|纯|百分百/.test(productName) && ingredients.length > 1) {
    const mainIngredient = extractMainIngredient(productName);
    const extras = ingredients.filter(
      (i) => !i.includes(mainIngredient) && !isTrivialIngredient(i)
    );
    if (extras.length > 0) {
      warnings.push({
        ingredient: extras[0],
        issue: `商品名暗示由纯${mainIngredient || "单一成分"}构成，但配料表中含有${extras.slice(0, 3).join("、")}等其他成分`,
        severity: "high",
      });
    }
  }

  // Rule 2: Claims "无糖" but ingredients contain sugar
  if (/无糖|0糖|零糖|不添加糖|未添加糖/.test(allClaims)) {
    const sugars = ingredients.filter((i) =>
      /糖|蔗糖|白砂糖|果糖|葡萄糖|果葡糖浆|麦芽糖|蜂蜜|枫糖/.test(i)
    );
    for (const s of sugars) {
      warnings.push({
        ingredient: s,
        issue: '宣传声称"无糖"，但配料中含有' + s,
        severity: "high",
      });
    }
  }

  // Rule 3: Claims "天然" or "无添加" but has artificial additives
  if (/天然|无添加|不含添加剂|零添加|不添加/.test(allClaims)) {
    const additives = ingredients.filter((i) =>
      /香精|色素|防腐剂|甜味剂|增稠剂|乳化剂|抗氧化剂|漂白剂|膨松剂/.test(i)
    );
    for (const a of additives) {
      warnings.push({
        ingredient: a,
        issue: '宣传声称"' + (/天然/.test(allClaims) ? "天然" : "无添加") + '"，但配料中含有人工' + a,
        severity: "high",
      });
    }
  }

  // Rule 4: Juice/drink product where water is primary ingredient
  if (/汁|饮料|饮品/.test(productName) && !/100%|纯/.test(productName)) {
    const first = ingredients[0]?.trim();
    if (first && /^水$|^水，|^水、|饮用水|纯净水/.test(first)) {
      warnings.push({
        ingredient: "水",
        issue:
          '配料表中水排在第一位（含量最高），而商品名突出"' +
          productName +
          "，实际果汁/提取物含量可能较低",
        severity: "medium",
      });
    }
  }

  // Rule 5: Claims "高蛋白"/"高钙"/"高纤维" — just flag for consumer awareness
  if (/高蛋白|高钙|高纤维|富含|丰富/.test(allClaims)) {
    const claimMatch = allClaims.match(/高蛋白|高钙|高纤维|富含[一-龥]+/);
    const claim = claimMatch ? claimMatch[0] : "营养成分";
    warnings.push({
      ingredient: "（查看营养成分表）",
      issue: `宣传强调"${claim}"，建议对照营养成分表确认实际含量是否达到宣称标准`,
      severity: "medium",
    });
  }

  // Determine product type
  const productType = guessProductType(productName, ingredients);

  // Determine risk level
  const highCount = warnings.filter((w) => w.severity === "high").length;
  const mediumCount = warnings.filter((w) => w.severity === "medium").length;
  let riskLevel: AnalysisResult["riskLevel"] = "none";
  if (highCount > 0) riskLevel = "high";
  else if (mediumCount > 0) riskLevel = "medium";
  else if (ingredients.length > 0) riskLevel = "low";

  // Generate summary
  const summary = generateSummary(warnings, productName, riskLevel);

  return {
    productType,
    claims: extractClaims(productName, claimsText),
    ingredients,
    warnings,
    summary,
    riskLevel,
    confidence: ingredients.length > 0 ? "medium" : "low",
  };
}

// ── helpers ──

function parseIngredients(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(/[,，、;；\n/／\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !/^(配料|原料|成分)[：:]?$/.test(s));
}

function extractMainIngredient(name: string): string {
  const m = name.match(/(?:100%|纯|百分百)\s*([一-龥]+)/);
  return m ? m[1] : "";
}

function isTrivialIngredient(i: string): boolean {
  return /^水$|^饮用水$|^纯净水$/.test(i.trim());
}

function guessProductType(productName: string, ingredients: string[]): string {
  const text = productName + ingredients.join(" ");
  if (/汁|饮料|饮品/.test(text)) return "饮料类";
  if (/奶|乳|牛奶|酸奶/.test(text)) return "乳制品";
  if (/饼|面包|蛋糕|糕点/.test(text)) return "烘焙食品";
  if (/糖|巧克力|糖果/.test(text)) return "糖果类";
  if (/酱|调味|酱油|醋/.test(text)) return "调味品";
  if (/面|粉|米|粮/.test(text)) return "粮食类";
  if (/肉|肠|火腿/.test(text)) return "肉制品";
  if (/油/.test(text)) return "油脂类";
  return "食品";
}

function extractClaims(productName: string, claimsText: string): string[] {
  const combined = productName + " " + claimsText;
  const claims: string[] = [];
  const patterns = [
    /100%/g,
    /纯/g,
    /无糖|0糖|零糖/g,
    /天然/g,
    /无添加|零添加/g,
    /原汁原味/g,
    /高蛋白/g,
    /高钙/g,
    /低脂/g,
    /低糖/g,
    /有机/g,
    /鲜/g,
    /现/g,
  ];
  for (const p of patterns) {
    const matches = combined.match(p);
    if (matches) claims.push(...matches);
  }
  return [...new Set(claims)];
}

function generateSummary(
  warnings: Warning[],
  productName: string,
  riskLevel: string
): string {
  if (warnings.length === 0) {
    return (
      "配料表信息与" +
      (productName || "商品") +
      "的宣传内容基本一致，未发现明显误导信息。建议仍以配料表和营养成分表为准判断产品品质。"
    );
  }
  if (riskLevel === "high") {
    const top = warnings
      .filter((w) => w.severity === "high")
      .map((w) => w.ingredient)
      .join("、");
    return (
      "该商品存在" +
      warnings.length +
      "项疑似问题，其中" +
      top +
      "等配料与宣传不符，建议谨慎购买。购买前请以配料表和营养成分表为实际依据。"
    );
  }
  return (
    "该商品存在" +
    warnings.length +
    "处需要留意的细节，建议购买前仔细核对配料表和营养成分表，不要仅凭商品名和广告语做判断。"
  );
}
