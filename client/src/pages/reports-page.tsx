import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { CarrierChart } from "@/components/reports/carrier-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Loader2 } from "lucide-react";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [timePeriod, setTimePeriod] = useState("30days");
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    staleTime: 300000, // 5 minutes
  });
  
  return (
    <DashboardLayout title="Financial Reports">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Financial Reports</CardTitle>
            <CardDescription>
              View and analyze your business performance metrics
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            
            {timePeriod === "custom" && (
              <DateRangePicker />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="revenue" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
              <TabsTrigger value="carriers">Carrier Distribution</TabsTrigger>
              <TabsTrigger value="customers">Top Customers</TabsTrigger>
              <TabsTrigger value="debts">Outstanding Debts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-2xl">
                          ${stats?.revenue.total.toFixed(2) || "0.00"}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Collected Revenue</CardDescription>
                        <CardTitle className="text-2xl">
                          ${stats?.revenue.paid.toFixed(2) || "0.00"}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardDescription>Outstanding Debts</CardDescription>
                        <CardTitle className="text-2xl">
                          ${stats?.revenue.unpaid.toFixed(2) || "0.00"}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="h-[350px]">
                        <RevenueChart />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="carriers" className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-80">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Carrier Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <CarrierChart data={stats?.carriers} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="customers" className="space-y-4">
              <Card className="p-6">
                <div className="text-center text-gray-500 my-8">
                  <p>Customer analytics data is not available yet.</p>
                  <p className="text-sm mt-2">This feature will be available in a future update.</p>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="debts" className="space-y-4">
              <Card className="p-6">
                <div className="text-center text-gray-500 my-8">
                  <p>Detailed debt analysis is not available yet.</p>
                  <p className="text-sm mt-2">This feature will be available in a future update.</p>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
