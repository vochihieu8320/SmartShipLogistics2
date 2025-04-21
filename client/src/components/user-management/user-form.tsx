
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUserSchema } from "@shared/schema";
import { API_BASE_URL, API_ENDPOINTS } from "@/config/api";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ROLES = ["manager", "cs", "sales", "accounting"] as const;

export default function UserForm() {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      password_confirmation: "",
      role_id: ""
    }
  });

  const loadPermissions = async (roleName: string) => {
    try {
      setIsLoading(true);
      // Mock response
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
              },
              "User Login": {
                "feature_id": 2,
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
      toast({
        title: "Error",
        description: "Failed to load role permissions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!res.ok) throw new Error('Failed to create user');
      
      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      form.reset();
      setPermissions(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
                    field.onChange(value);
                    loadPermissions(value);
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

      {permissions && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">Role Permissions</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Create</TableHead>
                  <TableHead>Read</TableHead>
                  <TableHead>Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(permissions).map(([moduleName, moduleData]: [string, any]) =>
                  Object.entries(moduleData.features).map(([featureName, featureData]: [string, any]) => {
                    const permissionMap = {
                      create: featureData.permissions.some((p: any) => p.name === 'create'),
                      read: featureData.permissions.some((p: any) => p.name === 'read'),
                      update: featureData.permissions.some((p: any) => p.name === 'update')
                    };
                    
                    return (
                      <TableRow key={`${moduleName}-${featureName}`}>
                        <TableCell className="font-medium">{moduleName}</TableCell>
                        <TableCell>{featureName}</TableCell>
                        <TableCell>
                          {permissionMap.create ? '✓' : '-'}
                        </TableCell>
                        <TableCell>
                          {permissionMap.read ? '✓' : '-'}
                        </TableCell>
                        <TableCell>
                          {permissionMap.update ? '✓' : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
