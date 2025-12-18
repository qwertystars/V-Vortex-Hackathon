import { supabase } from '../supabaseClient';

/**
 * Optimized Authentication Service
 * Handles all authentication operations with optimized API calls and error handling
 */
class AuthService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data or fetch fresh data
   */
  async getCachedOrFetch(key, fetchFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const data = await fetchFn();
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      // Return cached data if available during error
      if (cached) return cached.data;
      throw error;
    }
  }

  /**
   * Optimized team and member verification with parallel queries
   */
  async verifyTeamAndMember(teamName, email, role) {
    const cacheKey = `team-verify-${teamName}-${email}-${role}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        // Parallel queries for team and member verification
        const [teamResult, memberResult] = await Promise.all([
          // Team verification
          supabase
            .from('teams')
            .select('id, team_name, lead_email, team_size, is_vit_chennai')
            .eq('team_name', teamName)
            .single(),

          // Member verification (only if member role)
          role === 'member' ?
            supabase
              .from('team_members')
              .select('id, member_name, member_email, team_id')
              .eq('member_email', email)
              .single() :
            Promise.resolve({ data: null, error: null })
        ]);

        if (teamResult.error) {
          throw new Error(`Team verification failed: ${teamResult.error.message}`);
        }

        const team = teamResult.data;
        let isValid = false;
        let userData = null;

        if (role === 'team_lead') {
          // Verify team leader email
          isValid = team.lead_email === email;
          userData = team;
        } else {
          // Verify team member email and team association
          if (memberResult.error) {
            throw new Error(`Member verification failed: ${memberResult.error.message}`);
          }

          const member = memberResult.data;
          isValid = member && member.team_id === team.id;
          userData = { ...team, member };
        }

        if (!isValid) {
          throw new Error('Invalid credentials: Email does not match team records');
        }

        return {
          success: true,
          team,
          user: userData,
          role
        };
      } catch (error) {
        console.error('Auth verification error:', error);
        throw error;
      }
    });
  }

  /**
   * Optimized OTP sending with enhanced error handling
   */
  async sendOTP(email, options = {}) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: options.userData || {},
          ...options
        }
      });

      if (error) {
        throw new Error(`OTP sending failed: ${error.message}`);
      }

      return {
        success: true,
        message: 'Authentication code dispatched to your email',
        data
      };
    } catch (error) {
      console.error('OTP sending error:', error);
      throw error;
    }
  }

  /**
   * Optimized OTP verification with session management
   */
  async verifyOTP(email, token, options = {}) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: options.type || 'email'
      });

      if (error) {
        throw new Error(`OTP verification failed: ${error.message}`);
      }

      // Create user profile if it doesn't exist
      if (data.user && options.createProfile) {
        await this.createOrUpdateProfile(data.user, options.profileData);
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: '🔥 AUTH VERIFIED • WELCOME TO THE VORTEX CHAMPION 🔥'
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  /**
   * Create or update user profile
   */
  async createOrUpdateProfile(user, profileData = {}) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email,
          full_name: profileData.full_name || user.user_metadata?.full_name,
          role: profileData.role || 'team_lead',
          team_id: profileData.team_id,
          ...profileData
        });

      if (error) {
        throw new Error(`Profile creation failed: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Profile creation error:', error);
      throw error;
    }
  }

  /**
   * Optimized user session check with caching
   */
  async getCurrentUser() {
    const cacheKey = 'current-user';

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          throw new Error(`User session check failed: ${error.message}`);
        }

        return user;
      } catch (error) {
        console.error('Current user check error:', error);
        return null;
      }
    });
  }

  /**
   * Enhanced sign out with cache clearing
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(`Sign out failed: ${error.message}`);
      }

      // Clear all cached data
      this.cache.clear();

      // Clear session storage
      sessionStorage.clear();

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Optimized team registration with batched operations
   */
  async registerTeam(teamData) {
    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: teamData.leaderEmail,
        password: Math.random().toString(36).slice(-8), // Random password since we use OTP
        options: {
          data: {
            full_name: teamData.leaderName,
            role: 'team_lead'
          }
        }
      });

      if (authError) {
        throw new Error(`Auth user creation failed: ${authError.message}`);
      }

      // Prepare team data for database
      const dbTeamData = {
        team_name: teamData.teamName,
        team_size: teamData.teamSize,
        lead_name: teamData.leaderName,
        lead_email: teamData.leaderEmail,
        lead_reg_no: teamData.isVitChennai ? teamData.leaderReg : null,
        institution: teamData.isVitChennai ? null : teamData.institution,
        receipt_link: teamData.receiptLink,
        is_vit_chennai: teamData.isVitChennai,
        user_id: authData.user?.id,
        payment_verified: false
      };

      // Insert team and members in parallel
      const [teamResult, memberResult] = await Promise.all([
        supabase
          .from('teams')
          .insert(dbTeamData)
          .select()
          .single(),

        // Insert members if provided
        teamData.members && teamData.members.length > 0 ?
          supabase
            .from('team_members')
            .insert(
              teamData.members.map(member => ({
                member_name: member.name,
                member_email: member.email,
                member_reg_no: member.reg || null,
                institution: member.institution || null,
                team_id: authData.user?.id // Will be updated after team creation
              }))
            ) :
          Promise.resolve({ data: null, error: null })
      ]);

      if (teamResult.error) {
        throw new Error(`Team registration failed: ${teamResult.error.message}`);
      }

      if (memberResult.error) {
        throw new Error(`Member registration failed: ${memberResult.error.message}`);
      }

      // Update member team_id references
      if (teamData.members && teamData.members.length > 0) {
        await supabase
          .from('team_members')
          .update({ team_id: teamResult.data.id })
          .eq('team_id', authData.user?.id);
      }

      // Send welcome OTP
      await this.sendOTP(teamData.leaderEmail, {
        userData: {
          team_id: teamResult.data.id,
          role: 'team_lead'
        }
      });

      return {
        success: true,
        teamId: teamResult.data.id,
        message: '✅ Registration successful! Check your email for authentication code.'
      };
    } catch (error) {
      console.error('Team registration error:', error);
      throw error;
    }
  }

  /**
   * Clear cache manually
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;