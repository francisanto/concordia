import { ethers } from 'ethers';

export interface GroupMetadata {
  groupId: string;
  name: string;
  description: string;
  creator: string;
  goalAmount: number;
  duration: number;
  withdrawalDate: string;
  dueDay: number;
  members: MemberData[];
  contributions: ContributionData[];
  settings: GroupSettings;
  blockchain: BlockchainData;
  greenfield: GreenfieldData;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface MemberData {
  address: string;
  nickname: string;
  joinedAt: string;
  role: 'creator' | 'member';
  contribution: number;
  auraPoints: number;
  hasVoted: boolean;
  status?: 'active' | 'inactive';
}

export interface ContributionData {
  id: string;
  contributor: string;
  memberAddress?: string; // Alternative field name for compatibility
  amount: number;
  timestamp: string;
  auraPoints: number;
  isEarly: boolean;
  transactionHash: string;
  status?: 'pending' | 'confirmed' | 'failed';
}

export interface GroupSettings {
  dueDay: number;
  duration: string;
  withdrawalDate: string;
  isActive: boolean;
  maxMembers: number;
  publicAccess?: boolean; // Allow all team members to access
}

export interface BlockchainData {
  contractAddress: string;
  transactionHash: string;
  blockNumber: string;
  gasUsed: string;
  network: string;
}

export interface GreenfieldData {
  objectId: string;
  objectName: string;
  metadataHash: string;
  bucketName: string;
  endpoint: string;
  publicRead?: boolean; // Make data publicly readable for team members
}

export class GreenfieldService {
  private apiBaseUrl: string;
  private contractAddress: string;
  private bucketId: string;

  constructor() {
    // Use relative URLs for API routes in Next.js
    this.apiBaseUrl = typeof window !== 'undefined' ? '' : 'https://concordia-production.up.railway.app';
    this.contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
    
    // Use your specific bucket ID
    this.bucketId = '0x000000000000000000000000000000000000000000000000000000000000566f';
  }

