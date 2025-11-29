/**
 * Firebase Authentication Integration Example
 * 
 * This file shows how to integrate Firebase Realtime Database with the AuthContext
 * Uncomment and use this after installing firebase and bcryptjs packages
 * 
 * Installation:
 * npm install firebase bcryptjs
 * npm install --save-dev @types/bcryptjs
 */

/*
import React, { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminByUsername, updateLastLogin } from "@/lib/firebaseAdmin";
import { verifyPassword } from "@/lib/password";
import { AuthContext } from "./AuthContextType";

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
      // Get admin from Firebase Realtime Database
      const admin = await getAdminByUsername(username);

      if (!admin) {
        throw new Error("Invalid username or password");
      }

      // Verify password using bcryptjs
      const isPasswordValid = await verifyPassword(password, admin.passwordHash);

      if (!isPasswordValid) {
        throw new Error("Invalid username or password");
      }

      // Update last login timestamp
      try {
        await updateLastLogin(username);
      } catch (error) {
        console.warn("Failed to update last login:", error);
      }

      // Create user session
      const userData = {
        username: admin.username,
        token: `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

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

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
*/
