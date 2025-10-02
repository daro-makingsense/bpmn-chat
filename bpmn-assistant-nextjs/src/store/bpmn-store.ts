import { create } from 'zustand'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface BpmnState {
  // BPMN diagram state
  currentDiagram: string | null
  diagramHistory: string[]
  isProcessing: boolean
  
  // Chat state
  messages: Message[]
  isStreaming: boolean
  
  // Assistant state
  assistantMode: 'create' | 'analyze' | 'modify' | 'explain'
  currentTask: string | null
  
  // Actions
  setDiagram: (diagram: string) => void
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateMessage: (id: string, content: string) => void
  setStreaming: (streaming: boolean) => void
  setProcessing: (processing: boolean) => void
  setAssistantMode: (mode: BpmnState['assistantMode']) => void
  setCurrentTask: (task: string | null) => void
  clearChat: () => void
  reset: () => void
}

export const useBpmnStore = create<BpmnState>((set) => ({
  // Initial state
  currentDiagram: null,
  diagramHistory: [],
  isProcessing: false,
  messages: [],
  isStreaming: false,
  assistantMode: 'create',
  currentTask: null,
  
  // Actions
  setDiagram: (diagram) => set((state) => ({
    currentDiagram: diagram,
    diagramHistory: [...state.diagramHistory, diagram]
  })),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    }]
  })),
  
  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === id ? { ...msg, content } : msg
    )
  })),
  
  setStreaming: (streaming) => set({ isStreaming: streaming }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setAssistantMode: (mode) => set({ assistantMode: mode }),
  setCurrentTask: (task) => set({ currentTask: task }),
  
  clearChat: () => set({ messages: [] }),
  
  reset: () => set({
    currentDiagram: null,
    diagramHistory: [],
    isProcessing: false,
    messages: [],
    isStreaming: false,
    assistantMode: 'create',
    currentTask: null
  })
}))