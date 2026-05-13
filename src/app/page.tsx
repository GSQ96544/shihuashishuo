"use client";

import { useAnalysis } from "@/hooks/useAnalysis";
import InputSelector from "@/components/InputSelector";
import CameraCapture from "@/components/CameraCapture";
import ManualInput from "@/components/ManualInput";
import ImagePreview from "@/components/ImagePreview";
import StepIndicator from "@/components/StepIndicator";
import LoadingOverlay from "@/components/LoadingOverlay";
import ResultCard from "@/components/ResultCard";

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
      {step !== "error" && (
        <StepIndicator currentStep={currentStepNumber} totalSteps={3} />
      )}

      {/* ========== Main Content ========== */}
      <main style={{ flex: 1 }}>
        {/* === STEP: input / ocr-processing === */}
        {(step === "input" || step === "ocr-processing") && (
          <div className="fade-in">
            <InputSelector mode={mode} onModeChange={setMode} />

            {/* Camera Mode */}
            {mode === "camera" && (
              <>
                {!frontImage ? (
                  <CameraCapture
                    onImageReady={setFrontImage}
                    label="点击拍摄配料表"
                    hint="拍一张配料表即可，AI会自动识别品名和配料"
                  />
                ) : (
                  <ImagePreview
                    src={frontImage}
                    label="配料表照片"
                    onRetake={() => {
                      setFrontImage("");
                      setTimeout(() => setFrontImage(""), 0);
                    }}
                  />
                )}

                {frontImage && (
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

            {/* Manual Mode */}
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
        {step === "analyzing" && (
          <LoadingOverlay
            title="AI正在分析配料表..."
            subtitle="比对商品宣传与配料成分"
          />
        )}

        {/* === STEP: done === */}
        {step === "done" && analysisResult && ocrResult && (
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
        {step === "error" && (
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
    </div>
  );
}
