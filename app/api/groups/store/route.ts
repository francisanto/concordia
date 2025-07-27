import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@bnb-chain/greenfield-js-sdk'

const GREENFIELD_CONFIG = {
  endpoint: process.env.GREENFIELD_ENDPOINT || "https://gnfd-testnet-sp1.bnbchain.org",
  chainId: process.env.GREENFIELD_CHAIN_ID || 5600,
  bucketName: process.env.GREENFIELD_BUCKET || "concordia-data",
}

let greenfieldClient: any = null

async function initGreenfield() {
  if (!greenfieldClient) {
    greenfieldClient = Client.create(GREENFIELD_CONFIG.endpoint, String(GREENFIELD_CONFIG.chainId))
  }
  return greenfieldClient
}

export async function POST(request: NextRequest) {
  try {
    const { groupId, groupData } = await request.json()
    if (!groupId || !groupData) {
      return NextResponse.json({ error: "Group ID and data are required" }, { status: 400 })
    }
    const client = await initGreenfield()
    const objectName = `groups/group_${groupId}.json`

    // Add metadata fields if needed
    const metadata = {
      groupId,
      ...groupData,
      createdAt: new Date().toISOString(),
      version: "1.0",
    }

    // Store in Greenfield
    const createObjectTx = await client.object.createObject({
      bucketName: GREENFIELD_CONFIG.bucketName,
      objectName: objectName,
      creator: process.env.GREENFIELD_ACCOUNT_ADDRESS,
      visibility: "VISIBILITY_TYPE_PUBLIC_READ",
      contentType: "application/json",
      redundancyType: "REDUNDANCY_EC_TYPE",
      payload: Buffer.from(JSON.stringify(metadata)),
    })

    return NextResponse.json({
      success: true,
      objectName,
      transactionHash: createObjectTx.transactionHash,
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