import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import BookingPage from "@/pages/booking-page";
import OrdersPage from "@/pages/orders-page";
import FinancePage from "@/pages/finance-page";
import ReportsPage from "@/pages/reports-page";
import UsersPage from "@/pages/users-page";
import SettingsPage from "@/pages/settings-page";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute, AdminRoute, ManagerRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import HomePage from "@/pages/home-page";
import TrackingPage from "@/pages/tracking-page";
import ShippingPage from "@/pages/shipping-page";
import ShipmentsPage from "@/pages/shipments-page";
import CreateShippingPage from "@/pages/create-shipping-page";
import ShipmentDetailPage from "@/pages/shipment-detail-page";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="smartship-theme">
          <TooltipProvider>
            <Switch>
              {/* Auth route - always public */}
              <Route path="/auth" component={AuthPage} />

              {/* Public landing page */}
              <Route path="/" component={HomePage} />

              {/* All other routes require authentication */}
              <ProtectedRoute path="/track" component={TrackingPage} />
              <ProtectedRoute path="/tracking" component={TrackingPage} />
              <ProtectedRoute path="/shipping" component={ShippingPage} />
              <ProtectedRoute path="/shipping/create" component={CreateShippingPage} />
              <ProtectedRoute path="/shipments" component={ShipmentsPage} />
              <ProtectedRoute path="/shipments/:id" component={ShipmentDetailPage} />

              {/* Protected admin dashboard routes */}
              <ProtectedRoute path="/admin" component={DashboardPage} />
              <ProtectedRoute path="/admin/booking" component={BookingPage} />
              <ProtectedRoute path="/admin/orders" component={OrdersPage} />
              <ManagerRoute path="/admin/finance" component={FinancePage} />
              <ManagerRoute path="/admin/reports" component={ReportsPage} />
              <AdminRoute path="/admin/users" component={UsersPage} />
              <ProtectedRoute path="/admin/settings" component={SettingsPage} />

              <Route component={NotFound} />
            </Switch>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;