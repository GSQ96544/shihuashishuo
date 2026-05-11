"use client";

interface Props {
  src: string;
  onRetake: () => void;
  label: string;
}

export default function ImagePreview({ src, onRetake, label }: Props) {
  return (
    <div
      style={{
        marginBottom: 16,
        borderRadius: "var(--radius)",
        overflow: "hidden",
        boxShadow: "var(--shadow)",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          background: "var(--primary-50)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
        <button className="btn-ghost" onClick={onRetake} style={{ fontSize: 14, color: "var(--primary-500)" }}>
          重拍
        </button>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={label}
        style={{
          width: "100%",
          display: "block",
          maxHeight: 300,
          objectFit: "contain",
          background: "#f5f5f5",
        }}
      />
    </div>
  );
}
