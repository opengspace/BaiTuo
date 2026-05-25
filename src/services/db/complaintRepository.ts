import { getDB } from './indexedDB'
import { ComplaintRecord, AIConfig } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export class ComplaintRepository {
  async getAll(): Promise<ComplaintRecord[]> {
    const db = await getDB()
    return db.getAll('complaint_records')
  }

  async getById(id: string): Promise<ComplaintRecord | undefined> {
    const db = await getDB()
    return db.get('complaint_records', id)
  }

  async getByCharacter(characterId: string): Promise<ComplaintRecord[]> {
    const db = await getDB()
    return db.getAllFromIndex('complaint_records', 'by-characterId', characterId)
  }

  async getRecent(limit: number = 10): Promise<ComplaintRecord[]> {
    const db = await getDB()
    const all = await db.getAll('complaint_records')
    return all
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, limit)
  }

  async create(
    characterId: string,
    requesterName: string,
    content: string,
    emotion: string,
    todoIds: string[],
    source: 'ai' | 'template'
  ): Promise<ComplaintRecord> {
    const db = await getDB()
    const record: ComplaintRecord = {
      id: uuidv4(),
      characterId,
      requesterName,
      content,
      generatedAt: Date.now(),
      emotion: emotion as any,
      todoIds,
      source,
    }
    await db.add('complaint_records', record)
    return record
  }

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('complaint_records', id)
  }

  async getAIConfig(): Promise<AIConfig | undefined> {
    const db = await getDB()
    const configs = await db.getAll('ai_config')
    return configs[0]
  }

  async updateAIConfig(config: AIConfig): Promise<AIConfig> {
    const db = await getDB()
    const existing = await this.getAIConfig()
    const updated: AIConfig = {
      ...config,
      id: existing?.id || 'default',
    }
    await db.put('ai_config', updated as any)
    return updated
  }
}

export const complaintRepository = new ComplaintRepository()