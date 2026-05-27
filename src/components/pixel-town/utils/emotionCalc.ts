import { EmotionLevel } from '@/types'

interface EmotionInput {
  completedCount: number    // 已完成数量
  cancelledCount: number    // 已取消数量
  pendingCount: number      // 未完成数量
  overdueCount: number      // 逾期待办数量
  overdueDays: number       // 最大逾期天数
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

  const total = input.completedCount + input.cancelledCount + input.pendingCount

  // 完成率加分：完成的越多，心情越好
  if (total > 0) {
    const completionRate = input.completedCount / total
    score = score * (0.5 + 0.5 * completionRate) // 基础分 50，完成率影响 50
  }

  // 逾期天数扣分：每逾期一天扣 3 分
  score -= input.overdueDays * 3

  // 逾期数量扣分：每个逾期待办扣 8 分
  score -= input.overdueCount * 8

  // 取消数量扣分：每个取消扣 5 分（比逾期轻一些）
  score -= input.cancelledCount * 5

  // 未完成数量扣分：超过 3 个每个扣 3 分
  const extraPending = Math.max(0, input.pendingCount - 3)
  score -= extraPending * 3

  return Math.max(0, Math.min(100, score))
}

export function getOverdueDays(dueDate: number): number {
  if (!dueDate) return 0
  const now = Date.now()
  const diff = now - dueDate
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}