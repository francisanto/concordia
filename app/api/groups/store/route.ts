import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@bnb-chain/greenfield-js-sdk'

const GREENFIELD_CONFIG = {
  endpoint: process.env.GREENFIELD_ENDPOINT || "https://gnfd-testnet-sp1.bnbchain.org",
  chainId: process.env.GREENFIELD_CHAIN_ID || 5600,
  bucketName: process.env.GREENFIELD_BUCKET || "0x000000000000000000000000000000000000000000000000000000000000566f",
}

let greenfieldClient: any = null

async function initGreenfield() {
  if (!greenfieldClient) {
    try {
      greenfieldClient = Client.create(GREENFIELD_CONFIG.endpoint, String(GREENFIELD_CONFIG.chainId))
      console.log('✅ Greenfield client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Greenfield client:', error)
      throw error
    }
  }
  return greenfieldClient
}

export async function POST(request: NextRequest) {
  try {
    const { groupId, groupData } = await request.json()
    if (!groupId || !groupData) {
      return NextResponse.json({ error: "Group ID and data are required" }, { status: 400 })
    }
    
    console.log('📤 POST /api/groups/store - Storing group in BNB Greenfield:', groupId)

    const client = await initGreenfield()
    const objectName = `groups/group_${groupId}.json`

    // Add metadata fields if needed
    const metadata = {
      groupId,
      ...groupData,
      createdAt: new Date().toISOString(),
      version: "1.0",
    }

    console.log('💾 Storing group data in BNB Greenfield...')

    // Store in BNB Greenfield
    const createObjectTx = await client.object.createObject({
      bucketName: GREENFIELD_CONFIG.bucketName,
      objectName: objectName,
      creator: process.env.GREENFIELD_ACCOUNT_ADDRESS || "0x0000000000000000000000000000000000000000",
      visibility: "VISIBILITY_TYPE_PUBLIC_READ",
      contentType: "application/json",
      redundancyType: "REDUNDANCY_EC_TYPE",
      payload: Buffer.from(JSON.stringify(metadata)),
    })
    
    console.log('✅ Group stored successfully in BNB Greenfield:', groupId)
    console.log('🔗 Transaction hash:', createObjectTx.transactionHash)

    return NextResponse.json({
      success: true,
      objectName: objectName,
      transactionHash: createObjectTx.transactionHash,
      metadata,
    })
  } catch (error) {
    console.error('❌ Error storing group data in BNB Greenfield:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 