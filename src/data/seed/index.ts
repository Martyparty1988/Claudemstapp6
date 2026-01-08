/**
 * MST Seed Data - Main Index
 * 
 * Centrální místo pro všechna demo data.
 * Použití: Pro development a testování.
 */

// Re-export všech seed dat
export {
  SEED_PROJECTS,
  getSeedProjectById,
  getActiveSeedProjects,
  type SeedProject,
} from './projects.seed';

export {
  SEED_TABLES,
  getSeedTablesForProject,
  generateTablesForProject,
} from './tables.seed';

export {
  SEED_WORK_STATES,
  generateWorkStatesForProject,
} from './work-states.seed';

export {
  SEED_WORK_RECORDS,
  getSeedWorkRecordsForProject,
  getRecentSeedWorkRecords,
} from './work-records.seed';

export {
  CURRENT_USER,
  SEED_USERS,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  getSeedUserById,
  getSeedMessagesForConversation,
  getSeedConversationWithDetails,
} from './users.seed';

// Import pro seedService
import { SEED_PROJECTS as _SEED_PROJECTS } from './projects.seed';
import { SEED_USERS as _SEED_USERS, SEED_CONVERSATIONS as _SEED_CONVERSATIONS } from './users.seed';

/**
 * Seed service pro inicializaci databáze
 */
export const seedService = {
  /**
   * Je seed data povoleno?
   */
  isEnabled(): boolean {
    // V rámci kompatibility - vždy true pro development
    if (typeof window !== 'undefined') {
      return true; // Browser environment
    }
    return true;
  },

  /**
   * Inicializovat databázi se seed daty
   */
  async initialize(): Promise<void> {
    if (!this.isEnabled()) {
      console.log('[Seed] Seed data disabled in production');
      return;
    }

    console.log('[Seed] Initializing seed data...');
    console.log('[Seed] Seed data ready');
    console.log(`[Seed] - Projects: ${_SEED_PROJECTS.length}`);
    console.log(`[Seed] - Users: ${_SEED_USERS.length}`);
    console.log(`[Seed] - Conversations: ${_SEED_CONVERSATIONS.length}`);
  },

  /**
   * Vyčistit seed data z databáze
   */
  async clear(): Promise<void> {
    console.log('[Seed] Clearing seed data...');
    // TODO: Implementovat po napojení Dexie
  },

  /**
   * Reset - vyčistit a znovu inicializovat
   */
  async reset(): Promise<void> {
    await this.clear();
    await this.initialize();
  },
};

/**
 * Hook pro použití seed dat v development
 */
export function useSeedData() {
  return {
    projects: _SEED_PROJECTS,
    users: _SEED_USERS,
    conversations: _SEED_CONVERSATIONS,
    isEnabled: seedService.isEnabled(),
  };
}
