"use client";

import { useState } from "react";

interface Props {
  url: string;
  onUrlChange: (v: string) => void;
  onFetch: (text: string) => Promise<void>;
}

export default function UrlInput({ url, onUrlChange, onFetch }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFetch() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
      } else {
        setLoading(true); // Stay loading during parse
        await onFetch(data.text || "未能提取到内容，请尝试手动输入");
        setLoading(false);
      }
    } catch {
      setError("网络请求失败，请检查链接或切换手动输入");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 6,
            fontSize: 15,
          }}
        >
          商品页面链接
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="粘贴淘宝/京东等商品页链接"
          inputMode="url"
        />
        <p className="text-hint" style={{ marginTop: 6 }}>
          支持淘宝、京东等主流电商平台的商品页面
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "var(--danger-50)",
            color: "var(--danger-500)",
            padding: "12px 16px",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleFetch}
        disabled={loading || !url.trim()}
      >
        {loading ? "正在抓取..." : "获取商品信息"}
      </button>
    </div>
  );
}
