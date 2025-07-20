// Simple storage solution that works with existing types
export interface SimpleGroup {
  id: string;
  name: string;
  goal: string;
  targetAmount: number;
  currentAmount: number;
  contributionAmount: number;
  duration: string;
  endDate: string;
  nextContribution: string;
  status: "active" | "completed" | "pending";
  createdBy: string;
  createdAt: string;
  members: any[];
  greenfieldObjectId?: string;
  greenfieldMetadataHash?: string;
}

class SimpleStorageService {
  private readonly STORAGE_KEY = 'concordia_savings_groups';

  /**
   * Save group data
   */
  saveGroup(group: SimpleGroup): void {
    try {
      const groups = this.loadGroups();
      const existingIndex = groups.findIndex(g => g.id === group.id);
      
      if (existingIndex >= 0) {
        groups[existingIndex] = group;
      } else {
        groups.push(group);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups));
      console.log('✅ Group saved locally:', group.id);
    } catch (error) {
      console.error('Error saving group:', error);
    }
  }

  /**
   * Load all groups
   */
  loadGroups(): SimpleGroup[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const groups = JSON.parse(stored);
      return Array.isArray(groups) ? groups : [];
    } catch (error) {
      console.error('Error loading groups:', error);
      return [];
    }
  }

  /**
   * Delete a group
   */
  deleteGroup(groupId: string): void {
    try {
      const groups = this.loadGroups();
      const filteredGroups = groups.filter(g => g.id !== groupId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredGroups));
      console.log('✅ Group deleted:', groupId);
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  }

  /**
   * Update a group
   */
  updateGroup(groupId: string, updates: Partial<SimpleGroup>): void {
    try {
      const groups = this.loadGroups();
      const groupIndex = groups.findIndex(g => g.id === groupId);
      
      if (groupIndex >= 0) {
        groups[groupIndex] = { ...groups[groupIndex], ...updates };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(groups));
        console.log('✅ Group updated:', groupId);
      }
    } catch (error) {
      console.error('Error updating group:', error);
    }
  }
}

export const simpleStorage = new SimpleStorageService(); 