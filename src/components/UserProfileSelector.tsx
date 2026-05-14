"use client";

import type { UserProfile } from "@/lib/types";

interface Props {
  profile: UserProfile;
  onChange: (p: UserProfile) => void;
}

const profiles: { key: UserProfile; label: string; emoji: string }[] = [
  { key: "default", label: "普通", emoji: "🙂" },
  { key: "pregnant", label: "孕妇", emoji: "🤰" },
  { key: "breastfeeding", label: "哺乳期", emoji: "🤱" },
  { key: "infant", label: "婴幼儿", emoji: "👶" },
  { key: "child", label: "儿童", emoji: "🧒" },
  { key: "elderly", label: "老人", emoji: "👴" },
  { key: "diabetic", label: "糖尿病", emoji: "💉" },
  { key: "hypertension", label: "高血压", emoji: "🫀" },
  { key: "fitness", label: "健身减脂", emoji: "💪" },
];

export default function UserProfileSelector({ profile, onChange }: Props) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, color: "var(--text-hint)", marginBottom: 8 }}>
        选择人群类型，分析更精准
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {profiles.map((p) => (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 16,
              fontSize: 12,
              fontWeight: profile === p.key ? 700 : 400,
              border: profile === p.key
                ? "2px solid var(--primary-500)"
                : "1px solid var(--border)",
              background: profile === p.key
                ? "var(--primary-50)"
                : "var(--bg-card)",
              color: profile === p.key
                ? "var(--primary-700)"
                : "var(--text-secondary)",
              minHeight: "auto",
              lineHeight: 1.4,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 13 }}>{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
