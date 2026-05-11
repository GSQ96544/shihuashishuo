"use client";

export default function LoadingOverlay() {
  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          border: "4px solid var(--primary-100)",
          borderTopColor: "var(--primary-500)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
          AI正在分析配料表...
        </p>
        <p className="text-hint">正在比对商品宣传与配料成分</p>
      </div>
    </div>
  );
}
