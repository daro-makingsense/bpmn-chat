export interface BpmnElement {
  id: string
  type: string
  name?: string
  incoming?: string[]
  outgoing?: string[]
  sourceRef?: string
  targetRef?: string
}

export interface BpmnProcess {
  id: string
  name?: string
  elements: BpmnElement[]
}

export interface BpmnDiagram {
  processes: BpmnProcess[]
  xml: string
}

export interface BpmnAnalysisResult {
  summary: string
  issues: string[]
  suggestions: string[]
  complexity: 'low' | 'medium' | 'high'
}

export interface BpmnModificationRequest {
  type: 'add' | 'remove' | 'modify' | 'connect'
  elementId?: string
  elementType?: string
  properties?: Record<string, any>
  sourceId?: string
  targetId?: string
}

export interface AssistantContext {
  mode: 'create' | 'analyze' | 'modify' | 'explain'
  currentDiagram?: string
  history: string[]
  userRequest: string
}