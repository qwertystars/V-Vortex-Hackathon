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
});
