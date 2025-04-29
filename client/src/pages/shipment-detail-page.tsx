import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { API_BASE_URL } from "@/config/api";
import { Loader2, ChevronLeft, Truck, Package, Calendar, Clock, MapPin, CreditCard, Check, AlertTriangle, X, ChevronRight } from "lucide-react";
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
}

interface DocumentsSectionProps {
  shipmentId: string | number;
}

interface Credential {
  id: number;
  name: string;
  url: string;
  file_size?: string;
  file_type?: string;
}

const DocumentsSection = ({ shipmentId }: DocumentsSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);

  useEffect(() => {
    const fetchCredentials = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/credentials?shipment_id=${shipmentId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Không thể tải danh sách chứng từ");
        }
        
        const data = await response.json();
        const credentialsList = data.credentials || [];
        setCredentials(credentialsList);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Đã xảy ra lỗi khi tải chứng từ'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCredentials();
  }, [shipmentId]);

  // Hàm lấy icon dựa trên loại file
  const getFileIcon = (fileType?: string) => {
    // Nếu không có file type, mặc định là file document
    if (!fileType) return (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
    
    // Dựa vào file type để trả về icon phù hợp
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15h6" />
          <path d="M9 11h6" />
        </svg>
      );
    } else if (type.includes('image') || type.includes('jpg') || type.includes('jpeg') || type.includes('png')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );
    } else if (type.includes('excel') || type.includes('spreadsheet') || type.includes('xlsx') || type.includes('xls')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M8 13h2" />
          <path d="M8 17h2" />
          <path d="M14 13h2" />
          <path d="M14 17h2" />
        </svg>
      );
    } else {
      // Mặc định cho các loại file khác
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      );
    }
  };

  // Xử lý tải xuống file
  const handleDownload = (url: string, documentName: string) => {
    // Kiểm tra URL
    if (!url) {
      alert('Không có URL tải xuống cho tài liệu này');
      return;
    }

    // Tạo một thẻ a ẩn để tải xuống
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = documentName || 'document'; // Tên file khi tải xuống
    anchor.target = '_blank'; // Mở trong tab mới nếu không thể tải trực tiếp
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Không thể tải danh sách chứng từ</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Tải lại
        </Button>
      </div>
    );
  }

  if (credentials.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Chưa có chứng từ nào</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Đơn hàng này hiện chưa có chứng từ nào. Các chứng từ sẽ được tự động cập nhật khi có sẵn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {credentials.map((credential) => (
        <div key={credential.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2.5 rounded-lg mr-3">
              {getFileIcon(credential.file_type)}
            </div>
            <div>
              <h3 className="font-medium">{credential.name}</h3>
              <p className="text-sm text-gray-500">
                {credential.file_type?.toUpperCase() || 'PDF'}{credential.file_size ? `, ${credential.file_size}` : ''}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleDownload(credential.url, credential.name)}
          >
            Tải xuống
          </Button>
        </div>
      ))}
    </div>
  );
};

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
              <Badge variant="outline" className={`ml-2 ${getStatusColor(shipment.status)}`}>
                <span className="flex items-center gap-1.5">
                  {getStatusIcon(shipment.status)}
                  {getStatusText(shipment.status)}
                </span>
              </Badge>
            </h1>
            <p className="text-gray-600 mt-1">Tạo lúc: {formatDate(shipment.created_at)}</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide mr-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Tải PDF
            </Button>
            <Button>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide mr-2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              In Đơn Hàng
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-lg">Người Gửi</h3>
                        </div>
                        <div className="ml-10">
                          <p className="font-medium text-gray-900">{shipment.sender_address.name}</p>
                          {shipment.sender_address.company && <p className="text-gray-700">{shipment.sender_address.company}</p>}
                          {shipment.sender_address.address1 && <p className="text-gray-700">{shipment.sender_address.address1}</p>}
                          {shipment.sender_address.address2 && <p className="text-gray-700">{shipment.sender_address.address2}</p>}
                          <p className="text-gray-700">{shipment.sender_address.city}, {shipment.sender_address.country}</p>
                          {shipment.sender_address.phone && (
                            <p className="text-gray-700 mt-2">
                              <span className="font-medium">SĐT:</span> {shipment.sender_address.phone}
                            </p>
                          )}
                          {shipment.sender_address.email && (
                            <p className="text-gray-700">
                              <span className="font-medium">Email:</span> {shipment.sender_address.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
                              <path d="M16.5 9.4 7.55 4.24" />
                              <polyline points="3.29 7 12 12 20.71 7" />
                              <line x1="12" x2="12" y1="22" y2="12" />
                              <circle cx="18.5" cy="15.5" r="2.5" />
                              <path d="M20.27 17.27 22 19" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-lg">Người Nhận</h3>
                        </div>
                        <div className="ml-10">
                          <p className="font-medium text-gray-900">{shipment.receiver_address.name}</p>
                          {shipment.receiver_address.company && <p className="text-gray-700">{shipment.receiver_address.company}</p>}
                          {shipment.receiver_address.address1 && <p className="text-gray-700">{shipment.receiver_address.address1}</p>}
                          {shipment.receiver_address.address2 && <p className="text-gray-700">{shipment.receiver_address.address2}</p>}
                          <p className="text-gray-700">{shipment.receiver_address.city}, {shipment.receiver_address.country}</p>
                          {shipment.receiver_address.phone && (
                            <p className="text-gray-700 mt-2">
                              <span className="font-medium">SĐT:</span> {shipment.receiver_address.phone}
                            </p>
                          )}
                          {shipment.receiver_address.email && (
                            <p className="text-gray-700">
                              <span className="font-medium">Email:</span> {shipment.receiver_address.email}
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
                <DocumentsSection shipmentId={shipmentId} />
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