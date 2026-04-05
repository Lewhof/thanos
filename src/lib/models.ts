export type ModelId = 'gpt-4o' | 'claude-sonnet' | 'gemini-pro'

export type ModelConfig = {
  id: ModelId
  label: string
  provider: 'openai' | 'anthropic' | 'google'
  envKey: string
}

export const MODELS: ModelConfig[] = [
  { id: 'gpt-4o',        label: 'GPT-4o',   provider: 'openai',     envKey: 'OPENAI_API_KEY' },
  { id: 'claude-sonnet', label: 'Claude',   provider: 'anthropic',  envKey: 'ANTHROPIC_API_KEY' },
  { id: 'gemini-pro',    label: 'Gemini',   provider: 'google',     envKey: 'GOOGLE_GENERATIVE_AI_API_KEY' },
]

export const DEFAULT_MODEL: ModelId = 'gpt-4o'
