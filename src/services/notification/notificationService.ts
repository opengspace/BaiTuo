import { NotificationSettings } from '@/types'
import { notificationRepository } from '@/services/db'

export class NotificationService {
  private permission: NotificationPermission = 'default'
  private scheduledNotifications: Map<string, number> = new Map()

  async init(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('浏览器不支持通知')
      return false
    }

    this.permission = Notification.permission
    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission()
    }

    return this.permission === 'granted'
  }

  async scheduleNotification(
    id: string,
    title: string,
    body: string,
    scheduledFor: number
  ): Promise<void> {
    const now = Date.now()
    const delay = scheduledFor - now

    if (delay <= 0) {
      await this.showNotification(title, body)
      return
    }

    // 保存通知记录
    await notificationRepository.create({
      todoId: id,
      title,
      body,
      scheduledFor,
      sent: false,
      type: 'reminder',
    })

    // 使用 setTimeout（页面需要保持打开）
    const timeoutId = window.setTimeout(
      () => {
        this.showNotification(title, body)
        notificationRepository.markSent(id)
        this.scheduledNotifications.delete(id)
      },
      delay
    )

    this.scheduledNotifications.set(id, timeoutId)
  }

  async showNotification(title: string, body: string): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.init()
      if (!granted) return
    }

    new Notification(title, {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      requireInteraction: false,
    })
  }

  cancelNotification(id: string): void {
    const timeoutId = this.scheduledNotifications.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.scheduledNotifications.delete(id)
    }
    notificationRepository.deleteByTodoId(id)
  }

  async getSettings(): Promise<NotificationSettings> {
    return notificationRepository.getSettings()
  }

  async saveSettings(settings: NotificationSettings): Promise<void> {
    await notificationRepository.saveSettings(settings)
  }
}

export const notificationService = new NotificationService()