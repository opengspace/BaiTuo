# 像素小镇视图实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为待办管理系统新增"像素小镇"视图，将请求人渲染为像素小人，根据待办状态计算情绪并生成抱怨。

**Architecture:** 使用 Canvas 渲染像素风格小人，Zustand 管理状态，IndexedDB 持久化抱怨记录，支持 AI/模板双模式生成抱怨。

**Tech Stack:** React, TypeScript, Canvas API, Zustand, IndexedDB (idb), TailwindCSS

---

## 文件结构

```
新建文件:
├── src/types/pixelTown.ts           # 小镇相关类型
├── src/store/complaintStore.ts      # 抱怨状态管理
├── src/services/db/complaintRepository.ts # 抱怨数据仓库
├── src/components/pixel-town/
│   ├── types.ts                     # 组件内部类型
│   ├── PixelTownView.tsx            # 主视图
│   ├── PixelTownCanvas.tsx          # Canvas渲染
│   ├── CharacterDetailPanel.tsx     # 详情面板
│   ├── ComplaintNotification.tsx    # 抱怨通知
│   ├── hooks/
│   │   ├── useCharacters.ts         # 小人数据计算
│   │   ├── useComplaints.ts         # 抱怨管理
│   │   └── usePixelRenderer.ts      # Canvas渲染逻辑
│   └── utils/
│   │   ├── pixelArt.ts              # 像素绘制
│   │   ├── emotionCalc.ts           # 情绪计算
│   │   └── complaintTemplates.ts    # 抱怨模板
│   └── sprites/
│   │   └── characterSprites.ts      # 小人像素矩阵
│   └── index.ts                     # 导出

修改文件:
├── src/types/index.ts               # 导出新类型
├── src/services/db/indexedDB.ts     # 新增数据库表
├── src/services/db/index.ts         # 导出新仓库
├── src/store/index.ts               # 导出新store
├── src/components/layout/Sidebar.tsx # 新增小镇视图入口
├── src/pages/HomePage.tsx           # 新增小镇视图渲染
├── src/components/settings/SettingsModal.tsx # 新增AI配置
```

---

## Task 1: 类型定义

**Files:**
- Create: `src/types/pixelTown.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: 创建像素小镇类型文件**

```typescript
// src/types/pixelTown.ts

/** 情绪等级 */
export type EmotionLevel = 'happy' | 'neutral' | 'sad' | 'angry'

/** 小人实体 */
export interface PixelCharacter {
  id: string              // 基于请求人名生成唯一ID
  name: string            // 请求人名称
  todos: string[]         // 该请求人的所有未完成待办ID
  overdueCount: number    //逾期待办数量
  overdueDays: number     // 最大逾期天数
  emotion: EmotionLevel   // 当前情绪等级
  position: { x: number; y: number }  // 小镇中的位置
  currentFrame: number    // 当前动画帧索引
  hasNewComplaint: boolean // 是否有新抱怨未查看
}

/** 抱怨记录 */
export interface ComplaintRecord {
  id: string
  characterId: string     // 关联的小人ID
  requesterName: string   // 请求人名
  content: string         // 抱怨内容
  generatedAt: number     // 生成时间戳
  emotion: EmotionLevel   // 当时情绪
  todoIds: string[]       // 关联的待办ID列表
  source: 'ai' | 'template' // 内容来源
}

/** AI 配置 */
export interface AIConfig {
  enabled: boolean
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey: string
  apiEndpoint?: string    // 自定义端点
  model?: string          // 模型名称
}

/** 情绪等级标签 */
export const EMOTION_LABELS: Record<EmotionLevel, { label: string; emoji: string }> = {
  happy: { label: '开心', emoji: '😊' },
  neutral: { label: '平静', emoji: '😐' },
  sad: { label: '难过', emoji: '😢' },
  angry: { label: '气愤', emoji: '😠' },
}
```

- [ ] **Step 2: 导出类型**

修改 `src/types/index.ts`，添加导出：

```typescript
export * from './pixelTown'
```

- [ ] **Step 3: 验证类型编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

Expected: 无错误输出

---

## Task 2: IndexedDB 扩展

**Files:**
- Modify: `src/services/db/indexedDB.ts`

- [ ] **Step 1: 扩展数据库 Schema**

在 `indexedDB.ts` 中修改 `BaituoDBSchema` 接口，添加新表定义：

```typescript
// 在 BaituoDBSchema 接口中添加
interface BaituoDBSchema {
  // ... 现有表
  complaint_records: {
    key: string
    value: ComplaintRecord
    indexes: {
      'by-characterId': string
      'by-generatedAt': number
    }
  }
  ai_config: {
    key: string
    value: AIConfig
  }
}
```

- [ ] **Step 2: 更新数据库版本和 upgrade 函数**

修改 `DB_VERSION` 为 2，在 upgrade 函数中添加新表创建：

```typescript
const DB_VERSION = 2  // 从 1 改为 2

