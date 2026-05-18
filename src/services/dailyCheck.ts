import { Todo, DailyCheckConfig, DEFAULT_DAILY_CHECK_CONFIG, Quadrant } from '@/types'
import { reputationRepository } from './db'
import { getDB } from './db/indexedDB'

const LAST_CHECK_KEY = 'last_daily_check_time'
const CONFIG_KEY = 'daily_check_config'

/** 计算逾期小时数 */
function calculateOverdueHours(dueDate: number): number {
  return Math.max(0, (Date.now() - dueDate) / (1000 * 60 * 60))
}

/** 计算逾期天数 */
function calculateOverdueDays(dueDate: number): number {
  return Math.floor(calculateOverdueHours(dueDate) / 24)
}

/** 获取上次检查时间 */
function getLastCheckTime(): number | null {
  const stored = localStorage.getItem(LAST_CHECK_KEY)
  return stored ? parseInt(stored, 10) : null
}

/** 设置上次检查时间 */
function setLastCheckTime(time: number): void {
  localStorage.setItem(LAST_CHECK_KEY, time.toString())
}

/** 判断是否需要执行每日检查 */
function shouldRunDailyCheck(config: DailyCheckConfig): boolean {
  if (!config.enabled) return false

  const lastCheck = getLastCheckTime()
  if (!lastCheck) return true

  const hoursSinceLastCheck = (Date.now() - lastCheck) / (1000 * 60 * 60)
  return hoursSinceLastCheck >= 24
}

/** 获取当前配置 */
export async function getDailyCheckConfig(): Promise<DailyCheckConfig> {
  const db = await getDB()
  const setting = await db.get('settings', CONFIG_KEY)
  if (setting && typeof setting === 'object' && 'value' in setting) {
    return (setting as { key: string; value: DailyCheckConfig }).value
  }
  return DEFAULT_DAILY_CHECK_CONFIG
}

/** 更新配置 */
export async function updateDailyCheckConfig(config: DailyCheckConfig): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key: CONFIG_KEY, value: config })
}

/** 执行每日检查 */
export async function runDailyCheck(todos: Todo[]): Promise<{
  checked: boolean
  penaltiesApplied: Array<{
    todoId: string
    todoTitle: string
    penalty: number
    overdueDays: number
    reason: string
  }>
}> {
  const config = await getDailyCheckConfig()

  if (!shouldRunDailyCheck(config)) {
    return { checked: false, penaltiesApplied: [] }
  }

  // 获取逾期未完成的任务
  const overdueTodos = todos.filter(t =>
    t.status !== 'completed' &&
    t.status !== 'cancelled' &&
    t.dueDate &&
    t.dueDate < Date.now()
  )

  if (!config.overduePenalty.enabled || overdueTodos.length === 0) {
    setLastCheckTime(Date.now())
    return { checked: true, penaltiesApplied: [] }
  }

  const penalties: Array<{
    todoId: string
    todoTitle: string
    penalty: number
    overdueDays: number
    reason: string
  }> = []

  for (const todo of overdueTodos) {
    const overdueDays = calculateOverdueDays(todo.dueDate!)

    // 超过阈值才开始扣分
    if (overdueDays < config.overduePenalty.startAfterDays) continue

    // 计算逾期小时数
    const overdueHours = calculateOverdueHours(todo.dueDate!)

    // 计算基础扣分（每小时扣分，但有每日上限）
    let penalty = Math.min(
      Math.round(overdueHours * config.overduePenalty.hourlyPenalty / 24), // 平均每天扣分
      config.overduePenalty.dailyMaxPenalty
    )

    // 按象限调整
    if (config.overduePenalty.differentiateByQuadrant) {
      const multiplier = config.overduePenalty.quadrantMultiplier[todo.quadrant as Quadrant] || 1.0
      penalty = Math.round(penalty * multiplier)
    }

    // 确保扣分不为负
    penalty = Math.max(0, penalty)

    if (penalty > 0) {
      // 记录扣分
      await reputationRepository.addRecord({
        todoId: todo.id,
        change: -penalty,
        reason: `任务逾期惩罚: "${todo.title}" (逾期${overdueDays}天)`,
        type: 'penalty',
      })

      penalties.push({
        todoId: todo.id,
        todoTitle: todo.title,
        penalty,
        overdueDays,
        reason: `逾期${overdueDays}天`,
      })
    }
  }

  setLastCheckTime(Date.now())
  return { checked: true, penaltiesApplied: penalties }
}

/** 处理取消任务的惩罚 */
export async function handleCancelledPenalty(
  todo: Todo,
  config?: DailyCheckConfig
): Promise<{ penalty: number; reason: string } | null> {
  const checkConfig = config || await getDailyCheckConfig()

  if (!checkConfig.cancelledPenalty.enabled) {
    return null
  }

  // 计算扣分（基于任务信誉值的一定比例）
  const penalty = Math.min(
    Math.round(todo.reputationValue * checkConfig.cancelledPenalty.penaltyRate),
    checkConfig.cancelledPenalty.maxPenalty
  )

  if (penalty > 0) {
    await reputationRepository.addRecord({
      todoId: todo.id,
      change: -penalty,
      reason: `取消任务惩罚: "${todo.title}"`,
      type: 'penalty',
    })

    return { penalty, reason: `取消任务扣${penalty}分` }
  }

  return null
}