export type FlowStep =
  | "input"
  | "ocr-processing"
  | "analyzing"
  | "done"
  | "error";

export type InputMode = "camera" | "manual";

export type UserProfile =
  | "default"
  | "pregnant"
  | "breastfeeding"
  | "infant"
  | "child"
  | "elderly"
  | "diabetic"
  | "hypertension"
  | "fitness";

export interface OcrResult {
  brand: string;
  productName: string;
  claimsText: string;
  ingredientsText: string;
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
  manualProductName: string;
  manualIngredients: string;
  manualClaims: string;
}
