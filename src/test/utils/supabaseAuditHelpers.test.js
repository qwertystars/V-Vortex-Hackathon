import { describe, it, expect } from 'vitest';
import { checkTableExists, checkColumnExists } from './supabaseAuditHelpers';

describe('Supabase Audit Helpers', () => {
  describe('checkTableExists', () => {
    it('should return true for an existing table (teams)', async () => {
      const exists = await checkTableExists('teams');
      expect(exists).toBe(true);
    });

    it('should return false for a non-existent table', async () => {
      const exists = await checkTableExists('non_existent_table_123');
      expect(exists).toBe(false);
    });
  });

  describe('checkColumnExists', () => {
    it('should return true for an existing column (id in teams)', async () => {
      const exists = await checkColumnExists('teams', 'id');
      expect(exists).toBe(true);
    });

    it('should return false for a non-existent column', async () => {
      const exists = await checkColumnExists('teams', 'non_existent_column_abc');
      expect(exists).toBe(false);
    });
    
    it('should return false if table does not exist', async () => {
       const exists = await checkColumnExists('non_existent_table', 'id');
       expect(exists).toBe(false);
    });
  });
});