// 在 upgrade 函数中添加
upgrade(db, oldVersion) {
  // ... 现有表创建逻辑保持不变
  
  // 版本2新增：抱怨记录表
  if (oldVersion < 2) {
    if (!db.objectStoreNames.contains('complaint_records')) {
      const complaintStore = db.createObjectStore('complaint_records', { keyPath: 'id' })
      complaintStore.createIndex('by-characterId', 'characterId')
      complaintStore.createIndex('by-generatedAt', 'generatedAt')
    }
    
    if (!db.objectStoreNames.contains('ai_config')) {
      db.createObjectStore('ai_config', { keyPath: 'id' })
    }
  }
}
```

- [ ] **Step 3: 更新导入**

在文件顶部添加新类型导入：

```typescript
import { Todo, ReputationRecord, NotificationRecord, NotificationSettings, ComplaintRecord, AIConfig } from '@/types'
```

- [ ] **Step 4: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

Expected: 无错误输出

---

## Task 3: 抱怨数据仓库

**Files:**
- Create: `src/services/db/complaintRepository.ts`
- Modify: `src/services/db/index.ts`

- [ ] **Step 1: 创建 complaintRepository**

```typescript
// src/services/db/complaintRepository.ts
import { getDB } from './indexedDB'
import { ComplaintRecord, AIConfig } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export class ComplaintRepository {
  async getAll(): Promise<ComplaintRecord[]> {
    const db = await getDB()
    return db.getAll('complaint_records')
  }

  async getById(id: string): Promise<ComplaintRecord | undefined> {
    const db = await getDB()
    return db.get('complaint_records', id)
  }

  async getByCharacter(characterId: string): Promise<ComplaintRecord[]> {
    const db = await getDB()
    return db.getAllFromIndex('complaint_records', 'by-characterId', characterId)
  }

  async getRecent(limit: number = 10): Promise<ComplaintRecord[]> {
    const db = await getDB()
    const all = await db.getAll('complaint_records')
    return all
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, limit)
  }

  async create(characterId: string, requesterName: string, content: string, emotion: string, todoIds: string[], source: 'ai' | 'template'): Promise<ComplaintRecord> {
    const db = await getDB()
    const record: ComplaintRecord = {
      id: uuidv4(),
      characterId,
      requesterName,
      content,
      generatedAt: Date.now(),
      emotion: emotion as any,
      todoIds,
      source,
    }
    await db.add('complaint_records', record)
    return record
  }

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('complaint_records', id)
  }

  async getAIConfig(): Promise<AIConfig | undefined> {
    const db = await getDB()
    const configs = await db.getAll('ai_config')
    return configs[0]
  }

  async updateAIConfig(config: AIConfig): Promise<AIConfig> {
    const db = await getDB()
    const existing = await this.getAIConfig()
    const updated: AIConfig = {
      ...config,
      id: existing?.id || 'default',
    }
    await db.put('ai_config', updated as any)
    return updated
  }
}

export const complaintRepository = new ComplaintRepository()
```

- [ ] **Step 2: 导出仓库**

修改 `src/services/db/index.ts`：

```typescript
export { complaintRepository, ComplaintRepository } from './complaintRepository'
```

- [ ] **Step 3: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 4: 抱怨状态管理 Store

**Files:**
- Create: `src/store/complaintStore.ts`
- Modify: `src/store/index.ts`

- [ ] **Step 1: 创建 complaintStore**

```typescript
// src/store/complaintStore.ts
import { create } from 'zustand'
import { ComplaintRecord, AIConfig, PixelCharacter } from '@/types'
import { complaintRepository } from '@/services/db'
import { generateComplaintContent } from '@/components/pixel-town/utils/complaintTemplates'

interface ComplaintState {
  complaints: ComplaintRecord[]
  aiConfig: AIConfig | null
  loading: boolean
  initialized: boolean

