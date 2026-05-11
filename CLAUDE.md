# CLAUDE.md — 食话实说 项目指引

## 项目概览
**食话实说** 是一个移动端食品配料表与宣传比对工具。
目标用户是不懂配料表的普通消费者，拍照或手动输入即可识别虚假宣传。

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 产品需求 | [docs/requirements.md](docs/requirements.md) | 功能范围、用户场景 |
| 技术规范 | [docs/tech-spec.md](docs/tech-spec.md) | 技术栈、项目结构、API设计 |
| 设计规范 | [docs/design-spec.md](docs/design-spec.md) | 配色、字体、组件规范 |
| 开发步骤 | [docs/dev-plan.md](docs/dev-plan.md) | 分阶段执行清单 |
| 开发日志 | [logs/](logs/) | 每日开发记录 |

## 工作约定

### 开发原则
1. **模拟数据先行**：当前所有API为mock模式，无需配置第三方服务即可运行
2. **小步推进**：每次只完成一个阶段，完成后在 [docs/dev-plan.md](docs/dev-plan.md) 更新进度
3. **移动端优先**：所有UI改动需在375px-480px宽度下验证
4. **纯CSS**：不使用Tailwind或第三方UI库，所有样式在 globals.css 中定义

### 每次开发结束
1. 在 [logs/](logs/) 创建或更新当日日志（格式：`YYYY-MM-DD.md`）
2. 更新 [docs/dev-plan.md](docs/dev-plan.md) 的阶段清单状态
3. 如有API或类型变更，同步更新 [docs/tech-spec.md](docs/tech-spec.md)

### 关键文件路径
- 主页面：`src/app/page.tsx`（尚未完成，为当前优先任务）
- 全局样式：`src/app/globals.css`
- 类型定义：`src/lib/types.ts`
- Mock数据：`src/lib/mock-data.ts`
- 组件目录：`src/components/`
- 自定义Hook：`src/hooks/`
- API路由：`src/app/api/`

### 当前状态
阶段一至五已完成（项目骨架、输入组件、API路由、流程串联、结果展示）。
**下一步**：编写 `src/app/page.tsx` 主页面，串联全部组件和交互流程。
