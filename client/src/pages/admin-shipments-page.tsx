
import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, AlertCircle } from "lucide-react";

interface Shipment {
  id: number;
  tracking_number: string;
  status: string | null;
  created_at: string;
  sender: {
    name: string;
    city: string;
    country: string;
  };
  receiver: {
    name: string;
    city: string;
    country: string;
  };
  total_price: number | null;
  provider?: string;
  provider_service?: string;
}

export default function AdminShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["/admin/shipments"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/admin/shipments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Không thể tải danh sách vận chuyển");
      }
      
      return response.json();
    },
  });

  const shipments = response?.shipments || [];

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "Đã Giao";
      case "in_transit":
        return "Đang Vận Chuyển";
      case "pending":
        return "Chờ Xử Lý";
      case "cancelled":
        return "Đã Hủy";
      default:
        return "Không Xác Định";
    }
  };

  const filteredShipments = shipments?.filter((shipment) => {
    const searchStr = searchTerm.toLowerCase();
    return (
      shipment.tracking_number.toLowerCase().includes(searchStr) ||
      shipment.sender.name.toLowerCase().includes(searchStr) ||
      shipment.receiver.name.toLowerCase().includes(searchStr)
    );
  });

  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <DashboardLayout title="Quản Lý Vận Chuyển">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Tìm kiếm theo mã vận đơn, người gửi, người nhận..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full md:w-[300px]"
            />
          </div>
          <Button asChild>
            <Link href="/admin/booking">
              <Plus className="h-4 w-4 mr-2" />
              Tạo Đơn Mới
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <h3 className="text-xl font-medium mb-2">Không thể tải danh sách đơn hàng</h3>
              <p className="text-gray-500 text-center max-w-md mb-6">
                Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.
              </p>
              <Button onClick={() => window.location.reload()}>Tải lại</Button>
            </CardContent>
          </Card>
        ) : filteredShipments && filteredShipments.length > 0 ? (
          <Card>
            <CardHeader className="px-6">
              <CardTitle className="text-lg">Đơn Hàng ({filteredShipments.length})</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Mã Vận Đơn</TableHead>
                      <TableHead>Người Gửi / Nhận</TableHead>
                      <TableHead>Dịch Vụ</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead className="text-right">Giá Trị</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">
                          <Link href={`/admin/shipments/${shipment.id}`}>
                            <a className="text-primary hover:underline">
                              {shipment.tracking_number}
                            </a>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              Từ: <span className="font-medium">{shipment.sender.name}</span>
                              <span className="text-gray-500 ml-1">
                                ({shipment.sender.city}, {shipment.sender.country})
                              </span>
                            </div>
                            <div className="text-sm">
                              Đến: <span className="font-medium">{shipment.receiver.name}</span>
                              <span className="text-gray-500 ml-1">
                                ({shipment.receiver.city}, {shipment.receiver.country})
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{shipment.provider}</div>
                            <div className="text-sm text-gray-500">{shipment.provider_service}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(shipment.status)}>
                            {getStatusText(shipment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPrice(shipment.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Không Có Đơn Hàng</h3>
                <p className="text-gray-500 mb-6">
                  Chưa có đơn hàng nào được tạo hoặc không tìm thấy kết quả phù hợp.
                </p>
                <Button asChild>
                  <Link href="/admin/booking">
                    <Plus className="h-4 w-4 mr-2" />
                    Tạo Đơn Mới
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
