export interface LocalGroup {
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
}

class DataPersistenceService {
  private readonly STORAGE_KEY = 'concordia_groups';

  /**
   * Save group data to localStorage
   */
  async saveGroup(groupData: LocalGroup): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("💾 Saving group to localStorage:", groupData.id);

      // Get existing groups
      const groups = await this.loadGroups();
      
      // Check if group already exists
      const existingIndex = groups.findIndex((g: LocalGroup) => g.id === groupData.id);
      
      if (existingIndex !== -1) {
        // Update existing group
        groups[existingIndex] = { ...groupData, updatedAt: new Date().toISOString() };
      } else {
        // Add new group
        groups.push({ ...groupData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      
      // Save to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups));
      
      console.log("✅ Group saved to localStorage successfully:", groupData.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving group to localStorage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Load all groups from localStorage
   */
  async loadGroups(): Promise<LocalGroup[]> {
    try {
      console.log("🔄 Loading groups from localStorage...");
      
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        console.log("📭 No groups found in localStorage");
        return [];
      }
      
      const groups = JSON.parse(stored);
      const validGroups = Array.isArray(groups) ? groups : [];
      
      console.log("✅ Loaded groups from localStorage:", validGroups.length);
      return validGroups;
    } catch (error) {
      console.error('❌ Error loading groups from localStorage:', error);
      return [];
    }
  }

  /**
   * Update an existing group
   */
  async updateGroup(groupId: string, updates: Partial<LocalGroup>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🔄 Updating group in localStorage:", groupId);

      const groups = await this.loadGroups();
      const groupIndex = groups.findIndex((g: LocalGroup) => g.id === groupId);
      
      if (groupIndex === -1) {
        return { success: false, error: 'Group not found' };
      }
      
      // Update the group
      groups[groupIndex] = { 
        ...groups[groupIndex], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      
      // Save updated groups
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups));
      
      console.log("✅ Group updated in localStorage successfully");
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating group in localStorage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Delete a group
   */
  async deleteGroup(groupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Deleting group from localStorage:", groupId);

      const groups = await this.loadGroups();
      const filteredGroups = groups.filter((g: LocalGroup) => g.id !== groupId);
      
      // Save filtered groups
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredGroups));
      
      console.log("✅ Group deleted from localStorage successfully");
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting group from localStorage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get a specific group
   */
  async getGroup(groupId: string): Promise<LocalGroup | null> {
    try {
      console.log("🔍 Getting group from localStorage:", groupId);

      const groups = await this.loadGroups();
      const group = groups.find((g: LocalGroup) => g.id === groupId);
      
      if (group) {
        console.log("✅ Group retrieved from localStorage");
        return group;
      } else {
        console.log("❌ Group not found in localStorage");
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting group from localStorage:', error);
      return null;
    }
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAllData(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log("🗑️ Clearing all data from localStorage");
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("✅ All data cleared from localStorage");
      return { success: true };
    } catch (error) {
      console.error('❌ Error clearing data from localStorage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{ totalGroups: number; totalSize: number }> {
    try {
      const groups = await this.loadGroups();
      const dataSize = JSON.stringify(groups).length;
      
      return {
        totalGroups: groups.length,
        totalSize: dataSize
      };
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return { totalGroups: 0, totalSize: 0 };
    }
  }
}

export const dataPersistenceService = new DataPersistenceService(); 