  init: () => Promise<void>
  addComplaint: (character: PixelCharacter, source: 'ai' | 'template') => Promise<ComplaintRecord>
  getComplaintsByCharacter: (characterId: string) => ComplaintRecord[]
  getRecentComplaints: (limit?: number) => ComplaintRecord[]
  markAsViewed: (characterId: string) => void
  updateAIConfig: (config: AIConfig) => Promise<void>
  getAIConfig: () => Promise<AIConfig | null>
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  aiConfig: null,
  loading: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return
    set({ loading: true })
    try {
      const complaints = await complaintRepository.getAll()
      const aiConfig = await complaintRepository.getAIConfig()
      set({ complaints, aiConfig: aiConfig || null, initialized: true, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },

  addComplaint: async (character, source) => {
    const config = get().aiConfig
    const content = await generateComplaintContent(character, config)
    
    const record = await complaintRepository.create(
      character.id,
      character.name,
      content,
      character.emotion,
      character.todos,
      source
    )
    
    set((state) => ({ complaints: [...state.complaints, record] }))
    return record
  },

  getComplaintsByCharacter: (characterId) => {
    return get().complaints
      .filter(c => c.characterId === characterId)
      .sort((a, b) => b.generatedAt - a.generatedAt)
  },

  getRecentComplaints: (limit = 5) => {
    return get().complaints
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, limit)
  },

  markAsViewed: (characterId) => {
    // 更新本地状态，标记已查看
    // 实际的 hasNewComplaint 在 PixelCharacter 中管理
  },

  updateAIConfig: async (config) => {
    const updated = await complaintRepository.updateAIConfig(config)
    set({ aiConfig: updated })
  },

  getAIConfig: async () => {
    return get().aiConfig
  },
}))
```

- [ ] **Step 2: 导出 store**

修改 `src/store/index.ts`：

```typescript
export { useComplaintStore } from './complaintStore'
```

- [ ] **Step 3: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 5: 情绪计算和抱怨模板

**Files:**
- Create: `src/components/pixel-town/utils/emotionCalc.ts`
- Create: `src/components/pixel-town/utils/complaintTemplates.ts`

- [ ] **Step 1: 创建情绪计算函数**

```typescript
// src/components/pixel-town/utils/emotionCalc.ts
import { EmotionLevel } from '@/types'

interface EmotionInput {
  overdueCount: number
  overdueDays: number
  todoCount: number
}

export function calculateEmotion(input: EmotionInput): EmotionLevel {
  const score = computeEmotionScore(input)
  
  if (score >= 80) return 'happy'
  if (score >= 50) return 'neutral'
  if (score >= 20) return 'sad'
  return 'angry'
}

function computeEmotionScore(input: EmotionInput): number {
  let score = 100
  
  // 逾期天数扣分：每逾期一天扣 5 分
  score -= input.overdueDays * 5
  
  // 逾期数量扣分：每个逾期待办扣 10 分
  score -= input.overdueCount * 10
  
  // 待办总数扣分：超过 3 个每个扣 3 分
  const extraTodos = Math.max(0, input.todoCount - 3)
  score -= extraTodos * 3
  
  return Math.max(0, Math.min(100, score))
}

export function getOverdueDays(dueDate: number): number {
  if (!dueDate) return 0
  const now = Date.now()
  const diff = now - dueDate
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}
```

- [ ] **Step 2: 创建抱怨模板**

```typescript
// src/components/pixel-town/utils/complaintTemplates.ts
import { EmotionLevel, PixelCharacter, AIConfig } from '@/types'

const templates: Record<EmotionLevel, string[]> = {
  happy: [
    "今天天气不错，但我的待办还在等着呢~",
    "一切顺利，继续加油哦！",
    "心情不错，不过别忘了还有任务哦~",
  ],
  neutral: [
    "有几个任务还在排队，别忘了处理~",
    "进度正常，但要保持节奏哦！",
    "一切都在计划中，请继续努力~",
  ],
  sad: [
    "有些任务逾期好几天了，我很难过...",
    "等了好久还没完成，有点失望...",
    "期待了很久，但还是没有结果...",
  ],
  angry: [
    "太久了！我已经忍无可忍了！",
    "再不完成我就要罢工了！",
    "这都拖了多久了？！快点处理！",
  ],
}

export function generateByTemplate(emotion: EmotionLevel): string {
  const list = templates[emotion]
  return list[Math.floor(Math.random() * list.length)]
}

export async function generateComplaintContent(
  character: PixelCharacter,
  aiConfig: AIConfig | null
): Promise<string> {
  if (aiConfig?.enabled && aiConfig.apiKey) {
    try {
      return await callAI(character, aiConfig)
    } catch (error) {
      console.warn('AI generation failed:', error)
      return generateByTemplate(character.emotion)
    }
  }
  
  return generateByTemplate(character.emotion)
}

