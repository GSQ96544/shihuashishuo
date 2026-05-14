"use client";

import { useState, useEffect } from "react";

export default function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari, not in standalone mode
    if (typeof window === "undefined") return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = "standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone;
    const isSafari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|mercury/.test(navigator.userAgent);

    if (isIOS && isSafari && !isStandalone) {
      // Don't show again for 7 days once dismissed
      const dismissed = localStorage.getItem("install_banner_dismissed");
      if (!dismissed || Date.now() - parseInt(dismissed) > 7 * 86400000) {
        setShow(true);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <div
      className="fade-in"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(25, 118, 210, 0.97)",
        color: "#fff",
        padding: "14px 16px",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <button
        onClick={() => {
          setShow(false);
          localStorage.setItem("install_banner_dismissed", Date.now().toString());
        }}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: 20,
          padding: 4,
          minHeight: "auto",
          minWidth: "auto",
          opacity: 0.7,
        }}
      >
        ✕
      </button>
      <div style={{ flex: 1, fontSize: 13, lineHeight: 1.5 }}>
        <strong>添加到主屏幕</strong>，像 App 一样使用
        <br />
        点下方 <span style={{ fontSize: 16 }}>⎋</span> 分享 →「添加到主屏幕」
      </div>
      <span style={{ fontSize: 12, opacity: 0.6 }}>⬆</span>
    </div>
  );
}
