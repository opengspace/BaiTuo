import { getDB } from './indexedDB'
import { ReputationRecord, ReputationState, calculateLevel, ACHIEVEMENTS } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export class ReputationRepository {
  async getAllRecords(): Promise<ReputationRecord[]> {
    const db = await getDB()
    return db.getAll('reputation_records')
  }

  async addRecord(record: Omit<ReputationRecord, 'id' | 'timestamp'>): Promise<ReputationRecord> {
    const db = await getDB()
    const newRecord: ReputationRecord = {
      ...record,
      id: uuidv4(),
      timestamp: Date.now(),
    }
    await db.add('reputation_records', newRecord)
    return newRecord
  }

  async getRecentRecords(limit: number = 10): Promise<ReputationRecord[]> {
    const db = await getDB()
    const all = await db.getAllFromIndex('reputation_records', 'by-timestamp')
    return all.reverse().slice(0, limit)
  }

  async getRecordsByTodoId(todoId: string): Promise<ReputationRecord[]> {
    const db = await getDB()
    return db.getAllFromIndex('reputation_records', 'by-todoId', todoId)
  }

  async getState(): Promise<ReputationState> {
    const records = await this.getAllRecords()

    const total = records.reduce((sum, r) => sum + r.change, 0)
    const levelInfo = calculateLevel(total)

    const completedRecords = records.filter(r => r.type === 'completion')

    const stats = {
      totalCompleted: completedRecords.length,
      streakDays: 0,
      maxStreak: 0,
      thisWeek: 0,
      thisMonth: 0,
      avgCompletionTime: 0,
      earlyCompletionCount: 0,
      overdueCount: 0,
    }

    const unlockedAchievements = await this.getUnlockedAchievements()

    return {
      total,
      level: levelInfo.level,
      title: levelInfo.title,
      stats,
      achievements: unlockedAchievements,
      recentRecords: await this.getRecentRecords(),
    }
  }

  async getUnlockedAchievements(): Promise<string[]> {
    const db = await getDB()
    const setting = await db.get('settings', 'unlocked_achievements')
    if (setting && typeof setting === 'object' && 'value' in setting) {
      return (setting as any).value || []
    }
    return []
  }

  async unlockAchievement(achievementId: string): Promise<void> {
    const db = await getDB()
    const unlocked = await this.getUnlockedAchievements()
    if (!unlocked.includes(achievementId)) {
      unlocked.push(achievementId)
      await db.put('settings', { key: 'unlocked_achievements', value: unlocked })

      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
      if (achievement) {
        await this.addRecord({
          todoId: '',
          change: achievement.reward,
          reason: `解锁成就: ${achievement.name}`,
          type: 'achievement',
        })
      }
    }
  }

  async getReputationTotal(): Promise<number> {
    const state = await this.getState()
    return state.total
  }

  async setReputationTotal(value: number): Promise<void> {
    const db = await getDB()
    await db.put('settings', { key: 'reputation_total', value })
  }

  async importRecords(records: ReputationRecord[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction('reputation_records', 'readwrite')
    await Promise.all(records.map(r => tx.store.put(r)))
    await tx.done
  }

  async exportRecords(): Promise<ReputationRecord[]> {
    return this.getAllRecords()
  }
}

export const reputationRepository = new ReputationRepository()