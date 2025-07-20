import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { groupId, groupData, address, privateKey } = await request.json();

    console.log('📤 Storing group data:', { groupId, groupData });

    // For now, just return success since we're using client-side storage
    // The actual storage happens on the client side through the data persistence service
    console.log('✅ Group data processed successfully:', groupId);
    
    return NextResponse.json({
      success: true,
      objectId: groupId,
      metadataHash: `hash_${groupId}_${Date.now()}`,
      message: 'Group data will be stored on client side'
    });
  } catch (error) {
    console.error('❌ Error processing group data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 