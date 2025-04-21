import { createContext, ReactNode, useContext, useState } from "react";
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
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Mock response
      if (credentials.username === 'admin@example.com' && credentials.password === 'password123') {
        const mockResponse = {
          token: "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozLCJleHAiOjE3NDUzMzA1MDV9.COT01SSbFDY1HCXCjxhffh5_g5XNObeqi6o42MUCY74",
          user_id: 3,
          email: "admin@example.com"
        };

        localStorage.setItem('token', mockResponse.token);
        return {
          id: mockResponse.user_id,
          email: mockResponse.email,
          fullName: mockResponse.email.split('@')[0],
          role: 'admin'
        };
      }

      throw new Error('Invalid credentials');
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
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
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

function PermissionsTable({ roleName }: { roleName: string }) {
  const [permissions, setPermissions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadPermissions = async (roleName: string) => {
    try {
      setIsLoading(true);
      // Mock response for development
      const mockResponse = {
        "success": true,
        "role": {
          "id": 27,
          "name": roleName
        },
        "modules": {
          "Home & Login": {
            "module_id": 7,
            "features": {
              "User Registration": {
                "feature_id": 1,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              }
            }
          },
          "Account Management": {
            "module_id": 10,
            "features": {
              "Create Account": {
                "feature_id": 17,
                "permissions": [
                  { "id": 26, "name": "create", "action_name": "create" },
                  { "id": 27, "name": "read", "action_name": "read" },
                  { "id": 28, "name": "update", "action_name": "update" }
                ]
              }
            }
          }
        }
      };
      setPermissions(mockResponse.modules);
    } catch (error) {
      console.error("Error loading permissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions(roleName);
  }, [roleName]);

  if (isLoading) return <p>Loading...</p>;
  if (!permissions) return <p>No permissions found</p>;

  return (
    <table>
      <thead>
        <tr>
          <th>Module</th>
          <th>Feature</th>
          <th>Permissions</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(permissions).map(([moduleName, module]) => (
          Object.entries(module.features).map(([featureName, feature]) => (
            <React.Fragment key={`${moduleName}-${featureName}`}>
              <tr>
                <td>{moduleName}</td>
                <td>{featureName}</td>
                <td>{feature.permissions.map(p => p.name).join(', ')}</td>
              </tr>
            </React.Fragment>
          ))
        ))}
      </tbody>
    </table>
  );
}

export default PermissionsTable;