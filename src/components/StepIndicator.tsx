"use client";

interface Props {
  currentStep: number;
  totalSteps: number;
}

const stepLabels = ["输入信息", "确认内容", "查看结果"];

export default function StepIndicator({ currentStep, totalSteps }: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        marginBottom: 24,
        padding: "0 20px",
      }}
    >
      {stepLabels.map((label, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            flex: i < stepLabels.length - 1 ? 1 : 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  i + 1 < currentStep
                    ? "var(--success-500)"
                    : i + 1 === currentStep
                      ? "var(--primary-500)"
                      : "var(--border)",
                color:
                  i + 1 <= currentStep ? "#fff" : "var(--text-hint)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 700,
                transition: "background 0.3s",
              }}
            >
              {i + 1 < currentStep ? "✓" : i + 1}
            </div>
            <span
              style={{
                fontSize: 12,
                marginTop: 4,
                color:
                  i + 1 === currentStep
                    ? "var(--primary-500)"
                    : "var(--text-hint)",
                fontWeight: i + 1 === currentStep ? 600 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
          </div>
          {i < stepLabels.length - 1 && (
            <div
              style={{
                flex: 1,
                height: 2,
                background:
                  i + 1 < currentStep
                    ? "var(--success-500)"
                    : "var(--border)",
                margin: "0 8px",
                marginBottom: 20,
                transition: "background 0.3s",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
