---
title: 像素小镇视图设计
date: 2026-05-25
status: approved
---

# 像素小镇视图 - 设计文档

## 概述

为待办管理系统（百托）新增"像素小镇"视图，将每个待办的请求人渲染为像素风格小人，根据待办状态计算情绪并生成抱怨内容，营造趣味性的待办管理体验。

## 1. 页面架构

### 视图定位

- 作为独立视图页面，复用现有视图切换系统
- 新增 `ViewMode` 类型选项 `'pixel-town'`
- 从侧边栏切换进入，与"四象限/全部待办/今日/已完成/已取消"并列

### 页面布局

```
┌─────────────────────────────────────────────┐
│ Header                                       │
├────────┬────────────────────────────────────┤
│ Sidebar│  Canvas 小镇场景                    │
│  ...   │  ┌────────────────────────────┐    │
│  四象限│  │    像素背景 + 小人分布      │    │
│  小镇  │  │                             │    │
│  ...   │  └────────────────────────────┘    │
│        │  抱怨通知区域（底部/侧边浮窗）      │
└────────┴────────────────────────────────────┘
```

## 2. 核心组件设计

### 文件结构

```
src/components/pixel-town/
├── PixelTownView.tsx      # 主视图组件
├── PixelTownCanvas.tsx    # Canvas 渲染层
├── PixelCharacter.tsx     # 小人逻辑（非UI，纯数据计算）
├── CharacterDetailPanel.tsx # 点击小人后的详情面板
├── ComplaintNotification.tsx # 抱怨通知区域
├── hooks/
│   ├── useCharacters.ts   # 小人数据计算
│   ├── useComplaints.ts   # 抱怨生成和管理
│   └── usePixelRenderer.ts # Canvas 渲染逻辑
├── utils/
│   ├── pixelArt.ts        # 像素绘制工具函数
│   ├── emotionCalc.ts     # 情绪计算逻辑
│   └── complaintTemplates.ts # 本地抱怨模板
└── types.ts               # 小镇相关类型定义
```

### 组件职责

| 组件 | 职责 |
|------|------|
| PixelTownView | 组合 Canvas 和 UI 元素，处理用户交互，管理视图状态 |
| PixelTownCanvas | 渲染像素背景和小人，处理 Canvas 点击事件，定时更新动画帧 |
| CharacterDetailPanel | 展示选中小人的详情（待办列表、抱怨内容、历史记录） |
| ComplaintNotification | 显示最近抱怨通知列表，支持折叠展开 |

## 3. 数据模型

### 类型定义

```typescript
// 小人实体
interface PixelCharacter {
  id: string              // 基于请求人名生成唯一ID
  name: string            // 请求人名称
  todos: Todo[]           // 该请求人的所有未完成待办
  overdueCount: number    // 逾期待办数量
  overdueDays: number     // 最大逾期天数
  emotion: EmotionLevel   // 当前情绪等级
  position: Position      // 小镇中的位置 {x, y}
  currentFrame: number    // 当前动画帧索引
  hasNewComplaint: boolean // 是否有新抱怨未查看
}

// 情绪等级
type EmotionLevel = 'happy' | 'neutral' | 'sad' | 'angry'

// 抱怨记录
interface ComplaintRecord {
  id: string
  characterId: string     // 关联的小人
  requesterName: string   // 请求人名
  content: string         // 抱怨内容
  generatedAt: number     // 生成时间
  emotion: EmotionLevel   // 当时情绪
  todoIds: string[]       // 关联的待办ID列表
  source: 'ai' | 'template' // 内容来源
}

// AI 配置
interface AIConfig {
  enabled: boolean
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey: string
  apiEndpoint?: string
  model?: string
}
```

### IndexedDB 新增表

| 表名 | 索引 | 说明 |
|------|------|------|
| complaint_records | `id`, `characterId`, `generatedAt` | 抱怨记录 |
| ai_config | `id` | AI 配置（单条记录） |

## 4. 情绪计算

### 计算算法

```typescript
function calculateEmotion(character: PixelCharacter): EmotionLevel {
  const score = computeEmotionScore(character)

  if (score >= 80) return 'happy'
  if (score >= 50) return 'neutral'
  if (score >= 20) return 'sad'
  return 'angry'
}

function computeEmotionScore(character: PixelCharacter): number {
  let score = 100

  // 逾期天数扣分：每逾期一天扣 5 分
  score -= character.overdueDays * 5

  // 逾期数量扣分：每个逾期待办扣 10 分
  score -= character.overdueCount * 10

  // 待办总数扣分：超过 3 个每个扣 3 分
  const extraTodos = Math.max(0, character.todos.length - 3)
  score -= extraTodos * 3

  return Math.max(0, Math.min(100, score))
}
```

