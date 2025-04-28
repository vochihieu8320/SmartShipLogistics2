import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { API_BASE_URL } from "@/config/api";
import { Loader2, ChevronLeft, Truck, Package, Calendar, Clock, MapPin, CreditCard, Check, AlertTriangle, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

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

interface Shipment {
  id: number;
  tracking_number: string;
  status: string | null;
  created_at: string;
  sender: Address;
  receiver: Address;
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
}

export default function ShipmentDetailPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Extract ID from URL
  const parts = location.split("/");
  const shipmentId = parts[parts.length - 1];
  
  const { data: shipment, isLoading, error } = useQuery<Shipment>({
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (e) {
      return dateString;
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
        <h1 className="text-2xl font-bold">Không thể tải thông tin vận chuyển</h1>
        <p className="text-gray-500 text-center max-w-md">
          Đã xảy ra lỗi khi tải thông tin vận chuyển. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <a className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">VN Logistics</a>
            </Link>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/">
              <a className="font-medium text-gray-600 hover:text-primary transition-colors">
                Trang Chủ
              </a>
            </Link>
            <Link href="/shipping">
              <a className="font-medium text-gray-600 hover:text-primary transition-colors">Vận Chuyển</a>
            </Link>
            <Link href="/track">
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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild className="h-8">
                <Link href="/shipments">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Quay Lại
                </Link>
              </Button>
              <Badge variant="outline" className={`px-3 py-1 border ${getStatusColor(shipment.status)}`}>
                <span className="flex items-center gap-1.5">
                  {getStatusIcon(shipment.status)}
                  {getStatusText(shipment.status)}
                </span>
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold flex flex-wrap items-center gap-2">
              Chi Tiết Đơn Vận Chuyển
              <span className="text-gray-500 text-base font-medium">#{shipment.tracking_number}</span>
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-1">
              <span className="mr-2">
                <Printer />
              </span>
              In Hóa Đơn
            </Button>
            <Button className="gap-1">
              <CreditCard className="h-4 w-4" />
              Thanh Toán
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-6 p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ngày Tạo</h3>
                <p className="font-medium">{formatDate(shipment.created_at)}</p>
              </div>
            </div>
            
            <div className="p-4 flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Mã Vận Đơn</h3>
                <p className="font-medium">{shipment.tracking_number}</p>
              </div>
            </div>
            
            <div className="p-4 flex items-start">
              <div className="bg-primary/10 p-3 rounded-full mr-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Dịch Vụ</h3>
                <p className="font-medium">{shipment.provider || "Chưa chọn"} {shipment.provider_service && `- ${shipment.provider_service}`}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
            <TabsTrigger value="tracking">Theo Dõi</TabsTrigger>
            <TabsTrigger value="documents">Tài Liệu</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Thông Tin Vận Chuyển</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Người Gửi</h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="font-medium">{shipment.sender.name}</p>
                            {shipment.sender.company && <p className="text-gray-700">{shipment.sender.company}</p>}
                            {shipment.sender.address1 && <p className="text-gray-700">{shipment.sender.address1}</p>}
                            {shipment.sender.address2 && <p className="text-gray-700">{shipment.sender.address2}</p>}
                            <p className="text-gray-700">{shipment.sender.city}, {shipment.sender.country}</p>
                            {shipment.sender.phone && (
                              <p className="text-gray-700 mt-2">
                                <span className="font-medium">SĐT:</span> {shipment.sender.phone}
                              </p>
                            )}
                            {shipment.sender.email && (
                              <p className="text-gray-700">
                                <span className="font-medium">Email:</span> {shipment.sender.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Người Nhận</h3>
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="font-medium">{shipment.receiver.name}</p>
                            {shipment.receiver.company && <p className="text-gray-700">{shipment.receiver.company}</p>}
                            {shipment.receiver.address1 && <p className="text-gray-700">{shipment.receiver.address1}</p>}
                            {shipment.receiver.address2 && <p className="text-gray-700">{shipment.receiver.address2}</p>}
                            <p className="text-gray-700">{shipment.receiver.city}, {shipment.receiver.country}</p>
                            {shipment.receiver.phone && (
                              <p className="text-gray-700 mt-2">
                                <span className="font-medium">SĐT:</span> {shipment.receiver.phone}
                              </p>
                            )}
                            {shipment.receiver.email && (
                              <p className="text-gray-700">
                                <span className="font-medium">Email:</span> {shipment.receiver.email}
                              </p>
                            )}
                          </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500">Trọng Lượng</p>
                          <p className="font-medium">{shipment.package_details.weight} kg</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500">Kích Thước</p>
                          <p className="font-medium">{shipment.package_details.dimensions || "Không có"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-500">Số Lượng Sản Phẩm</p>
                          <p className="font-medium">{shipment.package_details.items?.length || 0}</p>
                        </div>
                      </div>
                      
                      {shipment.package_details.items && shipment.package_details.items.length > 0 && (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b">
                            <h3 className="font-medium">Danh Sách Sản Phẩm</h3>
                          </div>
                          <div className="divide-y">
                            {shipment.package_details.items.map((item, idx) => (
                              <div key={idx} className="px-4 py-3 flex justify-between items-center">
                                <div>
                                  <p className="font-medium">{item.description}</p>
                                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">${item.value.toFixed(2)}</p>
                                </div>
                              </div>
                            ))}
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
                    <CardTitle className="text-lg">Tóm Tắt Vận Chuyển</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái</span>
                        <Badge variant="outline" className={getStatusColor(shipment.status)}>
                          {getStatusText(shipment.status)}
                        </Badge>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thanh toán</span>
                        <Badge variant={shipment.payment_status === "paid" ? "default" : "outline"} className={shipment.payment_status === "paid" ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}>
                          {shipment.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </Badge>
                      </div>
                      
                      <Separator />
                      
                      {shipment.estimated_delivery && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dự kiến giao hàng</span>
                            <span className="font-medium">{formatDate(shipment.estimated_delivery)}</span>
                          </div>
                          <Separator />
                        </>
                      )}
                      
                      {shipment.total_price !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tổng phí</span>
                          <span className="font-medium">${shipment.total_price.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button className="w-full" disabled={shipment.payment_status === "paid"}>
                      {shipment.payment_status === "paid" ? "Đã Thanh Toán" : "Thanh Toán Ngay"}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Trợ Giúp</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Nếu bạn có bất kỳ câu hỏi nào về đơn hàng này, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
                      </p>
                      <Button variant="outline" className="w-full">Liên Hệ Hỗ Trợ</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tracking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Theo Dõi Vận Chuyển</CardTitle>
              </CardHeader>
              <CardContent>
                {shipment.tracking_events && shipment.tracking_events.length > 0 ? (
                  <div className="relative">
                    <div className="absolute top-0 bottom-0 left-[22px] w-[2px] bg-gray-200"></div>
                    <div className="space-y-6">
                      {shipment.tracking_events.map((event, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="relative z-10">
                            <div className={`w-6 h-6 rounded-full ${idx === 0 ? "bg-primary" : "bg-gray-300"} flex items-center justify-center`}>
                              {idx === 0 && <Check className="h-3 w-3 text-white" />}
                            </div>
                          </div>
                          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
                              <h3 className="font-medium">{event.status}</h3>
                              <span className="text-sm text-gray-500">{formatDate(event.timestamp)}</span>
                            </div>
                            <p className="text-gray-600">{event.description}</p>
                            <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Chưa có dữ liệu theo dõi</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      Thông tin theo dõi sẽ được cập nhật khi đơn hàng của bạn bắt đầu được vận chuyển.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tài Liệu & Hóa Đơn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2.5 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Vận Đơn</h3>
                        <p className="text-sm text-gray-500">PDF, 156KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Tải xuống</Button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2.5 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <line x1="10" y1="9" x2="8" y2="9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Hóa Đơn</h3>
                        <p className="text-sm text-gray-500">PDF, 203KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Tải xuống</Button>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2.5 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <path d="M16 18a2 2 0 0 1-2 2H6"></path>
                          <path d="M16 8v10"></path>
                          <path d="M12 20H6"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium">Biên Lai Giao Hàng</h3>
                        <p className="text-sm text-gray-500">PDF, 148KB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Tải xuống</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const Printer = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 6 2 18 2 18 9"></polyline>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
      <rect x="6" y="14" width="12" height="8"></rect>
    </svg>
  );
}