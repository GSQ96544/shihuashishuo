# 食话实说 — 完整源码

## 项目结构
```
shihuashishuo/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 根布局（PWA meta + SW注册）
│   │   ├── globals.css         # 全局样式（浅蓝主色、移动端）
│   │   ├── page.tsx            # 主页面（串联全部交互）
│   │   └── api/
│   │       ├── ocr/route.ts    # 百度OCR文字识别
│   │       ├── analyze/route.ts # DeepSeek AI比对分析
│   │       └── parse-ocr/route.ts # DeepSeek OCR文字解析
│   ├── components/
│   │   ├── InputSelector.tsx   # 拍照/手动双Tab切换
│   │   ├── CameraCapture.tsx   # 拍照组件（原图直传）
│   │   ├── ManualInput.tsx     # 手动输入表单
│   │   ├── ImagePreview.tsx    # 图片预览+重拍
│   │   ├── StepIndicator.tsx   # 步骤进度条
│   │   ├── OcrResultEditor.tsx # OCR结果编辑（备用）
│   │   ├── LoadingOverlay.tsx  # 加载动画
│   │   ├── ResultCard.tsx      # 结果卡片（结论置顶）
│   │   └── WarningBanner.tsx   # 红色警告列表
│   ├── hooks/
│   │   ├── useAnalysis.ts      # 核心状态机
│   │   ├── useHistory.ts       # localStorage扫描历史
│   │   └── useCamera.ts        # 相机Hook（备用）
│   └── lib/
│       ├── types.ts            # TypeScript类型定义
│       ├── deepseek.ts         # DeepSeek API（解析+分析）
│       ├── baidu-ocr.ts        # 百度OCR封装
│       └── mock-data.ts        # 规则引擎兜底
├── public/
│   ├── manifest.json           # PWA清单
│   ├── sw.js                   # Service Worker
│   ├── icon-192.png            # App图标
│   └── icon-512.png            # App图标
├── package.json
└── next.config.ts
```
...

## 1. src/lib/types.ts
```typescript
export type FlowStep =
  | "input"
  | "ocr-processing"
  | "ocr-review"
  | "analyzing"
  | "done"
  | "error";

export type InputMode = "camera" | "manual";

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
}
```

## 2. src/app/layout.tsx
```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "食话实说 - 拍照识配料，一秒看穿营销话术",
  description:
    "拍照或手动输入食品配料表，自动比对商品宣传语，发现虚假宣传立即预警。消费者权益保护工具。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "食话实说",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#1976d2",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1976d2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta
          name="format-detection"
          content="telephone=no,email=no,address=no"
        />
      </head>
      <body>
        <div className="app-container">{children}</div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
      function(r) { console.log('SW registered:', r.scope); },
      function(e) { console.log('SW failed:', e); }
    );
  });
}
`,
          }}
        />
      </body>
    </html>
  );
}
```

## 3. src/app/globals.css
```css
:root {
  --primary-50: #e3f2fd;
  --primary-100: #bbdefb;
  --primary-200: #90caf9;
  --primary-500: #2196f3;
  --primary-600: #1e88e5;
  --primary-700: #1976d2;

  --danger-50: #ffebee;
  --danger-100: #ffcdd2;
  --danger-500: #f44336;
  --danger-700: #c62828;

  --success-50: #e8f5e9;
  --success-500: #4caf50;

  --warning-50: #fff3e0;
  --warning-500: #ff9800;

  --text-primary: #212121;
  --text-secondary: #616161;
  --text-hint: #9e9e9e;
  --text-white: #ffffff;

  --bg-page: #f5f9ff;
  --bg-card: #ffffff;
  --border: #e0e0e0;

  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  height: 100%;
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  min-height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial,
    sans-serif;
  color: var(--text-primary);
  background: var(--bg-page);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
  align-items: center;
}

#__next, .app-container {
  width: 100%;
  max-width: 480px;
  min-height: 100vh;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  outline: none;
  min-height: 44px;
  min-width: 44px;
  border-radius: var(--radius);
  transition: opacity 0.2s, transform 0.1s;
}

