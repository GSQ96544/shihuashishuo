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

  async function handleReanalyze() {
    await onReanalyze(edit);
    setEditing(false);
  }

  return (
    <div className="card fade-in" style={{ padding: 0, overflow: "hidden" }}>
      {/* ===== 1. Conclusion Banner — most prominent ===== */}
      <div
        style={{
          padding: "20px 16px",
          background: risk.bg,
          borderBottom: `3px solid ${risk.border}`,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 28, lineHeight: 1 }}>{risk.icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: risk.color, marginBottom: 4 }}>
            {risk.text}
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-primary)" }}>
            {result.summary}
          </p>
        </div>
      </div>

      {/* ===== 2. Identified Info Bar (compact, collapsible) ===== */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          onClick={() => setDetailOpen(!detailOpen)}
          style={{
            width: "100%",
            padding: "10px 16px",
            background: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            color: "var(--text-secondary)",
            minHeight: "auto",
            borderRadius: 0,
          }}
        >
          <span>
            识别：{ocrResult.productName || "—"} | 配料：{ocrResult.ingredientsText?.slice(0, 30) || "—"}…
          </span>
          <span style={{ fontSize: 11, color: "var(--text-hint)" }}>
            {detailOpen ? "收起 ▲" : "详情 ▼"}
          </span>
        </button>

        {detailOpen && (
          <div style={{ padding: "0 16px 16px" }}>
            {/* Edit toggle */}
            <div style={{ marginBottom: 8, textAlign: "right" }}>
              <button
                onClick={() => {
                  setEdit({ ...ocrResult });
                  setEditing(!editing);
                }}
                style={{
                  fontSize: 12,
                  color: "var(--primary-500)",
                  background: "var(--primary-50)",
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontWeight: 600,
                  minHeight: "auto",
                }}
              >
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

      {/* ===== 3. Warning details ===== */}
      <div style={{ padding: "16px" }}>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
          商品类型：<strong>{result.productType}</strong>
          {result.confidence === "low" && <span style={{ color: "var(--text-hint)" }}>（置信度较低）</span>}
        </p>

        {hasWarnings ? (
          <WarningBanner warnings={result.warnings} />
        ) : (
          <p style={{ fontSize: 14, color: "var(--success-500)", fontWeight: 600, textAlign: "center", padding: "12px 0" }}>
            配料表各项与宣传内容一致
          </p>
        )}
      </div>
    </div>
  );
}
