import { EmotionLevel, PixelCharacter, AIConfig, AI_PROVIDER_PRESETS, CharacterPersonality } from '@/types'

const templates: Record<EmotionLevel, string[]> = {
  happy: [
    "今天天气不错，但我的待办还在等着呢~",
    "一切顺利，继续加油哦！",
    "心情不错，不过别忘了还有任务哦~",
  ],
  neutral: [
    "有几个任务还在排队，别忘了处理~",
    "进度正常，但要保持节奏哦！",
    "一切都在计划中，请继续努力~",
  ],
  sad: [
    "有些任务逾期好几天了，我很难过...",
    "等了好久还没完成，有点失望...",
    "期待了很久，但还是没有结果...",
  ],
  angry: [
    "太久了！我已经忍无可忍了！",
    "再不完成我就要罢工了！",
    "这都拖了多久了？！快点处理！",
  ],
}

export function generateByTemplate(emotion: EmotionLevel): string {
  const list = templates[emotion]
  return list[Math.floor(Math.random() * list.length)]
}

async function callAIAPI(prompt: string, config: AIConfig, maxTokens: number = 100): Promise<string | null> {
  const preset = AI_PROVIDER_PRESETS[config.provider]
  const isAnthropic = config.provider === 'anthropic'

  const endpoint = config.apiEndpoint || preset.defaultEndpoint
  const model = config.model || preset.defaultModel

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (isAnthropic) {
    headers['x-api-key'] = config.apiKey
    headers['anthropic-version'] = '2023-06-01'
  } else {
    headers['Authorization'] = `Bearer ${config.apiKey}`
  }

  const body = {
    model,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) return null

    const data = await response.json()

    return isAnthropic
      ? data.content?.[0]?.text
      : data.choices?.[0]?.message?.content
  } catch {
    return null
  }
}

export async function generateComplaintContent(
  character: PixelCharacter,
  aiConfig: AIConfig | null,
  personality?: CharacterPersonality
): Promise<string> {
  if (aiConfig?.enabled && aiConfig.apiKey) {
    try {
      const prompt = buildPrompt(character, personality)
      const result = await callAIAPI(prompt, aiConfig)
      if (result) return result
    } catch (error) {
      console.warn('AI generation failed:', error)
    }
  }

  return generateByTemplate(character.emotion)
}

function buildPrompt(character: PixelCharacter, personality?: CharacterPersonality): string {
  const personalityDesc = personality
    ? `\n你的性格是"${personality.personality}"，说话风格是"${personality.speechStyle}"，口头禅是"${personality.catchphrase}"，怪癖是"${personality.quirks}"。请用符合你性格的方式来抱怨。`
    : ''

  return `你是一个像素小人，名字是${character.name}。
你的主人有${character.todos.length}个待办还没完成，
其中${character.overdueCount}个已经逾期，最久的一个逾期了${character.overdueDays}天。
你的情绪等级是${character.emotion}。${personalityDesc}
请用简短幽默的方式抱怨一下（30字以内），表达你的不满或催促。不要加任何前缀或标点符号外的修饰。`
}

export async function generatePersonalityByAI(
  characterName: string,
  config: AIConfig
): Promise<Omit<CharacterPersonality, 'id' | 'characterName' | 'initializedAt' | 'source'> | null> {
  const prompt = `为名叫"${characterName}"的像素小镇居民生成一个有趣的性格设定。
要求：性格要有趣、有辨识度，不要太负面，要有可爱的缺点。

请严格按照以下JSON格式返回，不要添加任何其他内容：
{"personality":"性格关键词","speechStyle":"说话风格","catchphrase":"口头禅","quirks":"小怪癖"}`

  const result = await callAIAPI(prompt, config, 200)
  if (!result) return null

  const jsonMatch = result.match(/\{[^}]+\}/)
  if (!jsonMatch) return null

  try {
    const parsed = JSON.parse(jsonMatch[0])
    return {
      personality: parsed.personality || '普通',
      speechStyle: parsed.speechStyle || '正常说话',
      catchphrase: parsed.catchphrase || '嗯',
      quirks: parsed.quirks || '没什么特别的',
    }
  } catch {
    return null
  }
}