import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
  };
  
  return (
    <DashboardLayout title="System Settings">
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure system preferences and default settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="carriers">Carrier Integration</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="SmartShip Logistics" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select defaultValue="usd">
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                      <SelectItem value="jpy">JPY (¥)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger id="date-format">
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-tax" className="flex-1">Auto-calculate Tax</Label>
                  <Switch id="auto-tax" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-invoice" className="flex-1">Auto-generate Invoice</Label>
                  <Switch id="auto-invoice" defaultChecked />
                </div>
              </div>
              
              <Button onClick={handleSave} className="mt-4">Save Changes</Button>
            </TabsContent>
            
            <TabsContent value="carriers" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ups-api-key">UPS API Key</Label>
                  <Input id="ups-api-key" type="password" value="•••••••••••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fedex-api-key">FedEx API Key</Label>
                  <Input id="fedex-api-key" type="password" value="•••••••••••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dhl-api-key">DHL API Key</Label>
                  <Input id="dhl-api-key" type="password" value="•••••••••••••••••" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sf-api-key">SF Express API Key</Label>
                  <Input id="sf-api-key" type="password" value="•••••••••••••••••" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dev-mode" className="flex-1">Use Test Environment</Label>
                  <Switch id="dev-mode" />
                </div>
              </div>
              
              <Button onClick={handleSave} className="mt-4">Save API Keys</Button>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="flex-1">Email Notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-notifications" className="flex-1">SMS Notifications</Label>
                  <Switch id="sms-notifications" />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-reminders" className="flex-1">Payment Reminders</Label>
                  <Switch id="payment-reminders" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="status-updates" className="flex-1">Order Status Updates</Label>
                  <Switch id="status-updates" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reminder-days">Days Before Payment Reminder</Label>
                  <Select defaultValue="3">
                    <SelectTrigger id="reminder-days">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleSave} className="mt-4">Save Notification Settings</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
