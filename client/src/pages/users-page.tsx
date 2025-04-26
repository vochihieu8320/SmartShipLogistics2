import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTable from "@/components/user-management/user-table";
import UserForm from "@/components/user-management/user-form";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const { user, isLoading, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Đăng xuất thành công",
          description: "Bạn đã đăng xuất khỏi hệ thống",
        });
        navigate('/auth');
      }
    });
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!user || user.role !== 'admin') {
    return null;
  }
  
  return (
    <DashboardLayout title="Quản Lý Người Dùng">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản Lý Người Dùng</CardTitle>
            <CardDescription>
              Quản lý tài khoản và quyền hạn người dùng
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Đăng Xuất
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="list" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="list">Danh Sách Người Dùng</TabsTrigger>
              <TabsTrigger value="create">Tạo Người Dùng Mới</TabsTrigger>
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
