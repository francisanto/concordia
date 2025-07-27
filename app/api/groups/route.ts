import { NextResponse } from 'next/server'
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

export async function GET() {
  try {
    const client = await initGreenfield()
    
    // List all objects in the groups folder
    const listObjectsResponse = await client.object.listObjects({
      bucketName: GREENFIELD_CONFIG.bucketName,
      prefix: "groups/",
      maxKeys: 1000,
    })

    if (!listObjectsResponse.objects || listObjectsResponse.objects.length === 0) {
      return NextResponse.json({
        success: true,
        groups: []
      })
    }

    // Fetch all group data
    const groups = []
    for (const object of listObjectsResponse.objects) {
      try {
        const objectData = await client.object.downloadFile({
          bucketName: GREENFIELD_CONFIG.bucketName,
          objectName: object.objectName,
        })
        const groupData = JSON.parse(objectData.toString())
        groups.push(groupData)
      } catch (error) {
        console.error(`Error fetching group ${object.objectName}:`, error instanceof Error ? error.message : error)
      }
    }

    return NextResponse.json({
      success: true,
      groups,
    })
  } catch (error) {
    console.error("Error retrieving groups:", error instanceof Error ? error.message : error)
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
    console.error("Error storing group data:", error instanceof Error ? error.message : error)
    return NextResponse.json({
      error: "Failed to store group data",
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
} 