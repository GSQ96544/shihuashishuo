"use client";

import { useState, useCallback } from "react";
import type { FlowStep, AppState, OcrResult, AnalysisResult, InputMode } from "@/lib/types";

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
};

export function useAnalysis() {
  const [state, setState] = useState<AppState>(initialState);

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

  // Camera mode: OCR → DeepSeek parse → structured fields
  const runOcr = useCallback(async () => {
    setState((s) => ({ ...s, step: "ocr-processing", error: null }));
    try {
      const [frontText, labelText] = await Promise.all([
        state.frontImage ? ocrImage(state.frontImage) : Promise.resolve(""),
        state.labelImage ? ocrImage(state.labelImage) : Promise.resolve(""),
      ]);

      const combinedText = [frontText, labelText].filter(Boolean).join("\n");
      if (!combinedText.trim()) {
        setState((s) => ({
          ...s,
          step: "error",
          error: "未识别到文字，请拍摄清晰的包装照片",
        }));
        return;
      }

      let result: OcrResult;
      try {
        const parseRes = await fetch("/api/parse-ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: combinedText }),
        });
        const parseData = await parseRes.json();
        if (parseData.error) {
          result = { brand: "", productName: "", claimsText: frontText, ingredientsText: labelText || frontText };
        } else {
          result = parseData;
        }
      } catch {
        result = { brand: "", productName: "", claimsText: frontText, ingredientsText: labelText || frontText };
      }

      setState((s) => ({ ...s, ocrResult: result, step: "ocr-review" }));
    } catch (err) {
      setState((s) => ({
        ...s,
        step: "error",
        error: err instanceof Error ? err.message : "识别失败，请重试",
      }));
    }
  }, [state.frontImage, state.labelImage]);

  // Manual mode: skip OCR, go direct to review
  const submitManual = useCallback(() => {
    const result: OcrResult = {
      brand: "",
      productName: state.manualProductName,
      claimsText: "",
      ingredientsText: state.manualIngredients,
    };
    setState((s) => ({ ...s, ocrResult: result, step: "ocr-review" }));
  }, [state.manualProductName, state.manualIngredients]);

  // Run analysis (calls API)
  const runAnalysis = useCallback(async (ocrResult: OcrResult) => {
    setState((s) => ({ ...s, step: "analyzing", error: null }));
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: ocrResult.productName,
          ingredientsText: ocrResult.ingredientsText,
          claimsText: ocrResult.claimsText,
          brand: ocrResult.brand,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setState((s) => ({ ...s, step: "error", error: data.error }));
      } else {
        setState((s) => ({ ...s, analysisResult: data as AnalysisResult, step: "done" }));
      }
    } catch {
      setState((s) => ({ ...s, step: "error", error: "网络异常，请稍后重试" }));
    }
  }, []);

  const resetAll = useCallback(() => {
    setState(initialState);
  }, []);

  const updateOcrResult = useCallback((ocrResult: OcrResult) => {
    setState((s) => ({ ...s, ocrResult }));
  }, []);

  return {
    state,
    setMode,
    setFrontImage,
    setLabelImage,
    setManualProductName,
    setManualIngredients,
    runOcr,
    submitManual,
    runAnalysis,
    resetAll,
    updateOcrResult,
  };
}