### 情绪等级映射

| 分数范围 | 情绪 | 动画特征 |
|----------|------|----------|
| 80-100 | happy | 跳跃、微笑 |
| 50-79 | neutral | 正常站立 |
| 20-49 | sad | 低头、轻微抖动 |
| 0-19 | angry | 挥手、急躁动作 |

## 5. 抱怨生成

### 生成流程

```typescript
async function generateComplaint(character: PixelCharacter): Promise<string> {
  const config = await getAIConfig()

  if (config?.enabled && config.apiKey) {
    try {
      return await callAI(config, buildPrompt(character))
    } catch (error) {
      // AI 失败时降级到模板
      return generateByTemplate(character)
    }
  }

  return generateByTemplate(character)
}
```

### AI Prompt 模板

```
你是一个像素小人，名字是 ${name}。
你的主人 ${ownerName} 有 ${todoCount} 个待办还没完成，
其中 ${overdueCount} 个已经逾期，最久的一个逾期了 ${overdueDays} 天。
你的情绪等级是 ${emotion}。
请用简短幽默的方式抱怨一下（50字以内），表达你的不满或催促。
```

### 本地模板

```typescript
const templates: Record<EmotionLevel, string[]> = {
  happy: [
    "今天天气不错，但我的待办还在等着呢~",
    "一切顺利，继续加油哦！",
  ],
  neutral: [
    "有几个任务还在排队，别忘了处理~",
    "进度正常，但要保持节奏哦！",
  ],
  sad: [
    "有些任务逾期好几天了，我很难过...",
    "等了好久还没完成，有点失望...",
  ],
  angry: [
    "太久了！我已经忍无可忍了！",
    "再不完成我就要罢工了！",
  ],
}
```

## 6. Canvas 渲染

### 像素绘制基础

```typescript
function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number = 4) {
  ctx.fillStyle = color
  ctx.fillRect(x * size, y * size, size, size)
}
```

### 小人像素矩阵

每个小人由 8x7 像素矩阵定义，不同情绪对应不同的像素排列：

```typescript
const CHARACTER_SPRITES: Record<EmotionLevel, number[][][]> = {
  happy: [/* 帧1: 站立微笑 */, /* 帧2: 跳跃 */],
  neutral: [/* 帧1: 正常站立 */],
  sad: [/* 帧1: 低头 */, /* 帧2: 抖动 */],
  angry: [/* 帧1: 气愤 */, /* 帧2: 挥手 */],
}
```

### 颜色映射

| 索引 | 部位 | 颜色 |
|------|------|------|
| 1 | 头发/帽子 | #FFD700 |
| 2 | 皮肤 | #FFE4C4 |
| 3 | 眼睛 | #000000 |
| 4 | 嘴巴 | #FF6B6B |
| 5 | 身体/衣服 | #4169E1 |
| 6 | 手臂 | #FFE4C4 |
| 7 | 腿部/裤子 | #2F4F4F |

### 动画控制

- 帧率：约 8 FPS（像素动画不需要高帧率）
- 帧间隔：125ms
- 每种情绪有 1-2 个动画帧循环播放

## 7. 用户交互

### 点击检测

通过计算点击位置与小人碰撞区域判断点击了哪个小人：

```typescript
function detectCharacterClick(
  characters: PixelCharacter[],
  clickX: number,
  clickY: number,
  pixelSize: number = 4
): PixelCharacter | null
```

### 详情面板内容

```
┌────────────────────────────────┐
│  [像素小人头像]                 │
│  名称: 张三                     │
│  情绪: 😠 气愤                  │
│  ─────────────────────         │
│  📋 待办列表 (5个)              │
│  ├─ 修复Bug（逾期3天）          │
│  ├─ 写文档（逾期1天）           │
│  ├─ 部署服务（未逾期）          │
│  ─────────────────────         │
│  💬 最新抱怨                    │
│  "太久了！我已经忍无可忍了！"   │
│  ─────────────────────         │
│  📜 历史抱怨 (可展开查看)       │
│  [关闭]                        │
└────────────────────────────────┘
```

### 抱怨通知区域

