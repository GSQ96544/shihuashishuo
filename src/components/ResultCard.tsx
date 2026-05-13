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

const riskLabel: Record<string, { text: string; color: string; bg: string }> = {
  high: { text: "高风险", color: "var(--danger-500)", bg: "var(--danger-50)" },
  medium: { text: "中风险", color: "var(--warning-500)", bg: "var(--warning-50)" },
  low: { text: "低风险", color: "#2196f3", bg: "#e3f2fd" },
  none: { text: "未发现问题", color: "var(--success-500)", bg: "var(--success-50)" },
};

export default function ResultCard({ result, ocrResult, onReanalyze, isAnalyzing }: Props) {
  const risk = riskLabel[result.riskLevel] || riskLabel.none;
  const hasWarnings = result.warnings.length > 0;
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState<OcrResult>({ ...ocrResult });

  async function handleReanalyze() {
    await onReanalyze(edit);
    setEditing(false);
  }

  return (
    <div className="card fade-in">
      {/* === Identified Info Bar === */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          marginBottom: 16,
          overflow: "hidden",
        }}
      >
        {/* Collapsed view */}
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, color: "var(--text-hint)", marginBottom: 4 }}>
              识别信息
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
              {ocrResult.productName || "未识别到品名"}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              配料：{ocrResult.ingredientsText || "—"}
            </p>
          </div>
          <button
            className="btn-ghost"
            onClick={() => {
              setEdit({ ...ocrResult });
              setEditing(!editing);
            }}
            style={{
              fontSize: 13,
              color: "var(--primary-500)",
              fontWeight: 600,
              flexShrink: 0,
              padding: "6px 12px",
            }}
          >
            {editing ? "取消" : "修改"}
          </button>
        </div>

        {/* Expanded edit panel */}
        {editing && (
          <div
            style={{
              padding: "0 16px 16px",
              borderTop: "1px solid var(--border)",
              paddingTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div>
              <label style={labelStyle}>品牌</label>
              <input
                type="text"
                value={edit.brand}
                onChange={(e) => setEdit({ ...edit, brand: e.target.value })}
                style={{ fontSize: 14, padding: "8px 12px" }}
              />
            </div>
            <div>
              <label style={labelStyle}>商品名称</label>
              <input
                type="text"
                value={edit.productName}
                onChange={(e) => setEdit({ ...edit, productName: e.target.value })}
                style={{ fontSize: 14, padding: "8px 12px" }}
              />
            </div>
            <div>
              <label style={labelStyle}>宣传语</label>
              <textarea
                value={edit.claimsText}
                onChange={(e) => setEdit({ ...edit, claimsText: e.target.value })}
                style={{ fontSize: 14, minHeight: 50 }}
              />
            </div>
            <div>
              <label style={labelStyle}>配料表</label>
              <textarea
                value={edit.ingredientsText}
                onChange={(e) => setEdit({ ...edit, ingredientsText: e.target.value })}
                style={{ fontSize: 14, minHeight: 60 }}
              />
            </div>
            <button
              className="btn-primary"
              onClick={handleReanalyze}
              disabled={isAnalyzing}
              style={{ fontSize: 14, padding: "10px" }}
            >
              {isAnalyzing ? "分析中..." : "重新分析"}
            </button>
          </div>
        )}
      </div>

      {/* === Result === */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700 }}>分析结果</h3>
        <span
          style={{
            padding: "4px 12px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
            background: risk.bg,
            color: risk.color,
          }}
        >
          {risk.text}
        </span>
      </div>

      <div
        style={{
          background: "var(--primary-50)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 16px",
          marginBottom: 16,
        }}
      >
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          商品类型：<strong>{result.productType}</strong>
        </p>
      </div>

      {hasWarnings ? (
        <WarningBanner warnings={result.warnings} />
      ) : (
        <div
          style={{
            background: "var(--success-50)",
            borderRadius: "var(--radius-sm)",
            padding: "20px 16px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 32 }}>✅</span>
          <p style={{ marginTop: 8, fontWeight: 600, color: "var(--success-500)" }}>
            配料表与宣传一致，未发现明显问题
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          padding: "16px",
          background: hasWarnings ? "var(--warning-50)" : "var(--primary-50)",
          borderRadius: "var(--radius-sm)",
          borderLeft: `4px solid ${hasWarnings ? "var(--danger-500)" : "var(--success-500)"}`,
        }}
      >
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>
          {hasWarnings ? "💡 食话说" : "📋 小结"}
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>
          {result.summary}
        </p>
      </div>

      <p className="text-hint" style={{ marginTop: 12, textAlign: "center" }}>
        分析置信度：{result.confidence === "high" ? "高" : result.confidence === "medium" ? "中" : "低"}
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 2,
  color: "var(--text-secondary)",
};
