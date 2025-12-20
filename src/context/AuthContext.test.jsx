import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '../supabaseClient';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const TestComponent = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return <div>{user ? `User: ${user.email}` : 'No User'}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    supabase.functions.invoke.mockResolvedValue({ data: null, error: null });
  });

  it('provides loading state initially', async () => {
    supabase.auth.getSession.mockReturnValue(new Promise(() => {})); // Never resolves to keep loading state
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('provides user when session exists', async () => {
    const mockUser = { email: 'test@example.com' };
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
    supabase.functions.invoke.mockResolvedValue({
      data: { role: 'team_leader', teamId: null, onboardingComplete: true },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
  });

  it('provides "No User" when no session exists', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    supabase.functions.invoke.mockResolvedValue({ data: null, error: null });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(screen.getByText('No User')).toBeInTheDocument();
  });

  it('handles login successfully', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({ error: null });
    let authContext;
    const TestLogin = () => {
      authContext = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestLogin />
      </AuthProvider>
    );

    const result = await authContext.login('test@example.com');
    expect(result.success).toBe(true);
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        shouldCreateUser: true,
      },
    });
  });

  it('handles login failure', async () => {
    supabase.auth.signInWithOtp.mockResolvedValue({ error: { message: 'Failed' } });
    let authContext;
    const TestLogin = () => {
      authContext = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestLogin />
      </AuthProvider>
    );

    const result = await authContext.login('test@example.com');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed');
  });

  it('handles logout', async () => {
    supabase.auth.signOut.mockResolvedValue({ error: null });
    let authContext;
    const TestLogout = () => {
      authContext = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestLogout />
      </AuthProvider>
    );

    await authContext.logout();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  it('updates user on auth state change', async () => {
    let authChangeHandler;
    supabase.auth.onAuthStateChange.mockImplementation((handler) => {
      authChangeHandler = handler;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    supabase.functions.invoke.mockResolvedValue({
      data: { role: 'team_leader', teamId: null, onboardingComplete: true },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    const newUser = { email: 'new@example.com' };
    await act(async () => {
      authChangeHandler('SIGNED_IN', { user: newUser });
    });

    await waitFor(() => {
      expect(screen.getByText('User: new@example.com')).toBeInTheDocument();
    });
  });
});
