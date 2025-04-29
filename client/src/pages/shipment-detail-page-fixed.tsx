import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  Truck,
  Clock,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { DocumentUpload } from "@/components/shipment/document-upload";

interface TrackingEvent {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

interface Address {
  name: string;
  company?: string;
  city: string;
  country: string;
  address1?: string;
  address2?: string;
  phone?: string;
  email?: string;
}

interface AppliedFee {
  name: string;
  display_name: string;
  amount: string;
  description: string;
  note: string | null;
}

interface PackageFee {
  package: number;
  applied_fees: AppliedFee[];
}

interface ShipmentPrices {
  net_price: number;
  fuel_surcharge: number;
  peak_season: number;
  oversize_fee: PackageFee[];
}

interface Shipment {
  id: number;
  tracking_number: string;
  status: string | null;
  created_at: string;
  sender_address: Address;
  receiver_address: Address;
  total_price: number | null;
  provider?: string;
  provider_service?: string;
  tracking_events?: TrackingEvent[];
  package_details?: {
    weight: number;
    dimensions: string;
    items: Array<{
      description: string;
      quantity: number;
      value: number;
    }>;
  };
  payment_status?: string;
  estimated_delivery?: string;
  prices?: ShipmentPrices;
}

export default function ShipmentDetailPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  // Extract ID from URL
  const parts = location.split("/");
  const shipmentId = parts[parts.length - 1];

