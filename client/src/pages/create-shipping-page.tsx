import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config/api";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import ServiceQuoteForm from "@/components/shipping/service-quote-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShippingSummary from "@/components/shipping/shipping-summary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import AddressForm from "@/components/shipping/address-form";
import PackageForm from "@/components/shipping/package-form";

const createShipmentSchema = z.object({
  shipment: z.object({
    provider_id: z.number().default(1),
    provider_service_id: z.number().default(1),
    status: z.string().default("created"),
    sender_address_attributes: z.object({
      name: z.string().min(1, "Tên là bắt buộc"),
      company: z.string().optional(),
      country_id: z.number(),
      postal_code: z.string().min(1, "Mã bưu điện là bắt buộc"),
      city: z.string().min(1, "Thành phố là bắt buộc"),
      state: z.string().optional(),
      address1: z.string().min(1, "Địa chỉ là bắt buộc"),
      address2: z.string().optional(),
      address3: z.string().optional(),
      phone: z.string().min(1, "Số điện thoại là bắt buộc"),
      email: z.string().email("Email không hợp lệ"),
    }),
    receiver_address_attributes: z.object({
      name: z.string().min(1, "Tên là bắt buộc"),
      company: z.string().optional(),
      country_id: z.number(),
      postal_code: z.string().min(1, "Mã bưu điện là bắt buộc"),
      city: z.string().min(1, "Thành phố là bắt buộc"),
      state: z.string().optional(),
      address1: z.string().min(1, "Địa chỉ là bắt buộc"),
      address2: z.string().optional(),
      address3: z.string().optional(),
      phone: z.string().min(1, "Số điện thoại là bắt buộc"),
      email: z.string().email("Email không hợp lệ"),
    }),
    packages_attributes: z.array(
      z.object({
        carriage_value: z.number(),
        unit_of_weight: z.string(),
        currency: z.string(),
        type_shipping: z.string(),
        packaging: z.string(),
        items_attributes: z
          .array(
            z.object({
              weight: z.number(),
              length: z.number(),
              width: z.number(),
              height: z.number(),
              quantity: z.number(),
              description: z.string(),
              value: z.number(),
              country_of_origin: z.string(),
              hs_code: z.string().optional(),
            }),
          )
          .optional()
          .default([]),
      }),
    ),
  }),
});

type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;

