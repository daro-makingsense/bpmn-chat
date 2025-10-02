import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface CompletionRequest {
  messages: OpenAI.Chat.ChatCompletionMessageParam[]
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export async function createCompletion({
  messages,
  temperature = 0.7,
  maxTokens = 2000,
  stream = false
}: CompletionRequest) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
    })

    return response
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to create completion')
  }
}

export async function* streamCompletion({
  messages,
  temperature = 0.7,
  maxTokens = 2000
}: CompletionRequest) {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error) {
    console.error('OpenAI streaming error:', error)
    throw new Error('Failed to stream completion')
  }
}