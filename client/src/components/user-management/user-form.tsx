
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

const ROLES = [
  { name: "admin", id: 26 },
  { name: "manager", id: 27 },
  { name: "cs", id: 28 },
  { name: "sales", id: 29 },
  { name: "accounting", id: 30 }
];

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
    const token = localStorage.getItem('token');
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ROLE_PERMISSIONS}?role_name=${roleName}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to load permissions');
      const data = await res.json();
      setPermissions(data.modules);
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
            name="role_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    const role = ROLES.find(r => r.id.toString() === value);
                    if (role) loadPermissions(role.name);
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
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
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
          {Object.entries(permissions).map(([moduleName, moduleData]: [string, any]) => (
            <div key={moduleName} className="mb-6">
              <h4 className="text-md font-medium mb-2">{moduleName}</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Permissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(moduleData.features).map(([featureName, featureData]: [string, any]) => (
                    <TableRow key={featureName}>
                      <TableCell>{featureName}</TableCell>
                      <TableCell className="space-x-1">
                        {featureData.permissions.map((p: any) => (
                          <span key={p.id} className="inline-block px-2 py-1 text-xs rounded bg-slate-100">
                            {p.name}
                          </span>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
