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

export async function GET(
  request: Request,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params
    const client = await initGreenfield()
    const objectName = `groups/group_${groupId}.json`

    // Get object from Greenfield
    const objectInfo = await client.object.headObject(GREENFIELD_CONFIG.bucketName, objectName)

    if (!objectInfo) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 })
    }

    // Download object content
    const objectData = await client.object.downloadFile({
      bucketName: GREENFIELD_CONFIG.bucketName,
      objectName: objectName,
    })

    const metadata = JSON.parse(objectData.toString())

    return NextResponse.json({
      success: true,
      groupId,
      metadata,
      objectInfo,
    })
  } catch (error) {
    console.error("Error retrieving group:", error instanceof Error ? error.message : error)
    return NextResponse.json({
      error: "Failed to retrieve group",
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
} 