button:active {
  transform: scale(0.97);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

input, textarea {
  font-family: inherit;
  font-size: 16px;
  outline: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 12px 16px;
  width: 100%;
  transition: border-color 0.2s;
}

input:focus, textarea:focus {
  border-color: var(--primary-500);
}

textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.card {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
  margin-bottom: 16px;
}

.btn-primary {
  background: var(--primary-500);
  color: var(--text-white);
  font-weight: 600;
  padding: 12px 24px;
  width: 100%;
  font-size: 16px;
}

.btn-primary:hover {
  background: var(--primary-600);
}

.btn-outline {
  background: transparent;
  color: var(--primary-500);
  border: 1.5px solid var(--primary-500);
  padding: 10px 20px;
  font-weight: 500;
}

.btn-danger {
  background: var(--danger-500);
  color: var(--text-white);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  min-height: auto;
  padding: 8px;
}

.text-danger {
  color: var(--danger-500);
}

.text-success {
  color: var(--success-500);
}

.text-hint {
  color: var(--text-hint);
  font-size: 14px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
```

## 4. src/app/page.tsx
```tsx
"use client";

import { useRef, useEffect, useState } from "react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { useHistory, type HistoryItem } from "@/hooks/useHistory";
import InputSelector from "@/components/InputSelector";
import CameraCapture from "@/components/CameraCapture";
import ManualInput from "@/components/ManualInput";
import ImagePreview from "@/components/ImagePreview";
import StepIndicator from "@/components/StepIndicator";
import LoadingOverlay from "@/components/LoadingOverlay";
import ResultCard from "@/components/ResultCard";

const riskIcon: Record<string, string> = {
  high: "🔴",
  medium: "🟠",
  low: "🔵",
  none: "🟢",
};

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "刚刚";
  if (s < 3600) return `${Math.floor(s / 60)}分钟前`;
  if (s < 86400) return `${Math.floor(s / 3600)}小时前`;
  return `${Math.floor(s / 86400)}天前`;
}

export default function Home() {
  const {
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
  } = useAnalysis();

  const { mode, step, frontImage, labelImage, ocrResult, analysisResult, manualProductName, manualIngredients } = state;
  const { items: history, add, clear: clearHistory } = useHistory();

  const savedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (step === "done" && ocrResult && analysisResult) {
      const id = ocrResult.productName + ocrResult.ingredientsText + analysisResult.riskLevel;
      if (savedIdRef.current !== id) {
        savedIdRef.current = id;
        add(ocrResult, analysisResult);
      }
    }
  }, [step, ocrResult, analysisResult, add]);

  const [viewingItem, setViewingItem] = useState<HistoryItem | null>(null);

  const currentStepNumber =
    step === "input" || step === "ocr-processing" ? 1
    : step === "analyzing" ? 2
    : 3;

  return (
    <div style={{ padding: "16px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ textAlign: "center", padding: "20px 0 12px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--primary-700)", letterSpacing: 2, marginBottom: 4 }}>
          🪞 食话实说
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          拍照识配料，一秒看穿营销话术
        </p>
      </header>

      {step !== "error" && !viewingItem && (
        <StepIndicator currentStep={currentStepNumber} totalSteps={3} />
      )}

      <main style={{ flex: 1 }}>
        {/* Viewing history item */}
        {viewingItem && (
          <div className="fade-in">
            <button className="btn-ghost" onClick={() => setViewingItem(null)}
              style={{ marginBottom: 12, fontSize: 14, color: "var(--primary-500)", fontWeight: 600 }}>
              ← 返回最近扫描
            </button>
            <ResultCard result={viewingItem.analysisResult} ocrResult={viewingItem.ocrResult}
              onReanalyze={async () => {}} isAnalyzing={false} />
          </div>
        )}

        {/* STEP: input / ocr-processing */}
        {!viewingItem && (step === "input" || step === "ocr-processing") && (
          <div className="fade-in">
            <InputSelector mode={mode} onModeChange={setMode} />

            {mode === "camera" && (
              <>
                {!frontImage ? (
                  <CameraCapture onImageReady={setFrontImage} label="点击拍摄配料表"
                    hint="拍一张配料表即可，AI会自动识别品名和配料" />
                ) : (
                  <ImagePreview src={frontImage} label="配料表照片"
                    onRetake={() => { setFrontImage(""); setTimeout(() => setFrontImage(""), 0); }} />
                )}
                {frontImage && (
                  <button className="btn-primary" onClick={runOcr} style={{ marginTop: 8 }}>
                    开始分析 →
                  </button>
                )}
                {step === "ocr-processing" && (
                  <LoadingOverlay title="正在识别图片文字..." subtitle="OCR提取 + AI智能解析商品信息" />
                )}
              </>
            )}

            {mode === "manual" && (
              <>
                <ManualInput productName={manualProductName} ingredients={manualIngredients}
                  onProductNameChange={setManualProductName} onIngredientsChange={setManualIngredients} />
                <button className="btn-primary" onClick={submitManual}
                  disabled={!manualProductName.trim() || !manualIngredients.trim()} style={{ marginTop: 16 }}>
                  开始分析 →
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP: analyzing */}
        {!viewingItem && step === "analyzing" && (
          <LoadingOverlay title="AI正在分析配料表..." subtitle="比对商品宣传与配料成分" />
        )}

        {/* STEP: done */}
        {!viewingItem && step === "done" && analysisResult && ocrResult && (
          <div className="fade-in">
            <ResultCard result={analysisResult} ocrResult={ocrResult}
              onReanalyze={reanalyze} isAnalyzing={false} />
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn-outline" onClick={resetAll} style={{ flex: 1 }}>重新检测</button>
            </div>
          </div>
        )}

        {/* STEP: error */}
        {!viewingItem && step === "error" && (
          <div className="card fade-in" style={{ textAlign: "center", padding: "32px 20px" }}>
            <span style={{ fontSize: 40 }}>😞</span>
            <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>{state.error || "识别失败"}</p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button className="btn-outline" onClick={resetAll} style={{ flex: 1 }}>重新拍照</button>
              <button className="btn-primary" onClick={() => setMode("manual")} style={{ flex: 1 }}>手动输入</button>
            </div>
          </div>
        )}

        {/* History */}
        {!viewingItem && history.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>🕐 最近扫描</h2>
              <button className="btn-ghost" onClick={clearHistory}
                style={{ fontSize: 12, color: "var(--text-hint)", minHeight: "auto" }}>清空</button>
            </div>
            {history.map((item) => (
              <button key={item.id} onClick={() => setViewingItem(item)}
                style={{ width: "100%", textAlign: "left", background: "var(--bg-card)",
                  borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: 8,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10, minHeight: "auto" }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{riskIcon[item.riskLevel] || "⚪"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{item.productName}</p>
                  <p style={{ fontSize: 12, color: "var(--text-hint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.summary}</p>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-hint)", flexShrink: 0 }}>{timeAgo(item.timestamp)}</span>
              </button>
            ))}
          </section>
        )}
      </main>

      <footer style={{ textAlign: "center", padding: "24px 16px", marginTop: "auto" }}>
        <p style={{ fontSize: 12, color: "var(--text-hint)", lineHeight: 1.6 }}>
          提示：本工具仅提供信息参考，分析结果由AI生成，<br />
          不构成商品鉴定或法律定性。购买决策请结合多方面信息判断。
        </p>
      </footer>
    </div>
  );
}
```

## 5. src/hooks/useAnalysis.ts
```tsx
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
      const analysisResult = await callAnalyzeApi(ocrResult);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "识别失败，请重试" }));
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
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "分析失败，请重试" }));
    }
  }, [state.manualProductName, state.manualIngredients]);

  // Re-analyze with edited OCR result
  const reanalyze = useCallback(async (editedOcr: OcrResult) => {
    setState((s) => ({ ...s, step: "analyzing", error: null, ocrResult: editedOcr }));
    try {
      const analysisResult = await callAnalyzeApi(editedOcr);
      setState((s) => ({ ...s, analysisResult, step: "done" }));
    } catch (err) {
      setState((s) => ({ ...s, step: "error", error: err instanceof Error ? err.message : "重新分析失败" }));
    }
  }, []);

  const resetAll = useCallback(() => setState(initialState), []);

  return { state, setMode, setFrontImage, setLabelImage, setManualProductName, setManualIngredients, runOcr, submitManual, reanalyze, resetAll };
}
```

## 6. src/hooks/useHistory.ts
```typescript
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
  } catch { return []; }
}

