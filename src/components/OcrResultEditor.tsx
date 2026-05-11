"use client";

import type { OcrResult } from "@/lib/types";

interface Props {
  ocrResult: OcrResult;
  onChange: (result: OcrResult) => void;
  onConfirm: () => void;
}

export default function OcrResultEditor({ ocrResult, onChange, onConfirm }: Props) {
  return (
    <div className="card fade-in" style={{ marginBottom: 16 }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          marginBottom: 4,
          color: "var(--primary-700)",
        }}
      >
        📋 确认商品信息
      </h3>
      {!ocrResult.productName && !ocrResult.ingredientsText && (
        <div
          style={{
            background: "#fff8e1",
            border: "1px solid #ffe082",
            borderRadius: "var(--radius-sm)",
            padding: "10px 14px",
            marginBottom: 12,
            fontSize: 13,
            color: "#f57f17",
            lineHeight: 1.5,
          }}
        >
          💡 当前为演示模式，请在下方手动填写商品信息后点击"开始分析"
        </div>
      )}
      <p className="text-hint" style={{ marginBottom: 16 }}>
        请核对或手动填写以下信息，完成后点击"开始分析"
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label style={labelStyle}>品牌</label>
          <input
            type="text"
            value={ocrResult.brand}
            onChange={(e) => onChange({ ...ocrResult, brand: e.target.value })}
            placeholder="如未识别可手动填写"
          />
        </div>
        <div>
          <label style={labelStyle}>商品名称 *</label>
          <input
            type="text"
            value={ocrResult.productName}
            onChange={(e) =>
              onChange({ ...ocrResult, productName: e.target.value })
            }
          />
        </div>
        <div>
          <label style={labelStyle}>包装宣传语</label>
          <textarea
            value={ocrResult.claimsText}
            onChange={(e) =>
              onChange({ ...ocrResult, claimsText: e.target.value })
            }
            placeholder="如：100%纯天然、无糖、无添加等"
          />
        </div>
        <div>
          <label style={labelStyle}>配料表 *</label>
          <textarea
            value={ocrResult.ingredientsText}
            onChange={(e) =>
              onChange({ ...ocrResult, ingredientsText: e.target.value })
            }
          />
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={onConfirm}
        disabled={!ocrResult.productName.trim() || !ocrResult.ingredientsText.trim()}
        style={{ marginTop: 20 }}
      >
        开始分析
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 4,
  color: "var(--text-primary)",
};
