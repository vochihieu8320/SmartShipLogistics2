
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@shared/schema";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
import RolePermissions from "@/components/user-management/role-permissions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLES = ["manager", "cs", "sales", "accounting"] as const;

interface UserFormProps {
  onSuccess?: () => void;
}

export default function UserForm({ onSuccess }: UserFormProps) {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0); // Key to force re-render
  
  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirmation: "",
      role_name: ""
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');

      // Use configured API URL and endpoints
      const res = await fetch(`${ACTIVE_API_URL}${API_ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
          role_name: data.role_name
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create user');
      }
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      form.reset();
      setSelectedRole("");
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle role selection change
  const handleRoleChange = (value: string) => {
    console.log('Role selected in form:', value);
    setSelectedRole(value);
    // Force component to re-render with new role
    setKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    // Update form value
                    field.onChange(value);
                    // Also update our local state for permissions display
                    handleRoleChange(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating User...
              </>
            ) : (
              "Create User"
            )}
          </Button>
        </form>
      </Form>

      {/* Only show permissions when a role is selected */}
      {selectedRole && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
          <RolePermissions key={`${selectedRole}-${key}`} roleName={selectedRole} />
        </div>
      )}
    </div>
  );
}
