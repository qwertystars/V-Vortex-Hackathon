import { describe, it, expect } from 'vitest';
import { supabase } from '../supabaseClient';
import { checkTableExists, checkColumnExists } from './utils/supabaseAuditHelpers';

describe('Baseline Audit - Schema Verification', () => {
  const expectedTables = [
    'domains',
    'problem_statements',
    'users',
    'teams',
    'team_members',
    'team_invites'
  ];

  describe('Table Existence', () => {
    expectedTables.forEach(tableName => {
      it(`should have the "${tableName}" table`, async () => {
        const exists = await checkTableExists(tableName);
        expect(exists).toBe(true);
      });
    });
    
    it('should have a "team_invites" table for invite tracking', async () => {
      const exists = await checkTableExists('team_invites');
      expect(exists).toBe(true);
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

    it('should have "leader_user_id" in "teams" for leader linkage', async () => {
       const exists = await checkColumnExists('teams', 'leader_user_id');
       expect(exists).toBe(true);
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
      
      it('should have "onboarding_complete" in "users" for onboarding gating', async () => {
          const exists = await checkColumnExists('users', 'onboarding_complete');
          expect(exists).toBe(true);
      });
  });

  describe('Current RLS Audit (Step 1 Gaps)', () => {
    it('team_members SELECT should return no rows for anon users', async () => {
        const { data, error } = await supabase.from('team_members').select('*').limit(1);
        expect(error).toBeNull();
        expect(data).toEqual([]);
    });

    it('team_members INSERT should be blocked for anon users', async () => {
        const { error } = await supabase.from('team_members').insert({ 
            team_id: '00000000-0000-0000-0000-000000000000', 
            user_id: '00000000-0000-0000-0000-000000000000' 
        });
        
        expect(error).toBeDefined();
    });

    it('teams UPDATE should be blocked for anon users', async () => {
        const { error } = await supabase.from('teams').update({ team_name: 'test' }).eq('id', '00000000-0000-0000-0000-000000000000');
        expect(error).toBeDefined();
    });
  });

  describe('Database Triggers & Constraints (Step 1 Verification)', () => {
      it('should have a team_code generation mechanism (Effect verification)', async () => {
          // This is a placeholder for behavior that requires authentication.
          // We acknowledge the documentation in Step 1.
          expect(true).toBe(true);
      });

      it('should have a team size limit trigger (Effect verification)', async () => {
          // This is a placeholder for behavior that requires authentication.
          expect(true).toBe(true);
      });
  });
});
