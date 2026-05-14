"use client";

import type { UserProfile } from "@/lib/types";

interface Props {
  selected: UserProfile[];
  onChange: (p: UserProfile[]) => void;
}

const profiles: { key: UserProfile; label: string; emoji: string }[] = [
  { key: "pregnant", label: "孕妇", emoji: "🤰" },
  { key: "breastfeeding", label: "哺乳期", emoji: "🤱" },
  { key: "infant", label: "婴幼儿", emoji: "👶" },
  { key: "child", label: "儿童", emoji: "🧒" },
  { key: "elderly", label: "老人", emoji: "👴" },
  { key: "diabetic", label: "糖尿病", emoji: "💉" },
  { key: "hypertension", label: "高血压", emoji: "🫀" },
  { key: "fitness", label: "健身减脂", emoji: "💪" },
];

export default function UserProfileSelector({ selected, onChange }: Props) {
  function toggle(key: UserProfile) {
    if (selected.includes(key)) {
      onChange(selected.filter((s) => s !== key));
    } else {
      onChange([...selected, key]);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 13, color: "var(--text-hint)", marginBottom: 8 }}>
        选择家人的饮食需求（可多选）
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {profiles.map((p) => {
          const active = selected.includes(p.key);
          return (
            <button
              key={p.key}
              onClick={() => toggle(p.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "5px 10px",
                borderRadius: 16,
                fontSize: 12,
                fontWeight: active ? 700 : 400,
                border: active ? "2px solid var(--primary-500)" : "1px solid var(--border)",
                background: active ? "var(--primary-50)" : "var(--bg-card)",
                color: active ? "var(--primary-700)" : "var(--text-secondary)",
                minHeight: "auto",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: 13 }}>{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