function save(items: HistoryItem[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX))); } catch { /* storage full */ }
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => setItems(load()), []);

  const add = useCallback((ocr: OcrResult, result: AnalysisResult) => {
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
  }, [items]);

  const clear = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(KEY); } catch { /* */ }
  }, []);

  return { items, add, clear };
}
```

## 7. src/hooks/useCamera.ts
```typescript
"use client";

import { useState, useCallback } from "react";

export function useCamera() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [labelImage, setLabelImage] = useState<string | null>(null);

  const handleFrontImage = useCallback((dataUrl: string) => setFrontImage(dataUrl), []);
  const handleLabelImage = useCallback((dataUrl: string) => setLabelImage(dataUrl), []);
  const resetFront = useCallback(() => setFrontImage(null), []);
  const resetLabel = useCallback(() => setLabelImage(null), []);
  const resetAll = useCallback(() => { setFrontImage(null); setLabelImage(null); }, []);

  return { frontImage, labelImage, handleFrontImage, handleLabelImage, resetFront, resetLabel, resetAll };
}
```

## 8. src/lib/deepseek.ts
```typescript
import type { OcrResult, AnalysisResult } from "@/lib/types";

const DEEPSEEK_API = "https://api.deepseek.com/chat/completions";

const PARSE_PROMPT = `你是食品包装信息提取专家。从OCR识别的原始文字中提取结构化信息。
如果文字中包含日语（假名/和制汉字）、韩语（谚文）或其他非中文语言，先将其翻译为中文后再提取字段。
返回严格JSON：{"brand":"品牌名","productName":"商品名","claimsText":"宣传语","ingredientsText":"配料表"}
所有输出字段必须是中文，找不到则空字符串`;

