import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "食话实说 - 拍照识配料，一秒看穿营销话术",
  description:
    "拍照或手动输入食品配料表，自动比对商品宣传语，发现虚假宣传立即预警。消费者权益保护工具。",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "食话实说",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
      </body>
    </html>
  );
}
