"use client";

import { useRef, useState } from "react";

interface Props {
  onImageReady: (dataUrl: string) => void;
  label: string;
  hint?: string;
}

export default function CameraCapture({ onImageReady, label, hint }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  async function compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1920;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = URL.createObjectURL(file);
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    const dataUrl = await compressImage(file);
    setCompressing(false);
    onImageReady(dataUrl);
  }

  // Check if running in WeChat browser
  const isWechat =
    typeof navigator !== "undefined" &&
    /MicroMessenger/i.test(navigator.userAgent);

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={compressing}
        style={{
          width: "100%",
          minHeight: 120,
          border: "2px dashed var(--primary-200)",
          borderRadius: "var(--radius)",
          background: "var(--primary-50)",
          color: "var(--primary-700)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 15,
        }}
      >
        <span style={{ fontSize: 32 }}>
          {compressing ? "⏳" : "📸"}
        </span>
        <span style={{ fontWeight: 600 }}>
          {compressing ? "处理中..." : label}
        </span>
        {hint && !compressing && (
          <span style={{ fontSize: 13, color: "var(--text-hint)" }}>
            {hint}
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={isWechat ? undefined : "environment"}
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}
