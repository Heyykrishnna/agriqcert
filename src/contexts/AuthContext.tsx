import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "exporter" | "qa_agency" | "importer" | "admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole | null;
  userRoles: UserRole[];
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) throw error;

      const roles = data?.map(r => r.role) || [];
      setUserRoles(roles);

      // Set primary role with priority: admin > qa_agency > importer > exporter
      const primaryRole = roles.includes("admin") ? "admin" :
        roles.includes("qa_agency") ? "qa_agency" :
          roles.includes("importer") ? "importer" :
            roles.includes("exporter") ? "exporter" : null;

      setUserRole(primaryRole);
      return primaryRole;
    } catch (error) {
      console.error("Error fetching user role:", error);
      return null;
    }
  };

  const hasRole = (role: UserRole) => {
    return userRoles.includes(role);
  };

  useEffect(() => {
    let mounted = true;

    // Check for existing session FIRST
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserRole(session.user.id).then(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // THEN set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session);

        // Handle explicit sign out - don't restore session
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserRole(null);
          setUserRoles([]);
          return;
        }

        // Handle other events
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fetch role after state update
          setTimeout(() => {
            if (mounted) fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setUserRoles([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role // Pass role in metadata for trigger to handle
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Account created successfully! Please sign in.");

        // Wait a bit for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to auth page for sign in
        navigate("/auth");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast.error(error.message || "Failed to sign up");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Wait a bit to ensure role is loaded
        await new Promise(resolve => setTimeout(resolve, 500));

        const role = await fetchUserRole(data.user.id);

        if (!role) {
          toast.error("User role not found. Please contact support.");
          return;
        }

        toast.success("Signed in successfully!");

        // Redirect to deployed app
        window.location.href = "https://agrotrace-peach.vercel.app/";
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://agrotrace-peach.vercel.app/',
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(error.message || "Failed to sign in with Google");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Sign out globally to clear all sessions
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error: any) {
      // Ignore session-not-found errors
      console.log("Sign out:", error?.message || "Cleared locally");
    } finally {
      // Always clear local state
      setUser(null);
      setSession(null);
      setUserRole(null);
      setUserRoles([]);

      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userRole,
        userRoles,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};