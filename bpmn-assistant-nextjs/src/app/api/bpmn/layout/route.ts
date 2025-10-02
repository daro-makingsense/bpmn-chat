import { NextRequest, NextResponse } from 'next/server'
import { layoutProcess } from 'bpmn-auto-layout'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { xml } = body

    if (!xml) {
      return NextResponse.json(
        { error: 'BPMN XML is required' },
        { status: 400 }
      )
    }

    // Apply auto-layout to the BPMN diagram
    const layoutedXml = await layoutProcess(xml)

    return NextResponse.json({ xml: layoutedXml })
  } catch (error) {
    console.error('Auto-layout error:', error)
    return NextResponse.json(
      { error: 'Failed to apply auto-layout to the diagram' },
      { status: 500 }
    )
  }
}