```
┌──────────────────────────────┐
│ 🔔 抱怨通知 (3条新消息)  [展开]│
├──────────────────────────────┤
│ 张三: "太久了！我已经..."     │
│ 2分钟前                       │
├──────────────────────────────┤
│ 李四: "等了好久还没完成..."   │
│ 5分钟前                       │
└──────────────────────────────┘
```

## 8. 数据流

### 状态管理

新增 `complaintStore`：

```typescript
interface ComplaintState {
  complaints: ComplaintRecord[]
  aiConfig: AIConfig | null
  loading: boolean

  init: () => Promise<void>
  addComplaint: (complaint: ComplaintRecord) => Promise<void>
  getComplaintsByCharacter: (characterId: string) => ComplaintRecord[]
  getRecentComplaints: (limit?: number) => ComplaintRecord[]
  updateAIConfig: (config: AIConfig) => Promise<void>
  generateComplaint: (character: PixelCharacter) => Promise<string>
}
```

### 数据流图

```
HomePage (activeView = 'pixel-town')
    │
    ▼
PixelTownView
    │
    ├─ useCharacters()
    │    └─ 读取 todoStore.todos → 计算 PixelCharacter[]
    │
    ├─ useComplaints()
    │    └─ 管理 selectedCharacter → 调用 complaintStore
    │
    ▼
┌─────────────┬─────────────┬─────────────┐
│ Canvas      │ DetailPanel │ Notification│
│ (渲染+点击) │ (详情展示)  │ (抱怨列表)  │
└─────────────┴─────────────┴─────────────┘
```

### 更新触发

- 待办变化 → 重新计算小人数据 → Canvas 重绘
- 点击小人 → 生成新抱怨 → 存入 IndexedDB → 更新通知
- 打开详情面板 → 加载历史抱怨

## 9. IndexedDB 扩展

### 新增 Repository

```typescript
// src/services/db/complaintRepository.ts
export const complaintRepository = {
  getAll: async (): Promise<ComplaintRecord[]>,
  getById: async (id: string): Promise<ComplaintRecord | undefined>,
  getByCharacter: async (characterId: string): Promise<ComplaintRecord[]>,
  create: async (complaint: ComplaintRecord): Promise<ComplaintRecord>,
  delete: async (id: string): Promise<void>,
  getRecent: async (limit: number): Promise<ComplaintRecord[]>,
  getAIConfig: async (): Promise<AIConfig | undefined>,
  updateAIConfig: async (config: AIConfig): Promise<AIConfig>,
}
```

### Schema

```typescript
const DB_SCHEMA = {
  todos: 'id, quadrant, status, createdAt',
  reputation_records: 'id, todoId, createdAt',
  complaint_records: 'id, characterId, generatedAt',
  ai_config: 'id',
}
```

## 10. AI 配置入口

### 设置页面新增

在 `SettingsModal` 中新增 AI 配置区域：

- 启用 AI 抱怨生成（开关）
- API 提供商选择（OpenAI / Anthropic / 自定义）
- API Key 输入（支持遮罩显示）
- 自定义端点（可选）
- 模型名称（可选）
- 测试连接按钮

### 测试连接

```typescript
async function testAIConnection(config: AIConfig): Promise<{ success: boolean; message: string }>
```

### 安全处理

- API Key 存储在 IndexedDB，仅本地使用
- 显示时遮罩处理（`sk-****...****`）
- 提供"显示/隐藏"切换

## 11. 错误处理与性能

### 错误处理

| 场景 | 处理方式 |
|------|----------|
| AI API 调用失败 | 降级到本地模板生成 |
| Canvas 初始化失败 | 显示降级 UI（静态 HTML 列表） |
| IndexedDB 不可用 | 数据仅在内存中（会丢失） |

### 性能优化

| 优化点 | 方案 |
|--------|------|
| Canvas 重绘 | 仅数据变化时重绘，动画用 requestAnimationFrame |
| 小人数量限制 | 最多 20 个，超出时滚动或按情绪聚合 |
| 抱怨生成频率 | 同一小人 5 分钟内不重复生成 |
| IndexedDB 查询 | 使用索引 `by characterId` 和 `by generatedAt` |
| 像素素材 | 直接嵌入代码（像素矩阵），无需加载外部图片 |

## 12. 实现优先级

建议实现顺序：

1. 基础组件结构搭建
2. IndexedDB 扩展和 complaintStore
3. 情绪计算逻辑
4. Canvas 渲染和像素绘制
5. 小人动画系统
6. 点击交互和详情面板
7. 抱怨生成（本地模板优先）
8. AI 配置和 API 调用
9. 抱怨通知区域
10. 性能优化和错误处理