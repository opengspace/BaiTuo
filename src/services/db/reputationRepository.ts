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

  async getRecordsPaginated(options: {
    type?: ReputationRecord['type']
    startDate?: number
    endDate?: number
    limit?: number
    offset?: number
  }): Promise<{
    records: ReputationRecord[]
    total: number
    hasMore: boolean
  }> {
    const db = await getDB()
    const all = await db.getAllFromIndex('reputation_records', 'by-timestamp')
    const reversed = all.reverse()

    // 筛选
    let filtered = reversed
    if (options.type) {
      filtered = filtered.filter(r => r.type === options.type)
    }
    const startDate = options.startDate
    if (startDate !== undefined) {
      filtered = filtered.filter(r => r.timestamp >= startDate)
    }
    const endDate = options.endDate
    if (endDate !== undefined) {
      filtered = filtered.filter(r => r.timestamp <= endDate)
    }

    const total = filtered.length
    const limit = options.limit || 20
    const offset = options.offset || 0

    return {
      records: filtered.slice(offset, offset + limit),
      total,
      hasMore: offset + limit < total,
    }
  }

  async getRecordsSummaryByType(): Promise<Record<string, { count: number; totalChange: number }>> {
    const records = await this.getAllRecords()
    const summary: Record<string, { count: number; totalChange: number }> = {}

    for (const r of records) {
      if (!summary[r.type]) {
        summary[r.type] = { count: 0, totalChange: 0 }
      }
      summary[r.type].count++
      summary[r.type].totalChange += r.change
    }

    return summary
  }
}

export const reputationRepository = new ReputationRepository()