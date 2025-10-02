export function extractBpmnXml(content: string): string | null {
  // Try to find BPMN XML in the content
  // Look for patterns that indicate BPMN XML
  
  // Pattern 1: Content between ```xml and ``` blocks
  const codeBlockMatch = content.match(/```xml\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  
  // Pattern 2: Content between ``` and ``` blocks that contains BPMN
  const genericCodeBlockMatch = content.match(/```\s*([\s\S]*?)```/);
  if (genericCodeBlockMatch && genericCodeBlockMatch[1] && genericCodeBlockMatch[1].includes('bpmn:definitions')) {
    return genericCodeBlockMatch[1].trim();
  }
  
  // Pattern 3: Direct XML content starting with <?xml
  const xmlMatch = content.match(/<\?xml[\s\S]*?<\/bpmn:definitions>/);
  if (xmlMatch) {
    return xmlMatch[0];
  }
  
  // Pattern 4: BPMN definitions without XML declaration
  const bpmnMatch = content.match(/<bpmn:definitions[\s\S]*?<\/bpmn:definitions>/);
  if (bpmnMatch) {
    // Add XML declaration if missing
    return `<?xml version="1.0" encoding="UTF-8"?>\n${bpmnMatch[0]}`;
  }
  
  return null;
}

export function isValidBpmnXml(xml: string): boolean {
  // Basic validation to check if it's likely valid BPMN XML
  return xml.includes('bpmn:definitions') && 
         xml.includes('bpmn:process') &&
         (xml.includes('<?xml') || xml.includes('<bpmn:definitions'));
}