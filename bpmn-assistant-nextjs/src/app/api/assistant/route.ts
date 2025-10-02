import { NextRequest, NextResponse } from 'next/server'
import { bpmnAssistantService } from '@/services/bpmn-assistant-service'
import { AssistantContext } from '@/types/bpmn'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, context, stream = true } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    const assistantContext: AssistantContext = {
      mode: context?.mode || 'create',
      currentDiagram: context?.currentDiagram,
      history: context?.history || [],
      userRequest: query
    }

    if (stream) {
      // Set up streaming response
      const encoder = new TextEncoder()
      const readable = new ReadableStream({
        async start(controller) {
          try {
            const generator = await bpmnAssistantService.processUserQuery(
              query,
              assistantContext,
              true
            )

            if (generator && typeof generator === 'object' && Symbol.asyncIterator in generator) {
              for await (const chunk of generator as AsyncGenerator<string>) {
                const data = encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
                controller.enqueue(data)
              }
            }
            
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('Streaming error:', error)
            controller.error(error)
          }
        }
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Non-streaming response
      const response = await bpmnAssistantService.processUserQuery(
        query,
        assistantContext,
        false
      )

      return NextResponse.json({ content: response })
    }
  } catch (error) {
    console.error('Assistant API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}