async function callAI(character: PixelCharacter, config: AIConfig): Promise<string> {
  const prompt = buildPrompt(character)
  
  let endpoint = config.apiEndpoint
  let headers: Record<string, string> = {}
  
  if (config.provider === 'openai') {
    endpoint = endpoint || 'https://api.openai.com/v1/chat/completions'
    headers['Authorization'] = `Bearer ${config.apiKey}`
    headers['Content-Type'] = 'application/json'
  } else if (config.provider === 'anthropic') {
    endpoint = endpoint || 'https://api.anthropic.com/v1/messages'
    headers['x-api-key'] = config.apiKey
    headers['Content-Type'] = 'application/json'
  } else {
    endpoint = endpoint || ''
    headers['Authorization'] = `Bearer ${config.apiKey}`
    headers['Content-Type'] = 'application/json'
  }
  
  const model = config.model || (config.provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-haiku-20240307')
  
  const body = config.provider === 'anthropic' 
    ? {
        model,
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      }
    : {
        model,
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      }
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  
  const data = await response.json()
  
  if (config.provider === 'anthropic') {
    return data.content?.[0]?.text || generateByTemplate(character.emotion)
  }
  
  return data.choices?.[0]?.message?.content || generateByTemplate(character.emotion)
}

function buildPrompt(character: PixelCharacter): string {
  return `你是一个像素小人，名字是${character.name}。
你的主人有${character.todos.length}个待办还没完成，
其中${character.overdueCount}个已经逾期，最久的一个逾期了${character.overdueDays}天。
你的情绪等级是${character.emotion}。
请用简短幽默的方式抱怨一下（30字以内），表达你的不满或催促。不要加任何前缀或标点符号外的修饰。`
}
```

- [ ] **Step 3: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 6: 像素绘制工具

**Files:**
- Create: `src/components/pixel-town/utils/pixelArt.ts`

- [ ] **Step 1: 创建像素绘制函数**

```typescript
// src/components/pixel-town/utils/pixelArt.ts

/** 颜色映射表 */
export const COLOR_PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#FFD700',  // 头发/帽子
  2: '#FFE4C4',  // 皮肤
  3: '#000000',  // 眼睛
  4: '#FF6B6B',  // 嘴巴
  5: '#4169E1',  // 身体/衣服
  6: '#FFE4C4',  // 手臂
  7: '#2F4F4F',  // 腿部/裤子
}

/** 在 Canvas 上绘制单个像素块 */
export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colorIndex: number,
  pixelSize: number = 4
): void {
  const color = COLOR_PALETTE[colorIndex]
  if (color === 'transparent') return
  
  ctx.fillStyle = color
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
}

/** 绘制像素矩阵 */
export function drawPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: number[][],
  startX: number,
  startY: number,
  pixelSize: number = 4
): void {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const colorIndex = matrix[row][col]
      drawPixel(ctx, startX + col, startY + row, colorIndex, pixelSize)
    }
  }
}

/** 清除 Canvas 区域 */
export function clearArea(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  ctx.clearRect(x, y, width, height)
}

/** 绘制对话气泡图标 */
export function drawBubbleIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pixelSize: number = 4
): void {
  ctx.fillStyle = '#FF4444'
  ctx.beginPath()
  ctx.arc(x * pixelSize + pixelSize * 2, y * pixelSize - pixelSize * 2, pixelSize * 2, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `${pixelSize * 3}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('!', x * pixelSize + pixelSize * 2, y * pixelSize - pixelSize * 2)
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 7: 小人像素精灵定义

**Files:**
- Create: `src/components/pixel-town/sprites/characterSprites.ts`

- [ ] **Step 1: 创建小人像素矩阵**

```typescript
// src/components/pixel-town/sprites/characterSprites.ts
import { EmotionLevel } from '@/types'

/** 小人像素精灵矩阵
 * 每个情绪有1-2个动画帧
 * 8列 x 7行像素
 */
export const CHARACTER_SPRITES: Record<EmotionLevel, number[][][]> = {
  happy: [
    // 帧1: 站立微笑
    [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,0,2,3,3,2,0,0],
      [0,0,2,4,4,2,0,0],
      [0,1,5,5,5,5,1,0],
      [1,6,6,0,0,6,6,1],
      [0,7,0,0,0,0,7,0],
    ],
    // 帧2: 跳跃（腿部抬起）
    [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,0,2,3,3,2,0,0],
      [0,0,2,4,4,2,0,0],
      [0,1,5,5,5,5,1,0],
      [1,6,0,0,0,0,6,1],
      [0,0,7,0,0,7,0,0],
    ],
  ],
  
  neutral: [
    // 帧1: 正常站立
    [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,0,2,3,3,2,0,0],
      [0,0,2,0,0,2,0,0],
      [0,1,5,5,5,5,1,0],
      [1,6,6,0,0,6,6,1],
      [0,7,0,0,0,0,7,0],
    ],
  ],
  
  sad: [
    // 帧1: 低头
    [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,0,3,2,2,3,0,0],
      [0,0,2,0,0,2,0,0],
      [0,1,5,5,5,5,1,0],
      [1,6,6,0,0,6,6,1],
      [0,7,0,0,0,0,7,0],
    ],
    // 帧2: 抖动（身体微倾）
    [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,0,3,2,2,3,0,0],
      [0,0,2,0,0,2,0,0],
      [0,1,5,5,5,5,1,0],
      [1,6,6,0,0,6,6,1],
      [0,7,0,0,0,0,7,0],
    ],
  ],
  
  angry: [
    // 帧1: 气愤站立
    [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,0,3,2,2,3,0,0],
      [0,0,2,4,4,2,0,0],
      [0,1,5,5,5,5,1,0],
      [1,6,6,0,0,6,6,1],
      [0,7,0,0,0,0,7,0],
    ],
    // 帧2: 挥手愤怒
    [
      [0,0,1,1,1,1,0,0],
      [0,1,2,2,2,2,1,0],
      [0,0,3,2,2,3,0,0],
      [0,0,2,4,4,2,0,0],
      [0,1,5,5,5,5,1,0],
      [6,1,0,0,0,6,6,1],
      [0,7,0,0,0,0,7,0],
    ],
  ],
}

