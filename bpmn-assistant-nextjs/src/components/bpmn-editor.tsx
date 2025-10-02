'use client'

import React, { useEffect, useRef, useState } from 'react'
import BpmnModeler from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBpmnStore } from '@/store/bpmn-store'
import { bpmnService } from '@/services/bpmn-service'

interface BpmnEditorProps {
  onDiagramChange?: (xml: string) => void
  initialDiagram?: string
}

export function BpmnEditor({ onDiagramChange, initialDiagram }: BpmnEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelerRef = useRef<BpmnModeler | null>(null)
  const { setDiagram, setProcessing } = useBpmnStore()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize the modeler
    const modeler = new BpmnModeler({
      container: containerRef.current,
      keyboard: {
        bindTo: window
      }
    })

    modelerRef.current = modeler

    // Set up event listeners
    modeler.on('commandStack.changed', async () => {
      try {
        const { xml } = await modeler.saveXML({ format: true })
        if (xml) {
          setDiagram(xml)
          onDiagramChange?.(xml)
        }
      } catch (err) {
        console.error('Failed to save XML', err)
      }
    })

    // Load initial diagram
    const loadDiagram = async () => {
      setProcessing(true)
      try {
        const defaultDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_1</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_1" bpmnElement="EndEvent_1">
        <dc:Bounds x="273" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="209" y="120" />
        <di:waypoint x="273" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

        await modeler.importXML(initialDiagram || defaultDiagram)
        setIsReady(true)
      } catch (err) {
        console.error('Failed to import XML', err)
      } finally {
        setProcessing(false)
      }
    }

    loadDiagram()

    // Cleanup
    return () => {
      modeler.destroy()
    }
  }, [initialDiagram, onDiagramChange, setDiagram, setProcessing])

  const handleExport = async () => {
    if (!modelerRef.current) return

    try {
      const { xml } = await modelerRef.current.saveXML({ format: true })
      if (xml) {
        // Create a blob and download
        const blob = new Blob([xml], { type: 'application/xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'diagram.bpmn'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Failed to export diagram', err)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.bpmn,.xml'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file || !modelerRef.current) return

      const reader = new FileReader()
      reader.onload = async (event) => {
        const xml = event.target?.result as string
        try {
          await modelerRef.current!.importXML(xml)
        } catch (err) {
          console.error('Failed to import XML', err)
          alert('Failed to import BPMN file. Please check the file format.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <Card className="relative h-full">
      <div className="absolute top-4 right-4 z-10 space-x-2">
        <Button onClick={handleImport} variant="outline" size="sm">
          Import
        </Button>
        <Button onClick={handleExport} variant="outline" size="sm">
          Export
        </Button>
      </div>
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading BPMN Editor...</p>
          </div>
        </div>
      )}
    </Card>
  )
}