  const {
    data: shipment,
    isLoading,
    error,
  } = useQuery<Shipment>({
    queryKey: [`/shipments/${shipmentId}`],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải thông tin vận chuyển");
      }

      const data = await response.json();
      return data.shipment || data;
    },
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

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "delivered":
        return <Check className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <AlertTriangle className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold">
          Không thể tải thông tin vận chuyển
        </h1>
        <p className="text-gray-500 text-center max-w-md">
          Đã xảy ra lỗi khi tải thông tin vận chuyển. Vui lòng thử lại sau hoặc
          liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
        </p>
        <Button asChild>
          <Link href="/shipments">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay Lại Danh Sách
          </Link>
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
              <a className="font-medium text-gray-600 hover:text-primary transition-colors">
                Trang Chủ
              </a>
            </Link>
            <Link href="/shipping/create">
              <a className="font-medium text-gray-600 hover:text-primary transition-colors">
                Vận Chuyển
              </a>
            </Link>
            <Link href="/tracking">
              <a className="font-medium text-gray-600 hover:text-primary transition-colors">
                Theo Dõi
              </a>
            </Link>
            <Link href="/shipments">
              <a className="font-medium text-primary border-b-2 border-primary pb-1">
                Đơn Hàng
              </a>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button variant="outline" size="sm" asChild className="mb-2">
              <Link href="/shipments">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Quay Lại Danh Sách
              </Link>
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Đơn Hàng #{shipment.tracking_number}
              <Badge
                variant="outline"
                className={`ml-2 ${getStatusColor(shipment.status)}`}
              >
                <span className="flex items-center gap-1.5">
                  {getStatusIcon(shipment.status)}
                  {getStatusText(shipment.status)}
                </span>
              </Badge>
            </h1>
            <p className="text-gray-600 mt-1">
              Tạo lúc: {new Date(shipment.created_at).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide mr-2"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Tải PDF
            </Button>
            <Button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide mr-2"
              >
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              In Đơn Hàng
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="tracking">Theo Dõi</TabsTrigger>
            <TabsTrigger value="documents">Chứng Từ</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Thông Tin Địa Chỉ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Người Gửi</p>
                            <p className="text-gray-500 text-xs">
                              Địa chỉ gửi hàng
                            </p>
                          </div>
                        </div>
                        <div className="pl-10 space-y-1.5 text-sm">
                          <p className="font-medium">
                            {shipment.sender_address.name}
                          </p>
                          {shipment.sender_address.company && (
                            <p className="text-gray-600">
                              {shipment.sender_address.company}
                            </p>
                          )}
                          <p className="text-gray-700">
                            {shipment.sender_address.address1}
                            {shipment.sender_address.address2 &&
                              `, ${shipment.sender_address.address2}`}
                          </p>
                          <p className="text-gray-700">
                            {shipment.sender_address.city},{" "}
                            {shipment.sender_address.country}
                          </p>
                          {shipment.sender_address.phone && (
                            <p className="text-gray-700">
                              <strong>SĐT:</strong>{" "}
                              {shipment.sender_address.phone}
                            </p>
                          )}
                          {shipment.sender_address.email && (
                            <p className="text-gray-700">
                              <strong>Email:</strong>{" "}
                              {shipment.sender_address.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-primary"
                            >
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Người Nhận</p>
                            <p className="text-gray-500 text-xs">
                              Địa chỉ nhận hàng
                            </p>
                          </div>
                        </div>
                        <div className="pl-10 space-y-1.5 text-sm">
                          <p className="font-medium">
                            {shipment.receiver_address.name}
                          </p>
                          {shipment.receiver_address.company && (
                            <p className="text-gray-600">
                              {shipment.receiver_address.company}
                            </p>
                          )}
                          <p className="text-gray-700">
                            {shipment.receiver_address.address1}
                            {shipment.receiver_address.address2 &&
                              `, ${shipment.receiver_address.address2}`}
                          </p>
                          <p className="text-gray-700">
                            {shipment.receiver_address.city},{" "}
                            {shipment.receiver_address.country}
                          </p>
                          {shipment.receiver_address.phone && (
                            <p className="text-gray-700">
                              <strong>SĐT:</strong>{" "}
                              {shipment.receiver_address.phone}
                            </p>
                          )}
                          {shipment.receiver_address.email && (
                            <p className="text-gray-700">
                              <strong>Email:</strong>{" "}
                              {shipment.receiver_address.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {shipment.package_details && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Chi Tiết Gói Hàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Khối Lượng</p>
                          <p className="font-medium">
                            {shipment.package_details.weight} kg
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Kích Thước</p>
                          <p className="font-medium">
                            {shipment.package_details.dimensions}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Nhà Vận Chuyển</p>
                          <p className="font-medium">
                            {shipment.provider || "Chưa Xác Định"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Số Mục</p>
                          <p className="font-medium">
                            {shipment.package_details.items?.length || 0}
                          </p>
                        </div>
                      </div>

                      {shipment.package_details.items &&
                        shipment.package_details.items.length > 0 && (
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b">
                              <h3 className="font-medium">
                                Danh Sách Sản Phẩm
                              </h3>
                            </div>
                            <div className="divide-y">
                              {shipment.package_details.items.map(
                                (item, idx) => (
                                  <div
                                    key={idx}
                                    className="px-4 py-3 flex justify-between items-center"
                                  >
                                    <div>
                                      <p className="font-medium">
                                        {item.description}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Số lượng: {item.quantity}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">
                                        ${item.value.toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      Tóm Tắt Vận Chuyển
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái</span>
                        <Badge
                          variant="outline"
                          className={getStatusColor(shipment.status)}
                        >
                          {getStatusText(shipment.status)}
                        </Badge>
                      </div>

                      <Separator />

                      <div className="flex justify-between">
                        <span className="text-gray-600">Thanh toán</span>
                        <Badge
                          variant={
                            shipment.payment_status === "paid"
                              ? "outline"
                              : "destructive"
                          }
                          className={
                            shipment.payment_status === "paid"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {shipment.payment_status === "paid"
                            ? "Đã Thanh Toán"
                            : "Chưa Thanh Toán"}
                        </Badge>
                      </div>

                      <Separator />

                      {shipment.prices ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Giá gốc</span>
                            <span className="font-medium">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(shipment.prices.net_price || 0)}
                            </span>
                          </div>
                          
                          {shipment.prices.fuel_surcharge > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Phụ phí nhiên liệu</span>
                              <span className="font-medium">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format((shipment.prices.net_price * shipment.prices.fuel_surcharge) / 100)}
                              </span>
                            </div>
                          )}
                          
                          {shipment.prices.peak_season > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Phụ phí cao điểm</span>
                              <span className="font-medium">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format((shipment.prices.net_price * shipment.prices.peak_season) / 100)}
                              </span>
                            </div>
                          )}
                          
                          {shipment.prices.oversize_fee.some(fee => fee.applied_fees.length > 0) && (
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-600 font-medium">Phí bổ sung kích thước</span>
                                <span className="font-medium">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(
                                    shipment.prices.oversize_fee.reduce(
                                      (sum, fee) =>
                                        sum +
                                        fee.applied_fees.reduce(
                                          (feeSum, applied) => feeSum + parseFloat(applied.amount),
                                          0,
                                        ),
                                      0,
                                    )
                                  )}
                                </span>
                              </div>
                              
                              <div className="mt-2 space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {shipment.prices.oversize_fee.map((feePkg, pkgIndex) => (
                                  feePkg.applied_fees.length > 0 && (
                                    <div key={pkgIndex} className="border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                                      <p className="text-sm font-medium text-gray-700 mb-1">
                                        Kiện hàng #{feePkg.package + 1}
                                      </p>
                                      <div className="space-y-1">
                                        {feePkg.applied_fees.map((fee, feeIndex) => (
                                          <div key={feeIndex} className="flex justify-between text-sm">
                                            <div className="flex items-start">
                                              <span className="text-gray-600">{fee.display_name}</span>
                                              {fee.note && (
                                                <span className="ml-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                                                  {fee.note}
                                                </span>
                                              )}
                                            </div>
                                            <span className="font-medium">
                                              {new Intl.NumberFormat("vi-VN", {
                                                style: "currency",
                                                currency: "VND",
                                              }).format(parseFloat(fee.amount))}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                      <p className="text-xs text-gray-500 mt-1 italic">{feePkg.applied_fees[0]?.description}</p>
                                    </div>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex justify-between py-2 mt-2 font-semibold">
                            <span className="text-gray-700">Tổng tiền</span>
                            <span className="text-primary text-lg">
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(shipment.total_price || 0)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tổng tiền</span>
                          <span className="font-medium">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(shipment.total_price || 0)}
                          </span>
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nhà vận chuyển</span>
                          <span className="font-medium">
                            {shipment.provider || "Chưa Xác Định"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dịch vụ</span>
                          <span className="font-medium">
                            {shipment.provider_service || "Tiêu Chuẩn"}
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {shipment.estimated_delivery && (
                          <p>
                            <strong>Giao Hàng Dự Kiến:</strong>{" "}
                            {formatDate(shipment.estimated_delivery)}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Trợ Giúp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Nếu bạn có bất kỳ câu hỏi nào về đơn hàng này, vui lòng
                        liên hệ với đội ngũ hỗ trợ của chúng tôi.
                      </p>
                      <Button variant="outline" className="w-full">
                        Liên Hệ Hỗ Trợ
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tracking">
            {shipment.tracking_events && shipment.tracking_events.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Nhật Ký Theo Dõi</CardTitle>
                  <CardDescription>
                    Theo dõi hành trình của gói hàng của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative ml-6">
                    <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-gray-200" />
                    <div className="space-y-6">
                      {shipment.tracking_events.map((event, index) => (
                        <div key={index} className="relative">
                          <div
                            className={`absolute left-0 w-4 h-4 rounded-full -translate-x-1.5 border-2 ${
                              index === 0
                                ? "bg-primary border-primary"
                                : "bg-white border-gray-300"
                            }`}
                          />
                          <div className="ml-6">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-1 md:gap-4">
                              <div>
                                <p className="font-medium">{event.status}</p>
                                <p className="text-sm text-gray-600">
                                  {event.location}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {event.description}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 whitespace-nowrap">
                                {formatDate(event.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Không Có Dữ Liệu Theo Dõi
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Thông tin theo dõi chưa có sẵn hoặc đang được cập nhật. Vui
                  lòng kiểm tra lại sau.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents">
            <DocumentUpload shipmentId={shipmentId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}