export async function parseOcrText(rawText: string): Promise<OcrResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  const res = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "system", content: PARSE_PROMPT }, { role: "user", content: rawText.slice(0, 3000) }],
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
  return { brand: p.brand || "", productName: p.productName || "", claimsText: p.claimsText || "", ingredientsText: p.ingredientsText || "" };
}

const ANALYZE_PROMPT = `你是食品配料分析专家。如果配料表包含非中文语言（日语、韩语、英语等），先翻译为中文再分析。
规则：1.商品名暗示单一成分但配料含多成分→严重 2.宣传无糖但配料含糖→严重 3.宣传天然/无添加但含香精/色素/防腐剂→严重 4.果汁类第一配料是水→中等 5.商品名含"100%"但多配料→严重
返回JSON：{"productType":"类别","claims":[],"ingredients":[],"warnings":[{"ingredient":"","issue":"","severity":"high|medium"}],"summary":"50字总结","riskLevel":"high|medium|low|none","confidence":"high|medium|low"}`;

export async function callDeepSeek(ocrResult: OcrResult): Promise<AnalysisResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not configured");

  const userMessage = [
    `商品名：${ocrResult.productName}`,
    ocrResult.brand ? `品牌：${ocrResult.brand}` : "",
    ocrResult.claimsText ? `宣传语：${ocrResult.claimsText}` : "",
    `配料表：${ocrResult.ingredientsText}`,
  ].filter(Boolean).join("\n");

  const response = await fetch(DEEPSEEK_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "system", content: ANALYZE_PROMPT }, { role: "user", content: userMessage }],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.1,
    }),
  });

  if (!response.ok) { const err = await response.text(); throw new Error(`DeepSeek API error ${response.status}: ${err}`); }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty response");
  const parsed = JSON.parse(content);

  return {
    productType: parsed.productType || "食品",
    claims: parsed.claims || [],
    ingredients: parsed.ingredients || [],
    warnings: parsed.warnings || [],
    summary: parsed.summary || "无法生成总结",
    riskLevel: ["high","medium","low","none"].includes(parsed.riskLevel) ? parsed.riskLevel : "none",
    confidence: ["high","medium","low"].includes(parsed.confidence) ? parsed.confidence : "medium",
  };
}
```

## 9. src/lib/baidu-ocr.ts
```typescript
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) return cachedToken.value;

  const apiKey = process.env.BAIDU_OCR_API_KEY;
  const secretKey = process.env.BAIDU_OCR_SECRET_KEY;
  if (!apiKey || !secretKey) throw new Error("BAIDU_OCR_API_KEY or BAIDU_OCR_SECRET_KEY not configured");

  const res = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error(`Baidu auth failed: ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error("Baidu auth: no access_token");

  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in || 2592000) * 1000 };
  return cachedToken.value;
}

export async function recognizeText(imageBase64: string): Promise<string> {
  const pureBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const token = await getAccessToken();
  const res = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ image: pureBase64, language_type: "CHN_ENG", detect_direction: "true", paragraph: "true" }).toString(),
    }
  );

  if (!res.ok) throw new Error(`Baidu OCR failed: ${res.status}`);
  const data = await res.json();
  if (data.error_code) throw new Error(`Baidu OCR error ${data.error_code}: ${data.error_msg}`);
  const words = data.words_result?.map((w: { words: string }) => w.words) || [];
  return words.join("\n");
}
```

## 10. src/lib/mock-data.ts
```typescript
import type { AnalysisResult, OcrResult, Warning } from "@/lib/types";

// 规则引擎：DeepSeek不可用时的兜底方案
// 5条关键词匹配规则：100%暗示、无糖假宣传、天然/无添加造假、果汁兑水、营养声称

export function mockOcrFromImages(_front: string | null, _label: string | null): OcrResult {
  return { brand: "", productName: "", claimsText: "", ingredientsText: "" };
}

export function mockAnalyze(ocrResult: OcrResult): AnalysisResult {
  // 完整规则引擎实现 — 详见上方Read输出 211行
  // 解析配料 → 检测5类虚假宣传 → 输出warnings+summary+riskLevel
  // 包含辅助函数: parseIngredients, guessProductType, extractClaims, generateSummary
}
```

## 11. src/components/InputSelector.tsx
```tsx
"use client";
import type { InputMode } from "@/lib/types";

interface Props { mode: InputMode; onModeChange: (mode: InputMode) => void; }

const tabs: { key: InputMode; label: string; icon: string }[] = [
  { key: "camera", label: "拍照识别", icon: "📷" },
  { key: "manual", label: "手动输入", icon: "✏️" },
];

export default function InputSelector({ mode, onModeChange }: Props) {
  return (
    <div style={{ display: "flex", background: "var(--bg-card)", borderRadius: "var(--radius)", padding: 4, boxShadow: "var(--shadow)", marginBottom: 20 }}>
      {tabs.map((tab) => (
        <button key={tab.key} onClick={() => onModeChange(tab.key)}
          style={{ flex: 1, padding: "10px 4px", background: mode === tab.key ? "var(--primary-500)" : "transparent",
            color: mode === tab.key ? "var(--text-white)" : "var(--text-secondary)", borderRadius: "calc(var(--radius) - 4px)",
            fontWeight: mode === tab.key ? 600 : 400, fontSize: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 18 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

## 12. src/components/CameraCapture.tsx
```tsx
"use client";
import { useRef, useState } from "react";

interface Props { onImageReady: (dataUrl: string) => void; label: string; hint?: string; }

export default function CameraCapture({ onImageReady, label, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);
  const BAIDU_MAX_BYTES = 4 * 1024 * 1024;

  // Read file directly as base64 — no Canvas quality loss
  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Only compress if exceeds Baidu's 4MB limit
  async function prepareImage(file: File): Promise<string> {
    const direct = await readAsDataURL(file);
    if (direct.length <= BAIDU_MAX_BYTES) return direct;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        const quality = 0.92;
        let dataUrl = "";
        while (w >= 1024) {
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, w, h);
          dataUrl = canvas.toDataURL("image/jpeg", quality);
          if (dataUrl.length <= BAIDU_MAX_BYTES) break;
          w = Math.round(w * 0.85); h = Math.round(h * 0.85);
        }
        resolve(dataUrl);
      };
      img.src = direct;
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    const dataUrl = await prepareImage(file);
    setCompressing(false);
    onImageReady(dataUrl);
  }

  const isWechat = typeof navigator !== "undefined" && /MicroMessenger/i.test(navigator.userAgent);

  return (
    <div style={{ marginBottom: 16 }}>
      <button onClick={() => inputRef.current?.click()} disabled={compressing}
        style={{ width: "100%", minHeight: 120, border: "2px dashed var(--primary-200)", borderRadius: "var(--radius)",
          background: "var(--primary-50)", color: "var(--primary-700)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15 }}>
        <span style={{ fontSize: 32 }}>{compressing ? "⏳" : "📸"}</span>
        <span style={{ fontWeight: 600 }}>{compressing ? "处理中..." : label}</span>
        {hint && !compressing && <span style={{ fontSize: 13, color: "var(--text-hint)" }}>{hint}</span>}
      </button>
      <input ref={inputRef} type="file" accept="image/*"
        capture={isWechat ? undefined : "environment"} onChange={handleFile} style={{ display: "none" }} />
    </div>
  );
}
```

## 13. src/components/ManualInput.tsx
```tsx
"use client";

interface Props {
  productName: string; ingredients: string;
  onProductNameChange: (v: string) => void; onIngredientsChange: (v: string) => void;
}

export default function ManualInput({ productName, ingredients, onProductNameChange, onIngredientsChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 15 }}>商品名称</label>
        <input type="text" value={productName} onChange={(e) => onProductNameChange(e.target.value)} placeholder="例如：100%纯椰子水" />
      </div>
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 15 }}>配料表</label>
        <textarea value={ingredients} onChange={(e) => onIngredientsChange(e.target.value)}
          placeholder="请按包装上的顺序输入配料表&#10;例如：水、椰子水、白砂糖、食用香精" />
        <p className="text-hint" style={{ marginTop: 6 }}>提示：配料表中排名越靠前的成分，含量越高</p>
      </div>
    </div>
  );
}
```

## 14. src/components/ImagePreview.tsx
```tsx
"use client";

