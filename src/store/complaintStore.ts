import { create } from 'zustand'
import { ComplaintRecord, AIConfig, PixelCharacter } from '@/types'
import { complaintRepository } from '@/services/db'
import { generateComplaintContent } from '@/components/pixel-town/utils/complaintTemplates'

interface ComplaintState {
  complaints: ComplaintRecord[]
  aiConfig: AIConfig | null
  loading: boolean
  initialized: boolean

  init: () => Promise<void>
  addComplaint: (character: PixelCharacter, source: 'ai' | 'template') => Promise<ComplaintRecord>
  getComplaintsByCharacter: (characterId: string) => ComplaintRecord[]
  getRecentComplaints: (limit?: number) => ComplaintRecord[]
  markAsViewed: (characterId: string) => void
  updateAIConfig: (config: AIConfig) => Promise<void>
  getAIConfig: () => Promise<AIConfig | null>
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  aiConfig: null,
  loading: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return
    set({ loading: true })
    try {
      const complaints = await complaintRepository.getAll()
      const aiConfig = await complaintRepository.getAIConfig()
      set({ complaints, aiConfig: aiConfig || null, initialized: true, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },

  addComplaint: async (character, source) => {
    const config = get().aiConfig
    const content = await generateComplaintContent(character, config)

    const record = await complaintRepository.create(
      character.id,
      character.name,
      content,
      character.emotion,
      character.todos,
      source
    )

    set((state) => ({ complaints: [...state.complaints, record] }))
    return record
  },

  getComplaintsByCharacter: (characterId) => {
    return get().complaints
      .filter(c => c.characterId === characterId)
      .sort((a, b) => b.generatedAt - a.generatedAt)
  },

  getRecentComplaints: (limit = 5) => {
    return get().complaints
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, limit)
  },

  markAsViewed: (_characterId) => {
    // 更新本地状态，标记已查看
    // 实际的 hasNewComplaint 在 PixelCharacter 中管理
  },

  updateAIConfig: async (config) => {
    const updated = await complaintRepository.updateAIConfig(config)
    set({ aiConfig: updated })
  },

  getAIConfig: async () => {
    return get().aiConfig
  },
}))