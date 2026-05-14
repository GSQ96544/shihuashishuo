import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "食话实说 - 拍照识配料，一秒看穿营销话术",
  description:
    "拍照或手动输入食品配料表，自动比对商品宣传语，发现虚假宣传立即预警。消费者权益保护工具。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "食话实说",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "theme-color": "#1976d2",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1976d2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta
          name="format-detection"
          content="telephone=no,email=no,address=no"
        />
      </head>
      <body>
        <div className="app-container">{children}</div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
      function(r) { console.log('SW registered:', r.scope); },
      function(e) { console.log('SW failed:', e); }
    );
  });
}
`,
          }}
        />
      </body>
    </html>
  );
}
