
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle } from "lucide-react";

export default function OrdersPage() {
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

  return (
    <DashboardLayout title="Quản Lý Đơn Hàng">
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
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã Vận Đơn</TableHead>
                  <TableHead>Người Gửi</TableHead>
                  <TableHead>Người Nhận</TableHead>
                  <TableHead>Dịch Vụ</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell>{shipment.tracking_number}</TableCell>
                    <TableCell>
                      {shipment.sender.name}
                      <div className="text-sm text-gray-500">
                        {shipment.sender.city}, {shipment.sender.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      {shipment.receiver.name}
                      <div className="text-sm text-gray-500">
                        {shipment.receiver.city}, {shipment.receiver.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      {shipment.provider} - {shipment.provider_service}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(shipment.status)}>
                        {getStatusText(shipment.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
