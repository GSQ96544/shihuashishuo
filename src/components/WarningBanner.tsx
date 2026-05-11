"use client";

import type { Warning } from "@/lib/types";

interface Props {
  warnings: Warning[];
}

export default function WarningBanner({ warnings }: Props) {
  if (warnings.length === 0) return null;

  return (
    <div
      style={{
        background: "var(--danger-50)",
        border: "1px solid var(--danger-100)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "var(--danger-500)",
          color: "#fff",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 20 }}>⚠️</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>
          发现 {warnings.length} 项疑似问题
        </span>
      </div>

      <div style={{ padding: "12px 16px" }}>
        {warnings.map((w, i) => (
          <div
            key={i}
            style={{
              padding: "12px 0",
              borderBottom:
                i < warnings.length - 1 ? "1px solid var(--danger-100)" : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    w.severity === "high"
                      ? "var(--danger-500)"
                      : "var(--warning-500)",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--danger-700)",
                  fontSize: 15,
                }}
              >
                {w.ingredient}
              </span>
              {w.severity === "high" && (
                <span
                  style={{
                    fontSize: 11,
                    background: "var(--danger-500)",
                    color: "#fff",
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  严重
                </span>
              )}
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, marginLeft: 16 }}>
              {w.issue}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
