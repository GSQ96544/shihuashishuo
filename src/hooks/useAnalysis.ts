"use client";

import { useState, useCallback, useEffect } from "react";
import type { AppState, OcrResult, AnalysisResult, InputMode, UserProfile } from "@/lib/types";

const PROFILES_KEY = "shihuashishuo_profiles";

function loadProfiles(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    const v = localStorage.getItem(PROFILES_KEY);
    if (!v) return [];
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

async function ocrImage(dataUrl: string): Promise<string> {
  const res = await fetch("/api/ocr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl: dataUrl }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text || "";
}

async function callAnalyzeApi(ocr: OcrResult, userProfiles: UserProfile[]): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName: ocr.productName,
      ingredientsText: ocr.ingredientsText,
      claimsText: ocr.claimsText,
      brand: ocr.brand,
      userProfile: userProfiles.join(","),
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as AnalysisResult;
}

const initialState: AppState = {
  mode: "camera",
  step: "input",
  frontImage: null,
  labelImage: null,
  ocrResult: null,
  analysisResult: null,
  error: null,
  manualProductName: "",
  manualIngredients: "",
  manualClaims: "",
};

export function useAnalysis() {
  const [state, setState] = useState<AppState>(initialState);
  const [profiles, setProfilesState] = useState<UserProfile[]>([]);

  useEffect(() => { setProfilesState(loadProfiles()); }, []);

  const setProfiles = useCallback((p: UserProfile[]) => {
    setProfilesState(p);
    try { localStorage.setItem(PROFILES_KEY, JSON.stringify(p)); } catch { /* */ }
  }, []);

  const setMode = useCallback((mode: InputMode) => {
    setState((s) => ({ ...s, mode, step: "input", error: null }));
  }, []);

  const setFrontImage = useCallback((img: string) => {
    setState((s) => ({ ...s, frontImage: img }));
  }, []);

  const setLabelImage = useCallback((img: string) => {
    setState((s) => ({ ...s, labelImage: img }));
  }, []);

  const setManualProductName = useCallback((v: string) => {
    setState((s) => ({ ...s, manualProductName: v }));
  }, []);

  const setManualIngredients = useCallback((v: string) => {
    setState((s) => ({ ...s, manualIngredients: v }));
  }, []);

  const setManualClaims = useCallback((v: string) => {
    setState((s) => ({ ...s, manualClaims: v }));
  }, []);

  // Camera mode: OCR both images → parse → analyze
  const runOcr = useCallback(async () => {
    setState((s) => ({ ...s, step: "ocr-processing", error: null }));
    try {
      const [frontText, labelText] = await Promise.all([
        state.frontImage ? ocrImage(state.frontImage) : Promise.resolve(""),
        state.labelImage ? ocrImage(state.labelImage) : Promise.resolve(""),
      ]);

      const combinedText = [frontText, labelText].filter(Boolean).join("\n");
      if (!combinedText.trim()) {
        setState((s) => ({ ...s, step: "error", error: "未识别到文字，请调整角度重拍，或切换手动输入" }));
        return;
      }

      let ocrResult: OcrResult;
      try {
        const parseRes = await fetch("/api/parse-ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: combinedText }),
        });
        const parseData = await parseRes.json();
        ocrResult = parseData.error
          ? { brand: "", productName: "", claimsText: frontText, ingredientsText: labelText || frontText }
          : parseData;
      } catch {
        ocrResult = { brand: "", productName: "", claimsText: frontText, ingredientsText: labelText || frontText };
      }

      setState((s) => ({ ...s, ocrResult, step: "analyzing" }));
      const analysisResult = await callAnalyzeApi(ocrResult, profiles);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "识别失败，请重试" }));
    }
  }, [state.frontImage, state.labelImage, profiles]);

  // Manual mode: analyze directly with typed fields
  const submitManual = useCallback(async () => {
    setState((s) => ({ ...s, step: "analyzing", error: null }));
    const ocrResult: OcrResult = {
      brand: "",
      productName: state.manualProductName,
      claimsText: state.manualClaims,
      ingredientsText: state.manualIngredients,
    };
    setState((s) => ({ ...s, ocrResult }));
    try {
      const analysisResult = await callAnalyzeApi(ocrResult, profiles);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "分析失败，请重试" }));
    }
  }, [state.manualProductName, state.manualIngredients, state.manualClaims, profiles]);

  const reanalyze = useCallback(async (editedOcr: OcrResult) => {
    setState((s) => ({ ...s, step: "analyzing", error: null, ocrResult: editedOcr }));
    try {
      const analysisResult = await callAnalyzeApi(editedOcr, profiles);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "重新分析失败" }));
    }
  }, [profiles]);

  const resetAll = useCallback(() => setState(initialState), []);

  return { state, profiles, setProfiles, setMode, setFrontImage, setLabelImage, setManualProductName, setManualIngredients, setManualClaims, runOcr, submitManual, reanalyze, resetAll };
}
