import { EmotionLevel, PixelCharacter, AIConfig } from '@/types'

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

export async function generateComplaintContent(
  character: PixelCharacter,
  aiConfig: AIConfig | null
): Promise<string> {
  if (aiConfig?.enabled && aiConfig.apiKey) {
    try {
      return await callAI(character, aiConfig)
    } catch (error) {
      console.warn('AI generation failed:', error)
      return generateByTemplate(character.emotion)
    }
  }

  return generateByTemplate(character.emotion)
}

async function callAI(character: PixelCharacter, config: AIConfig): Promise<string> {
  const prompt = buildPrompt(character)

  let endpoint = config.apiEndpoint
  const headers: Record<string, string> = {}

  if (config.provider === 'openai') {
    endpoint = endpoint || 'https://api.openai.com/v1/chat/completions'
    headers['Authorization'] = `Bearer ${config.apiKey}`
    headers['Content-Type'] = 'application/json'
  } else if (config.provider === 'anthropic') {
    endpoint = endpoint || 'https://api.anthropic.com/v1/messages'
    headers['x-api-key'] = config.apiKey
    headers['anthropic-version'] = '2023-06-01'
    headers['Content-Type'] = 'application/json'
  } else {
    endpoint = endpoint || ''
    headers['Authorization'] = `Bearer ${config.apiKey}`
    headers['Content-Type'] = 'application/json'
  }

  const model = config.model || (config.provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-haiku-20240307')

  const body = config.provider === 'anthropic'
    ? {
        model,
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      }
    : {
        model,
        max_tokens: 100,
        messages: [{ role: 'user', content: prompt }],
      }

  const response = await fetch(endpoint!, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()

  if (config.provider === 'anthropic') {
    return data.content?.[0]?.text || generateByTemplate(character.emotion)
  }

  return data.choices?.[0]?.message?.content || generateByTemplate(character.emotion)
}

function buildPrompt(character: PixelCharacter): string {
  return `你是一个像素小人，名字是${character.name}。
你的主人有${character.todos.length}个待办还没完成，
其中${character.overdueCount}个已经逾期，最久的一个逾期了${character.overdueDays}天。
你的情绪等级是${character.emotion}。
请用简短幽默的方式抱怨一下（30字以内），表达你的不满或催促。不要加任何前缀或标点符号外的修饰。`
}