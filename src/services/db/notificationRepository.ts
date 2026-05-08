import { getDB } from './indexedDB'
import { NotificationRecord, NotificationSettings, DEFAULT_NOTIFICATION_SETTINGS } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export class NotificationRepository {
  async getAll(): Promise<NotificationRecord[]> {
    const db = await getDB()
    return db.getAll('notifications')
  }

  async getPending(): Promise<NotificationRecord[]> {
    const db = await getDB()
    const all = await db.getAll('notifications')
    return all.filter(n => !n.sent && n.scheduledFor > Date.now())
  }

  async create(record: Omit<NotificationRecord, 'id'>): Promise<NotificationRecord> {
    const db = await getDB()
    const newRecord: NotificationRecord = {
      ...record,
      id: uuidv4(),
    }
    await db.add('notifications', newRecord)
    return newRecord
  }

  async markSent(id: string): Promise<void> {
    const db = await getDB()
    const record = await db.get('notifications', id)
    if (record) {
      record.sent = true
      await db.put('notifications', record)
    }
  }

  async deleteByTodoId(todoId: string): Promise<void> {
    const db = await getDB()
    const all = await db.getAll('notifications')
    const toDelete = all.filter(n => n.todoId === todoId)
    const tx = db.transaction('notifications', 'readwrite')
    await Promise.all(toDelete.map(n => tx.store.delete(n.id)))
    await tx.done
  }

  async getSettings(): Promise<NotificationSettings> {
    const db = await getDB()
    const setting = await db.get('settings', 'notification_settings')
    if (setting) {
      return setting as NotificationSettings
    }
    return DEFAULT_NOTIFICATION_SETTINGS
  }

  async saveSettings(settings: NotificationSettings): Promise<void> {
    const db = await getDB()
    await db.put('settings', { key: 'notification_settings', ...settings })
  }
}

export const notificationRepository = new NotificationRepository()