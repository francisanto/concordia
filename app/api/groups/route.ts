import { NextResponse } from 'next/server'

// Simple in-memory storage for testing (will be replaced with Greenfield)
let mockGroups: any[] = []

export async function GET() {
  try {
    console.log('📥 GET /api/groups - Fetching groups')
    
    // For now, return mock groups for testing
    console.log('✅ Returning mock groups:', mockGroups.length)
    
    return NextResponse.json({
      success: true,
      groups: mockGroups,
    })
  } catch (error) {
    console.error("❌ Error retrieving groups:", error instanceof Error ? error.message : error)
    return NextResponse.json({
      error: "Failed to retrieve groups",
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { groupId, groupData } = await request.json()
    
    if (!groupId || !groupData) {
      return NextResponse.json({ error: "Group ID and data are required" }, { status: 400 })
    }

    console.log('📤 POST /api/groups - Storing group:', groupId)
    
    // For now, store in mock storage
    const metadata = {
      groupId,
      ...groupData,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
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
    console.error("❌ Error storing group data:", error instanceof Error ? error.message : error)
    return NextResponse.json({
      error: "Failed to store group data",
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
} 