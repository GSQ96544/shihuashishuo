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

async function callAnalyzeApi(ocr: OcrResult): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productName: ocr.productName,
      ingredientsText: ocr.ingredientsText,
      claimsText: ocr.claimsText,
      brand: ocr.brand,
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

  // Camera mode: OCR → parse → analyze (all in one go, no review step)
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
          ...s, step: "error",
          error: "未识别到文字，请调整角度重拍，或切换手动输入",
        }));
        return;
      }

      // Parse raw OCR into structured fields
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

      // Immediately analyze — no pause for review
      setState((s) => ({ ...s, ocrResult, step: "analyzing" }));
      const analysisResult = await callAnalyzeApi(ocrResult);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({
        ...s, step: "error",
        error: err instanceof Error ? err.message : "识别失败，请重试",
      }));
    }
  }, [state.frontImage, state.labelImage]);

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
      const analysisResult = await callAnalyzeApi(ocrResult);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({
        ...s, step: "error",
        error: err instanceof Error ? err.message : "分析失败，请重试",
      }));
    }
  }, [state.manualProductName, state.manualIngredients]);

  // Re-analyze with edited OCR result (from ResultCard edit panel)
  const reanalyze = useCallback(async (editedOcr: OcrResult) => {
    setState((s) => ({ ...s, step: "analyzing", error: null, ocrResult: editedOcr }));
    try {
      const analysisResult = await callAnalyzeApi(editedOcr);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({
        ...s, step: "error",
        error: err instanceof Error ? err.message : "重新分析失败",
      }));
    }
  }, []);

  const resetAll = useCallback(() => setState(initialState), []);

  return {
    state,
    setMode,
    setFrontImage,
    setLabelImage,
    setManualProductName,
    setManualIngredients,
    runOcr,
    submitManual,
    reanalyze,
    resetAll,
  };
}
