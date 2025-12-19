import { describe, it, expect } from 'vitest';
import { supabase } from '../supabaseClient';

describe('Phase 1: Database Schema', () => {
  it('should have a domains table', async () => {
    const { data, error } = await supabase.from('domains').select('*').limit(1);
    // If table doesn't exist, error will be present
    expect(error).toBeNull();
  });

  it('should have a problem_statements table', async () => {
    const { data, error } = await supabase.from('problem_statements').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have a users table', async () => {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have a teams table', async () => {
    const { data, error } = await supabase.from('teams').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have a team_members table', async () => {
    const { data, error } = await supabase.from('team_members').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should auto-generate team_code on insertion', async () => {
    const teamName = `Test Team ${Date.now()}`;
    const { data, error } = await supabase
      .from('teams')
      .insert([{ team_name: teamName }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
    }
    
    expect(error).toBeNull();
    expect(data.team_code).toBeDefined();
    expect(data.team_code).not.toBeNull();
    expect(data.team_code.length).toBeGreaterThan(0);

    // Cleanup
    await supabase.from('teams').delete().eq('id', data.id);
  });
});
