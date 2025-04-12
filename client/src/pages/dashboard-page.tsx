import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { KpiCard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderTable from "@/components/orders/order-table";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { CarrierChart } from "@/components/reports/carrier-chart";
import { Package, DollarSign, ClipboardList, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  // Mock user for development purposes
  const user = {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    fullName: "Admin User",
    role: UserRole.ADMIN,
    createdAt: new Date()
  };
  
  const { data: recentOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["/api/dashboard/recent-orders"],
    staleTime: 300000, // 5 minutes
  });
  
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 300000, // 5 minutes
    enabled: user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER,
  });
  
  const isLoading = isLoadingOrders || isLoadingStats;
  
  return (
    <DashboardLayout title="Dashboard">
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                title="Total Shipments"
                value={stats.orders.total}
                trend={{
                  value: "12% from last month",
                  positive: true
                }}
                icon={<Package />}
                iconColor="text-primary"
                iconBgColor="bg-blue-100"
              />
              
              <KpiCard
                title="Revenue"
                value={`$${stats.revenue.total.toFixed(2)}`}
                trend={{
                  value: "8% from last month",
                  positive: true
                }}
                icon={<DollarSign />}
                iconColor="text-green-600"
                iconBgColor="bg-green-100"
              />
              
              <KpiCard
                title="Pending Orders"
                value={stats.orders.processing}
                trend={{
                  value: "3 more than yesterday",
                  positive: false
                }}
                icon={<ClipboardList />}
                iconColor="text-amber-500"
                iconBgColor="bg-yellow-100"
              />
              
              <KpiCard
                title="Outstanding Debt"
                value={`$${stats.revenue.unpaid.toFixed(2)}`}
                trend={{
                  value: "4 overdue payments",
                  positive: false
                }}
                icon={<AlertTriangle />}
                iconColor="text-red-600"
                iconBgColor="bg-red-100"
              />
            </div>
          )}
          
          {/* Charts Row */}
          {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">Revenue Overview</CardTitle>
                  <Select defaultValue="7days">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">Last 7 days</SelectItem>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="90days">Last 90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <RevenueChart />
                </CardContent>
              </Card>
              
              {/* Carrier Distribution */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base font-medium">Carrier Distribution</CardTitle>
                  <Select defaultValue="30days">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30days">Last 30 days</SelectItem>
                      <SelectItem value="quarter">Last quarter</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <CarrierChart data={stats?.carriers} />
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Recent Orders */}
          <OrderTable title="Recent Orders" limit={5} />
        </>
      )}
    </DashboardLayout>
  );
}
