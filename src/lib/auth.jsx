import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, onTokenChange } from "./http";
import { getMe, login } from "./api";

const AuthContext = createContext(null);

/**
 * Keeps the signed-in user. `session` is truthy while a login token exists
 * (same name as before so the rest of the app is unchanged).
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(() =>
    getToken() ? { token: getToken() } : null,
  );
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile() {
    try {
      setProfile(await getMe());
    } catch (e) {
      if (e.status === 403 && e.code === "inactive")
        setProfile((p) =>
          p ? { ...p, is_active: false } : { is_active: false },
        );
      else if (e.status === 401) setToken(null);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (getToken()) await loadProfile();
      if (mounted) setLoading(false);
    })();
    const off = onTokenChange((t) => {
      setSession(t ? { token: t } : null);
      if (!t) setProfile(null);
    });
    return () => {
      mounted = false;
      off();
    };
  }, []);

  const value = {
    session,
    profile,
    loading,
    isAdmin: profile?.role === "admin" || profile?.role === "super_admin",
    isSuperAdmin: profile?.role === "super_admin",
    isOwner: profile?.is_owner === true,
    async signIn(email, password) {
      try {
        const res = await login(email, password);
        setProfile(res.user);
        setToken(res.token);
        return null;
      } catch (e) {
        return e.message || "Sign-in failed";
      }
    },
    async signOut() {
      setToken(null);
      setProfile(null);
    },
    async refreshProfile() {
      if (getToken()) await loadProfile();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
