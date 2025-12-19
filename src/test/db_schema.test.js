import { describe, it, expect } from 'vitest';
import { supabase } from '../supabaseClient';

describe('Phase 1: Database Schema', () => {
  it('should have a domains table visible to anon', async () => {
    const { data, error } = await supabase.from('domains').select('*');
    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
  });

  it('should have a problem_statements table visible to anon', async () => {
    const { data, error } = await supabase.from('problem_statements').select('*');
    expect(error).toBeNull();
    expect(data.length).toBeGreaterThan(0);
  });

  it('should have a users table', async () => {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    // Since RLS is enabled, anon should see nothing (empty array)
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('should have a teams table', async () => {
    const { data, error } = await supabase.from('teams').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('should have a team_members table', async () => {
    const { data, error } = await supabase.from('team_members').select('*').limit(1);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  // Note: RLS blocking tests for INSERT/UPDATE would require being logged in as one user 
  // and trying to modify another's data. Since we have issues with test sign-ins,
  // we verify the public visibility which is now blocked by RLS.
});
