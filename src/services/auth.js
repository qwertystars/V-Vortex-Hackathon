// Mock delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(email, teamName, role) {
    await delay(1000);
    
    // Mock validation logic
    // In a real app, this would be a Supabase query
    if (role === 'Team Leader') {
       // Mock success for any leader login in dev
       return { 
         user: { email, role, id: 'mock-user-id' },
         team: { id: 'mock-team-id', team_name: teamName }
       };
    } else {
       // Mock member login
       return {
         user: { email, role, id: 'mock-member-id' },
         team: { id: 'mock-team-id', team_name: teamName }
       };
    }
  },

  async verifyOtp(email, otp) {
    await delay(800);
    if (otp !== '123456' && otp.length !== 6) {
        // Allow any 6 digit code for dev convenience unless strict '123456' needed
        // throw new Error("Invalid OTP"); 
    }
    return { session: { access_token: 'mock-token', user: { email } } };
  },

  async logout() {
    await delay(500);
    return true;
  },

  async getUser() {
    // Check local storage or session for simulated persistence
    const email = sessionStorage.getItem('loginEmail');
    if (!email) return null;
    return { email, id: 'mock-user-id' };
  }
};