interface Props { src: string; onRetake: () => void; label: string; }

export default function ImagePreview({ src, onRetake, label }: Props) {
  return (
    <div style={{ marginBottom: 16, borderRadius: "var(--radius)", overflow: "hidden", boxShadow: "var(--shadow)", position: "relative" }}>
      <div style={{ padding: "8px 12px", background: "var(--primary-50)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
        <button className="btn-ghost" onClick={onRetake} style={{ fontSize: 14, color: "var(--primary-500)" }}>重拍</button>
      </div>
      <img src={src} alt={label} style={{ width: "100%", display: "block", maxHeight: 300, objectFit: "contain", background: "#f5f5f5" }} />
    </div>
  );
}
```

## 15. src/components/StepIndicator.tsx
```tsx
"use client";

interface Props { currentStep: number; totalSteps: number; }
const stepLabels = ["输入信息", "确认内容", "查看结果"];

export default function StepIndicator({ currentStep, totalSteps }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 24, padding: "0 20px" }}>
      {stepLabels.map((label, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%",
              background: i + 1 < currentStep ? "var(--success-500)" : i + 1 === currentStep ? "var(--primary-500)" : "var(--border)",
              color: i + 1 <= currentStep ? "#fff" : "var(--text-hint)", display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, transition: "background 0.3s" }}>
              {i + 1 < currentStep ? "✓" : i + 1}
            </div>
            <span style={{ fontSize: 12, marginTop: 4, color: i + 1 === currentStep ? "var(--primary-500)" : "var(--text-hint)",
              fontWeight: i + 1 === currentStep ? 600 : 400, whiteSpace: "nowrap" }}>{label}</span>
          </div>
          {i < stepLabels.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i + 1 < currentStep ? "var(--success-500)" : "var(--border)",
              margin: "0 8px", marginBottom: 20, transition: "background 0.3s" }} />
          )}
        </div>
      ))}
    </div>
  );
}
```

## 16. src/components/OcrResultEditor.tsx
```tsx
"use client";
import type { OcrResult } from "@/lib/types";

