"use client";

import type { AnalysisResult } from "@/lib/types";
import WarningBanner from "./WarningBanner";

interface Props {
  result: AnalysisResult;
}

const riskLabel: Record<string, { text: string; color: string; bg: string }> = {
  high: { text: "高风险", color: "var(--danger-500)", bg: "var(--danger-50)" },
  medium: { text: "中风险", color: "var(--warning-500)", bg: "var(--warning-50)" },
  low: { text: "低风险", color: "#2196f3", bg: "#e3f2fd" },
  none: { text: "未发现问题", color: "var(--success-500)", bg: "var(--success-50)" },
};

export default function ResultCard({ result }: Props) {
  const risk = riskLabel[result.riskLevel] || riskLabel.none;
  const hasWarnings = result.warnings.length > 0;

  return (
    <div className="card fade-in">
      {/* Risk badge */}
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

      {/* Product info */}
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

      {/* Warnings */}
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

      {/* Summary */}
      <div
        style={{
          marginTop: 16,
          padding: "16px",
          background: hasWarnings ? "var(--warning-50)" : "var(--primary-50)",
          borderRadius: "var(--radius-sm)",
          borderLeft: `4px solid ${hasWarnings ? "var(--danger-500)" : "var(--success-500)"}`,
        }}
      >
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 4,
          }}
        >
          {hasWarnings ? "💡 食话说" : "📋 小结"}
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6 }}>
          {result.summary}
        </p>
      </div>

      {/* Confidence */}
      <p
        className="text-hint"
        style={{ marginTop: 12, textAlign: "center" }}
      >
        分析置信度：{result.confidence === "high" ? "高" : result.confidence === "medium" ? "中" : "低"}
      </p>
    </div>
  );
}
