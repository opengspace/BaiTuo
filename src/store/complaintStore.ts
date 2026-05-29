import { create } from 'zustand'
import { ComplaintRecord, AIConfig, PixelCharacter, CharacterPersonality, PERSONALITY_PRESETS } from '@/types'
import { complaintRepository } from '@/services/db'
import { generateComplaintContent, generatePersonalityByAI } from '@/components/pixel-town/utils/complaintTemplates'

interface ComplaintState {
  complaints: ComplaintRecord[]
  aiConfig: AIConfig | null
  personalityMap: Record<string, CharacterPersonality>
  loading: boolean
  initialized: boolean

  init: () => Promise<void>
  addComplaint: (character: PixelCharacter, source: 'ai' | 'template') => Promise<ComplaintRecord>
  getComplaintsByCharacter: (characterId: string) => ComplaintRecord[]
  getRecentComplaints: (limit?: number) => ComplaintRecord[]
  markAsViewed: (characterId: string) => void
  updateAIConfig: (config: AIConfig) => Promise<void>
  getAIConfig: () => Promise<AIConfig | null>
  ensurePersonality: (characterId: string, characterName: string) => Promise<void>
}

function getRandomPreset(): Omit<CharacterPersonality, 'id' | 'characterName' | 'initializedAt' | 'source'> {
  return PERSONALITY_PRESETS[Math.floor(Math.random() * PERSONALITY_PRESETS.length)]
}

export const useComplaintStore = create<ComplaintState>((set, get) => ({
  complaints: [],
  aiConfig: null,
  personalityMap: {},
  loading: false,
  initialized: false,

  init: async () => {
    if (get().initialized) return
    set({ loading: true })
    try {
      const complaints = await complaintRepository.getAll()
      const aiConfig = await complaintRepository.getAIConfig()
      const personalities = await complaintRepository.getAllPersonalities()
      const personalityMap: Record<string, CharacterPersonality> = {}
      for (const p of personalities) {
        personalityMap[p.id] = p
      }
      set({ complaints, aiConfig: aiConfig || null, personalityMap, initialized: true, loading: false })
    } catch (error) {
      set({ loading: false })
    }
  },

  addComplaint: async (character, source) => {
    const config = get().aiConfig
    const personality = get().personalityMap[character.id]
    const content = await generateComplaintContent(character, config, personality)

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

  ensurePersonality: async (characterId, characterName) => {
    if (get().personalityMap[characterId]) return

    const existing = await complaintRepository.getPersonality(characterId)
    if (existing) {
      set(state => ({ personalityMap: { ...state.personalityMap, [characterId]: existing } }))
      return
    }

    const aiConfig = get().aiConfig
    let personalityData: Omit<CharacterPersonality, 'id' | 'characterName' | 'initializedAt' | 'source'>
    let source: 'ai' | 'preset'

    if (aiConfig?.enabled && aiConfig.apiKey) {
      const aiResult = await generatePersonalityByAI(characterName, aiConfig)
      if (aiResult) {
        personalityData = aiResult
        source = 'ai'
      } else {
        personalityData = getRandomPreset()
        source = 'preset'
      }
    } else {
      personalityData = getRandomPreset()
      source = 'preset'
    }

    const personality: CharacterPersonality = {
      id: characterId,
      characterName,
      ...personalityData,
      initializedAt: Date.now(),
      source,
    }

    await complaintRepository.savePersonality(personality)
    set(state => ({ personalityMap: { ...state.personalityMap, [characterId]: personality } }))
  },
}))