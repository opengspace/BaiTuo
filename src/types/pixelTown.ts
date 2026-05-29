/** 情绪等级 */
export type EmotionLevel = 'happy' | 'neutral' | 'sad' | 'angry'

/** 小人实体 */
export interface PixelCharacter {
  id: string              // 基于拜托人名生成唯一ID
  name: string            // 拜托人名称
  todos: string[]         // 该拜托人的所有未完成待办ID
  overdueCount: number    // 逾期待办数量
  overdueDays: number     // 最大逾期天数
  emotion: EmotionLevel   // 当前情绪等级
  position: { x: number; y: number }  // 小镇中的位置
  currentFrame: number    // 当前动画帧索引
  hasNewComplaint: boolean // 是否有新抱怨未查看
}

/** 抱怨记录 */
export interface ComplaintRecord {
  id: string
  characterId: string     // 关联的小人ID
  requesterName: string   // 拜托人名
  content: string         // 抱怨内容
  generatedAt: number     // 生成时间戳
  emotion: EmotionLevel   // 当时情绪
  todoIds: string[]       // 关联的待办ID列表
  source: 'ai' | 'template' // 内容来源
}

/** AI 提供商 */
export type AIProvider = 'openai' | 'deepseek' | 'moonshot' | 'zhipu' | 'anthropic' | 'gemini' | 'custom'

/** AI 提供商预设 */
export const AI_PROVIDER_PRESETS: Record<AIProvider, { label: string; defaultEndpoint: string; defaultModel: string }> = {
  openai: { label: 'OpenAI', defaultEndpoint: 'https://api.openai.com/v1/chat/completions', defaultModel: 'gpt-4o-mini' },
  deepseek: { label: 'DeepSeek', defaultEndpoint: 'https://api.deepseek.com/v1/chat/completions', defaultModel: 'deepseek-chat' },
  moonshot: { label: 'Moonshot', defaultEndpoint: 'https://api.moonshot.cn/v1/chat/completions', defaultModel: 'moonshot-v1-8k' },
  zhipu: { label: '智谱 GLM', defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', defaultModel: 'glm-4-flash' },
  anthropic: { label: 'Anthropic', defaultEndpoint: 'https://api.anthropic.com/v1/messages', defaultModel: 'claude-3-haiku-20240307' },
  gemini: { label: 'Gemini', defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', defaultModel: 'gemini-2.0-flash' },
  custom: { label: '自定义 (OpenAI兼容)', defaultEndpoint: '', defaultModel: '' },
}

/** AI 配置 */
export interface AIConfig {
  id?: string
  enabled: boolean
  provider: AIProvider
  apiKey: string
  apiEndpoint?: string
  model?: string
}

/** 默认 AI 配置 */
export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
}

/** 角色性格 */
export interface CharacterPersonality {
  id: string              // 同角色ID: char-{name}
  characterName: string
  personality: string     // 性格关键词（如：急躁、傲娇、毒舌）
  speechStyle: string    // 说话风格描述
  catchphrase: string    // 口癖/口头禅
  quirks: string         // 小怪癖
  initializedAt: number
  source: 'ai' | 'preset'
}

/** 性格预设模板（AI未配置时随机分配） */
export const PERSONALITY_PRESETS: Omit<CharacterPersonality, 'id' | 'characterName' | 'initializedAt' | 'source'>[] = [
  { personality: '急躁', speechStyle: '喜欢催促和命令，语气急切', catchphrase: '啧', quirks: '动不动就叹气，总觉得时间不够' },
  { personality: '温柔', speechStyle: '喜欢用鼓励语气，说话柔和', catchphrase: '嗯', quirks: '总是先说没关系，但其实很在意' },
  { personality: '傲娇', speechStyle: '喜欢说反话，嘴硬心软', catchphrase: '哼', quirks: '嘴上说不在乎，心里全记着' },
  { personality: '毒舌', speechStyle: '喜欢讽刺和挖苦，一针见血', catchphrase: '呵', quirks: '每次都要损一句才觉得舒服' },
  { personality: '幽默', speechStyle: '喜欢讲笑话和类比，化解尴尬', catchphrase: '哈', quirks: '总能用段子把气氛搞轻松' },
  { personality: '唠叨', speechStyle: '喜欢反复提醒，不厌其烦', catchphrase: '唉', quirks: '能把一件事说三遍不嫌多' },
  { personality: '佛系', speechStyle: '喜欢说随缘，语气淡定', catchphrase: '哦', quirks: '表面无所谓，其实什么都记着' },
  { personality: '戏精', speechStyle: '喜欢夸张表达，小题大做', catchphrase: '天呐', quirks: '小事也能演出一出大戏' },
]

/** 情绪等级标签 */
export const EMOTION_LABELS: Record<EmotionLevel, { label: string; emoji: string }> = {
  happy: { label: '开心', emoji: '😊' },
  neutral: { label: '平静', emoji: '😐' },
  sad: { label: '难过', emoji: '😢' },
  angry: { label: '气愤', emoji: '😠' },
}