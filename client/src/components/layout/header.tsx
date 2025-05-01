
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <a className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              VN Logistics
            </a>
          </Link>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="text-sm text-gray-600">
                    {user.fullName}
                  </span>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem>
                    <Link href="/admin">
                      <a className="w-full">Quản trị viên</a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <nav className="hidden md:flex gap-8 items-center">
          <Link href="/">
            <a className={`font-medium ${isActive("/") && !isActive("/shipping") && !isActive("/tracking") && !isActive("/shipments")
              ? "text-primary border-b-2 border-primary pb-1" 
              : "text-gray-600 hover:text-primary transition-colors"}`}>
              Trang Chủ
            </a>
          </Link>
          <Link href="/shipping/create">
            <a className={`font-medium ${isActive("/shipping") 
              ? "text-primary border-b-2 border-primary pb-1" 
              : "text-gray-600 hover:text-primary transition-colors"}`}>
              Vận Chuyển
            </a>
          </Link>
          <Link href="/tracking">
            <a className={`font-medium ${isActive("/tracking") 
              ? "text-primary border-b-2 border-primary pb-1" 
              : "text-gray-600 hover:text-primary transition-colors"}`}>
              Theo Dõi
            </a>
          </Link>
          <Link href="/shipments">
            <a className={`font-medium ${isActive("/shipments") 
              ? "text-primary border-b-2 border-primary pb-1" 
              : "text-gray-600 hover:text-primary transition-colors"}`}>
              Đơn Hàng
            </a>
          </Link>
          {!user && (
            <Link href="/auth">
              <Button variant="default" className="text-sm">
                Đăng Nhập
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
