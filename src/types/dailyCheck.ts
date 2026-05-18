import { Quadrant } from './todo'

/** 每日检查配置 */
export interface DailyCheckConfig {
  /** 是否启用每日检查 */
  enabled: boolean

  /** 逾期扣分规则 */
  overduePenalty: {
    /** 是否启用逾期扣分 */
    enabled: boolean

    /** 每小时逾期扣分（基础值） */
    hourlyPenalty: number

    /** 每日最大扣分上限 */
    dailyMaxPenalty: number

    /** 逾期天数阈值（超过此天数才开始扣分） */
    startAfterDays: number

    /** 是否区分象限（不同象限不同扣分） */
    differentiateByQuadrant: boolean

    /** 各象限扣分系数（当 differentiateByQuadrant = true 时使用） */
    quadrantMultiplier: Record<Quadrant, number>
  }

  /** 取消任务惩罚 */
  cancelledPenalty: {
    /** 是否启用 */
    enabled: boolean

    /** 取消任务扣分比例（相对于任务信誉值） */
    penaltyRate: number

    /** 最大扣分上限 */
    maxPenalty: number
  }
}

/** 默认配置 */
export const DEFAULT_DAILY_CHECK_CONFIG: DailyCheckConfig = {
  enabled: true,
  overduePenalty: {
    enabled: true,
    hourlyPenalty: 3,
    dailyMaxPenalty: 50,
    startAfterDays: 0,
    differentiateByQuadrant: true,
    quadrantMultiplier: {
      'urgent-important': 1.5,
      'not-urgent-important': 1.0,
      'urgent-not-important': 0.8,
      'not-urgent-not-important': 0.5,
    },
  },
  cancelledPenalty: {
    enabled: true,
    penaltyRate: 0.5, // 取消任务扣取50%信誉值
    maxPenalty: 30,
  },
}