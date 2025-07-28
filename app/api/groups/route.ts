import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    console.log('📥 GET /api/groups - Fetching groups from BNB Greenfield')
    
    const client = await initGreenfield()
    
    // List all objects in the groups folder
    const listObjectsResponse = await client.object.listObjects({
      bucketName: GREENFIELD_CONFIG.bucketName,
      prefix: "groups/",
      maxKeys: 1000,
    })

    console.log('📊 Found objects in Greenfield:', listObjectsResponse.objects?.length || 0)

    if (!listObjectsResponse.objects || listObjectsResponse.objects.length === 0) {
      console.log('📭 No groups found in Greenfield')
      return NextResponse.json({
        success: true,
        groups: []
      })
    }

    // Fetch all group data
    const groups = []
    for (const object of listObjectsResponse.objects) {
      try {
        console.log('📥 Fetching group:', object.objectName)
        const objectData = await client.object.downloadFile({
          bucketName: GREENFIELD_CONFIG.bucketName,
          objectName: object.objectName,
        })
        const groupData = JSON.parse(objectData.toString())
        groups.push(groupData)
        console.log('✅ Group loaded:', groupData.groupId)
      } catch (error) {
        console.error(`❌ Error fetching group ${object.objectName}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log('✅ Successfully loaded groups from BNB Greenfield:', groups.length)
    
    return NextResponse.json({
      success: true,
      groups,
    })
  } catch (error) {
    console.error("❌ Error retrieving groups from BNB Greenfield:", error instanceof Error ? error.message : error)
    return NextResponse.json({
      error: "Failed to retrieve groups from BNB Greenfield",
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

    console.log('📤 POST /api/groups - Storing group in BNB Greenfield:', groupId)
    
    const client = await initGreenfield()
    const objectName = `groups/group_${groupId}.json`
    
    // Generate invite code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let inviteCode = ''
    for (let i = 0; i < 6; i++) {
      inviteCode += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    const metadata = {
      groupId,
      ...groupData,
      inviteCode,
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
      objectName,
      transactionHash: createObjectTx.transactionHash,
      metadata,
    })
  } catch (error) {
    console.error("❌ Error storing group data in BNB Greenfield:", error instanceof Error ? error.message : error)
    return NextResponse.json({
      error: "Failed to store group data in BNB Greenfield",
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
} 