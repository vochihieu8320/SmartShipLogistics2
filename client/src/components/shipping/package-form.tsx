import React, { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Import Dialog and DialogContent
import { API_BASE_URL } from "../../config/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ServiceQuoteForm from "./service-quote-form";

// Define the interface for an item
interface ShipmentItem {
  weight: number;
  length: number;
  width: number;
  height: number;
  quantity: number;
  description: string;
  value: number;
  country_of_origin: string;
  hs_code?: string;
}

interface PackageFormProps {
  form: UseFormReturn<any>;
}

export default function PackageForm({ form }: PackageFormProps) {
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [tempItem, setTempItem] = useState<ShipmentItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shipmentId, setShipmentId] = useState<number | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const { toast } = useToast();

  // Use field array to handle dynamic item list
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "shipment.packages_attributes.0.items_attributes",
  });

  // Function to create a new blank item
  const createNewItem = (): ShipmentItem => {
    return {
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      quantity: 1, // Fixed quantity that cannot be changed
      description: "",
      value: 0,
      country_of_origin: "VN",
      hs_code: "",
    };
  };

  // Start editing an item
  const startEditItem = (index: number) => {
    const defaultItem = createNewItem();
    const currentItem =
      (fields[index] as unknown as ShipmentItem) || defaultItem;

    setTempItem({
      weight: currentItem.weight || 0,
      length: currentItem.length || 0,
      width: currentItem.width || 0,
      height: currentItem.height || 0,
      quantity: currentItem.quantity || 1,
      description: currentItem.description || "",
      value: currentItem.value || 0,
      country_of_origin: currentItem.country_of_origin || "VN",
      hs_code: currentItem.hs_code || "",
    });
    setEditingItemIndex(index);
  };

  // Save item changes
  const saveItemChanges = () => {
    if (editingItemIndex !== null && tempItem) {
      update(editingItemIndex, tempItem as any);
      setEditingItemIndex(null);
      setTempItem(null);
    }
  };

  // Cancel editing
  const cancelEditItem = () => {
    setEditingItemIndex(null);
    setTempItem(null);
  };

  // Handle temp item field changes
  const handleTempItemChange = (field: keyof ShipmentItem, value: any) => {
    if (tempItem) {
      setTempItem({
        ...tempItem,
        [field]: value,
      });
    }
  };

  // Add a new item
  const addNewItem = () => {
    const newItem = createNewItem();
    append(newItem as any);
    // Use setTimeout to allow the DOM to update before focusing
    setTimeout(() => {
      const inputs = document.querySelectorAll(
        'input[placeholder="Nhập mô tả"]',
      );
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }, 0);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <path d="M3.27 6.96L12 12.01l8.73-5.05"></path>
              <path d="M12 22.08V12"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold">Thông Tin Hàng Hoá</h3>
        </div>

        {/* Package-level attributes */}
        <div className="space-y-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="shipment.packages_attributes.0.carriage_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-base">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                      <path d="M12 18V6"></path>
                    </svg>
                    Giá Trị Hàng Hoá
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      className="border-gray-300 focus:border-primary text-base px-4 py-6"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shipment.packages_attributes.0.currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5 text-base">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-500"
                    >
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    Đơn Vị Tiền Tệ
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-primary text-base px-4 py-6">
                        <SelectValue placeholder="Chọn đơn vị tiền tệ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VND">VND - Việt Nam Đồng</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h4 className="text-base font-medium mb-4 text-gray-700">
              Thông tin vận chuyển
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.unit_of_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-base">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M6 16.5l6-10 6 10"></path>
                      </svg>
                      Đơn Vị Đo Lường
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-primary">
                          <SelectValue placeholder="Chọn đơn vị đo lường" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kg_cm">
                          kg/cm - Kilogram/Centimeter
                        </SelectItem>
                        <SelectItem value="lb_in">
                          lb/in - Pound/Inch
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.type_shipping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-base">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      </svg>
                      Loại Vận Chuyển
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-primary">
                          <SelectValue placeholder="Chọn loại vận chuyển" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="items">
                          Hàng Hoá Thông Thường
                        </SelectItem>
                        <SelectItem value="documents">
                          Tài Liệu/Giấy Tờ
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.packaging"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-base">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-500"
                      >
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <path d="M3.27 6.96L12 12.01l8.73-5.05"></path>
                        <path d="M12 22.08V12"></path>
                      </svg>
                      Phương Thức Đóng Gói
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-primary">
                          <SelectValue placeholder="Chọn loại đóng gói" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="box">Hộp Carton</SelectItem>
                        <SelectItem value="your_packaging">
                          Tự đóng gói
                        </SelectItem>
                        <SelectItem value="pak">Gói</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Items Table */}
        <div>
          <div className="bg-primary/5 p-4 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="8" height="8" x="3" y="3" rx="1"></rect>
                  <rect width="8" height="8" x="13" y="3" rx="1"></rect>
                  <rect width="8" height="8" x="3" y="13" rx="1"></rect>
                  <rect width="8" height="8" x="13" y="13" rx="1"></rect>
                </svg>
              </div>
              <h4 className="text-base font-semibold">Chi Tiết Hàng Hoá</h4>
            </div>
            <Button
              type="button"
              onClick={addNewItem}
              className="flex items-center gap-1 rounded-lg border-primary/20 border-2 bg-white text-primary hover:bg-primary hover:text-white"
            >
              <Plus className="h-4 w-4" /> Thêm Sản Phẩm
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="py-3 font-semibold">STT</TableHead>
                  <TableHead className="text-center py-3 font-semibold">
                    Kích Thước (D×R×C)
                  </TableHead>
                  <TableHead className="text-center py-3 font-semibold">
                    Cân Nặng
                  </TableHead>
                  <TableHead className="text-center py-3 font-semibold">
                    Thể Tích
                  </TableHead>
                  <TableHead className="text-center py-3 font-semibold">
                    Thao Tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-muted-foreground bg-gray-50/30"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-300 mb-3"
                        >
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          <path d="M3.27 6.96L12 12.01l8.73-5.05"></path>
                          <path d="M12 22.08V12"></path>
                        </svg>
                        <p>Chưa có sản phẩm nào được thêm vào</p>
                        <Button
                          type="button"
                          onClick={addNewItem}
                          className="flex items-center gap-1 mt-3"
                          size="sm"
                        >
                          <Plus className="h-4 w-4" /> Thêm Sản Phẩm Ngay
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field, index) => {
                    const item = field as unknown as ShipmentItem;
                    const volumetricWeight =
                      ((item.length || 0) *
                        (item.width || 0) *
                        (item.height || 0)) /
                      5000;
                    return (
                      <TableRow key={field.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-center">
                          {index + 1}/{fields.length}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Input
                              type="number"
                              defaultValue={item.length || 0}
                              onBlur={(e) =>
                                update(index, {
                                  ...field,
                                  length: Number(e.target.value),
                                } as any)
                              }
                              className="w-[60px] border-gray-300 focus:border-primary"
                              placeholder="D"
                              min={0}
                            />
                            ×
                            <Input
                              type="number"
                              defaultValue={item.width || 0}
                              onBlur={(e) =>
                                update(index, {
                                  ...field,
                                  width: Number(e.target.value),
                                } as any)
                              }
                              className="w-[60px] border-gray-300 focus:border-primary"
                              placeholder="R"
                              min={0}
                            />
                            ×
                            <Input
                              type="number"
                              defaultValue={item.height || 0}
                              onBlur={(e) =>
                                update(index, {
                                  ...field,
                                  height: Number(e.target.value),
                                } as any)
                              }
                              className="w-[60px] border-gray-300 focus:border-primary"
                              placeholder="C"
                              min={0}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            defaultValue={item.weight || 0}
                            onBlur={(e) =>
                              update(index, {
                                ...field,
                                weight: Number(e.target.value),
                              } as any)
                            }
                            className="w-[80px] mx-auto border-gray-300 focus:border-primary"
                            min={0}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-sm font-medium">
                            {volumetricWeight.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {fields.length > 0 && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Tổng số sản phẩm:{" "}
                <span className="font-medium text-primary">
                  {fields.reduce(
                    (sum, field) => sum + ((field as any).quantity || 1),
                    0,
                  )}{" "}
                  cái
                </span>
              </p>
              <p className="text-sm text-gray-500">
                Tổng khối lượng:{" "}
                <span className="font-medium text-primary">
                  {fields
                    .reduce((sum, field) => {
                      const item = field as any;
                      return sum + item.weight;
                    }, 0)
                    .toFixed(2)}{" "}
                  kg
                </span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center">
                <Button
                  type="button"
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      // First create shipment
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
                        throw new Error("Không thể tạo đơn hàng");
                      }

                      const result = await response.json();
                      if (result?.shipment?.id) {
                        setShipmentId(result.shipment.id);
                        // Set shipmentId in form data
                        form.setValue("shipment.id", result.shipment.id);
                        
                        // Pass quotes directly to ServiceQuoteForm
                        setQuotes(result.quote || []);
                      } else {
                        throw new Error("Invalid response from server");
                      }
                    } catch (error) {
                      console.log("error", error);
                      toast({
                        title: "Lỗi",
                        description: "Không thể tạo đơn hàng. Vui lòng thử lại",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className="w-full md:w-auto px-6 py-2 bg-primary text-white hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    "Kiểm Tra Giá"
                  )}
                </Button>
              </div>

              {shipmentId && quotes && (
                <div className="border-t pt-6">
                  <ServiceQuoteForm
                    key={`quote-form-${shipmentId}`}
                    shipmentId={shipmentId}
                    quotes={quotes}
                    onQuoteSelect={(quote) => {
                      form.setValue("shipment.provider_service_id", quote.id);
                      toast({
                        title: "Đã chọn dịch vụ",
                        description: `Đã chọn ${quote.provider_name} - ${quote.service_name}`,
                      });
                      window.location.href = `/shipping/create?tab=review&shipmentId=${shipmentId}`;
                    }}
                    gridColumns={3}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Item Dialog */}
        {/* Removed the edit item dialog as per the user request */}
      </CardContent>
    </Card>
  );
}
