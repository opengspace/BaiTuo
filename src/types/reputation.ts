import { Todo } from './todo'

/** 用户等级 */
export interface UserLevel {
  level: number
  title: string
  minReputation: number
  icon: string
}

/** 信誉记录 */
export interface ReputationRecord {
  id: string
  todoId: string
  change: number
  reason: string
  timestamp: number
  type: 'completion' | 'bonus' | 'penalty' | 'streak' | 'achievement'
}

/** 成就类别 */
export type AchievementCategory = 'completion' | 'streak' | 'special' | 'time'

/** 成就条件 */
export interface AchievementCondition {
  type: 'count' | 'streak' | 'time' | 'special'
  target: number
  timeRange?: 'day' | 'week' | 'month' | 'all'
}

/** 成就定义 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  condition: AchievementCondition
  reward: number
  unlockedAt?: number
}

/** 用户信誉状态 */
export interface ReputationState {
  total: number
  level: number
  title: string

  stats: {
    totalCompleted: number
    streakDays: number
    maxStreak: number
    thisWeek: number
    thisMonth: number
    avgCompletionTime: number
    earlyCompletionCount: number
    overdueCount: number
  }

  achievements: string[]
  recentRecords: ReputationRecord[]
}

/** 等级定义 */
export const LEVEL_DEFINITIONS: UserLevel[] = [
  { level: 1, title: '初来乍到', minReputation: 0, icon: '🌱' },
  { level: 2, title: '小有尝试', minReputation: 100, icon: '🌿' },
  { level: 3, title: '初见成效', minReputation: 300, icon: '☘️' },
  { level: 4, title: '渐入佳境', minReputation: 500, icon: '🌿' },
  { level: 5, title: '略有名气', minReputation: 800, icon: '🌳' },
  { level: 6, title: '崭露头角', minReputation: 1200, icon: '🌲' },
  { level: 7, title: '小有成就', minReputation: 1800, icon: '🌴' },
  { level: 8, title: '声名鹊起', minReputation: 2500, icon: '⭐' },
  { level: 9, title: '口碑载道', minReputation: 3500, icon: '🌟' },
  { level: 10, title: '德高望重', minReputation: 5000, icon: '✨' },
  { level: 15, title: '一诺千金', minReputation: 10000, icon: '💎' },
  { level: 20, title: '信誉卓著', minReputation: 20000, icon: '👑' },
  { level: 30, title: '言出必行', minReputation: 40000, icon: '🏆' },
  { level: 40, title: '信守不渝', minReputation: 80000, icon: '🎖️' },
  { level: 50, title: '金口玉言', minReputation: 150000, icon: '🏅' },
  { level: 60, title: '一言九鼎', minReputation: 300000, icon: '🗽' },
  { level: 70, title: '万古流芳', minReputation: 500000, icon: '🌈' },
  { level: 80, title: '传奇', minReputation: 800000, icon: '🔥' },
  { level: 99, title: '传说', minReputation: 1000000, icon: '🌟' },
]

/** 四象限基础分值 */
export const QUADRANT_BASE_SCORE: Record<string, number> = {
  'urgent-important': 100,
  'not-urgent-important': 80,
  'urgent-not-important': 60,
  'not-urgent-not-important': 40,
}

/** 难度系数 */
export const DIFFICULTY_MULTIPLIER: Record<string, number> = {
  easy: 0.8,
  medium: 1.0,
  hard: 1.5,
}

/** 成就列表 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    name: '初试锋芒',
    description: '完成第一个待办',
    icon: '🎯',
    category: 'completion',
    condition: { type: 'count', target: 1 },
    reward: 50,
  },
  {
    id: 'ten-todos',
    name: '小试牛刀',
    description: '累计完成 10 个待办',
    icon: '🔪',
    category: 'completion',
    condition: { type: 'count', target: 10 },
    reward: 100,
  },
  {
    id: 'fifty-todos',
    name: '渐入佳境',
    description: '累计完成 50 个待办',
    icon: '📈',
    category: 'completion',
    condition: { type: 'count', target: 50 },
    reward: 300,
  },
  {
    id: 'hundred-todos',
    name: '百折不挠',
    description: '累计完成 100 个待办',
    icon: '💯',
    category: 'completion',
    condition: { type: 'count', target: 100 },
    reward: 500,
  },
  {
    id: 'three-day-streak',
    name: '三连击',
    description: '连续 3 天完成待办',
    icon: '🔥',
    category: 'streak',
    condition: { type: 'streak', target: 3 },
    reward: 100,
  },
  {
    id: 'seven-day-streak',
    name: '周周向上',
    description: '连续 7 天完成待办',
    icon: '📅',
    category: 'streak',
    condition: { type: 'streak', target: 7 },
    reward: 300,
  },
  {
    id: 'thirty-day-streak',
    name: '月度达人',
    description: '连续 30 天完成待办',
    icon: '🏆',
    category: 'streak',
    condition: { type: 'streak', target: 30 },
    reward: 1000,
  },
  {
    id: 'important-person',
    name: '重要人物',
    description: '完成 50 个"重要紧急"待办',
    icon: '👑',
    category: 'special',
    condition: { type: 'special', target: 50 },
    reward: 800,
  },
  {
    id: 'time-master',
    name: '时间管理大师',
    description: '在截止时间前完成 100 个待办',
    icon: '⏰',
    category: 'special',
    condition: { type: 'special', target: 100 },
    reward: 600,
  },
  {
    id: 'early-bird',
    name: '早起鸟',
    description: '在早上 8 点前完成待办 10 次',
    icon: '🐦',
    category: 'time',
    condition: { type: 'time', target: 10 },
    reward: 200,
  },
]

/** 计算等级 */
export function calculateLevel(reputation: number): UserLevel {
  for (let i = LEVEL_DEFINITIONS.length - 1; i >= 0; i--) {
    if (reputation >= LEVEL_DEFINITIONS[i].minReputation) {
      return LEVEL_DEFINITIONS[i]
    }
  }
  return LEVEL_DEFINITIONS[0]
}

/** 计算完成待办获得的信誉值 */
export function calculateCompletionReward(
  todo: Todo,
  options: {
    completedAt: number
    streakDays: number
  }
): { base: number; timeBonus: number; streakBonus: number; total: number; reason: string } {
  const quadrantScore = QUADRANT_BASE_SCORE[todo.quadrant] || 40
  const difficultyMult = DIFFICULTY_MULTIPLIER[todo.difficulty] || 1.0

  const base = Math.round(quadrantScore * difficultyMult)

  let timeBonus = 0
  let reason = ''

  if (todo.dueDate) {
    const hoursDiff = (todo.dueDate - options.completedAt) / (1000 * 60 * 60)
    if (hoursDiff > 0) {
      timeBonus = Math.min(Math.round(hoursDiff * 5), 50)
      reason = `提前${Math.round(hoursDiff)}小时完成`
    } else {
      timeBonus = Math.max(-Math.round(-hoursDiff * 3), -100)
      reason = `逾期${Math.round(-hoursDiff)}小时完成`
    }
  }

  let streakBonus = 0
  if (options.streakDays >= 3) {
    streakBonus = Math.min(options.streakDays * 10, 100)
  }

  const total = Math.max(base + timeBonus + streakBonus, 10)

  return { base, timeBonus, streakBonus, total, reason }
}