/** 获取动画帧数 */
export function getFrameCount(emotion: EmotionLevel): number {
  return CHARACTER_SPRITES[emotion].length
}

/** 获取指定帧 */
export function getFrame(emotion: EmotionLevel, frameIndex: number): number[][] {
  const frames = CHARACTER_SPRITES[emotion]
  return frames[frameIndex % frames.length]
}

/** 小人像素尺寸 */
export const CHARACTER_PIXEL_SIZE = 4
export const CHARACTER_WIDTH = 8  // 8列
export const CHARACTER_HEIGHT = 7 // 7行
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 8: 小人数据计算 Hook

**Files:**
- Create: `src/components/pixel-town/hooks/useCharacters.ts`

- [ ] **Step 1: 创建 useCharacters hook**

```typescript
// src/components/pixel-town/hooks/useCharacters.ts
import { useMemo } from 'react'
import { useTodoStore } from '@/store'
import { PixelCharacter, EmotionLevel } from '@/types'
import { calculateEmotion, getOverdueDays } from '../utils/emotionCalc'

export function useCharacters() {
  const { todos } = useTodoStore()
  
  return useMemo(() => {
    // 获取所有未完成的待办（排除已完成和已取消）
    const pendingTodos = todos.filter(
      t => t.status !== 'completed' && t.status !== 'cancelled' && t.requester
    )
    
    // 按请求人分组
    const requesterMap = new Map<string, typeof pendingTodos>()
    
    for (const todo of pendingTodos) {
      const requester = todo.requester || '匿名'
      if (!requesterMap.has(requester)) {
        requesterMap.set(requester, [])
      }
      requesterMap.get(requester)!.push(todo)
    }
    
    // 转换为 PixelCharacter 数组
    const characters: PixelCharacter[] = []
    const canvasWidth = 800
    const canvasHeight = 600
    const spacing = 60
    
    let index = 0
    for (const [name, todoList] of requesterMap.entries()) {
      // 计算逾期信息
      const overdueTodos = todoList.filter(t => t.dueDate && getOverdueDays(t.dueDate) > 0)
      const overdueCount = overdueTodos.length
      const overdueDays = Math.max(
        0,
        ...todoList.map(t => t.dueDate ? getOverdueDays(t.dueDate) : 0)
      )
      
      // 计算情绪
      const emotion = calculateEmotion({
        overdueCount,
        overdueDays,
        todoCount: todoList.length,
      })
      
      // 计算位置（网格布局）
      const cols = Math.floor(canvasWidth / spacing)
      const row = Math.floor(index / cols)
      const col = index % cols
      const x = col * spacing + 20
      const y = row * spacing + 50
      
      characters.push({
        id: `char-${name}`,
        name,
        todos: todoList.map(t => t.id),
        overdueCount,
        overdueDays,
        emotion,
        position: { x, y },
        currentFrame: 0,
        hasNewComplaint: overdueCount > 0,
      })
      
      index++
    }
    
    return characters
  }, [todos])
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 9: Canvas 渲染组件

**Files:**
- Create: `src/components/pixel-town/PixelTownCanvas.tsx`

- [ ] **Step 1: 创建 PixelTownCanvas 组件**

```typescript
// src/components/pixel-town/PixelTownCanvas.tsx
import { useRef, useEffect, useCallback } from 'react'
import { PixelCharacter } from '@/types'
import { drawPixelMatrix, clearArea, drawBubbleIndicator } from '../utils/pixelArt'
import { getFrame, CHARACTER_PIXEL_SIZE, CHARACTER_WIDTH, CHARACTER_HEIGHT } from '../sprites/characterSprites'

interface PixelTownCanvasProps {
  characters: PixelCharacter[]
  onCharacterClick: (character: PixelCharacter) => void
  width?: number
  height?: number
}

