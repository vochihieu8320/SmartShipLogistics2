import { Link, useLocation } from "wouter";

export function Header() {
  const [location] = useLocation();
  
  // Kiểm tra đường dẫn hiện tại để highlight menu item phù hợp
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/">
            <a className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              VN Logistics
            </a>
          </Link>
        </div>
        <nav className="hidden md:flex gap-8">
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
        </nav>
      </div>
    </header>
  );
}