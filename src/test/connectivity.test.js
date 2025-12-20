import { describe, it, expect } from 'vitest';
import { supabase } from '../supabaseClient';

describe('Supabase Connectivity', () => {
  it('should have environment variables set', () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined();
    expect(import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY).toBeDefined();
  });

  it('should connect to Supabase and fetch public configuration or health check', async () => {
    // We try to select from a known table 'teams' just to check connectivity.
    // Even if it returns 0 rows, it means connection is successful.
    // If it fails with network error, then connectivity is broken.
    const { data, error, count } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Supabase Connection Error:', error);
    }
    expect(error).toBeNull();
  });
});
