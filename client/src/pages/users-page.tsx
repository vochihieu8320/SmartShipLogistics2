import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UserTable from "@/components/user-management/user-table";
import UserForm from "@/components/user-management/user-form";
import RolePermissions from "@/components/user-management/role-permissions";
import { useState } from "react";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedRole, setSelectedRole] = useState("manager");
  const [key, setKey] = useState(0); // Key to force re-render
  
  // Available roles from external API
  const ROLES = ["admin", "manager", "cs", "sales", "accounting"];
  
  // When changing tabs, force reload if permissions tab is selected
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "permissions") {
      console.log("Permissions tab selected, triggering reload of permissions for role:", selectedRole);
      // Force re-render the RolePermissions component
      setKey(prev => prev + 1);
    }
  };
  
  return (
    <DashboardLayout title="User Management">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="list" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="list">User List</TabsTrigger>
              <TabsTrigger value="create">Create User</TabsTrigger>
              <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <UserTable />
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4">
              <UserForm onSuccess={() => setActiveTab("list")} />
            </TabsContent>
            
            <TabsContent value="permissions" className="space-y-4">
              <div className="mb-6 max-w-md">
                <label className="block text-sm font-medium mb-2">Select Role to Manage</label>
                <Select 
                  value={selectedRole}
                  onValueChange={(value) => {
                    console.log('Role selected:', value);
                    setSelectedRole(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Force re-render of RolePermissions when role changes by using key prop */}
              <RolePermissions key={`${selectedRole}-${key}`} roleName={selectedRole} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
