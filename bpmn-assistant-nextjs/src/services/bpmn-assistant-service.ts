import { createCompletion, streamCompletion } from './openai-service'
import { BpmnAnalysisResult, BpmnModificationRequest, AssistantContext } from '@/types/bpmn'

// System prompts for different assistant modes
const SYSTEM_PROMPTS = {
  create: `You are a BPMN expert assistant. Your task is to help users create BPMN diagrams.
When users describe a process, you should:
1. Identify the key activities, events, and gateways
2. Determine the sequence flow between elements
3. Suggest appropriate BPMN elements (tasks, events, gateways, pools, lanes)
4. Provide a clear, structured BPMN XML output
Always respond with valid BPMN 2.0 XML that can be directly imported into a BPMN editor.`,

  analyze: `You are a BPMN expert assistant specializing in process analysis.
When analyzing a BPMN diagram, you should:
1. Identify potential bottlenecks or inefficiencies
2. Check for BPMN best practices and standards compliance
3. Suggest improvements for clarity and efficiency
4. Evaluate the process complexity
5. Identify missing elements or unclear flows
Provide constructive feedback with specific, actionable suggestions.`,

  modify: `You are a BPMN expert assistant helping users modify existing diagrams.
When users request modifications:
1. Understand the current diagram structure
2. Identify the elements to be changed
3. Ensure modifications maintain process integrity
4. Suggest related changes that might be needed
5. Provide the modified BPMN XML
Always maintain valid BPMN 2.0 syntax and ensure the diagram remains coherent.`,

  explain: `You are a BPMN expert assistant explaining BPMN diagrams and concepts.
When explaining:
1. Use clear, non-technical language when possible
2. Explain the purpose of each element
3. Describe the process flow step by step
4. Highlight important decision points and outcomes
5. Relate the process to real-world scenarios
Make BPMN accessible to users of all expertise levels.`
}

export class BpmnAssistantService {
  async createDiagram(description: string, stream: boolean = false) {
    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPTS.create
      },
      {
        role: 'user' as const,
        content: `Create a BPMN diagram for the following process: ${description}
        
Please provide the complete BPMN 2.0 XML code that can be directly imported into a BPMN editor. Make sure to include all necessary namespaces and proper element structure.`
      }
    ]

    if (stream) {
      return streamCompletion({ messages })
    } else {
      const response = await createCompletion({ messages })
      return response.choices[0]?.message?.content || ''
    }
  }

  async analyzeDiagram(diagramXml: string, stream: boolean = false): Promise<BpmnAnalysisResult | AsyncGenerator<string>> {
    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPTS.analyze
      },
      {
        role: 'user' as const,
        content: `Analyze the following BPMN diagram and provide insights:\n\n${diagramXml}`
      }
    ]

    if (stream) {
      return streamCompletion({ messages })
    } else {
      const response = await createCompletion({ messages })
      const content = response.choices[0]?.message?.content || ''
      
      // Parse the response into structured format
      // This is a simplified version - in production, you'd want more robust parsing
      return {
        summary: content.split('\n')[0] || 'No summary available',
        issues: [],
        suggestions: [],
        complexity: 'medium'
      }
    }
  }

  async modifyDiagram(
    diagramXml: string, 
    modificationRequest: string, 
    stream: boolean = false
  ) {
    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPTS.modify
      },
      {
        role: 'user' as const,
        content: `Modify the following BPMN diagram according to this request: "${modificationRequest}"\n\nCurrent diagram:\n${diagramXml}`
      }
    ]

    if (stream) {
      return streamCompletion({ messages })
    } else {
      const response = await createCompletion({ messages })
      return response.choices[0]?.message?.content || ''
    }
  }

  async explainDiagram(diagramXml: string, stream: boolean = false) {
    const messages = [
      {
        role: 'system' as const,
        content: SYSTEM_PROMPTS.explain
      },
      {
        role: 'user' as const,
        content: `Explain the following BPMN diagram in simple terms:\n\n${diagramXml}`
      }
    ]

    if (stream) {
      return streamCompletion({ messages })
    } else {
      const response = await createCompletion({ messages })
      return response.choices[0]?.message?.content || ''
    }
  }

  async processUserQuery(
    query: string, 
    context: AssistantContext, 
    stream: boolean = false
  ) {
    // Determine the appropriate handler based on context and query
    const lowerQuery = query.toLowerCase()
    
    if (context.mode === 'create' || lowerQuery.includes('create') || lowerQuery.includes('design')) {
      return this.createDiagram(query, stream)
    } else if (context.mode === 'analyze' || lowerQuery.includes('analyze') || lowerQuery.includes('review')) {
      return this.analyzeDiagram(context.currentDiagram || '', stream)
    } else if (context.mode === 'modify' || lowerQuery.includes('modify') || lowerQuery.includes('change')) {
      return this.modifyDiagram(context.currentDiagram || '', query, stream)
    } else if (context.mode === 'explain' || lowerQuery.includes('explain') || lowerQuery.includes('what')) {
      return this.explainDiagram(context.currentDiagram || '', stream)
    }
    
    // Default to general assistance
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful BPMN assistant. Help the user with their BPMN-related questions.'
      },
      {
        role: 'user' as const,
        content: query
      }
    ]
    
    if (stream) {
      return streamCompletion({ messages })
    } else {
      const response = await createCompletion({ messages })
      return response.choices[0]?.message?.content || ''
    }
  }
}

export const bpmnAssistantService = new BpmnAssistantService()