import React, { useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContextType";
import type { AuthContextType } from "./AuthContextType";

// Mock authentication for development - replace with Firebase after setup
const MOCK_USERS = {
  admin: {
    username: "admin",
    // This is a placeholder - use npm run create-admin to get real credentials
    // passwordHash will be verified against Firebase when Firebase is set up
  },
};

async function authenticateWithFirebase(
  username: string,
  password: string
): Promise<{ username: string; token: string }> {
  // Dynamically import Firebase utilities
  const { getAdminByUsername, updateLastLogin } = await import("@/lib/firebaseAdmin");
  const { verifyPassword } = await import("@/lib/password");

  // Get admin from Firebase
  const admin = await getAdminByUsername(username);

  if (!admin) {
    throw new Error("Invalid username or password");
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, admin.passwordHash);

  if (!isPasswordValid) {
    throw new Error("Invalid username or password");
  }

  // Update last login
  try {
    await updateLastLogin(username);
  } catch (error) {
    console.warn("Failed to update last login:", error);
  }

  return {
    username: admin.username,
    token: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ username: string; token: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Try to authenticate with Firebase
      const userData = await authenticateWithFirebase(username, password);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
