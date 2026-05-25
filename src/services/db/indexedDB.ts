import { openDB, IDBPDatabase } from 'idb'
import { Todo, ReputationRecord, NotificationRecord, NotificationSettings, ComplaintRecord, AIConfig } from '@/types'

const DB_NAME = 'baituo-db'
const DB_VERSION = 2

interface BaituoDBSchema {
  todos: {
    key: string
    value: Todo
    indexes: {
      'by-status': string
      'by-quadrant': string
      'by-dueDate': number
      'by-createdAt': number
      'by-order': number
    }
  }
  reputation_records: {
    key: string
    value: ReputationRecord
    indexes: {
      'by-timestamp': number
      'by-todoId': string
    }
  }
  notifications: {
    key: string
    value: NotificationRecord
    indexes: {
      'by-scheduledFor': number
      'by-sent': boolean
    }
  }
  settings: {
    key: string
    value: NotificationSettings | number | string
  }
  complaint_records: {
    key: string
    value: ComplaintRecord
    indexes: {
      'by-characterId': string
      'by-generatedAt': number
    }
  }
  ai_config: {
    key: string
    value: AIConfig
  }
}

let dbInstance: IDBPDatabase<BaituoDBSchema> | null = null

export async function initDB(): Promise<IDBPDatabase<BaituoDBSchema>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<BaituoDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 待办表
      if (!db.objectStoreNames.contains('todos')) {
        const todoStore = db.createObjectStore('todos', { keyPath: 'id' })
        todoStore.createIndex('by-status', 'status')
        todoStore.createIndex('by-quadrant', 'quadrant')
        todoStore.createIndex('by-dueDate', 'dueDate')
        todoStore.createIndex('by-createdAt', 'createdAt')
        todoStore.createIndex('by-order', 'order')
      }

      // 信誉记录表
      if (!db.objectStoreNames.contains('reputation_records')) {
        const repStore = db.createObjectStore('reputation_records', { keyPath: 'id' })
        repStore.createIndex('by-timestamp', 'timestamp')
        repStore.createIndex('by-todoId', 'todoId')
      }

      // 通知表
      if (!db.objectStoreNames.contains('notifications')) {
        const notifStore = db.createObjectStore('notifications', { keyPath: 'id' })
        notifStore.createIndex('by-scheduledFor', 'scheduledFor')
        notifStore.createIndex('by-sent', 'sent')
      }

      // 设置表
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }

      // 抱怨记录表
      if (!db.objectStoreNames.contains('complaint_records')) {
        const complaintStore = db.createObjectStore('complaint_records', { keyPath: 'id' })
        complaintStore.createIndex('by-characterId', 'characterId')
        complaintStore.createIndex('by-generatedAt', 'generatedAt')
      }

      // AI配置表
      if (!db.objectStoreNames.contains('ai_config')) {
        db.createObjectStore('ai_config', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

export async function getDB(): Promise<IDBPDatabase<BaituoDBSchema>> {
  if (!dbInstance) {
    return initDB()
  }
  return dbInstance
}

export async function clearDB(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['todos', 'reputation_records', 'notifications', 'settings'], 'readwrite')
  await Promise.all([
    tx.objectStore('todos').clear(),
    tx.objectStore('reputation_records').clear(),
    tx.objectStore('notifications').clear(),
    tx.objectStore('settings').clear(),
  ])
  await tx.done
}