export default function CreateShippingPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("address");
  const [shipmentId, setShipmentId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<CreateShipmentFormValues>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      shipment: {
        provider_id: 1,
        provider_service_id: 1,
        status: "created",
        sender_address_attributes: {
          name: user?.fullName || "Ebay",
          company: "Furniture Exports",
          country_id: 1,
          postal_code: "70000",
          city: "Ho Chi Minh City",
          state: "",
          address1: "789 Cach Mang Thang 8",
          address2: "District 3",
          address3: "",
          phone: "+84918765432",
          email: user?.email || "le@example.com",
        },
        receiver_address_attributes: {
          name: "Li Wei",
          company: "",
          country_id: 5,
          postal_code: "018956",
          city: "Singapore",
          state: "",
          address1: "10 Marina Boulevard",
          address2: "#25-01",
          address3: "",
          phone: "+6591234567",
          email: "li.wei@example.com",
        },
        packages_attributes: [
          {
            carriage_value: 1200,
            unit_of_weight: "kg_cm",
            currency: "USD",
            type_shipping: "items",
            packaging: "box",
            items_attributes: [],
          },
        ],
      },
    },
  });

  const createShipmentMutation = useMutation({
    mutationFn: async (data: CreateShipmentFormValues) => {
      const response = await fetch(`${API_BASE_URL}/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Lỗi khi tạo đơn hàng");
      }

      return response.json();
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!isLoading && !token) {
      navigate("/auth");
    }
  }, [isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  function onSubmit(data: CreateShipmentFormValues) {
    createShipmentMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Tạo Đơn Vận Chuyển</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">Điền thông tin chi tiết để tạo đơn vận chuyển mới và so sánh báo giá từ các đối tác vận chuyển hàng đầu Việt Nam và Quốc tế.</p>
          </div>

          <Card className="shadow-lg border-0 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
              <CardTitle className="text-2xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="text-lg font-bold">+</span>
                </div>
                Đơn Hàng Vận Chuyển Mới
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                    <TabsList className="grid w-full grid-cols-3 p-1 rounded-xl bg-gray-100">
                      <TabsTrigger 
                        value="info" 
                        className={`rounded-lg ${activeTab === "info" ? "bg-white shadow-md" : ""} transition-all`}
                      >
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full ${activeTab === "info" ? "bg-primary text-white" : "bg-gray-200"}`}>1</span>
                          <span>Thông Tin Đơn Hàng</span>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="service"
                        className={`rounded-lg ${activeTab === "service" ? "bg-white shadow-md" : ""} transition-all`}
                      >
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full ${activeTab === "service" ? "bg-primary text-white" : "bg-gray-200"}`}>2</span>
                          <span>Chọn Dịch Vụ</span>
                        </div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="review"
                        className={`rounded-lg ${activeTab === "review" ? "bg-white shadow-md" : ""} transition-all`}
                      >
                        <div className="flex flex-col items-center gap-1.5 py-1">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full ${activeTab === "review" ? "bg-primary text-white" : "bg-gray-200"}`}>3</span>
                          <span>Xác Nhận</span>
                        </div>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="info" className="mt-6">
                      <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                          <AddressForm
                            form={form}
                            type="sender"
                            title="Thông Tin Người Gửi"
                          />
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                          <AddressForm
                            form={form}
                            type="receiver"
                            title="Thông Tin Người Nhận"
                          />
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                          <PackageForm form={form} />
                        </div>
                        <div className="flex justify-end mt-6">
                          <Button
                            type="button"
                            onClick={() => setActiveTab("service")}
                            className="px-6 py-5 rounded-lg gap-2 shadow-md hover:shadow-lg transition-all"
                          >
                            Tiếp Theo
                            <span className="inline-block ml-1">→</span>
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                      <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                          <ServiceQuoteForm
                            key={`quote-form-${shipmentId}`}
                            shipmentId={shipmentId}
                            onQuoteSelect={(quote) => {
                              form.setValue(
                                "shipment.provider_service_id",
                                quote.id,
                              );
                              toast({
                                title: "Đã chọn dịch vụ",
                                description: `Đã chọn ${quote.provider_name} - ${quote.service_name}`,
                              });
                              setActiveTab("review");
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveTab("info")}
                            className="px-6 py-5 rounded-lg gap-2"
                          >
                            <span className="inline-block mr-1">←</span>
                            Quay Lại
                          </Button>
                          <Button
                            type="button"
                            disabled={createShipmentMutation.isPending}
                            className="px-6 py-5 rounded-lg gap-2 shadow-md hover:shadow-lg transition-all"
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `${API_BASE_URL}/shipments`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `${localStorage.getItem("token")}`,
                                    },
                                    body: JSON.stringify(form.getValues()),
                                  },
                                );

                                if (!response.ok) {
                                  throw new Error("Không thể tạo đơn hàng");
                                }

                                const data = await response.json();
                                if (data) {
                                  setShipmentId(data.id);
                                  toast({
                                    title: "Đã lưu thông tin",
                                    description: "Đang tìm báo giá từ các nhà vận chuyển",
                                  });
                                  setActiveTab("service");
                                }
                              } catch (error) {
                                toast({
                                  title: "Lỗi",
                                  description: "Không thể tạo đơn hàng, vui lòng thử lại",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            {createShipmentMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                Tiếp Theo
                                <span className="inline-block ml-1">→</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
                      <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                          <div className="mb-4 flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                              <span className="text-xl font-bold">$</span>
                            </div>
                            <h3 className="text-xl font-semibold">Chọn Dịch Vụ Vận Chuyển</h3>
                          </div>
                          
                          {shipmentId && activeTab === "service" ? (
                            <div className="py-3">
                              <ServiceQuoteForm
                                key={`quote-form-${shipmentId}`}
                                shipmentId={shipmentId}
                                onQuoteSelect={(quote) => {
                                  form.setValue(
                                    "shipment.provider_service_id",
                                    quote.id,
                                  );
                                  toast({
                                    title: "Đã chọn dịch vụ",
                                    description: `Đã chọn ${quote.provider_name} - ${quote.service_name}`,
                                  });
                                  setActiveTab("review");
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                              <p className="text-lg">Đang tải báo giá từ các nhà vận chuyển...</p>
                              <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveTab("package")}
                            className="px-6 py-5 rounded-lg gap-2"
                          >
                            <span className="inline-block mr-1">←</span>
                            Quay Lại
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              if (form.getValues().shipment.provider_service_id) {
                                setActiveTab("review");
                              } else {
                                toast({
                                  title: "Chưa chọn dịch vụ",
                                  description: "Vui lòng chọn một dịch vụ vận chuyển trước khi tiếp tục",
                                  variant: "destructive",
                                });
                              }
                            }}
                            className="px-6 py-5 rounded-lg gap-2 shadow-md hover:shadow-lg transition-all"
                          >
                            Tiếp Theo
                            <span className="inline-block ml-1">→</span>
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="review" className="mt-6">
                      <div className="space-y-6">
                        {shipmentId && (
                          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="mb-4 flex items-center">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                                <span className="text-xl font-bold">✓</span>
                              </div>
                              <h3 className="text-xl font-semibold">Chi Tiết Đơn Hàng</h3>
                            </div>
                            <div className="space-y-6">
                              <ShippingSummary formData={form.getValues()} />
                            </div>
                          </div>
                        )}
                        <div className="flex justify-between mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveTab("service")}
                            className="px-6 py-5 rounded-lg gap-2"
                          >
                            <span className="inline-block mr-1">←</span>
                            Quay Lại
                          </Button>
                          <Button
                            type="button"
                            disabled={createShipmentMutation.isPending}
                            className="px-6 py-5 rounded-lg bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all"
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `${API_BASE_URL}/shipments/${shipmentId}/complete`,
                                  {
                                    method: "POST",
                                    headers: {
                                      Authorization: `${localStorage.getItem("token")}`,
                                    },
                                  },
                                );

                                if (!response.ok) {
                                  throw new Error(
                                    "Không thể hoàn thành đơn hàng",
                                  );
                                }

                                toast({
                                  title: "Thành công",
                                  description:
                                    "Đơn hàng đã được tạo thành công",
                                });

                                navigate("/shipments");
                              } catch (error) {
                                toast({
                                  title: "Lỗi",
                                  description: "Không thể hoàn thành đơn hàng",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            {createShipmentMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                Hoàn Thành Đơn Hàng
                                <span className="inline-block ml-1">✓</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