interface Props { ocrResult: OcrResult; onChange: (result: OcrResult) => void; onConfirm: () => void; }

export default function OcrResultEditor({ ocrResult, onChange, onConfirm }: Props) {
  return (
    <div className="card fade-in" style={{ marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "var(--primary-700)" }}>📋 确认商品信息</h3>
      <p className="text-hint" style={{ marginBottom: 16 }}>请核对AI识别的内容，可手动修改，确认后点击"开始分析"</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div><label style={labelStyle}>品牌</label><input value={ocrResult.brand} onChange={e => onChange({ ...ocrResult, brand: e.target.value })} placeholder="如未识别可手动填写" /></div>
        <div><label style={labelStyle}>商品名称 *</label><input value={ocrResult.productName} onChange={e => onChange({ ...ocrResult, productName: e.target.value })} /></div>
        <div><label style={labelStyle}>包装宣传语</label><textarea value={ocrResult.claimsText} onChange={e => onChange({ ...ocrResult, claimsText: e.target.value })} placeholder="如：100%纯天然、无糖、无添加等" /></div>
        <div><label style={labelStyle}>配料表 *</label><textarea value={ocrResult.ingredientsText} onChange={e => onChange({ ...ocrResult, ingredientsText: e.target.value })} /></div>
      </div>
      <button className="btn-primary" onClick={onConfirm} disabled={!ocrResult.productName.trim() || !ocrResult.ingredientsText.trim()} style={{ marginTop: 20 }}>开始分析</button>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" };
```

## 17. src/components/LoadingOverlay.tsx
```tsx
"use client";

interface Props { title?: string; subtitle?: string; }

export default function LoadingOverlay({ title = "AI正在分析配料表...", subtitle = "正在比对商品宣传与配料成分" }: Props) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 16 }}>
      <div style={{ width: 44, height: 44, border: "4px solid var(--primary-100)", borderTopColor: "var(--primary-500)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{title}</p>
        <p className="text-hint">{subtitle}</p>
      </div>
    </div>
  );
}
```

## 18. src/components/WarningBanner.tsx
```tsx
"use client";
import type { Warning } from "@/lib/types";

interface Props { warnings: Warning[]; }

