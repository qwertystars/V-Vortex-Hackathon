import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from storage on load
    const initAuth = async () => {
      const email = sessionStorage.getItem('loginEmail');
      const teamId = sessionStorage.getItem('teamId');
      const role = sessionStorage.getItem('role');

      if (email) {
        setUser({ email, role, id: 'restored-id' });
        if (teamId) {
          setTeam({ id: teamId });
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, teamName, role) => {
    try {
      const { user: userData, team: teamData } = await authService.login(email, teamName, role);
      setUser(userData);
      setTeam(teamData);
      
      // Persist to session storage for page reloads (simulating auth persistence)
      sessionStorage.setItem('loginEmail', email);
      sessionStorage.setItem('teamId', teamData.id);
      sessionStorage.setItem('role', role);
      
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setTeam(null);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, team, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
