import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState(null);

  const refreshContext = async (sessionOverride = null) => {
    const activeSession = sessionOverride ?? session;
    if (!activeSession) {
      setContext(null);
      setContextLoading(false);
      setContextError(null);
      return null;
    }

    setContextLoading(true);
    const { data, error } = await supabase.functions.invoke("get-my-context");
    if (error) {
      console.error("Error fetching auth context:", error);
      setContext(null);
      setContextError(error);
      setContextLoading(false);
      return null;
    }

    setContext(data);
    setContextError(null);
    setContextLoading(false);
    return data;
  };

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) {
        await refreshContext(session);
      } else {
        setContext(null);
        setContextLoading(false);
      }
    };

    getSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session) {
        refreshContext(session);
      } else {
        setContext(null);
        setContextLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // emailRedirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        context,
        contextLoading,
        contextError,
        login,
        logout,
        loading,
        refreshContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
