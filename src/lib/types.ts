export type FlowStep =
  | "input"
  | "ocr-processing"
  | "ocr-review"
  | "analyzing"
  | "done"
  | "error";

export type InputMode = "camera" | "manual" | "url";

export interface OcrResult {
  brand: string;
  productName: string;
  claimsText: string;
  ingredientsText: string;
  sourceUrl?: string;
}

export interface Warning {
  ingredient: string;
  issue: string;
  severity: "high" | "medium";
}

export interface AnalysisResult {
  productType: string;
  claims: string[];
  ingredients: string[];
  warnings: Warning[];
  summary: string;
  riskLevel: "high" | "medium" | "low" | "none";
  confidence: "high" | "medium" | "low";
}

export interface AppState {
  mode: InputMode;
  step: FlowStep;
  frontImage: string | null;
  labelImage: string | null;
  ocrResult: OcrResult | null;
  analysisResult: AnalysisResult | null;
  error: string | null;
  urlInput: string;
  manualProductName: string;
  manualIngredients: string;
}
