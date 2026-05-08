import { create } from 'zustand'
import { ReputationState, ReputationRecord } from '@/types'
import { reputationRepository } from '@/services/db'
import { initDB } from '@/services/db'

interface ReputationStateExtended extends ReputationState {
  loading: boolean
  initialized: boolean

  init: () => Promise<void>
  refresh: () => Promise<void>
  addRecord: (record: Omit<ReputationRecord, 'id' | 'timestamp'>) => Promise<ReputationRecord>
  unlockAchievement: (id: string) => Promise<void>
}

const DEFAULT_STATE: ReputationState = {
  total: 0,
  level: 1,
  title: '初来乍到',
  stats: {
    totalCompleted: 0,
    streakDays: 0,
    maxStreak: 0,
    thisWeek: 0,
    thisMonth: 0,
    avgCompletionTime: 0,
    earlyCompletionCount: 0,
    overdueCount: 0,
  },
  achievements: [],
  recentRecords: [],
}

export const useReputationStore = create<ReputationStateExtended>((set, get) => ({
  ...DEFAULT_STATE,
  loading: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return
    set({ loading: true })
    try {
      await initDB()
      await get().refresh()
      set({ initialized: true, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },

  refresh: async () => {
    set({ loading: true })
    try {
      const state = await reputationRepository.getState()
      set({ ...state, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },

  addRecord: async (record) => {
    const newRecord = await reputationRepository.addRecord(record)
    await get().refresh()
    return newRecord
  },

  unlockAchievement: async (id) => {
    await reputationRepository.unlockAchievement(id)
    await get().refresh()
  },
}))