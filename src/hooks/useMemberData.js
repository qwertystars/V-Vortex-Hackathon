import { useState, useEffect, useCallback } from 'react';
import memberService from '../services/memberService';
import { useToast } from '../components/ui/CyberpunkToast';
import CyberpunkLoader from '../components/ui/CyberpunkLoader';

/**
 * Custom hook for managing member data with loading states and error handling
 */
export const useMemberData = (userId, email) => {
  const [memberProfile, setMemberProfile] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [qrCode, setQrCode] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState({
    profile: false,
    team: false,
    attendance: false,
    qrCode: false,
    stats: false
  });
  const [error, setError] = useState(null);

  const { success, error: showError } = useToast();

  /**
   * Fetch member profile
   */
  const fetchMemberProfile = useCallback(async () => {
    if (!userId && !email) return;

    setLoading(prev => ({ ...prev, profile: true }));
    setError(null);

    try {
      const result = await memberService.getMemberProfile(userId, email);
      setMemberProfile(result);

      // If member has a team, fetch team members
      if (result.team_id) {
        fetchTeamMembers(result.team_id);
      }
    } catch (err) {
      console.error('Failed to fetch member profile:', err);
      setError(err.message);
      showError('Failed to load member profile');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
    }
  }, [userId, email, showError]);

  /**
   * Fetch team members
   */
  const fetchTeamMembers = useCallback(async (teamId) => {
    if (!teamId) return;

    setLoading(prev => ({ ...prev, team: true }));

    try {
      const result = await memberService.getTeamMembers(teamId);
      setTeamMembers(result.members);
    } catch (err) {
      console.error('Failed to fetch team members:', err);
      showError('Failed to load team members');
    } finally {
      setLoading(prev => ({ ...prev, team: false }));
    }
  }, [showError]);

  /**
   * Fetch attendance data
   */
  const fetchAttendance = useCallback(async (memberId) => {
    const id = memberId || memberProfile?.id;
    if (!id) return;

    setLoading(prev => ({ ...prev, attendance: true }));

    try {
      const result = await memberService.getMemberAttendance(id, email);
      setAttendance(result.attendanceData);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
      showError('Failed to load attendance data');
    } finally {
      setLoading(prev => ({ ...prev, attendance: false }));
    }
  }, [memberProfile?.id, email, showError]);

  /**
   * Generate QR code
   */
  const generateQRCode = useCallback(async (memberId) => {
    const id = memberId || memberProfile?.id;
    if (!id) return;

    setLoading(prev => ({ ...prev, qrCode: true }));

    try {
      const result = await memberService.generateQRCode(id, email);
      setQrCode(result.qrData);
      success('QR code generated successfully');
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      showError('Failed to generate QR code');
    } finally {
      setLoading(prev => ({ ...prev, qrCode: false }));
    }
  }, [memberProfile?.id, email, success, showError]);

  /**
   * Fetch member statistics
   */
  const fetchStats = useCallback(async (memberId) => {
    const id = memberId || memberProfile?.id;
    if (!id) return;

    setLoading(prev => ({ ...prev, stats: true }));

    try {
      const result = await memberService.getMemberStats(id, email);
      setStats(result.stats);
    } catch (err) {
      console.error('Failed to fetch member stats:', err);
      showError('Failed to load member statistics');
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  }, [memberProfile?.id, email, showError]);

  /**
   * Update member profile
   */
  const updateProfile = useCallback(async (updateData) => {
    if (!email) return;

    try {
      await memberService.updateMemberProfile(email, updateData);
      await fetchMemberProfile(); // Refresh profile data
      success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showError('Failed to update profile');
    }
  }, [email, fetchMemberProfile, success, showError]);

  /**
   * Record attendance
   */
  const recordAttendance = useCallback(async (scanType, location) => {
    if (!qrCode) {
      showError('Please generate QR code first');
      return;
    }

    try {
      await memberService.recordAttendanceScan(qrCode, scanType, location);
      await fetchAttendance(); // Refresh attendance data
      success(`${scanType === 'checkin' ? 'Check-in' : 'Check-out'} recorded successfully`);
    } catch (err) {
      console.error('Failed to record attendance:', err);
      showError('Failed to record attendance');
    }
  }, [qrCode, fetchAttendance, success, showError]);

  // Initial data fetch
  useEffect(() => {
    fetchMemberProfile();
  }, [fetchMemberProfile]);

  // Fetch attendance and stats when profile is loaded
  useEffect(() => {
    if (memberProfile) {
      fetchAttendance();
      fetchStats();
      // Generate QR code if not exists
      if (!qrCode) {
        generateQRCode();
      }
    }
  }, [memberProfile]);

  // Calculate loading state
  const isLoading = Object.values(loading).some(state => state);

  return {
    // Data
    memberProfile,
    teamMembers,
    attendance,
    qrCode,
    stats,

    // Loading states
    loading,
    isLoading,

    // Error state
    error,

    // Actions
    fetchMemberProfile,
    fetchTeamMembers,
    fetchAttendance,
    generateQRCode,
    fetchStats,
    updateProfile,
    recordAttendance,

    // Refresh all data
    refreshAll: useCallback(() => {
      fetchMemberProfile();
      if (memberProfile?.team_id) {
        fetchTeamMembers(memberProfile.team_id);
      }
      fetchAttendance();
      fetchStats();
    }, [fetchMemberProfile, fetchTeamMembers, fetchAttendance, fetchStats, memberProfile])
  };
};

/**
 * Hook for attendance sessions
 */
export const useAttendanceSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { error: showError } = useToast();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await memberService.getAttendanceSessions();
      setSessions(result.sessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      showError('Failed to load attendance sessions');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    fetchSessions,
    refreshSessions: fetchSessions
  };
};

export default useMemberData;