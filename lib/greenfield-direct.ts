import { Client } from '@bnb-chain/greenfield-js-sdk';

export class GreenfieldDirectService {
  private client: Client;
  private bucketId: string;
  private address: string = '';
  private privateKey: string = '';
  private isInitialized: boolean = false;

  constructor() {
    this.bucketId = '0x000000000000000000000000000000000000000000000000000000000000566f';
    
    // Initialize Greenfield client (placeholder for now)
    // TODO: Configure proper Greenfield client when SDK is stable
    this.client = {} as Client;
  }

  /**
   * Initialize with user credentials
   */
  async initialize(address: string, privateKey: string) {
    this.address = address;
    this.privateKey = privateKey;
    this.isInitialized = true;
    
    console.log('✅ Greenfield client initialized with address:', this.address);
  }

  /**
   * Store group data directly in Greenfield
   */
  async storeGroupData(groupId: string, groupData: any): Promise<{
    success: boolean;
    objectId?: string;
    metadataHash?: string;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Greenfield client not initialized');
      }

      console.log('📤 Storing group data directly in Greenfield bucket:', this.bucketId);

      // For now, store in localStorage as fallback since Greenfield SDK is complex
      // This will be replaced with actual Greenfield storage once SDK is properly configured
      if (typeof window !== 'undefined') {
        const storageKey = `greenfield_groups_${groupId}`;
        localStorage.setItem(storageKey, JSON.stringify({
          ...groupData,
          storedAt: new Date().toISOString(),
          greenfieldBucket: this.bucketId,
          greenfieldObjectId: `groups/group_${groupId}.json`
        }));
      }

      console.log('✅ Group data stored successfully (localStorage fallback):', groupId);
      
      return {
        success: true,
        objectId: groupId,
        metadataHash: `hash_${groupId}_${Date.now()}`,
      };
    } catch (error) {
      console.error('❌ Error storing group data in Greenfield:', error);
      
             // Fallback to localStorage
       try {
         if (typeof window !== 'undefined') {
           const storageKey = `greenfield_groups_${groupId}`;
           localStorage.setItem(storageKey, JSON.stringify({
             ...groupData,
             storedAt: new Date().toISOString(),
             fallback: true
           }));
         }
        
        console.log('✅ Group data stored in localStorage fallback:', groupId);
        
        return {
          success: true,
          objectId: groupId,
          metadataHash: `fallback_${groupId}`,
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: `Greenfield failed: ${error instanceof Error ? error.message : 'Unknown error'}, localStorage failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
        };
      }
    }
  }

  /**
   * Get group data from Greenfield
   */
  async getGroupData(groupId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      console.log('📥 Retrieving group data from Greenfield:', groupId);

             // Try to get from localStorage fallback first
       if (typeof window !== 'undefined') {
         const storageKey = `greenfield_groups_${groupId}`;
         const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        const data = JSON.parse(storedData);
        console.log('✅ Group data retrieved successfully from fallback:', data);
        
        return {
          success: true,
          data: data,
        };
      }

      // If not in localStorage, return not found
      return {
        success: false,
        error: 'Group not found',
      };
      }
    } catch (error) {
      console.error('❌ Error retrieving group data from Greenfield:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get all groups from Greenfield (public read)
   */
  async getAllGroups(): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
  }> {
    try {
      console.log('📥 Retrieving all groups from Greenfield bucket:', this.bucketId);

      // Get all groups from localStorage fallback
      const groups: any[] = [];
      
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        
        for (const key of keys) {
          if (key.startsWith('greenfield_groups_')) {
            try {
              const groupData = JSON.parse(localStorage.getItem(key) || '{}');
              if (groupData && groupData.groupId) {
                groups.push(groupData);
              }
            } catch (error) {
              console.warn('Failed to parse group data from key:', key);
            }
          }
        }
      }

      console.log('✅ All groups retrieved successfully from fallback:', groups.length);
      
      return {
        success: true,
        data: groups,
      };
    } catch (error) {
      console.error('❌ Error retrieving all groups from Greenfield:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update group data in Greenfield
   */
  async updateGroupData(groupId: string, updates: any): Promise<{
    success: boolean;
    metadataHash?: string;
    error?: string;
  }> {
    try {
      console.log('🔄 Updating group data in Greenfield:', groupId);

      // Get existing data
      const existingData = await this.getGroupData(groupId);
      if (!existingData.success) {
        throw new Error('Failed to get existing group data');
      }

      // Merge updates
      const updatedData = {
        ...existingData.data,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Store updated data
      const result = await this.storeGroupData(groupId, updatedData);
      
      return {
        success: result.success,
        metadataHash: result.metadataHash,
        error: result.error,
      };
    } catch (error) {
      console.error('❌ Error updating group data in Greenfield:', error);
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

      // Remove from localStorage fallback
      if (typeof window !== 'undefined') {
        const storageKey = `greenfield_groups_${groupId}`;
        localStorage.removeItem(storageKey);
      }

      console.log('✅ Group data deleted successfully from fallback:', groupId);
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Error deleting group data from Greenfield:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store invite data in Greenfield
   */
  async storeInviteData(groupId: string, inviteData: any): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('📤 Storing invite data in Greenfield:', groupId);

      // Store in localStorage fallback
      if (typeof window !== 'undefined') {
        const storageKey = `greenfield_invites_${groupId}`;
        const existingInvites = JSON.parse(localStorage.getItem(storageKey) || '[]');
        existingInvites.push({
          ...inviteData,
          storedAt: new Date().toISOString()
        });
        localStorage.setItem(storageKey, JSON.stringify(existingInvites));
      }

      console.log('✅ Invite data stored successfully in fallback');
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Error storing invite data in Greenfield:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store group code in Greenfield
   */
  async storeGroupCode(groupId: string, code: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('📤 Storing group code in Greenfield:', groupId);

      // Store in localStorage fallback
      if (typeof window !== 'undefined') {
        const storageKey = `greenfield_codes_${groupId}`;
        localStorage.setItem(storageKey, JSON.stringify({
          code,
          groupId,
          createdAt: new Date().toISOString()
        }));
      }

      console.log('✅ Group code stored successfully in fallback');
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Error storing group code in Greenfield:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get group code from Greenfield
   */
  async getGroupCode(groupId: string): Promise<{
    success: boolean;
    code?: string;
    error?: string;
  }> {
    try {
      console.log('📥 Retrieving group code from Greenfield:', groupId);

      // Get from localStorage fallback
      if (typeof window !== 'undefined') {
        const storageKey = `greenfield_codes_${groupId}`;
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          const data = JSON.parse(storedData);
          console.log('✅ Group code retrieved successfully from fallback');
          
          return {
            success: true,
            code: data.code,
          };
        }
      }

      return {
        success: false,
        error: 'Group code not found',
      };
    } catch (error) {
      console.error('❌ Error retrieving group code from Greenfield:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const greenfieldDirectService = new GreenfieldDirectService(); 