  /**
   * Store group data in Greenfield
   */
  async storeGroupData(groupId: string, groupData: Partial<GroupMetadata>): Promise<{
    success: boolean;
    objectId?: string;
    metadataHash?: string;
    error?: string;
  }> {
    try {
      console.log('📤 Storing group data in Greenfield:', { groupId, groupData });

      const response = await fetch(`${this.apiBaseUrl}/api/groups/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          groupData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to store group data');
      }

      console.log('✅ Group data stored successfully:', result);
      return {
        success: true,
        objectId: result.objectId,
        metadataHash: result.metadataHash,
      };
    } catch (error) {
      console.error('❌ Error storing group data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Retrieve group data from Greenfield
   */
  async getGroupData(groupId: string): Promise<{
    success: boolean;
    data?: GroupMetadata;
    error?: string;
  }> {
    try {
      console.log('📥 Retrieving group data from Greenfield:', groupId);

      const response = await fetch(`${this.apiBaseUrl}/api/groups/${groupId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to retrieve group data');
      }

      console.log('✅ Group data retrieved successfully:', result);
      return {
        success: true,
        data: result.metadata,
      };
    } catch (error) {
      console.error('❌ Error retrieving group data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update group metadata in Greenfield
   */
  async updateGroupMetadata(groupId: string, updates: Partial<GroupMetadata>): Promise<{
    success: boolean;
    metadataHash?: string;
    error?: string;
  }> {
    try {
      console.log('🔄 Updating group metadata in Greenfield:', { groupId, updates });

      const response = await fetch(`${this.apiBaseUrl}/api/groups/${groupId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updates,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update group metadata');
      }

      console.log('✅ Group metadata updated successfully:', result);
      return {
        success: true,
        metadataHash: result.metadataHash,
      };
    } catch (error) {
      console.error('❌ Error updating group metadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store contribution data in Greenfield
   */
  async storeContribution(groupId: string, contributionData: ContributionData): Promise<{
    success: boolean;
    contributionId?: string;
    error?: string;
  }> {
    try {
      console.log('📤 Storing contribution in Greenfield:', { groupId, contributionData });

      const response = await fetch(`${this.apiBaseUrl}/api/contributions/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          contributionData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to store contribution');
      }

      console.log('✅ Contribution stored successfully:', result);
      return {
        success: true,
        contributionId: result.contributionId,
      };
    } catch (error) {
      console.error('❌ Error storing contribution:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get contribution history from Greenfield
   */
  async getContributionHistory(groupId: string): Promise<{
    success: boolean;
    contributions?: ContributionData[];
    error?: string;
  }> {
    try {
      console.log('📥 Retrieving contribution history from Greenfield:', groupId);

      const response = await fetch(`${this.apiBaseUrl}/api/contributions/${groupId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to retrieve contribution history');
      }

      console.log('✅ Contribution history retrieved successfully:', result);
      return {
        success: true,
        contributions: result.contributions,
      };
    } catch (error) {
      console.error('❌ Error retrieving contribution history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload file to Greenfield
   */
  async uploadFile(file: File): Promise<{
    success: boolean;
    objectId?: string;
    objectName?: string;
    url?: string;
    error?: string;
  }> {
    try {
      console.log('📤 Uploading file to Greenfield:', file.name);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.apiBaseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload file');
      }

      console.log('✅ File uploaded successfully:', result);
      return {
        success: true,
        objectId: result.objectId,
        objectName: result.objectName,
        url: result.url,
      };
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate metadata hash for group data
   */
  generateMetadataHash(data: any): string {
    const dataString = JSON.stringify(data, Object.keys(data).sort());
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  }

  /**
   * Verify metadata integrity
   */
  verifyMetadataIntegrity(data: any, expectedHash: string): boolean {
    const actualHash = this.generateMetadataHash(data);
    return actualHash === expectedHash;
  }

  /**
   * Create comprehensive group metadata
   */
  createGroupMetadata(params: {
    groupId: string;
    name: string;
    description: string;
    creator: string;
    goalAmount: number;
    duration: string;
    withdrawalDate: string;
    dueDay: number;
    contractAddress: string;
    transactionHash: string;
    blockNumber: string;
    gasUsed: string;
    objectId: string;
    objectName: string;
    bucketName: string;
    endpoint: string;
  }): GroupMetadata {
    const metadata: GroupMetadata = {
      groupId: params.groupId,
      name: params.name,
      description: params.description,
      creator: params.creator,
      goalAmount: params.goalAmount,
      duration: params.duration === '1-month' ? 30 : 
                params.duration === '3-months' ? 90 : 
                params.duration === '6-months' ? 180 : 365,
      withdrawalDate: params.withdrawalDate,
      dueDay: params.dueDay,
      members: [
        {
          address: params.creator,
          nickname: 'Creator',
          joinedAt: new Date().toISOString(),
          role: 'creator',
          contribution: 0,
          auraPoints: 5,
          hasVoted: false,
        },
      ],
      contributions: [],
      settings: {
        dueDay: params.dueDay,
        duration: params.duration,
        withdrawalDate: params.withdrawalDate,
        isActive: true,
        maxMembers: 10,
      },
      blockchain: {
        contractAddress: params.contractAddress,
        transactionHash: params.transactionHash,
        blockNumber: params.blockNumber,
        gasUsed: params.gasUsed,
        network: 'opBNB Testnet',
      },
      greenfield: {
        objectId: params.objectId,
        objectName: params.objectName,
        metadataHash: '',
        bucketName: params.bucketName,
        endpoint: params.endpoint,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0',
    };

    // Generate metadata hash
    metadata.greenfield.metadataHash = this.generateMetadataHash(metadata);

    return metadata;
  }

  /**
   * Get all groups from Greenfield
   */
  async getAllGroups(): Promise<{
    success: boolean;
    data?: GroupMetadata[];
    error?: string;
  }> {
    try {
      console.log('📥 Retrieving all groups from Greenfield');

      const response = await fetch(`${this.apiBaseUrl}/api/groups`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to retrieve groups');
      }

      console.log('✅ All groups retrieved successfully:', result);
      return {
        success: true,
        data: result.groups || [],
      };
    } catch (error) {
      console.error('❌ Error retrieving all groups:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete group data from Greenfield
   */
  async deleteGroupData(groupId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🗑️ Deleting group data from Greenfield:', groupId);

      const response = await fetch(`${this.apiBaseUrl}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete group data');
      }

      console.log('✅ Group data deleted successfully:', result);
      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Error deleting group data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const greenfieldService = new GreenfieldService(); 