// All localStorage logic removed. Only backend API (Greenfield) is supported.
import { GroupMetadata } from './simple-storage';

class HybridStorageService {
  async loadGroups(): Promise<GroupMetadata[]> {
    // Only load from backend API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/groups`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.groups && result.groups.length > 0) {
          return result.groups;
        }
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading groups from Greenfield:', error);
      return [];
    }
  }

  async getGroup(groupId: string): Promise<{ metadata: GroupMetadata; fullData?: any } | null> {
    // Only load from backend API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/groups/${groupId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.metadata) {
          return { metadata: result.metadata, fullData: result.metadata };
        }
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting group from Greenfield:', error);
      return null;
    }
  }
}

export const hybridStorageService = new HybridStorageService(); 