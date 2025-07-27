import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for testing (will be replaced with Greenfield)
let mockGroups: any[] = []

export async function POST(request: NextRequest) {
  try {
    const { groupId, groupData } = await request.json()
    if (!groupId || !groupData) {
      return NextResponse.json({ error: "Group ID and data are required" }, { status: 400 })
    }
    
    console.log('📤 POST /api/groups/store - Storing group:', groupId)

    // Add metadata fields if needed
    const metadata = {
      groupId,
      ...groupData,
      createdAt: new Date().toISOString(),
      version: "1.0",
    }

    // Add to mock storage
    mockGroups.push(metadata)
    
    console.log('✅ Group stored successfully:', groupId)
    console.log('📊 Total groups in storage:', mockGroups.length)

    return NextResponse.json({
      success: true,
      objectName: `groups/group_${groupId}.json`,
      transactionHash: `mock_${Date.now()}`,
      metadata,
    })
  } catch (error) {
    console.error('❌ Error storing group data in Greenfield:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 