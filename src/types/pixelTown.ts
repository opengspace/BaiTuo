/** 情绪等级 */
export type EmotionLevel = 'happy' | 'neutral' | 'sad' | 'angry'

/** 小人实体 */
export interface PixelCharacter {
  id: string              // 基于拜托人名生成唯一ID
  name: string            // 拜托人名称
  todos: string[]         // 该拜托人的所有未完成待办ID
  overdueCount: number    // 逾期待办数量
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
  requesterName: string   // 拜托人名
  content: string         // 抱怨内容
  generatedAt: number     // 生成时间戳
  emotion: EmotionLevel   // 当时情绪
  todoIds: string[]       // 关联的待办ID列表
  source: 'ai' | 'template' // 内容来源
}

/** AI 配置 */
export interface AIConfig {
  id?: string             // 配置ID（存储时使用）
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