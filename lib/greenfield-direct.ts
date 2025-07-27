import { Client } from '@bnb-chain/greenfield-js-sdk';

export class GreenfieldDirectService {
  // All localStorage fallback logic removed. Only Greenfield API is supported.
  async saveGroup() { throw new Error('Use Greenfield API only.'); }
  async getGroup() { throw new Error('Use Greenfield API only.'); }
  async getAllGroups() { throw new Error('Use Greenfield API only.'); }
  async updateGroup() { throw new Error('Use Greenfield API only.'); }
  async deleteGroup() { throw new Error('Use Greenfield API only.'); }
  async saveInvite() { throw new Error('Use Greenfield API only.'); }
  async getInvite() { throw new Error('Use Greenfield API only.'); }
}

export const greenfieldDirectService = new GreenfieldDirectService(); 