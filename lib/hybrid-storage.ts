export interface GroupMetadata {
  id: string;
  name: string;
  description: string;
  creator: string;
  contributionAmount: number;
  currentAmount: number;
  targetAmount: number;
  goal: string;
  duration: string;
  endDate: string;
  withdrawalDate: string;
  isActive: boolean;
  status: string;
  createdBy: string;
  members: any[];
  nextContribution: string;
  createdAt: string;
  updatedAt: string;
  // Greenfield references
  greenfieldBucketId: string;
  greenfieldObjectKey: string;
  greenfieldDataHash: string;
}

export interface GreenfieldData {
  groupId: string;
  metadata: GroupMetadata;
  members: any[];
  contributions: any[];
  transactions: any[];
  settings: any;
}

class HybridStorageService {
  private readonly METADATA_KEY = 'concordia_metadata';
  private readonly BUCKET_NAME = 'concordia-groups';
  private readonly ENDPOINT = 'https://gnfd-testnet-sp1.bnbchain.org';

  /**
   * Initialize Greenfield connection
   */
  private async initGreenfield() {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Greenfield only available in browser');
      }

      // For now, we'll simulate Greenfield storage
      // In a real implementation, you would use the actual Greenfield SDK
      console.log('🌐 Greenfield connection initialized (simulated)');
      return { isSimulated: true };
    } catch (error) {
      console.error('Failed to initialize Greenfield:', error);
      throw error;
    }
  }

  /**
   * Create bucket if it doesn't exist
   */
  private async ensureBucket(client: any, address: string) {
    try {
      const bucketName = this.BUCKET_NAME;
      console.log('✅ Bucket ensured:', bucketName);
      return { bucketName };
    } catch (error) {
      console.error('Failed to ensure bucket:', error);
      throw error;
    }
  }

  /**
   * Store group data in Greenfield (simulated)
   */
  private async storeInGreenfield(groupData: GroupMetadata, fullData: GreenfieldData): Promise<{
    bucketId: string;
    objectKey: string;
    dataHash: string;
  }> {
    try {
      const client = await this.initGreenfield();
      
      // Ensure bucket exists
      await this.ensureBucket(client, groupData.creator);
      
      // Create object key
      const objectKey = `groups/${groupData.id}/data.json`;
      
      // Convert data to JSON string
      const jsonData = JSON.stringify(fullData, null, 2);
      
      // Simulate upload to Greenfield
      // In real implementation, this would upload to actual Greenfield
      console.log('✅ Data prepared for Greenfield upload:', objectKey);
      console.log('📊 Data size:', jsonData.length, 'bytes');
      
      // Store a reference in localStorage for simulation
      localStorage.setItem(`greenfield_data_${groupData.id}`, jsonData);
      
      return {
        bucketId: this.BUCKET_NAME,
        objectKey: objectKey,
        dataHash: `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.error('Failed to store in Greenfield:', error);
      throw error;
    }
  }

  /**
   * Retrieve data from Greenfield (simulated)
   */
  private async getFromGreenfield(bucketId: string, objectKey: string): Promise<GreenfieldData | null> {
    try {
      const client = await this.initGreenfield();
      
      // Extract group ID from object key
      const groupId = objectKey.split('/')[1];
      
      // Get data from localStorage simulation
      const storedData = localStorage.getItem(`greenfield_data_${groupId}`);
      
      if (storedData) {
        const data = JSON.parse(storedData);
        console.log('✅ Data retrieved from Greenfield simulation:', objectKey);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get from Greenfield:', error);
      return null;
    }
  }

  /**
   * Save group with hybrid storage
   */
  async saveGroup(groupData: GroupMetadata): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("💾 Saving group with hybrid storage:", groupData.id);

      // Prepare full data for Greenfield
      const fullData: GreenfieldData = {
        groupId: groupData.id,
        metadata: groupData,
        members: groupData.members || [],
        contributions: [],
        transactions: [],
        settings: {
          dueDay: 1,
          duration: groupData.duration,
          withdrawalDate: groupData.withdrawalDate,
          isActive: groupData.isActive,
          maxMembers: 10,
        }
      };

      // Store in Greenfield
      const greenfieldResult = await this.storeInGreenfield(groupData, fullData);
      
      // Update metadata with Greenfield references
      const metadataWithGreenfield = {
        ...groupData,
        greenfieldBucketId: greenfieldResult.bucketId,
        greenfieldObjectKey: greenfieldResult.objectKey,
        greenfieldDataHash: greenfieldResult.dataHash,
        updatedAt: new Date().toISOString()
      };

      // Store metadata locally
      const metadata = this.loadMetadata();
      const existingIndex = metadata.findIndex((g: GroupMetadata) => g.id === groupData.id);
      
      if (existingIndex !== -1) {
        metadata[existingIndex] = metadataWithGreenfield;
      } else {
        metadata.push(metadataWithGreenfield);
      }
      
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
      
      console.log("✅ Group saved with hybrid storage:", groupData.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving group with hybrid storage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Load all groups (metadata from local, data from Greenfield)
   */
  async loadGroups(): Promise<GroupMetadata[]> {
    try {
      console.log("🔄 Loading groups with hybrid storage...");
      
      const metadata = this.loadMetadata();
      console.log("✅ Loaded metadata from local storage:", metadata.length);
      
      return metadata;
    } catch (error) {
      console.error('❌ Error loading groups with hybrid storage:', error);
      return [];
    }
  }

  /**
   * Get specific group with full data
   */
  async getGroup(groupId: string): Promise<{ metadata: GroupMetadata; fullData?: GreenfieldData } | null> {
    try {
      console.log("🔍 Getting group with hybrid storage:", groupId);

      const metadata = this.loadMetadata();
      const groupMetadata = metadata.find((g: GroupMetadata) => g.id === groupId);
      
      if (!groupMetadata) {
        console.log("❌ Group metadata not found");
        return null;
      }

      // Try to get full data from Greenfield
      let fullData: GreenfieldData | undefined;
      if (groupMetadata.greenfieldObjectKey) {
        const greenfieldData = await this.getFromGreenfield(
          groupMetadata.greenfieldBucketId, 
          groupMetadata.greenfieldObjectKey
        );
        fullData = greenfieldData || undefined;
      }

      console.log("✅ Group retrieved with hybrid storage");
      return { metadata: groupMetadata, fullData };
    } catch (error) {
      console.error('❌ Error getting group with hybrid storage:', error);
      return null;
    }
  }

  /**
   * Update group
   */
  async updateGroup(groupId: string, updates: Partial<GroupMetadata>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔄 Updating group with hybrid storage:", groupId);

      const metadata = this.loadMetadata();
      const groupIndex = metadata.findIndex((g: GroupMetadata) => g.id === groupId);
      
      if (groupIndex === -1) {
        return { success: false, error: 'Group not found' };
      }

      // Update metadata
      const updatedMetadata = { 
        ...metadata[groupIndex], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };

      // If we have Greenfield references, update the full data there too
      if (updatedMetadata.greenfieldObjectKey) {
        const fullData = await this.getFromGreenfield(
          updatedMetadata.greenfieldBucketId, 
          updatedMetadata.greenfieldObjectKey
        );

        if (fullData) {
          // Update the full data
          fullData.metadata = updatedMetadata;
          if (updates.members) fullData.members = updates.members;
          
          // Re-upload to Greenfield
          await this.storeInGreenfield(updatedMetadata, fullData);
        }
      }

      // Update local metadata
      metadata[groupIndex] = updatedMetadata;
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
      
      console.log("✅ Group updated with hybrid storage");
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating group with hybrid storage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Deleting group with hybrid storage:", groupId);

      const metadata = this.loadMetadata();
      const groupToDelete = metadata.find((g: GroupMetadata) => g.id === groupId);
      
      if (groupToDelete && groupToDelete.greenfieldObjectKey) {
        // Delete from Greenfield (simulated)
        try {
          const client = await this.initGreenfield();
          // Remove from localStorage simulation
          localStorage.removeItem(`greenfield_data_${groupId}`);
          console.log("✅ Data deleted from Greenfield simulation");
        } catch (error) {
          console.warn("⚠️ Failed to delete from Greenfield:", error);
        }
      }

      // Remove from local metadata
      const filteredMetadata = metadata.filter((g: GroupMetadata) => g.id !== groupId);
      localStorage.setItem(this.METADATA_KEY, JSON.stringify(filteredMetadata));
      
      console.log("✅ Group deleted with hybrid storage");
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting group with hybrid storage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Load metadata from localStorage
   */
  private loadMetadata(): GroupMetadata[] {
    try {
      const stored = localStorage.getItem(this.METADATA_KEY);
      if (!stored) return [];
      
      const metadata = JSON.parse(stored);
      return Array.isArray(metadata) ? metadata : [];
    } catch (error) {
      console.error('Error loading metadata:', error);
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ 
    totalGroups: number; 
    totalSize: number;
    greenfieldBuckets: number;
    localMetadataSize: number;
  }> {
    try {
      const metadata = this.loadMetadata();
      const metadataSize = JSON.stringify(metadata).length;
      
      return {
        totalGroups: metadata.length,
        totalSize: metadataSize,
        greenfieldBuckets: 1, // We use one bucket
        localMetadataSize: metadataSize
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return { 
        totalGroups: 0, 
        totalSize: 0, 
        greenfieldBuckets: 0, 
        localMetadataSize: 0 
      };
    }
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Clearing all data with hybrid storage");
      
      // Clear local metadata
      localStorage.removeItem(this.METADATA_KEY);
      
      // Note: We don't clear Greenfield data here as it requires authentication
      // Users can manually clear their Greenfield bucket if needed
      
      console.log("✅ All local data cleared");
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export const hybridStorageService = new HybridStorageService(); 