import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, onAuthStateChanged, signOut as firebaseSignOut, type User } from "./firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  userName: string;
  isAdmin: boolean;
  signOutUser: () => Promise<void>;
  setAdminFlag: (flag: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  userName: "",
  isAdmin: false,
  signOutUser: async () => {},
  setAdminFlag: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOutUser = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  const userName =
    user?.displayName || user?.email?.split("@")[0] || "User";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        userName,
        isAdmin,
        signOutUser,
        setAdminFlag: setIsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
