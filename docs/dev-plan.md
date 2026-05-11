# 开发执行步骤 — 食话实说

## 总体策略
模拟数据先行 → UI交互确认 → 接入真实API → 部署上线

---

## 阶段一：项目骨架 ✅ 已完成
- [x] 创建 Next.js + TypeScript 项目
- [x] 配置全局 CSS（浅蓝色系、移动端优先）
- [x] 配置 layout.tsx（viewport、微信兼容meta、PWA）
- [x] 定义 TypeScript 类型（src/lib/types.ts）
- [x] 创建 .env.example
- [x] 清理模板文件

## 阶段二：输入组件 ✅ 已完成
- [x] InputSelector — 三种输入方式Tab切换
- [x] CameraCapture — 手机拍照（含微信检测、图片压缩）
- [x] ManualInput — 手动输入表单
- [x] UrlInput — URL粘贴输入 + 抓取按钮
- [x] ImagePreview — 拍照后预览 + 重拍
- [x] StepIndicator — 步骤进度条

## 阶段三：API路由（Mock） ✅ 已完成
- [x] /api/ocr — OCR识别（mock）
- [x] /api/analyze — AI比对（mock）
- [x] /api/fetch-url — URL抓取（mock）
- [x] mock-data.ts — 模拟数据

## 阶段四：流程串联 ✅ 已完成
- [x] useCamera hook — 相机状态管理
- [x] useAnalysis hook — 流程状态机
- [x] OcrResultEditor — OCR结果编辑
- [x] LoadingOverlay — 加载动画

## 阶段五：结果展示 ✅ 已完成
- [x] ResultCard — 结果卡片容器
- [x] WarningBanner — 红色警告项
- [x] 风险等级标识
- [x] 一句话总结建议

## 阶段七：测试与打磨 🚧 进行中
- [x] 本地运行测试（`npm run dev`）
- [x] `npm run build` 生产构建验证
- [x] `npx tsc --noEmit` TypeScript类型检查
- [x] Mock规则引擎动态化（5条检测规则）
- [x] Git初始化 + GitHub推送
- [x] Vercel部署上线
- [ ] 移动端浏览器测试
- [ ] 微信内置浏览器兼容测试
- [ ] localStorage 结果缓存
- [ ] PWA manifest.json & 图标

## 阶段八：接入真实API 🚧 待完成
- [ ] 百度OCR API 接入（替换mock）
- [ ] DeepSeek API 接入（替换mock）
- [ ] URL抓取实现（替换mock）

## 阶段九：部署 🚧 待完成
- [ ] GitHub 仓库初始化
- [ ] Vercel 关联部署
- [ ] 环境变量配置
- [ ] 自定义域名（可选）
