# 技术规范 — 食话实说

## 技术栈

| 层级 | 选型 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.x |
| 语言 | TypeScript | 5.x |
| 前端 | React (Client Components) | 19.x |
| 样式 | 纯CSS (CSS Variables) | — |
| OCR | 百度OCR API (通用文字识别) | — |
| AI分析 | DeepSeek V4 Flash API | — |
| 部署 | Vercel (Hobby Plan) | — |
| 包管理 | npm | 11.x |

## 项目结构
```
商标骗局揭秘/
├── docs/               # 项目文档
│   ├── requirements.md  # 产品需求
│   ├── tech-spec.md     # 技术规范 (本文件)
│   ├── design-spec.md   # 设计规范
│   └── dev-plan.md      # 开发步骤
├── logs/               # 开发日志 (每日自动记录)
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── layout.tsx  # 根布局
│   │   ├── globals.css # 全局样式
│   │   ├── page.tsx    # 主页面
│   │   └── api/        # API路由
│   ├── components/     # UI组件
│   ├── hooks/          # 自定义Hook
│   └── lib/            # 工具库 & 类型定义
├── public/             # 静态资源
├── .env.example        # 环境变量模板
└── package.json
```

## 开发模式
- **当前阶段：模拟数据开发** — 所有API返回mock数据，无需配置任何第三方服务
- **下一阶段：接入真实API** — 配置百度OCR和DeepSeek API Key

## API路由

### POST /api/ocr
接收base64图片，返回OCR识别的文字。当前为mock模式。

### POST /api/analyze
接收商品名+配料表，返回AI比对结果。当前为mock模式。

### POST /api/fetch-url
接收URL，返回抓取的页面文字。当前为mock模式。

## 类型定义
所有共享类型定义在 `src/lib/types.ts`，包括：
- `InputMode` — 输入方式枚举
- `FlowStep` — 流程步骤枚举
- `OcrResult` — OCR识别结果
- `Warning` — 单条警告
- `AnalysisResult` — AI分析结果
- `AppState` — 全局应用状态

## 安全注意事项
- API Key仅存储在服务端环境变量，不暴露给客户端
- URL抓取接口需校验协议（仅http/https）和防止SSRF
- 页面不含用户认证，无个人数据收集
