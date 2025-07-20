import { NextRequest, NextResponse } from 'next/server';
import { GreenfieldDirectService } from '@/lib/greenfield-direct';

const greenfieldService = new GreenfieldDirectService();

export async function GET(request: NextRequest) {
  try {
    console.log('📥 Retrieving all groups from Greenfield');

    // For public read access, we don't need credentials
    const result = await greenfieldService.getAllGroups();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to retrieve groups' },
        { status: 500 }
      );
    }

    console.log('✅ Groups retrieved successfully:', result.data?.length || 0);
    return NextResponse.json({
      success: true,
      data: result.data || [],
    });
  } catch (error) {
    console.error('❌ Error retrieving groups:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 