export function PixelTownCanvas({
  characters,
  onCharacterClick,
  width = 800,
  height = 600,
}: PixelTownCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const frameTimeRef = useRef<number>(0)
  
  // 渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 清除画布
    ctx.clearRect(0, 0, width, height)
    
    // 绘制背景（简单的草地效果）
    ctx.fillStyle = '#90EE90'
    ctx.fillRect(0, 0, width, height)
    
    // 绘制一些简单的像素房屋背景
    drawSimpleBackground(ctx, width, height)
    
    // 绘制每个小人
    for (const char of characters) {
      const sprite = getFrame(char.emotion, char.currentFrame)
      drawPixelMatrix(
        ctx,
        sprite,
        char.position.x,
        char.position.y,
        CHARACTER_PIXEL_SIZE
      )
      
      // 如果有新抱怨，绘制气泡图标
      if (char.hasNewComplaint) {
        drawBubbleIndicator(
          ctx,
          char.position.x + CHARACTER_WIDTH,
          char.position.y,
          CHARACTER_PIXEL_SIZE
        )
      }
      
      // 绘制名字标签
      ctx.fillStyle = '#333333'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(
        char.name,
        char.position.x * CHARACTER_PIXEL_SIZE + (CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE) / 2,
        char.position.y * CHARACTER_PIXEL_SIZE + CHARACTER_HEIGHT * CHARACTER_PIXEL_SIZE + 15
      )
    }
  }, [characters, width, height])
  
  // 动画循环
  const animate = useCallback(() => {
    const now = Date.now()
    const elapsed = now - frameTimeRef.current
    
    // 约 8 FPS (125ms间隔)
    if (elapsed >= 125) {
      frameTimeRef.current = now
      
      // 更新每个小人的动画帧
      for (const char of characters) {
        const frameCount = getFrame(char.emotion, 0) ? 2 : 1
        char.currentFrame = (char.currentFrame + 1) % frameCount
      }
      
      render()
    }
    
    animationRef.current = requestAnimationFrame(animate)
  }, [characters, render])
  
  // 启动渲染
  useEffect(() => {
    render()
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [render, animate])
  
  // 点击检测
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    // 检测点击了哪个小人
    for (const char of characters) {
      const hitBoxX = char.position.x * CHARACTER_PIXEL_SIZE
      const hitBoxY = char.position.y * CHARACTER_PIXEL_SIZE
      const hitBoxWidth = CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE
      const hitBoxHeight = CHARACTER_HEIGHT * CHARACTER_PIXEL_SIZE
      
      if (
        clickX >= hitBoxX &&
        clickX <= hitBoxX + hitBoxWidth &&
        clickY >= hitBoxY &&
        clickY <= hitBoxY + hitBoxHeight
      ) {
        onCharacterClick(char)
        return
      }
    }
  }
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onClick={handleClick}
      className="border border-gray-200 rounded-lg cursor-pointer"
    />
  )
}

