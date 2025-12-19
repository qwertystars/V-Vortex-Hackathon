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

  it('should update updated_at timestamp on modification', async () => {
    // 1. Create a team
    const { data: team, error: insertError } = await supabase
      .from('teams')
      .insert([{ team_name: 'Update Test Team' }])
      .select()
      .single();

    expect(insertError).toBeNull();
    const originalUpdatedAt = team.updated_at;

    // Wait a bit to ensure timestamp difference (Postgres resolution can be high)
    await new Promise((r) => setTimeout(r, 100));

    // 2. Update the team
    const { data: updatedTeam, error: updateError } = await supabase
      .from('teams')
      .update({ team_name: 'Updated Name' })
      .eq('id', team.id)
      .select()
      .single();

    expect(updateError).toBeNull();

    // 3. Check timestamps
    expect(updatedTeam.updated_at).not.toBe(originalUpdatedAt);
    expect(new Date(updatedTeam.updated_at).getTime()).toBeGreaterThan(new Date(originalUpdatedAt).getTime());

    // Cleanup
    await supabase.from('teams').delete().eq('id', team.id);
  });
});
