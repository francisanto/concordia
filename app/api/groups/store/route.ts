import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@bnb-chain/greenfield-js-sdk'
import { prisma } from '@/lib/prisma'

const GREENFIELD_CONFIG = {
  endpoint: process.env.GREENFIELD_ENDPOINT || "https://gnfd-testnet-sp1.bnbchain.org",
  chainId: process.env.GREENFIELD_CHAIN_ID || 5600,
  bucketName: process.env.GREENFIELD_BUCKET || "concordia-data",
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

    // Save user data to database for admin tracking
    try {
      console.log('💾 Saving user data to database for admin tracking...')
      
      const creatorAddress = groupData.creator || groupData.createdBy
      if (creatorAddress) {
        // Create or update user in database
        await prisma.user.upsert({
          where: { walletAddress: creatorAddress },
          update: {
            totalAuraPoints: { increment: 10 }, // Give 10 aura points for creating a group
            totalContributed: { increment: groupData.currentAmount || 0 },
            updatedAt: new Date()
          },
          create: {
            walletAddress: creatorAddress,
            nickname: groupData.creatorNickname || 'Creator',
            totalAuraPoints: 10,
            totalContributed: groupData.currentAmount || 0
          }
        })

        // Log admin action
        await prisma.adminLog.create({
          data: {
            action: 'GROUP_CREATED',
            details: {
              groupId,
              creator: creatorAddress,
              groupName: groupData.name,
              amount: groupData.currentAmount
            },
            adminAddress: creatorAddress
          }
        })

        console.log('✅ User data saved to database')
      }
    } catch (dbError) {
      console.warn('⚠️ Database save failed (non-critical):', dbError)
      // Continue even if database save fails - Greenfield storage is the primary
    }

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