// 简单背景绘制
function drawSimpleBackground(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // 绘制几栋像素房屋
  const houseColor = '#CD853F'
  const roofColor = '#8B4513'
  const windowColor = '#87CEEB'
  
  // 房屋1
  ctx.fillStyle = houseColor
  ctx.fillRect(50, 100, 60, 40)
  ctx.fillStyle = roofColor
  ctx.beginPath()
  ctx.moveTo(40, 100)
  ctx.lineTo(80, 60)
  ctx.lineTo(120, 100)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = windowColor
  ctx.fillRect(70, 110, 15, 15)
  
  // 房屋2
  ctx.fillStyle = houseColor
  ctx.fillRect(150, 80, 50, 35)
  ctx.fillStyle = roofColor
  ctx.beginPath()
  ctx.moveTo(140, 80)
  ctx.lineTo(175, 50)
  ctx.lineTo(210, 80)
  ctx.closePath()
  ctx.fill()
  
  // 树木
  ctx.fillStyle = '#228B22'
  ctx.beginPath()
  ctx.arc(250, 100, 25, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(245, 110, 10, 30)
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 10: 详情面板组件

**Files:**
- Create: `src/components/pixel-town/CharacterDetailPanel.tsx`

- [ ] **Step 1: 创建详情面板**

```typescript
// src/components/pixel-town/CharacterDetailPanel.tsx
import { useEffect, useState } from 'react'
import { PixelCharacter, Todo, EMOTION_LABELS } from '@/types'
import { useTodoStore, useComplaintStore } from '@/store'
import { cn } from '@/utils'
import { Clock, CheckCircle2, MessageCircle, History } from 'lucide-react'

interface CharacterDetailPanelProps {
  character: PixelCharacter
  onClose: () => void
  onCompleteTodo: (todoId: string) => void
}

export function CharacterDetailPanel({
  character,
  onClose,
  onCompleteTodo,
}: CharacterDetailPanelProps) {
  const { todos } = useTodoStore()
  const { addComplaint, getComplaintsByCharacter } = useComplaintStore()
  const [latestComplaint, setLatestComplaint] = useState<string>('')
  const [historyComplaints, setHistoryComplaints] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  
  // 获取该请求人的待办详情
  const characterTodos = todos.filter(t => character.todos.includes(t.id))
  
  // 加载抱怨内容
  useEffect(() => {
    const loadComplaints = async () => {
      // 添加新抱怨（如果距离上次超过5分钟）
      const existing = getComplaintsByCharacter(character.id)
      const lastTime = existing.length > 0 ? existing[0].generatedAt : 0
      const fiveMinutes = 5 * 60 * 1000
      
      if (Date.now() - lastTime > fiveMinutes) {
        const record = await addComplaint(character, 'template')
        setLatestComplaint(record.content)
        setHistoryComplaints(existing)
      } else {
        setLatestComplaint(existing.length > 0 ? existing[0].content : '正在生成抱怨...')
        setHistoryComplaints(existing.slice(1))
      }
    }
    
    loadComplaints()
  }, [character])
  
  const emotionInfo = EMOTION_LABELS[character.emotion]
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="bg-primary-500 text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold">{character.name} 的详情</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 情绪状态 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emotionInfo.emoji}</span>
            <span className="font-medium">{emotionInfo.label}</span>
            <span className="text-sm text-gray-500">
              ({character.overdueCount}个逾期，最长{character.overdueDays}天)
            </span>
          </div>
          
          {/* 待办列表 */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              待办列表 ({characterTodos.length})
            </h4>
            <div className="space-y-2">
              {characterTodos.map(todo => (
                <div
                  key={todo.id}
                  className={cn(
                    'p-2 rounded-lg border',
                    todo.dueDate && new Date(todo.dueDate) < new Date()
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{todo.title}</span>
                    {todo.dueDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{todo.quadrant}</span>
                    <button
                      onClick={() => onCompleteTodo(todo.id)}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      完成
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 最新抱怨 */}
          <div className="bg-yellow-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              最新抱怨
            </h4>
            <p className="text-gray-600 italic">{latestComplaint}</p>
          </div>
          
          {/* 历史抱怨 */}
          {historyComplaints.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                <History className="w-4 h-4" />
                历史抱怨 ({historyComplaints.length})
              </button>
              
              {showHistory && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {historyComplaints.map(c => (
                    <div key={c.id} className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                      <span>{c.content}</span>
                      <span className="text-xs ml-2">
                        {new Date(c.generatedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* 底部按钮 */}
        <div className="px-4 py-3 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 11: 抱怨通知组件

**Files:**
- Create: `src/components/pixel-town/ComplaintNotification.tsx`

- [ ] **Step 1: 创建抱怨通知组件**

```typescript
// src/components/pixel-town/ComplaintNotification.tsx
import { useState } from 'react'
import { useComplaintStore } from '@/store'
import { cn } from '@/utils'
import { Bell, ChevronDown, ChevronUp } from 'lucide-react'

export function ComplaintNotification() {
  const { getRecentComplaints } = useComplaintStore()
  const [expanded, setExpanded] = useState(false)
  
  const recentComplaints = getRecentComplaints(5)
  const unreadCount = recentComplaints.filter(c => 
    Date.now() - c.generatedAt < 10 * 60 * 1000 // 10分钟内视为新
  ).length
  
  if (recentComplaints.length === 0) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs">
        {/* 头部 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Bell className={cn(
              'w-4 h-4',
              unreadCount > 0 ? 'text-red-500 animate-bounce' : 'text-gray-400'
            )} />
            <span className="font-medium text-sm">抱怨通知</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                {unreadCount}条新消息
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
        
        {/* 内容列表 */}
        {expanded && (
          <div className="border-t border-gray-200 divide-y divide-gray-100">
            {recentComplaints.map(complaint => (
              <div key={complaint.id} className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm">{complaint.requesterName}</span>
                  <span className="text-xs text-gray-400">
                    {formatTime(complaint.generatedAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  "{complaint.content}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  return new Date(timestamp).toLocaleDateString()
}
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 12: 主视图组件

**Files:**
- Create: `src/components/pixel-town/PixelTownView.tsx`
- Create: `src/components/pixel-town/index.ts`

- [ ] **Step 1: 创建 PixelTownView 主组件**

```typescript
// src/components/pixel-town/PixelTownView.tsx
import { useState } from 'react'
import { PixelCharacter } from '@/types'
import { useTodoStore } from '@/store'
import { PixelTownCanvas } from './PixelTownCanvas'
import { CharacterDetailPanel } from './CharacterDetailPanel'
import { ComplaintNotification } from './ComplaintNotification'
import { useCharacters } from './hooks/useCharacters'

export function PixelTownView() {
  const { completeTodo } = useTodoStore()
  const characters = useCharacters()
  const [selectedCharacter, setSelectedCharacter] = useState<PixelCharacter | null>(null)
  
  const handleCharacterClick = (character: PixelCharacter) => {
    setSelectedCharacter(character)
  }
  
  const handleCloseDetail = () => {
    setSelectedCharacter(null)
  }
  
  const handleCompleteTodo = async (todoId: string) => {
    await completeTodo(todoId)
    // 关闭详情面板，触发重新计算小人数据
    setSelectedCharacter(null)
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* 小镇标题 */}
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">像素小镇</h2>
        <p className="text-sm text-gray-500">
          每个请求人都是一个像素小人，逾期太久他们会生气哦~
        </p>
      </div>
      
      {/* Canvas 区域 */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {characters.length > 0 ? (
          <PixelTownCanvas
            characters={characters}
            onCharacterClick={handleCharacterClick}
          />
        ) : (
          <div className="text-center text-gray-400">
            <p className="text-lg">小镇里还没有人</p>
            <p className="text-sm mt-1">添加带有请求人的待办，他们就会来这里</p>
          </div>
        )}
      </div>
      
      {/* 详情面板 */}
      {selectedCharacter && (
        <CharacterDetailPanel
          character={selectedCharacter}
          onClose={handleCloseDetail}
          onCompleteTodo={handleCompleteTodo}
        />
      )}
      
      {/* 抱怨通知 */}
      <ComplaintNotification />
    </div>
  )
}
```

- [ ] **Step 2: 创建导出文件**

```typescript
// src/components/pixel-town/index.ts
export { PixelTownView } from './PixelTownView'
export { PixelTownCanvas } from './PixelTownCanvas'
export { CharacterDetailPanel } from './CharacterDetailPanel'
export { ComplaintNotification } from './ComplaintNotification'
```

- [ ] **Step 3: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 13: 侧边栏新增入口

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: 添加像素小镇视图选项**

在 `Sidebar.tsx` 中修改：

```typescript
// 1. 添加新的图标导入
import { LayoutGrid, List, Calendar, CheckCircle2, Trophy, XCircle, Home } from 'lucide-react'

// 2. 扩展 ViewMode 类型注释
type ViewMode = 'matrix' | 'list' | 'today' | 'completed' | 'cancelled' | 'pixel-town'

// 3. 在 views 数组中添加新选项
const views: { id: ViewMode; label: string; icon: React.ReactNode; count?: number }[] = [
  { id: 'matrix', label: '四象限', icon: <LayoutGrid className="w-4 h-4" /> },
  { id: 'pixel-town', label: '像素小镇', icon: <Home className="w-4 h-4" /> },
  { id: 'list', label: '全部待办', icon: <List className="w-4 h-4" />, count: pendingTodos.length },
  { id: 'today', label: '今日待办', icon: <Calendar className="w-4 h-4" /> },
  { id: 'completed', label: '已完成', icon: <CheckCircle2 className="w-4 h-4" />, count: completedTodos.length },
  { id: 'cancelled', label: '已取消', icon: <XCircle className="w-4 h-4" />, count: cancelledTodos.length },
]
```

- [ ] **Step 2: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 14: HomePage 集成

**Files:**
- Modify: `src/pages/HomePage.tsx`

- [ ] **Step 1: 导入新组件**

在 `HomePage.tsx` 顶部添加导入：

```typescript
import { PixelTownView } from '@/components/pixel-town'
```

- [ ] **Step 2: 添加像素小镇视图渲染**

在 `HomePage.tsx` 的 main 区域，添加 pixel-town 视图的处理：

```typescript
// 扩展 ViewMode 类型注释
type ViewMode = 'matrix' | 'list' | 'today' | 'completed' | 'cancelled' | 'pixel-town'

// 在 main 的渲染逻辑中添加
{activeView === 'pixel-town' && (
  <div className="h-full">
    <PixelTownView />
  </div>
)}
```

- [ ] **Step 3: 初始化 complaintStore**

在 `useEffect` 中添加 complaintStore 初始化：

```typescript
import { useComplaintStore } from '@/store'

// 在组件中
const { init: initComplaint } = useComplaintStore()

// 在 useEffect 中
useEffect(() => {
  init()
  initReputation()
  initComplaint()
}, [init, initReputation, initComplaint])
```

- [ ] **Step 4: 验证编译**

```bash
cd /Users/window/opengspace/baituo && npx tsc --noEmit
```

---

## Task 15: 运行测试验证

- [ ] **Step 1: 启动开发服务器**

```bash
cd /Users/window/opengspace/baituo && npm run dev
```

Expected: 服务器启动成功，显示 localhost URL

- [ ] **Step 2: 打开浏览器验证**

打开 http://localhost:5173，验证：
1. 侧边栏显示"像素小镇"入口
2. 点击后能进入像素小镇视图
3. Canvas 正常渲染
4. 小人有动画效果
5. 点击小人能打开详情面板
6. 抱怨通知区域显示

---

## Task 16: 提交代码

- [ ] **Step 1: 查看变更**

```bash
cd /Users/window/opengspace/baituo && git status
```

- [ ] **Step 2: 提交变更**

```bash
git add .
git commit -m "feat: 添加像素小镇视图

- 新增像素小镇视图，将请求人渲染为像素小人
- 根据逾期状态计算情绪等级
- 支持本地模板生成抱怨内容
- 点击小人查看详情和待办列表
- 抱怨记录持久化到IndexedDB"
```

---

## 自检清单

完成所有任务后，检查：

1. **类型编译**: `npx tsc --noEmit` 无错误
2. **功能验证**: 能切换到像素小镇视图，小人正常显示
3. **动画效果**: 小人有站立/跳跃等动画
4. **交互功能**: 点击小人能打开详情面板
5. **抱怨生成**: 点击小人后生成抱怨内容
6. **数据持久化**: 抱怨记录能保存到 IndexedDB