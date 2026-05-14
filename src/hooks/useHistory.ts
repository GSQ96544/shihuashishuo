"use client";

import { useState, useCallback, useEffect } from "react";
import type { AnalysisResult, OcrResult } from "@/lib/types";

export interface HistoryItem {
  id: string;
  productName: string;
  ingredientsShort: string;
  riskLevel: string;
  summary: string;
  timestamp: number;
  analysisResult: AnalysisResult;
  ocrResult: OcrResult;
}

const KEY = "shihuashishuo_history";
const MAX = 10;

function load(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save(items: HistoryItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX)));
  } catch {
    // storage full, ignore
  }
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => setItems(load()), []);

  const add = useCallback(
    (ocr: OcrResult, result: AnalysisResult) => {
      const item: HistoryItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        productName: ocr.productName || "未知商品",
        ingredientsShort: ocr.ingredientsText?.slice(0, 60) || "",
        riskLevel: result.riskLevel,
        summary: result.summary,
        timestamp: Date.now(),
        analysisResult: result,
        ocrResult: ocr,
      };
      const next = [item, ...items].slice(0, MAX);
      setItems(next);
      save(next);
    },
    [items]
  );

  const clear = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(KEY); } catch { /* */ }
  }, []);

  return { items, add, clear };
}
