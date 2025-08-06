
import { NextResponse } from 'next/server';
import { Client } from '@bnb-chain/greenfield-js-sdk';

const GREENFIELD_CONFIG = {
  endpoint: process.env.GREENFIELD_ENDPOINT || 'https://gnfd-testnet-sp1.bnbchain.org',
  chainId: parseInt(process.env.GREENFIELD_CHAIN_ID || '5600'),
  bucketName: process.env.GREENFIELD_BUCKET || '0x000000000000000000000000000000000000000000000000000000000000566f',
}

let greenfieldClient: any = null

async function initGreenfield() {
  if (!greenfieldClient) {
    try {
      greenfieldClient = Client.create(GREENFIELD_CONFIG.endpoint, String(GREENFIELD_CONFIG.chainId))
      console.log('✅ Greenfield client initialized for access check')
    } catch (error) {
      console.error('❌ Failed to initialize Greenfield client:', error)
      throw error
    }
  }
  return greenfieldClient
}

export async function GET(request: Request, { params }: { params: { groupId: string } }) {
  try {
    const { groupId } = params
    const url = new URL(request.url)
    const userAddress = url.searchParams.get('address')
    
    console.log('🔐 Checking access for group:', groupId, 'user:', userAddress)
    
    if (!userAddress) {
      return NextResponse.json({
        canRead: false,
        canWrite: false,
        isCreator: false,
        error: 'User address required'
      }, { status: 400 })
    }
    
    const client = await initGreenfield()
    
    // Get group data to check membership
    try {
      const groupBucketName = `concordia-group-${groupId.toLowerCase()}`
      
      // Try to get group data from the group's bucket
      const groupObjectData = await client.object.downloadFile({
        bucketName: groupBucketName,
        objectName: `groups/${groupId}/data.json`,
      })
      
      const groupData = JSON.parse(groupObjectData.toString())
      
      // Check if user is the creator
      const isCreator = groupData.creator?.toLowerCase() === userAddress.toLowerCase()
      
      // Check if user is a member
      const isMember = groupData.members?.some((member: any) => 
        member.address?.toLowerCase() === userAddress.toLowerCase()
      )
      
      console.log('🔍 Access check results:', { isCreator, isMember, userAddress })
      
      return NextResponse.json({
        canRead: isCreator || isMember,
        canWrite: isCreator || isMember, // Members can contribute/add data
        isCreator: isCreator,
        isMember: isMember,
        groupId: groupId,
        userAddress: userAddress,
      })
      
    } catch (accessError) {
      console.error('❌ Error checking group access:', accessError)
      
      // If we can't access the group, user has no permissions
      return NextResponse.json({
        canRead: false,
        canWrite: false,
        isCreator: false,
        isMember: false,
        error: 'Group not found or access denied',
      })
    }
    
  } catch (error) {
    console.error('❌ Error in access check:', error)
    return NextResponse.json({
      canRead: false,
      canWrite: false,
      isCreator: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
