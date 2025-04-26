import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser, loginUserSchema, LoginCredentials } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        // Transform credentials format for the external API
        const loginData = {
          email: credentials.username, // API uses email instead of username
          password: credentials.password
        };
        
        // Call the external API endpoint
        const response = await fetch('/api/v1/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(loginData)
        });
        
        if (!response.ok) {
          throw new Error('Invalid credentials');
        }
        
        const data = await response.json();
        
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        
        // Return user data in the format our application expects
        return {
          id: data.user_id,
          email: data.email,
          fullName: data.email.split('@')[0],
          username: data.email,
          role: 'admin', // Assuming the user is an admin for now
          password: '', // We don't store the password
          createdAt: new Date()
        };
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const validatedUserData = insertUserSchema.parse(userData);
      const res = await apiRequest("POST", "/api/register", validatedUserData);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Remove token from localStorage
      localStorage.removeItem('token');
      
      // We don't need to call the server for logout with token-based auth
      // but we'll keep this line for compatibility with session auth if needed
      try {
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        // Ignore errors from logout endpoint since we've already removed the token
        console.log("Logout endpoint error (ignored):", error);
      }
    },
    onSuccess: () => {
      // Clear user from cache
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logged out successfully",
      });
      
      // Redirect to login page
      window.location.href = '/auth';
    },
    onError: (error: Error) => {
      // Even if there's an error, still remove the token and redirect
      localStorage.removeItem('token');
      queryClient.setQueryData(["/api/user"], null);
      
      toast({
        title: "Logout had issues",
        description: "You have been logged out, but there were some issues.",
        variant: "destructive",
      });
      
      // Redirect to login page
      window.location.href = '/auth';
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Permission table component moved to separate file for clarity
interface PermissionItem {
  id: number;
  name: string;
  action_name: string;
}

interface Feature {
  feature_id: number;
  permissions: PermissionItem[];
}

interface ModuleFeatures {
  [featureName: string]: Feature;
}

interface Module {
  module_id: number;
  features: ModuleFeatures;
}

interface Modules {
  [moduleName: string]: Module;
}

// This functionality has been moved to a dedicated component
// We keep it here simplified for backwards compatibility until refactored completely
function PermissionsTable({ roleName }: { roleName: string }) {
  return <div>Role permissions for {roleName} (component being refactored)</div>;
}

export default PermissionsTable;