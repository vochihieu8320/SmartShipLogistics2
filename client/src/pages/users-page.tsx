import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import UserTable from "@/components/user-management/user-table";
import UserForm from "@/components/user-management/user-form";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { API_BASE_URL } from "@/config/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Select from "@/components/ui/select";

interface Address {
  id: number;
  name: string;
  company: string;
  country_id: number;
  postal_code: string;
  city: string;
  state: string;
  address1: string;
  address2: string;
  address3: string;
  phone: string;
  email: string;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [countries, setCountries] = useState<{id: number; name: string}[]>([]);
  const { user, isLoading, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const form = useForm();

  const fetchAddresses = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/list_default_addresses`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setAddresses(data.addresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/countries`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCountries(data.countries);
      }
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast({
        title: "Error",
        description: "Failed to load countries",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/create_default_address`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Address created successfully",
        });
        fetchAddresses();
        form.reset();
      }
    } catch (error) {
      console.error("Error creating address:", error);
      toast({
        title: "Error",
        description: "Failed to create address",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCountries();
    if (!isLoading && (!user || user.role !== "admin")) {
      navigate("/auth");
    }
    if (user && user.role === "admin") {
      fetchAddresses();
    }
  }, [user, isLoading, navigate]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Đăng xuất thành công",
          description: "Bạn đã đăng xuất khỏi hệ thống",
        });
        navigate("/auth");
      },
    });
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <DashboardLayout title="Quản Lý Người Dùng">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Quản Lý Người Dùng</CardTitle>
            <CardDescription>
              Quản lý tài khoản và địa chỉ người dùng
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
              <TabsTrigger value="addresses">Quản Lý Địa Chỉ</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <UserTable />
            </TabsContent>

            <TabsContent value="create" className="space-y-4">
              <UserForm onSuccess={() => setActiveTab("list")} />
            </TabsContent>

            <TabsContent value="addresses" className="space-y-4">
              <div className="flex justify-end mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Thêm Địa Chỉ Mới</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Tạo Địa Chỉ Mới</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tên</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Công ty</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Số điện thoại</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={form.control}
                          name="address1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Địa chỉ 1</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Thành phố</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tỉnh/Bang</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="postal_code"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mã bưu chính</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="country_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quốc gia</FormLabel>
                                <FormControl>
                                  <Select {...field} options={countries.map(country => ({ value: country.id, label: country.name }))}/>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Tạo Địa Chỉ
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Company</TableHeader>
                    <TableHeader>Address</TableHeader>
                    <TableHeader>City, State, Zip</TableHeader>
                    <TableHeader>Phone</TableHeader>
                    <TableHeader>Email</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {addresses.map((address) => (
                    <TableRow key={address.id}>
                      <TableCell>{address.name}</TableCell>
                      <TableCell>{address.company}</TableCell>
                      <TableCell>{address.address1}, {address.address2}, {address.address3}</TableCell>
                      <TableCell>{`${address.city}, ${address.state} ${address.postal_code}`}</TableCell>
                      <TableCell>{address.phone}</TableCell>
                      <TableCell>{address.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}