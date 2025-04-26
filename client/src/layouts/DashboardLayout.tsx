import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserRole } from "@shared/schema";
import { 
  Search, 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  BarChart2, 
  Users, 
  Settings, 
  Bell, 
  HelpCircle, 
  Menu, 
  LogOut 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ href, icon, label, active }: NavItemProps) {
  return (
    <li className="mb-1">
      <Link href={href}>
        <div className={`flex items-center px-3 py-2 rounded-md transition-colors ${
          active 
            ? "bg-primary text-white" 
            : "text-white/70 hover:bg-neutral-700 hover:text-white"
        }`}>
          {icon}
          <span className="ml-2">{label}</span>
        </div>
      </Link>
    </li>
  );
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Get user initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = user ? getInitials(user.fullName) : "";

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been successfully logged out",
        });
        navigate('/auth');
      }
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-neutral-800 text-white w-64 flex-shrink-0 ${
        isMobile ? (sidebarOpen ? "fixed inset-0 z-50" : "hidden") : "block"
      }`}>
        <div className="p-4 border-b border-neutral-700">
          <h1 className="text-xl font-bold flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Hệ Thống Vận Chuyển
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-2 flex-1 overflow-y-auto">
          <div className="text-sm text-neutral-400 mb-2 px-3 py-2">
            {user?.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Role` : 'User Role'}
          </div>

          <ul>
            <NavItem 
              href="/admin" 
              icon={<LayoutDashboard className="h-5 w-5" />} 
              label="Dashboard" 
              active={location === "/admin"} 
            />

            <NavItem 
              href="/admin/booking" 
              icon={<Package className="h-5 w-5" />} 
              label="Đặt Hàng Mới" 
              active={location === "/admin/booking"} 
            />

            <NavItem 
              href="/admin/orders" 
              icon={<ShoppingCart className="h-5 w-5" />} 
              label="Đơn Hàng" 
              active={location === "/admin/orders"} 
            />

            <NavItem 
              href="/admin/finance" 
              icon={<CreditCard className="h-5 w-5" />} 
              label="Tài Chính" 
              active={location === "/admin/finance"} 
            />

            <NavItem 
              href="/admin/reports" 
              icon={<BarChart2 className="h-5 w-5" />} 
              label="Báo Cáo" 
              active={location === "/admin/reports"} 
            />

            {/* Admin only sections */}
            {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
              <>
                <li className="border-t border-neutral-700 mt-4 pt-4">
                  <div className="text-sm text-neutral-400 mb-2 px-3">Quản Trị Viên</div>
                </li>

                {user?.role === UserRole.ADMIN && (
                  <NavItem 
                    href="/admin/users" 
                    icon={<Users className="h-5 w-5" />} 
                    label="Quản Lý Người Dùng" 
                    active={location === "/admin/users"} 
                  />
                )}

                <NavItem 
                  href="/admin/settings" 
                  icon={<Settings className="h-5 w-5" />} 
                  label="Cài Đặt Hệ Thống" 
                  active={location === "/admin/settings"} 
                />
              </>
            )}
          </ul>
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center">
            <Avatar>
              <AvatarFallback className="bg-primary">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="ml-2">
              <div className="text-sm font-medium">{user?.fullName}</div>
              <div className="text-xs text-neutral-400">{user?.email}</div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={handleLogout} 
                  variant="ghost" 
                  size="icon" 
                  className="ml-auto text-neutral-400 hover:text-white hover:bg-transparent"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Đăng Xuất</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            {isMobile && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm..."
                  className="w-[200px] md:w-[300px] pl-9 rounded-md"
                />
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Thông báo</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Trợ giúp</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}