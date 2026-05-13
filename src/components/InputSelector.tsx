"use client";

import type { InputMode } from "@/lib/types";

interface Props {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
}

const tabs: { key: InputMode; label: string; icon: string }[] = [
  { key: "camera", label: "拍照识别", icon: "📷" },
  { key: "manual", label: "手动输入", icon: "✏️" },
];

export default function InputSelector({ mode, onModeChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--bg-card)",
        borderRadius: "var(--radius)",
        padding: 4,
        boxShadow: "var(--shadow)",
        marginBottom: 20,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onModeChange(tab.key)}
          style={{
            flex: 1,
            padding: "10px 4px",
            background: mode === tab.key ? "var(--primary-500)" : "transparent",
            color: mode === tab.key ? "var(--text-white)" : "var(--text-secondary)",
            borderRadius: "calc(var(--radius) - 4px)",
            fontWeight: mode === tab.key ? 600 : 400,
            fontSize: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span style={{ fontSize: 18 }}>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
