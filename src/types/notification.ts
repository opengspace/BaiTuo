/** 通知类型 */
export type NotificationType = 'reminder' | 'due' | 'overdue'

/** 通知设置 */
export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  advanceMinutes: number[]  // 提前提醒分钟数
  quietHoursStart?: string
  quietHoursEnd?: string
}

/** 通知记录 */
export interface NotificationRecord {
  id: string
  todoId: string
  title: string
  body: string
  scheduledFor: number
  sent: boolean
  type: NotificationType
}

/** 默认通知设置 */
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: true,
  advanceMinutes: [5, 15, 30, 60],
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
}