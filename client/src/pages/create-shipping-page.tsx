import { useState } from "react";
import { API_BASE_URL } from "@/config/api";
import { useLocation, Link } from "wouter";
import ServiceQuoteForm from "@/components/shipping/service-quote-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [activeTab, setActiveTab] = useState("address");
  const [shipmentId, setShipmentId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

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

  function onSubmit(data: CreateShipmentFormValues) {
    createShipmentMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">SmartShip Pro</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/">
              <a className="font-medium text-gray-600 hover:text-primary">
                Home
              </a>
            </Link>
            <Link href="/shipping">
              <a className="font-medium text-primary">Shipping</a>
            </Link>
            <Link href="/track">
              <a className="font-medium text-gray-600 hover:text-primary">
                Track
              </a>
            </Link>
            <Link href="/shipments">
              <a className="font-medium text-gray-600 hover:text-primary">
                Shipments
              </a>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden md:inline-block">
                  Welcome, {user.fullName}
                </span>
                <Link href="/admin">
                  <Button variant="outline" className="hidden md:inline-flex">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="hidden md:inline-flex">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth?register=true">
                  <Button className="hidden md:inline-flex">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Tạo Đơn Hàng</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tạo Đơn Hàng Mới</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="address">
                        Thông Tin Địa Chỉ
                      </TabsTrigger>
                      <TabsTrigger value="package">
                        Thông Tin Hàng Hóa
                      </TabsTrigger>
                      <TabsTrigger value="service">Chọn Dịch Vụ</TabsTrigger>
                      <TabsTrigger value="review">Xác Nhận</TabsTrigger>
                    </TabsList>

                    <TabsContent value="address">
                      <div className="space-y-6">
                        <AddressForm
                          form={form}
                          type="sender"
                          title="Thông Tin Người Gửi"
                        />
                        <AddressForm
                          form={form}
                          type="receiver"
                          title="Thông Tin Người Nhận"
                        />
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={() => setActiveTab("package")}
                          >
                            Tiếp Theo
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="package">
                      <div className="space-y-6">
                        <PackageForm form={form} />
                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveTab("address")}
                          >
                            Quay Lại
                          </Button>
                          <Button
                            type="button"
                            disabled={createShipmentMutation.isPending}
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  `${API_BASE_URL}/shipments`,
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    },
                                    body: JSON.stringify(form.getValues()),
                                  },
                                );

                                if (!response.ok) {
                                  throw new Error("Failed to create shipment");
                                }

                                const data = await response.json();
                                if (data.success && data.shipment?.id) {
                                  setShipmentId(data.shipment.id);
                                  createShipmentMutation.setData(data);
                                  setActiveTab("service");
                                }
                              } catch (error) {
                                toast({
                                  title: "Lỗi",
                                  description:
                                    "Không thể tạo đơn hàng. Vui lòng thử lại.",
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
                              "Tiếp Theo"
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="service">
                      <div className="space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle>Chọn Dịch Vụ Vận Chuyển</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {shipmentId ? (
                              <ServiceQuoteForm
                                shipmentId={shipmentId}
                                onQuoteSelect={(quote) => {
                                  form.setValue(
                                    "shipment.provider_service_id",
                                    quote.id,
                                  );
                                  setActiveTab("review");
                                }}
                              />
                            ) : (
                              <div className="text-center py-4">
                                <p>Vui lòng hoàn thành các bước trước</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveTab("package")}
                          >
                            Quay Lại
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setActiveTab("review")}
                          >
                            Tiếp Theo
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="review">
                      <div className="space-y-6">
                        {/* Review summary will be implemented here */}
                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setActiveTab("package")}
                          >
                            Quay Lại
                          </Button>
                          <Button
                            type="submit"
                            disabled={createShipmentMutation.isPending}
                          >
                            {createShipmentMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang Xử Lý...
                              </>
                            ) : (
                              "Tạo Đơn Hàng"
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
