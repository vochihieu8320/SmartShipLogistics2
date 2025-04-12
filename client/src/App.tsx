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

// Function to create a basic app without authentication
function App() {
  return (
    <>
      <TooltipProvider>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/" component={DashboardPage} />
          <Route path="/booking" component={BookingPage} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/finance" component={FinancePage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/users" component={UsersPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
      <Toaster />
    </>
  );
}

export default App;
