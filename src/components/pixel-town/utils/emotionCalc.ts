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