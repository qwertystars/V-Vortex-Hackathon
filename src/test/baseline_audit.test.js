import { describe, it, expect } from 'vitest';
import { checkTableExists, checkColumnExists } from './utils/supabaseAuditHelpers';

describe('Baseline Audit - Schema Verification', () => {
  const expectedTables = [
    'domains',
    'problem_statements',
    'users',
    'teams',
    'team_members'
  ];

  describe('Table Existence', () => {
    expectedTables.forEach(tableName => {
      it(`should have the "${tableName}" table`, async () => {
        const exists = await checkTableExists(tableName);
        expect(exists).toBe(true);
      });
    });
    
    it('should NOT have an "invites" or "team_invites" table yet (per Step 1)', async () => {
        // Step 1 says "no invite table"
        const exists = await checkTableExists('team_invites');
        expect(exists).toBe(false);
    });
  });

  describe('Teams Table Columns', () => {
    const columns = [
      'id',
      'team_name',
      'team_code',
      'problem_statement_id',
      'domain_id',
      'payment_link',
      'payment_verified',
      'created_at',
      'updated_at'
    ];

    columns.forEach(col => {
      it(`should have the "${col}" column in "teams"`, async () => {
        const exists = await checkColumnExists('teams', col);
        expect(exists).toBe(true);
      });
    });

    it('should NOT have "leader_user_id" in "teams" yet (target for Step 2)', async () => {
       const exists = await checkColumnExists('teams', 'leader_user_id');
       expect(exists).toBe(false);
    });
  });

  describe('Users Table Columns', () => {
      const columns = ['id', 'name', 'email', 'role', 'university_name'];
      
      columns.forEach(col => {
          it(`should have the "${col}" column in "users"`, async () => {
              const exists = await checkColumnExists('users', col);
              expect(exists).toBe(true);
          });
      });
      
      it('should NOT have "onboarding_complete" in "users" yet (target for Step 2)', async () => {
          const exists = await checkColumnExists('users', 'onboarding_complete');
          expect(exists).toBe(false);
      });
  });
});
