"use client";

import { useAnalysis } from "@/hooks/useAnalysis";
import InputSelector from "@/components/InputSelector";
import CameraCapture from "@/components/CameraCapture";
import ManualInput from "@/components/ManualInput";
import ImagePreview from "@/components/ImagePreview";
import StepIndicator from "@/components/StepIndicator";
import OcrResultEditor from "@/components/OcrResultEditor";
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
    runAnalysis,
    resetAll,
    updateOcrResult,
  } = useAnalysis();

  const { mode, step, frontImage, labelImage, ocrResult, analysisResult, manualProductName, manualIngredients } = state;

  const currentStepNumber =
    step === "input" || step === "ocr-processing" ? 1
    : step === "ocr-review" ? 2
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
        {/* === STEP: input === */}
        {(step === "input" || step === "ocr-processing") && (
          <div className="fade-in">
            <InputSelector mode={mode} onModeChange={setMode} />

            {/* Camera Mode */}
            {mode === "camera" && (
              <>
                {!frontImage ? (
                  <CameraCapture
                    onImageReady={setFrontImage}
                    label="点击拍摄产品正面"
                    hint="拍摄包装正面，获取品牌、品名和宣传语"
                  />
                ) : (
                  <ImagePreview
                    src={frontImage}
                    label="产品正面照"
                    onRetake={() => {
                      setFrontImage("");
                      setTimeout(() => setFrontImage(""), 0);
                    }}
                  />
                )}

                {frontImage && !labelImage && (
                  <CameraCapture
                    onImageReady={setLabelImage}
                    label="点击拍摄配料表"
                    hint="拍摄包装背面的配料表部分"
                  />
                )}

                {labelImage && (
                  <ImagePreview
                    src={labelImage}
                    label="配料表照片"
                    onRetake={() => {
                      setLabelImage("");
                      setTimeout(() => setLabelImage(""), 0);
                    }}
                  />
                )}

                {frontImage && labelImage && (
                  <button
                    className="btn-primary"
                    onClick={runOcr}
                    style={{ marginTop: 8 }}
                  >
                    识别文字 →
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
                  下一步 →
                </button>
              </>
            )}

          </div>
        )}

        {/* === STEP: ocr-review === */}
        {step === "ocr-review" && ocrResult && (
          <div className="fade-in">
            {/* Show images if camera mode */}
            {mode === "camera" && frontImage && (
              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <ImagePreview
                    src={frontImage}
                    label="正面照"
                    onRetake={() => {
                      setFrontImage("");
                      setTimeout(() => setFrontImage(""), 0);
                    }}
                  />
                </div>
                {labelImage && (
                  <div style={{ flex: 1 }}>
                    <ImagePreview
                      src={labelImage}
                      label="配料表"
                      onRetake={() => {
                        setLabelImage("");
                        setTimeout(() => setLabelImage(""), 0);
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            <OcrResultEditor
              ocrResult={ocrResult}
              onChange={updateOcrResult}
              onConfirm={() => runAnalysis(ocrResult)}
            />
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
        {step === "done" && analysisResult && (
          <div className="fade-in">
            <ResultCard result={analysisResult} />

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
          <div
            className="card fade-in"
            style={{ textAlign: "center", padding: "32px 20px" }}
          >
            <span style={{ fontSize: 40 }}>😞</span>
            <p style={{ marginTop: 12, fontSize: 16, fontWeight: 600 }}>
              分析失败
            </p>
            <p className="text-hint" style={{ marginTop: 4 }}>
              {state.error || "网络异常，请稍后重试"}
            </p>
            <button
              className="btn-primary"
              onClick={resetAll}
              style={{ marginTop: 20 }}
            >
              重新开始
            </button>
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