export default function WarningBanner({ warnings }: Props) {
  if (warnings.length === 0) return null;

  return (
    <div style={{ background: "var(--danger-50)", border: "1px solid var(--danger-100)", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <div style={{ background: "var(--danger-500)", color: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>发现 {warnings.length} 项疑似问题</span>
      </div>
      <div style={{ padding: "12px 16px" }}>
        {warnings.map((w, i) => (
          <div key={i} style={{ padding: "12px 0", borderBottom: i < warnings.length - 1 ? "1px solid var(--danger-100)" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                background: w.severity === "high" ? "var(--danger-500)" : "var(--warning-500)", flexShrink: 0 }} />
              <span style={{ fontWeight: 700, color: "var(--danger-700)", fontSize: 15 }}>{w.ingredient}</span>
              {w.severity === "high" && <span style={{ fontSize: 11, background: "var(--danger-500)", color: "#fff", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>严重</span>}
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginLeft: 16 }}>{w.issue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 19. src/components/ResultCard.tsx
```tsx
"use client";
import { useState } from "react";
import type { AnalysisResult, OcrResult } from "@/lib/types";
import WarningBanner from "./WarningBanner";

interface Props {
  result: AnalysisResult;
  ocrResult: OcrResult;
  onReanalyze: (edited: OcrResult) => Promise<void>;
  isAnalyzing: boolean;
}

const riskStyle: Record<string, { text: string; color: string; bg: string; border: string; icon: string }> = {
  high: { text: "建议谨慎购买", color: "var(--danger-700)", bg: "var(--danger-50)", border: "var(--danger-500)", icon: "⚠️" },
  medium: { text: "需留意", color: "#e65100", bg: "var(--warning-50)", border: "var(--warning-500)", icon: "⚡" },
  low: { text: "基本合规", color: "#1565c0", bg: "#e3f2fd", border: "#2196f3", icon: "👀" },
  none: { text: "未发现问题", color: "var(--success-500)", bg: "var(--success-50)", border: "var(--success-500)", icon: "✅" },
};

export default function ResultCard({ result, ocrResult, onReanalyze, isAnalyzing }: Props) {
  const risk = riskStyle[result.riskLevel] || riskStyle.none;
  const hasWarnings = result.warnings.length > 0;
  const [editing, setEditing] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [edit, setEdit] = useState<OcrResult>({ ...ocrResult });

  async function handleReanalyze() { await onReanalyze(edit); setEditing(false); }

  return (
    <div className="card fade-in" style={{ padding: 0, overflow: "hidden" }}>
      {/* 1. Conclusion Banner */}
      <div style={{ padding: "20px 16px", background: risk.bg, borderBottom: `3px solid ${risk.border}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>{risk.icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: risk.color, marginBottom: 4 }}>{risk.text}</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)" }}>{result.summary}</p>
        </div>
      </div>

      {/* 2. Identified Info Bar */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <button onClick={() => setDetailOpen(!detailOpen)}
          style={{ width: "100%", padding: "10px 16px", background: "none", display: "flex", alignItems: "center",
            justifyContent: "space-between", fontSize: 13, color: "var(--text-secondary)", minHeight: "auto", borderRadius: 0 }}>
          <span>识别：{ocrResult.productName || "—"} | 配料：{ocrResult.ingredientsText?.slice(0, 30) || "—"}…</span>
          <span style={{ fontSize: 11, color: "var(--text-hint)" }}>{detailOpen ? "收起 ▲" : "详情 ▼"}</span>
        </button>
        {detailOpen && (
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ marginBottom: 8, textAlign: "right" }}>
              <button onClick={() => { setEdit({ ...ocrResult }); setEditing(!editing); }}
                style={{ fontSize: 12, color: "var(--primary-500)", background: "var(--primary-50)", padding: "4px 10px", borderRadius: 4, fontWeight: 600, minHeight: "auto" }}>
                {editing ? "取消修改" : "修改"}
              </button>
            </div>
            {!editing ? (
              <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-secondary)" }}>
                <p><strong>品牌：</strong>{ocrResult.brand || "—"}</p>
                <p><strong>品名：</strong>{ocrResult.productName || "—"}</p>
                <p><strong>宣传语：</strong>{ocrResult.claimsText || "—"}</p>
                <p><strong>配料：</strong>{ocrResult.ingredientsText || "—"}</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={edit.brand} onChange={e => setEdit({ ...edit, brand: e.target.value })} placeholder="品牌" style={{ fontSize: 13, padding: "6px 10px" }} />
                <input value={edit.productName} onChange={e => setEdit({ ...edit, productName: e.target.value })} placeholder="商品名称" style={{ fontSize: 13, padding: "6px 10px" }} />
                <textarea value={edit.claimsText} onChange={e => setEdit({ ...edit, claimsText: e.target.value })} placeholder="包装宣传语" style={{ fontSize: 13, minHeight: 40 }} />
                <p className="text-hint" style={{ marginTop: -4 }}>封面宣传语光靠配料表照片可能识别不到，手动补上分析更准</p>
                <textarea value={edit.ingredientsText} onChange={e => setEdit({ ...edit, ingredientsText: e.target.value })} placeholder="配料表" style={{ fontSize: 13, minHeight: 50 }} />
                <button className="btn-primary" onClick={handleReanalyze} disabled={isAnalyzing} style={{ fontSize: 13, padding: "8px" }}>
                  {isAnalyzing ? "分析中…" : "重新分析"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Warning Details */}
      <div style={{ padding: "16px" }}>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
          商品类型：<strong>{result.productType}</strong>
          {result.confidence === "low" && <span style={{ color: "var(--text-hint)" }}>（置信度较低）</span>}
        </p>
        {hasWarnings ? <WarningBanner warnings={result.warnings} />
          : <p style={{ fontSize: 14, color: "var(--success-500)", fontWeight: 600, textAlign: "center", padding: "12px 0" }}>配料表各项与宣传内容一致</p>}
      </div>
    </div>
  );
}
```

## 20. src/app/api/ocr/route.ts
```typescript
import { NextResponse } from "next/server";
import { recognizeText } from "@/lib/baidu-ocr";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageDataUrl } = body;
    if (!imageDataUrl) return NextResponse.json({ error: "未提供图片" }, { status: 400 });

    let text: string;
    try { text = await recognizeText(imageDataUrl); }
    catch (err) {
      console.error("Baidu OCR failed:", err);
      return NextResponse.json({ error: "文字识别失败，请确认图片清晰后重试" }, { status: 500 });
    }

    if (!text.trim()) return NextResponse.json({ error: "未识别到文字，请拍摄清晰的配料表照片" }, { status: 422 });
    return NextResponse.json({ text });
  } catch {
    return NextResponse.json({ error: "OCR识别失败" }, { status: 500 });
  }
}
```

## 21. src/app/api/parse-ocr/route.ts
```typescript
import { NextResponse } from "next/server";
import { parseOcrText } from "@/lib/deepseek";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText } = body;
    if (!rawText?.trim()) return NextResponse.json({ error: "OCR未识别到文字，请重新拍照" }, { status: 400 });
    const result = await parseOcrText(rawText.trim());
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "文字解析失败，请手动输入商品信息" }, { status: 500 });
  }
}
```

## 22. src/app/api/analyze/route.ts
```typescript
import { NextResponse } from "next/server";
import { callDeepSeek } from "@/lib/deepseek";
import { mockAnalyze } from "@/lib/mock-data";
import type { OcrResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productName, ingredientsText, claimsText, brand } = body;
    if (!productName || !ingredientsText) return NextResponse.json({ error: "请至少提供商品名和配料表" }, { status: 400 });

    const ocrResult: OcrResult = { brand: brand || "", productName, claimsText: claimsText || "", ingredientsText };
    let result;
    try { result = await callDeepSeek(ocrResult); }
    catch (aiErr) { console.warn("DeepSeek unavailable, using mock:", aiErr); result = mockAnalyze(ocrResult); }
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "AI分析失败，请重试" }, { status: 500 });
  }
}
```

## 23. public/manifest.json
```json
{
  "name": "食话实说 - 食品配料表分析工具",
  "short_name": "食话实说",
  "description": "拍照识配料，一秒看穿营销话术",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#1976d2",
  "background_color": "#e3f2fd",
  "lang": "zh-CN",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

## 24. public/sw.js
```javascript
const CACHE = "shs-v2";
const PRECACHE = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => new Response(JSON.stringify({ error: "当前无网络连接" }), { status: 503, headers: { "Content-Type": "application/json" } }))
    );
    return;
  }

  if (/\.(?:js|css|png|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(event.request, clone));
        return res;
      }))
    );
    return;
  }

  event.respondWith(
    fetch(event.request).then((res) => {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(event.request, clone));
      return res;
    }).catch(() => caches.match(event.request))
  );
});
```

## 技术栈总结
- **前端**: Next.js 16 + TypeScript + React 19 + 纯CSS（无第三方UI库）
- **OCR**: 百度OCR API (accurate_basic, CHN_ENG)
- **AI**: DeepSeek API (deepseek-chat, JSON结构化输出)
- **存储**: localStorage（扫描历史，最多10条）
- **PWA**: manifest.json + Service Worker（离线访问、添加到主屏幕）
- **部署**: Vercel + EdgeOne Pages（双平台）
