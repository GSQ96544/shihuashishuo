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
import InstallBanner from "@/components/InstallBanner";
import UserProfileSelector from "@/components/UserProfileSelector";
import type { UserProfile } from "@/lib/types";

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
    profile,
    setProfile,
    setMode,
    setImage,
    setManualProductName,
    setManualIngredients,
    runOcr,
    submitManual,
    reanalyze,
    resetAll,
  } = useAnalysis();

  const { mode, step, image, ocrResult, analysisResult, manualProductName, manualIngredients } = state;
  const { items: history, add, clear: clearHistory } = useHistory();

  // Track whether we've saved the current analysis to history
  const savedIdRef = useRef<string | null>(null);

  // Save to history when analysis completes
  useEffect(() => {
    if (step === "done" && ocrResult && analysisResult) {
      const id = ocrResult.productName + ocrResult.ingredientsText + analysisResult.riskLevel;
      if (savedIdRef.current !== id) {
        savedIdRef.current = id;
        add(ocrResult, analysisResult);
      }
    }
  }, [step, ocrResult, analysisResult, add]);

  // Viewing a history item
  const [viewingItem, setViewingItem] = useState<HistoryItem | null>(null);

  const currentStepNumber =
    step === "input" || step === "ocr-processing" ? 1
    : step === "analyzing" ? 2
    : 3;

  return (
    <div style={{ padding: "16px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ========== Header ========== */}
      <header style={{ textAlign: "center", padding: "20px 0 12px" }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "var(--primary-700)",
            letterSpacing: 2,
            marginBottom: 4,
          }}
        >
          🪞 食话实说
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          拍照识配料，一秒看穿营销话术
        </p>
      </header>

      {/* ========== Step Indicator ========== */}
      {step !== "error" && !viewingItem && (
        <StepIndicator currentStep={currentStepNumber} totalSteps={3} />
      )}

      {/* ========== Main Content ========== */}
      <main style={{ flex: 1 }}>
        {/* === Viewing history item === */}
        {viewingItem && (
          <div className="fade-in">
            <button
              className="btn-ghost"
              onClick={() => setViewingItem(null)}
              style={{ marginBottom: 12, fontSize: 14, color: "var(--primary-500)", fontWeight: 600 }}
            >
              ← 返回最近扫描
            </button>
            <ResultCard
              result={viewingItem.analysisResult}
              ocrResult={viewingItem.ocrResult}
              onReanalyze={async () => {}}
              isAnalyzing={false}
            />
          </div>
        )}

        {/* === STEP: input / ocr-processing === */}
        {!viewingItem && (step === "input" || step === "ocr-processing") && (
          <div className="fade-in">
            <InputSelector mode={mode} onModeChange={setMode} />
            <UserProfileSelector profile={profile}
              onChange={(p: UserProfile) => setProfile(p)} />

            {mode === "camera" && (
              <>
                {!image ? (
                  <CameraCapture
                    onImageReady={setImage}
                    label="点击拍摄配料表"
                    hint="拍一张配料表即可，AI会自动识别品名和配料"
                  />
                ) : (
                  <ImagePreview
                    src={image}
                    label="配料表照片"
                    onRetake={() => {
                      setImage("");
                      setTimeout(() => setImage(""), 0);
                    }}
                  />
                )}

                {image && (
                  <button
                    className="btn-primary"
                    onClick={runOcr}
                    style={{ marginTop: 8 }}
                  >
                    开始分析 →
                  </button>
                )}

                {step === "ocr-processing" && (
                  <LoadingOverlay
                    title="正在识别图片文字..."
                    subtitle="OCR提取 + AI智能解析商品信息"
                  />
                )}
              </>
            )}

            {mode === "manual" && (
              <>
                <ManualInput
                  productName={manualProductName}
                  ingredients={manualIngredients}
                  onProductNameChange={setManualProductName}
                  onIngredientsChange={setManualIngredients}
                />
                <button
                  className="btn-primary"
                  onClick={submitManual}
                  disabled={!manualProductName.trim() || !manualIngredients.trim()}
                  style={{ marginTop: 16 }}
                >
                  开始分析 →
                </button>
              </>
            )}
          </div>
        )}

        {/* === STEP: analyzing === */}
        {!viewingItem && step === "analyzing" && (
          <LoadingOverlay
            title="AI正在分析配料表..."
            subtitle="比对商品宣传与配料成分"
          />
        )}

        {/* === STEP: done === */}
        {!viewingItem && step === "done" && analysisResult && ocrResult && (
          <div className="fade-in">
            <ResultCard
              result={analysisResult}
              ocrResult={ocrResult}
              onReanalyze={reanalyze}
              isAnalyzing={false}
            />

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                className="btn-outline"
                onClick={resetAll}
                style={{ flex: 1 }}
              >
                重新检测
              </button>
            </div>
          </div>
        )}

        {/* === STEP: error === */}
        {!viewingItem && step === "error" && (
          <div className="card fade-in" style={{ textAlign: "center", padding: "32px 20px" }}>
            <span style={{ fontSize: 40 }}>😞</span>
            <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>
              {state.error || "识别失败"}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                className="btn-outline"
                onClick={resetAll}
                style={{ flex: 1 }}
              >
                重新拍照
              </button>
              <button
                className="btn-primary"
                onClick={() => setMode("manual")}
                style={{ flex: 1 }}
              >
                手动输入
              </button>
            </div>
          </div>
        )}

        {/* ===== History Section ===== */}
        {!viewingItem && history.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                🕐 最近扫描
              </h2>
              <button
                className="btn-ghost"
                onClick={clearHistory}
                style={{ fontSize: 12, color: "var(--text-hint)", minHeight: "auto" }}
              >
                清空
              </button>
            </div>

            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => setViewingItem(item)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-sm)",
                  padding: "12px 14px",
                  marginBottom: 8,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minHeight: "auto",
                }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>
                  {riskIcon[item.riskLevel] || "⚪"}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                    {item.productName}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--text-hint)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.summary}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-hint)", flexShrink: 0 }}>
                  {timeAgo(item.timestamp)}
                </span>
              </button>
            ))}
          </section>
        )}
      </main>

      {/* ========== Footer ========== */}
      <footer
        style={{
          textAlign: "center",
          padding: "24px 16px",
          marginTop: "auto",
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: "var(--text-hint)",
            lineHeight: 1.6,
          }}
        >
          提示：本工具仅提供信息参考，分析结果由AI生成，
          <br />
          不构成商品鉴定或法律定性。购买决策请结合多方面信息判断。
        </p>
      </footer>

      <InstallBanner />
    </div>
  );
}
