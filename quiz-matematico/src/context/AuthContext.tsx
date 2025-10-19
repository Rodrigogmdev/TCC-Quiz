import { createContext, useState, useContext, type ReactNode, useMemo } from 'react';

interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (token: string, isAdmin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (newToken: string, newIsAdmin: boolean) => {
    setToken(newToken);
    setIsAdmin(newIsAdmin);
  };

  const logout = () => {
    setToken(null);
    setIsAdmin(false);
  };

  const value = useMemo(() => ({
    token,
    isLoggedIn: token !== null, 
    isAdmin,
    login,
    logout,
  }), [token, isAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};