import BpmnModeler from 'bpmn-js/lib/Modeler'
import { layoutProcess } from 'bpmn-auto-layout'

export class BpmnService {
  private modeler: BpmnModeler | null = null

  initialize(container: HTMLElement) {
    this.modeler = new BpmnModeler({
      container,
      keyboard: {
        bindTo: window
      }
    })
  }

  async createDiagram(xml?: string) {
    if (!this.modeler) {
      throw new Error('Modeler not initialized')
    }

    const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  id="Definitions_1" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">
        <dc:Bounds x="173" y="102" width="36" height="36"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

    try {
      await this.modeler.importXML(xml || defaultXml)
    } catch (error) {
      console.error('Failed to import BPMN diagram:', error)
      throw error
    }
  }

  async exportDiagram(): Promise<string> {
    if (!this.modeler) {
      throw new Error('Modeler not initialized')
    }

    try {
      const result = await this.modeler.saveXML({ format: true })
      return result.xml || ''
    } catch (error) {
      console.error('Failed to export BPMN diagram:', error)
      throw error
    }
  }

  async autoLayout(xml: string): Promise<string> {
    try {
      const layoutedXml = await layoutProcess(xml)
      return layoutedXml
    } catch (error) {
      console.error('Failed to auto-layout diagram:', error)
      throw error
    }
  }

  getModeler() {
    return this.modeler
  }

  destroy() {
    if (this.modeler) {
      this.modeler.destroy()
      this.modeler = null
    }
  }
}

export const bpmnService = new BpmnService()