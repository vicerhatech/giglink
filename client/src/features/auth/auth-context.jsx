import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";

const TOKEN_KEY = "giglink_token";
const AuthContext = createContext(null);

function getErrorMessage(error, fallback) {
  return error?.response?.data?.message || fallback;
}

function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasRole(user, roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return Boolean(user?.role && allowedRoles.includes(user.role));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const authenticate = useCallback(async (path, payload) => {
    const response = await api.post(path, payload);
    const { token, user: authenticatedUser } = response.data.data;
    saveToken(token);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const register = useCallback(
    (payload) => authenticate("/auth/register", payload),
    [authenticate],
  );

  const login = useCallback(
    (payload) => authenticate("/auth/login", payload),
    [authenticate],
  );

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!localStorage.getItem(TOKEN_KEY)) {
        if (active) setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        if (active) setUser(response.data.data.user);
      } catch {
        clearToken();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout,
      getErrorMessage,
    }),
    [isLoading, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
