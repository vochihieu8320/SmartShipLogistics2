
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { API_BASE_URL } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ChevronRight, Loader2, PackageOpen, Plus, Search, Truck } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import DashboardLayout from "@/layouts/DashboardLayout";

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
  estimated_delivery?: string;
}

export default function AdminShipmentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: shipments, isLoading, error } = useQuery<Shipment[]>({
    queryKey: ["/admin/shipments"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/shipments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Không thể tải danh sách vận chuyển");
      }
      
      const data = await response.json();
      return data.shipments || [];
    },
  });

  const filteredShipments = shipments?.filter(shipment => {
    if (!shipment) return false;
    
    const trackingMatch = shipment.tracking_number 
      ? shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) 
      : false;
      
    const senderMatch = shipment.sender?.name 
      ? shipment.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) 
      : false;
      
    const receiverMatch = shipment.receiver?.name 
      ? shipment.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) 
      : false;
      
    const providerMatch = shipment.provider 
      ? shipment.provider.toLowerCase().includes(searchTerm.toLowerCase()) 
      : false;
      
    return trackingMatch || senderMatch || receiverMatch || providerMatch;
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_transit":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string | null) => {
    switch (status) {
      case "delivered":
        return "Đã Giao Hàng";
      case "in_transit":
        return "Đang Vận Chuyển";
      case "processing":
        return "Đang Xử Lý";
      case "created":
        return "Đã Tạo";
      case "cancelled":
        return "Đã Hủy";
      default:
        return "Không Xác Định";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <DashboardLayout title="Quản Lý Vận Chuyển">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo mã vận đơn, tên người gửi/nhận, hoặc dịch vụ..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button asChild className="flex gap-2">
              <Link href="/admin/booking">
                <Plus className="h-4 w-4" />
                Tạo Đơn Hàng Mới
              </Link>
            </Button>
          </div>
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
                      <TableHead>Ngày Tạo</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead>Dịch Vụ</TableHead>
                      <TableHead className="text-right">Giá</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
                      <TableRow key={shipment.id}>
                        <TableCell className="font-medium">{shipment.tracking_number || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm">
                              <span className="font-medium">Từ:</span> {shipment.sender?.name || "Không có thông tin"}
                            </span>
                            <span className="text-sm">
                              <span className="font-medium">Đến:</span> {shipment.receiver?.name || "Không có thông tin"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{shipment.created_at ? formatDate(shipment.created_at) : "N/A"}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getStatusColor(shipment.status)}`}>
                            {getStatusText(shipment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{shipment.provider || "-"}</TableCell>
                        <TableCell className="text-right">
                          {shipment.total_price !== null && shipment.total_price !== undefined ? 
                            new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND"
                            }).format(shipment.total_price) : "-"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/shipments/${shipment.id}`}>
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="text-center">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <PackageOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Không tìm thấy đơn hàng nào</h3>
              {searchTerm ? (
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Không tìm thấy đơn hàng phù hợp với từ khóa "{searchTerm}". Vui lòng thử từ khóa khác.
                </p>
              ) : (
                <p className="text-gray-500 text-center max-w-md mb-6">
                  Chưa có đơn hàng nào. Hãy tạo đơn hàng đầu tiên để bắt đầu vận chuyển.
                </p>
              )}
              {searchTerm ? (
                <Button variant="outline" onClick={() => setSearchTerm("")}>Xóa tìm kiếm</Button>
              ) : (
                <Button asChild>
                  <Link href="/admin/booking">
                    <Truck className="mr-2 h-4 w-4" />
                    Tạo Đơn Hàng Mới
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
