"use client";

import { useState, useCallback, useEffect } from "react";
import type { AppState, OcrResult, AnalysisResult, InputMode, UserProfile } from "@/lib/types";

const PROFILE_KEY = "shihuashishuo_profile";

function loadProfile(): UserProfile {
  if (typeof window === "undefined") return "default";
  try {
    const v = localStorage.getItem(PROFILE_KEY);
    return (v as UserProfile) || "default";
  } catch { return "default"; }
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

async function callAnalyzeApi(ocr: OcrResult, userProfile: UserProfile): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName: ocr.productName,
      ingredientsText: ocr.ingredientsText,
      claimsText: ocr.claimsText,
      brand: ocr.brand,
      userProfile,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as AnalysisResult;
}

const initialState: AppState = {
  mode: "camera",
  step: "input",
  image: null,
  ocrResult: null,
  analysisResult: null,
  error: null,
  manualProductName: "",
  manualIngredients: "",
};

export function useAnalysis() {
  const [state, setState] = useState<AppState>(initialState);
  const [profile, setProfileState] = useState<UserProfile>("default");

  useEffect(() => { setProfileState(loadProfile()); }, []);

  const setProfile = useCallback((p: UserProfile) => {
    setProfileState(p);
    try { localStorage.setItem(PROFILE_KEY, p); } catch { /* */ }
  }, []);

  const setMode = useCallback((mode: InputMode) => {
    setState((s) => ({ ...s, mode, step: "input", error: null }));
  }, []);

  const setImage = useCallback((img: string) => {
    setState((s) => ({ ...s, image: img }));
  }, []);

  const setManualProductName = useCallback((v: string) => {
    setState((s) => ({ ...s, manualProductName: v }));
  }, []);

  const setManualIngredients = useCallback((v: string) => {
    setState((s) => ({ ...s, manualIngredients: v }));
  }, []);

  // Camera mode: OCR → parse → analyze — all in one go
  const runOcr = useCallback(async () => {
    setState((s) => ({ ...s, step: "ocr-processing", error: null }));
    try {
      const rawText = state.image ? await ocrImage(state.image) : "";
      if (!rawText.trim()) {
        setState((s) => ({ ...s, step: "error", error: "未识别到文字，请调整角度重拍，或切换手动输入" }));
        return;
      }

      // Parse raw OCR into structured fields
      let ocrResult: OcrResult;
      try {
        const parseRes = await fetch("/api/parse-ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText }),
        });
        const parseData = await parseRes.json();
        ocrResult = parseData.error
          ? { brand: "", productName: "", claimsText: rawText, ingredientsText: rawText }
          : parseData;
      } catch {
        ocrResult = { brand: "", productName: "", claimsText: rawText, ingredientsText: rawText };
      }

      setState((s) => ({ ...s, ocrResult, step: "analyzing" }));
      const analysisResult = await callAnalyzeApi(ocrResult, profile);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "识别失败，请重试" }));
    }
  }, [state.image, profile]);

  // Manual mode: skip OCR, analyze directly
  const submitManual = useCallback(async () => {
    setState((s) => ({ ...s, step: "analyzing", error: null }));
    const ocrResult: OcrResult = {
      brand: "",
      productName: state.manualProductName,
      claimsText: "",
      ingredientsText: state.manualIngredients,
    };
    setState((s) => ({ ...s, ocrResult }));
    try {
      const analysisResult = await callAnalyzeApi(ocrResult, profile);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "分析失败，请重试" }));
    }
  }, [state.manualProductName, state.manualIngredients]);

  const reanalyze = useCallback(async (editedOcr: OcrResult) => {
    setState((s) => ({ ...s, step: "analyzing", error: null, ocrResult: editedOcr }));
    try {
      const analysisResult = await callAnalyzeApi(editedOcr, profile);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "重新分析失败" }));
    }
  }, []);

  const resetAll = useCallback(() => setState(initialState), []);

  return { state, profile, setProfile, setMode, setImage, setManualProductName, setManualIngredients, runOcr, submitManual, reanalyze, resetAll };
}
