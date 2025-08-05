// All data is stored in Greenfield with proper access control
import { GroupMetadata } from './simple-storage';

class HybridStorageService {
  async loadGroups(userAddress?: string): Promise<GroupMetadata[]> {
    // Only load from backend API with user address for access control
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const url = userAddress ? `${apiUrl}/groups?address=${userAddress}` : `${apiUrl}/groups`;
      
      console.log('🔄 Loading groups for user:', userAddress || 'anonymous');
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.groups && result.groups.length > 0) {
          console.log('✅ Successfully loaded groups from Greenfield:', result.groups.length);
          return result.groups;
        }
      }
      console.log('📭 No groups found or access denied');
      return [];
    } catch (error) {
      console.error('❌ Error loading groups from Greenfield:', error);
      return [];
    }
  }

  async getGroup(groupId: string, userAddress?: string): Promise<{ metadata: GroupMetadata; fullData?: any } | null> {
    // Only load from backend API with user address for access control
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const url = userAddress 
        ? `${apiUrl}/groups/${groupId}?address=${userAddress}` 
        : `${apiUrl}/groups/${groupId}`;
      
      console.log('🔄 Loading group details:', groupId, 'for user:', userAddress || 'anonymous');
      const response = await fetch(url);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.metadata) {
          console.log('✅ Successfully loaded group from Greenfield:', groupId);
          return { metadata: result.metadata, fullData: result.metadata };
        }
      }
      console.log('❌ Group not found or access denied:', groupId);
      return null;
    } catch (error) {
      console.error('❌ Error getting group from Greenfield:', error);
      return null;
    }
  }
  
  async saveGroup(groupData: any, userAddress: string): Promise<boolean> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      console.log('💾 Saving group to Greenfield:', groupData.id, 'by user:', userAddress);
      
      const response = await fetch(`${apiUrl}/groups/store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: groupData.id,
          groupData: {
            ...groupData,
            creator: userAddress, // Ensure creator is set to current user
            updatedAt: new Date().toISOString(),
          }
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('✅ Group saved successfully to Greenfield');
        return true;
      } else {
        console.error('❌ Failed to save group:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error saving group to Greenfield:', error);
      return false;
    }
  }
}

export const hybridStorageService = new HybridStorageService();