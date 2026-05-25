/** 艾森豪威尔矩阵维度 */
export type Quadrant =
  | 'urgent-important'      // 重要紧急
  | 'not-urgent-important'  // 重要不紧急
  | 'urgent-not-important'  // 不重要紧急
  | 'not-urgent-not-important' // 不重要不紧急

/** 待办优先级 */
export type Priority = 'high' | 'medium' | 'low'

/** 待办状态 */
export type TodoStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'

/** 难度等级 */
export type Difficulty = 'easy' | 'medium' | 'hard'

/** 子任务 */
export interface SubTask {
  id: string
  title: string
  completed: boolean
}

/** 待办实体 */
export interface Todo {
  id: string
  title: string
  description?: string

  // 时间相关
  createdAt: number
  updatedAt: number
  completedAt?: number
  dueDate?: number
  reminderAt?: number

  // 分类相关
  quadrant: Quadrant
  priority: Priority
  status: TodoStatus

  // 排序
  order: number

  // 信誉相关
  reputationValue: number
  difficulty: Difficulty

  // 额外信息
  tags?: string[]
  requester?: string  // 拜托人 - 谁求你办这件事
  notes?: string

  // 统计
  timeSpent?: number
  subTasks?: SubTask[]
}

/** 创建待办的输入 */
export interface CreateTodoInput {
  title: string
  description?: string
  dueDate?: number
  reminderAt?: number
  quadrant: Quadrant
  priority?: Priority
  difficulty?: Difficulty
  requester?: string
  tags?: string[]
}

/** 更新待办的输入 */
export type UpdateTodoInput = Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>

/** 象限标签映射 */
export const QUADRANT_LABELS: Record<Quadrant, string> = {
  'urgent-important': '重要紧急',
  'not-urgent-important': '重要不紧急',
  'urgent-not-important': '不重要紧急',
  'not-urgent-not-important': '不重要不紧急',
}

/** 象限颜色映射 */
export const QUADRANT_COLORS: Record<Quadrant, string> = {
  'urgent-important': 'border-red-500 bg-red-50',
  'not-urgent-important': 'border-yellow-500 bg-yellow-50',
  'urgent-not-important': 'border-blue-500 bg-blue-50',
  'not-urgent-not-important': 'border-gray-500 bg-gray-50',
}

/** 难度标签 */
export const DIFFICULTY_LABELS: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: '简单', color: 'bg-green-100 text-green-800' },
  medium: { label: '中等', color: 'bg-yellow-100 text-yellow-800' },
  hard: { label: '困难', color: 'bg-red-100 text-red-800' },
}

/** 状态标签 */
export const STATUS_LABELS: Record<TodoStatus, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'bg-gray-100 text-gray-800' },
  'in-progress': { label: '进行中', color: 'bg-blue-100 text-blue-800' },
  completed: { label: '已完成', color: 'bg-green-100 text-green-800' },
  cancelled: { label: '已取消', color: 'bg-red-100 text-red-800' },
}