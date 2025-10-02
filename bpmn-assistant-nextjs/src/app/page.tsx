'use client'

import React, { useState, useCallback } from 'react'
import { BpmnEditor } from '@/components/bpmn-editor'
import { Chat } from '@/components/chat'
import { useBpmnStore } from '@/store/bpmn-store'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Wand2, 
  FileSearch, 
  Edit3, 
  HelpCircle, 
  Layout,
  Github
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { extractBpmnXml } from '@/lib/bpmn-utils'

export default function Home() {
  const { 
    assistantMode, 
    setAssistantMode, 
    addMessage, 
    updateMessage,
    setStreaming,
    currentDiagram
  } = useBpmnStore()
  
  const [diagramXml, setDiagramXml] = useState<string>('')

  const handleDiagramChange = useCallback((xml: string) => {
    setDiagramXml(xml)
  }, [])

  const handleSendMessage = async (message: string) => {
    try {
      setStreaming(true)
      
      // Add assistant message placeholder
      const assistantMessageId = Date.now().toString()
      addMessage({
        role: 'assistant',
        content: ''
      })

      // Call the assistant API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          context: {
            mode: assistantMode,
            currentDiagram: diagramXml,
            history: []
          },
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response from assistant')
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                break
              }
              try {
                const parsed = JSON.parse(data)
                accumulatedContent += parsed.content
                updateMessage(assistantMessageId, accumulatedContent)
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Check if the response contains BPMN XML and update the editor
      const extractedXml = extractBpmnXml(accumulatedContent)
      if (extractedXml && (assistantMode === 'create' || assistantMode === 'modify')) {
        setDiagramXml(extractedXml)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      })
    } finally {
      setStreaming(false)
    }
  }

  const handleAutoLayout = async () => {
    if (!diagramXml) return

    try {
      const response = await fetch('/api/bpmn/layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xml: diagramXml })
      })

      if (response.ok) {
        const { xml } = await response.json()
        setDiagramXml(xml)
      }
    } catch (error) {
      console.error('Auto-layout error:', error)
    }
  }

  const modes = [
    { id: 'create' as const, label: 'Create', icon: Wand2 },
    { id: 'analyze' as const, label: 'Analyze', icon: FileSearch },
    { id: 'modify' as const, label: 'Modify', icon: Edit3 },
    { id: 'explain' as const, label: 'Explain', icon: HelpCircle },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card p-4 space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold mb-4">BPMN Assistant</h2>
          <div className="space-y-2">
            {modes.map((mode) => (
              <Button
                key={mode.id}
                variant={assistantMode === mode.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setAssistantMode(mode.id)}
              >
                <mode.icon className="mr-2 h-4 w-4" />
                {mode.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleAutoLayout}
            disabled={!diagramXml}
          >
            <Layout className="mr-2 h-4 w-4" />
            Auto Layout
          </Button>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-sm text-muted-foreground">
            Powered by OpenAI GPT-4
          </p>
          <a
            href="https://github.com/jtlicardo/bpmn-assistant"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <Github className="mr-2 h-4 w-4" />
            Original Repository
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* BPMN Editor */}
        <div className="flex-1 p-4">
          <BpmnEditor 
            onDiagramChange={handleDiagramChange}
            initialDiagram={diagramXml}
          />
        </div>

        {/* Chat Interface */}
        <div className="w-96 border-l p-4">
          <Chat onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}