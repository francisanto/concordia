import { NextRequest, NextResponse } from 'next/server';
import { GreenfieldService } from '@/lib/greenfield-service';

const greenfieldService = new GreenfieldService();

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    console.log('📥 Retrieving group data from Greenfield:', groupId);

    const result = await greenfieldService.getGroupData(groupId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to retrieve group data' },
        { status: 500 }
      );
    }

    console.log('✅ Group data retrieved successfully:', groupId);
    return NextResponse.json({
      success: true,
      metadata: result.data,
    });
  } catch (error) {
    console.error('❌ Error retrieving group data:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 