# 设计规范 — 食话实说

## 品牌标识
- **产品名**：食话实说
- **副标题**：拍照识配料，一秒看穿营销话术
- **寓意**：谐音"实话实说"，"食"代表食品

## 配色方案

| Token | 色值 | 用途 |
|-------|------|------|
| --primary-50 | #e3f2fd | 页面背景、卡片底色 |
| --primary-100 | #bbdefb | 浅色区域 |
| --primary-500 | #2196f3 | 主按钮、进度条、激活态 |
| --primary-700 | #1976d2 | 按钮hover、深色文字 |
| --danger-50 | #ffebee | 警告背景 |
| --danger-500 | #f44336 | 红色警告文字、严重标识 |
| --danger-700 | #c62828 | 警告深色 |
| --success-50 | #e8f5e9 | 合格背景 |
| --success-500 | #4caf50 | 合格标识、绿色对勾 |
| --warning-50 | #fff3e0 | 中风险背景 |
| --warning-500 | #ff9800 | 中风险标识 |
| --text-primary | #212121 | 主文字 |
| --text-secondary | #616161 | 辅助文字 |
| --text-hint | #9e9e9e | 提示文字 |
| --bg-card | #ffffff | 卡片底色 |
| --border | #e0e0e0 | 边框 |
| --radius | 12px | 统一圆角 |
| --radius-sm | 8px | 小圆角 |

## 字体
```
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
  "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
  "Helvetica Neue", Helvetica, Arial, sans-serif;
```
- 基础字号：16px（防iOS缩放）
- 辅助文字：14px
- 提示文字：13px
- 标题：16-18px

## 移动端规范
- 最大宽度：480px，居中显示
- 最小触摸区域：44x44px（iOS/Android规范）
- viewport：`width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no`
- 微信浏览器兼容：不加 `capture` 属性

## 动画
- 页面元素：fadeIn 0.3s ease-out
- 加载中：旋转动画 0.8s
- 按钮按下：scale(0.97)

## 组件设计原则
1. 所有可交互元素最小44x44px
2. 按钮禁用态：opacity 0.5
3. 卡片统一使用 --radius (12px) 圆角和 --shadow 阴影
4. 输入框聚焦边框变为 --primary-500
5. 不使用emoji以外的图标库
