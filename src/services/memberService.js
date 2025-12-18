import { supabase } from '../supabaseClient';

/**
 * Member Data Management Service
 * Handles all member-specific operations including data fetching, QR codes, and attendance
 */
class MemberService {
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
   * Get current member's complete profile
   */
  async getMemberProfile(userId, email) {
    const cacheKey = `member-profile-${userId || email}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        // Get member data from team_members table
        const { data: memberData, error: memberError } = await supabase
          .from('team_members')
          .select(`
            *,
            teams!inner(
              team_name,
              lead_email,
              team_size,
              is_vit_chennai,
              institution
            )
          `)
          .or(`member_email.eq.${email},user_id.eq.${userId}`)
          .single();

        if (memberError && memberError.code !== 'PGRST116') {
          throw new Error(`Member data fetch failed: ${memberError.message}`);
        }

        // If no member data found, check if user is team lead
        if (!memberData) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('lead_email', email)
            .single();

          if (teamError && teamError.code !== 'PGRST116') {
            throw new Error(`Team data fetch failed: ${teamError.message}`);
          }

          if (teamData) {
            return {
              ...teamData,
              role: 'team_lead',
              member_name: teamData.lead_name,
              member_email: teamData.lead_email,
              member_reg_no: teamData.lead_reg_no
            };
          }
        }

        return memberData;
      } catch (error) {
        console.error('Member profile fetch error:', error);
        throw error;
      }
    });
  }

  /**
   * Generate QR code data for member
   */
  async generateQRCode(memberId, email) {
    try {
      const qrData = {
        id: memberId,
        email: email,
        timestamp: Date.now(),
        type: 'member_checkin',
        version: '1.0'
      };

      const qrString = JSON.stringify(qrData);

      // Update member's QR code in database
      const { error } = await supabase
        .from('team_members')
        .update({
          qr_code_data: qrString,
          qr_generated_at: new Date().toISOString()
        })
        .eq('member_email', email);

      if (error) {
        throw new Error(`QR code generation failed: ${error.message}`);
      }

      return {
        success: true,
        qrData: qrString,
        message: 'QR code generated successfully'
      };
    } catch (error) {
      console.error('QR code generation error:', error);
      throw error;
    }
  }

  /**
   * Get member attendance records
   */
  async getMemberAttendance(memberId, email) {
    const cacheKey = `member-attendance-${memberId || email}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('member_attendance')
          .select(`
            *,
            member_attendance_sessions(
              id,
              session_name,
              start_time,
              end_time,
              location
            )
          `)
          .eq('member_id', memberId)
          .order('scan_time', { ascending: false });

        if (attendanceError) {
          throw new Error(`Attendance fetch failed: ${attendanceError.message}`);
        }

        // Group attendance by sessions
        const attendanceBySession = attendanceData.reduce((acc, record) => {
          const sessionId = record.session_id;
          if (!acc[sessionId]) {
            acc[sessionId] = {
              session: record.member_attendance_sessions,
              scans: []
            };
          }
          acc[sessionId].scans.push({
            scan_time: record.scan_time,
            scan_type: record.scan_type,
            location: record.location
          });
          return acc;
        }, {});

        return {
          success: true,
          attendanceData: attendanceBySession,
          totalScans: attendanceData.length
        };
      } catch (error) {
        console.error('Attendance fetch error:', error);
        throw error;
      }
    });
  }

  /**
   * Get team members list
   */
  async getTeamMembers(teamId) {
    const cacheKey = `team-members-${teamId}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const { data: members, error: membersError } = await supabase
          .from('team_members')
          .select(`
            id,
            member_name,
            member_email,
            member_reg_no,
            institution,
            qr_code_data,
            is_leader
          `)
          .eq('team_id', teamId)
          .order('is_leader', { ascending: false })
          .order('member_name', { ascending: true });

        if (membersError) {
          throw new Error(`Team members fetch failed: ${membersError.message}`);
        }

        return {
          success: true,
          members: members || []
        };
      } catch (error) {
        console.error('Team members fetch error:', error);
        throw error;
      }
    });
  }

  /**
   * Update member profile
   */
  async updateMemberProfile(email, updateData) {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('member_email', email);

      if (error) {
        throw new Error(`Profile update failed: ${error.message}`);
      }

      // Clear cache for this member
      this.cache.delete(`member-profile-${email}`);
      this.cache.delete(`team-members-${updateData.team_id}`);

      return {
        success: true,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Record attendance scan
   */
  async recordAttendanceScan(qrData, scanType, location) {
    try {
      const parsedQrData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;

      const { error } = await supabase
        .from('member_attendance')
        .insert({
          member_id: parsedQrData.id,
          member_email: parsedQrData.email,
          session_id: 1, // Default session, should be dynamic
          scan_time: new Date().toISOString(),
          scan_type: scanType, // 'checkin' or 'checkout'
          location: location || 'Main Hall',
          qr_data: qrData
        });

      if (error) {
        throw new Error(`Attendance recording failed: ${error.message}`);
      }

      // Clear attendance cache
      this.cache.delete(`member-attendance-${parsedQrData.id}`);

      return {
        success: true,
        message: `${scanType === 'checkin' ? 'Check-in' : 'Check-out'} recorded successfully`
      };
    } catch (error) {
      console.error('Attendance recording error:', error);
      throw error;
    }
  }

  /**
   * Get attendance sessions
   */
  async getAttendanceSessions() {
    const cacheKey = 'attendance-sessions';

    return this.getCachedOrFetch(cacheKey, async () => {
      try {
        const { data: sessions, error: sessionsError } = await supabase
          .from('member_attendance_sessions')
          .select('*')
          .order('start_time', { ascending: true });

        if (sessionsError) {
          throw new Error(`Sessions fetch failed: ${sessionsError.message}`);
        }

        return {
          success: true,
          sessions: sessions || []
        };
      } catch (error) {
        console.error('Sessions fetch error:', error);
        throw error;
      }
    });
  }

  /**
   * Get member statistics
   */
  async getMemberStats(memberId, email) {
    try {
      const [profileResult, attendanceResult] = await Promise.all([
        this.getMemberProfile(memberId, email),
        this.getMemberAttendance(memberId, email)
      ]);

      const member = profileResult;
      const attendance = attendanceResult.attendanceData;

      const stats = {
        totalScans: attendanceResult.totalScans,
        sessionsAttended: Object.keys(attendance).length,
        teamSize: member.team_size || 1,
        isVitChennai: member.is_vit_chennai,
        registrationDate: member.created_at,
        lastScan: attendanceResult.totalScans > 0 ?
          Object.values(attendance)[0]?.scans[0]?.scan_time : null
      };

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Member stats error:', error);
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
   * Clear specific cache entries
   */
  clearCacheForMember(memberId, email) {
    this.cache.delete(`member-profile-${memberId || email}`);
    this.cache.delete(`member-attendance-${memberId || email}`);
  }
}

// Create singleton instance
const memberService = new MemberService();

export default memberService;