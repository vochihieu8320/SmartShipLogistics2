import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTable from "@/components/user-management/user-table";
import UserForm from "@/components/user-management/user-form";
import { useState } from "react";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list");
  
  return (
    <DashboardLayout title="User Management">
      <Card>
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
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="list">User List</TabsTrigger>
              <TabsTrigger value="create">Create User</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-4">
              <UserTable />
            </TabsContent>
            
            <TabsContent value="create" className="space-y-4">
              <UserForm onSuccess={() => setActiveTab("list")} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
