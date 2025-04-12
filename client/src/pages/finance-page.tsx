import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentForm from "@/components/finance/payment-form";
import DebtTable from "@/components/finance/debt-table";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState("payments");

  return (
    <DashboardLayout title="Financial Management">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
          <CardDescription>
            Manage payments, invoices, and track outstanding debts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="payments"
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="payments">Record Payments</TabsTrigger>
              <TabsTrigger value="debts">Outstanding Debts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payments" className="space-y-4">
              <PaymentForm />
            </TabsContent>
            
            <TabsContent value="debts" className="space-y-4">
              <DebtTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
