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

  const BAIDU_MAX_BYTES = 4 * 1024 * 1024; // Baidu OCR base64 limit

  // Read file directly as base64 — no Canvas quality loss
  function readAsDataURL(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  // Only compress if exceeds Baidu's 4MB limit
  async function prepareImage(file: File): Promise<string> {
    const direct = await readAsDataURL(file);
    if (direct.length <= BAIDU_MAX_BYTES) {
      return direct; // Original quality, no loss
    }

    // File too large — gentle resize until fits
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;

        // Step down dimensions until base64 fits under 4MB
        const quality = 0.92;
        let dataUrl = "";
        while (w >= 1024) {
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, w, h);
          dataUrl = canvas.toDataURL("image/jpeg", quality);
          if (dataUrl.length <= BAIDU_MAX_BYTES) break;
          // Reduce by 15% each step
          w = Math.round(w * 0.85);
          h = Math.round(h * 0.85);
        }
        resolve(dataUrl);
      };
      img.src = direct;
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    const dataUrl = await prepareImage(file);
    setCompressing(false);
    onImageReady(dataUrl);
  }

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
        onChange={handleFile}
        style={{ display: "none" }}
      />
    </div>
  );
}
