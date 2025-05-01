import React, { useState } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog"; // Import Dialog and DialogContent


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

  // Use field array to handle dynamic item list
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "shipment.packages_attributes.0.items_attributes"
  });

  // Function to create a new blank item
  const createNewItem = (): ShipmentItem => {
    return {
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      quantity: 1,
      description: "",
      value: 0,
      country_of_origin: "VN",
      hs_code: ""
    };
  };

  // Start editing an item
  const startEditItem = (index: number) => {
    const defaultItem = createNewItem();
    const currentItem = fields[index] as unknown as ShipmentItem || defaultItem;

    setTempItem({
      weight: currentItem.weight || 0,
      length: currentItem.length || 0,
      width: currentItem.width || 0,
      height: currentItem.height || 0,
      quantity: currentItem.quantity || 1,
      description: currentItem.description || "",
      value: currentItem.value || 0,
      country_of_origin: currentItem.country_of_origin || "VN",
      hs_code: currentItem.hs_code || ""
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
        [field]: value
      });
    }
  };

  // Add a new item
  const addNewItem = () => {
    const newItem = createNewItem();
    append(newItem as any);
    startEditItem(fields.length);
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path>
                      <path d="M12 18V6"></path>
                    </svg>
                    Giá Trị Hàng Hoá
                  </FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} className="border-gray-300 focus:border-primary text-base px-4 py-6" />
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
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
            <h4 className="text-base font-medium mb-4 text-gray-700">Thông tin vận chuyển</h4>
            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.unit_of_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5 text-base">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
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
                        <SelectItem value="kg_cm">kg/cm - Kilogram/Centimeter</SelectItem>
                        <SelectItem value="lb_in">lb/in - Pound/Inch</SelectItem>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
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
                        <SelectItem value="items">Hàng Hoá Thông Thường</SelectItem>
                        <SelectItem value="documents">Tài Liệu/Giấy Tờ</SelectItem>
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
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
                        <SelectItem value="your_packaging">Tự đóng gói</SelectItem>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <TableHead className="py-3 font-semibold">Mô Tả Sản Phẩm</TableHead>
                  <TableHead className="text-center font-semibold">Kích Thước (D×R×C)</TableHead>
                  <TableHead className="text-center font-semibold">Cân Nặng</TableHead>
                  <TableHead className="text-center font-semibold">Số Lượng</TableHead>
                  <TableHead className="text-center font-semibold">Xuất Xứ</TableHead>
                  <TableHead className="text-center font-semibold">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground bg-gray-50/30">
                      <div className="flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-3">
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
                    return (
                      <TableRow key={field.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Input
                            value={item.description || ""}
                            onChange={(e) => update(index, { ...field, description: e.target.value } as any)}
                            className="border-gray-300 focus:border-primary"
                            placeholder="Nhập mô tả"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center gap-1 justify-center">
                            <Input
                              type="number"
                              value={item.length || 0}
                              onChange={(e) => update(index, { ...field, length: Number(e.target.value) } as any)}
                              className="w-[60px] border-gray-300 focus:border-primary"
                              placeholder="D"
                              min={0}
                            />
                            ×
                            <Input
                              type="number"
                              value={item.width || 0}
                              onChange={(e) => update(index, { ...field, width: Number(e.target.value) } as any)}
                              className="w-[60px] border-gray-300 focus:border-primary"
                              placeholder="R"
                              min={0}
                            />
                            ×
                            <Input
                              type="number"
                              value={item.height || 0}
                              onChange={(e) => update(index, { ...field, height: Number(e.target.value) } as any)}
                              className="w-[60px] border-gray-300 focus:border-primary"
                              placeholder="C"
                              min={0}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={item.weight || 0}
                            onChange={(e) => update(index, { ...field, weight: Number(e.target.value) } as any)}
                            className="w-[80px] mx-auto border-gray-300 focus:border-primary"
                            placeholder="Kg"
                            min={0}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Input
                            type="number"
                            value={item.quantity || 1}
                            onChange={(e) => update(index, { ...field, quantity: Number(e.target.value) } as any)}
                            className="w-[80px] mx-auto border-gray-300 focus:border-primary"
                            min={1}
                            placeholder="SL"
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Select 
                            value={item.country_of_origin || "VN"}
                            onValueChange={(value) => update(index, { ...field, country_of_origin: value } as any)}
                          >
                            <SelectTrigger className="w-[80px] mx-auto border-gray-300 focus:border-primary">
                              <SelectValue placeholder="Quốc gia" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VN">Việt Nam</SelectItem>
                              <SelectItem value="CN">Trung Quốc</SelectItem>
                              <SelectItem value="JP">Nhật Bản</SelectItem>
                              <SelectItem value="KR">Hàn Quốc</SelectItem>
                              <SelectItem value="US">Hoa Kỳ</SelectItem>
                              <SelectItem value="TH">Thái Lan</SelectItem>
                            </SelectContent>
                          </Select>
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
          <div className="mt-4 text-right">
            <p className="text-sm text-gray-500">
              Tổng số sản phẩm: <span className="font-medium text-primary">{fields.length}</span>
            </p>
          </div>
        )}
          
        {/* Edit Item Dialog */}
        {editingItemIndex !== null && tempItem && (
          <Dialog open={editingItemIndex !== null} onOpenChange={() => cancelEditItem()}>
            <DialogContent className="max-w-3xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">
                      {editingItemIndex < fields.length ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={cancelEditItem}
                    className="hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-5">
                  <div className="bg-primary/5 p-4 rounded-lg mb-2">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="form-item">
                        <label className="flex items-center gap-1.5 text-base font-medium mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M5 3a2 2 0 0 0-2 2"></path>
                            <path d="M19 3a2 2 0 0 1 2 2"></path>
                            <path d="M21 19a2 2 0 0 1-2 2"></path>
                            <path d="M5 21a2 2 0 0 1-2-2"></path>
                            <path d="M9 3h6"></path>
                            <path d="M9 21h6"></path>
                            <path d="M3 9v6"></path>
                            <path d="M21 9v6"></path>
                            <rect width="10" height="10" x="7" y="7" rx="1"></rect>
                          </svg>
                          Mô Tả Chi Tiết Sản Phẩm
                        </label>
                        <Input 
                          value={tempItem.description || ""} 
                          onChange={(e) => handleTempItemChange("description", e.target.value)}
                          className="border-gray-300 focus:border-primary py-6"
                          placeholder="Nhập tên và mô tả sản phẩm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h5 className="font-medium mb-3 text-gray-700">Kích Thước & Trọng Lượng</h5>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="form-item">
                        <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M3 3v18h18"></path>
                            <path d="m21 3-9 9"></path>
                          </svg>
                          Dài (cm)
                        </label>
                        <Input 
                          type="number"
                          min="0"
                          value={tempItem.length || ""}
                          onChange={(e) => handleTempItemChange("length", Number(e.target.value))}
                          className="border-gray-300 focus:border-primary"
                          placeholder="0.0"
                        />
                      </div>
                      <div className="form-item">
                        <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M3 3v18h18"></path>
                            <path d="M15 9H9v6"></path>
                          </svg>
                          Rộng (cm)
                        </label>
                        <Input 
                          type="number"
                          min="0"
                          value={tempItem.width || ""}
                          onChange={(e) => handleTempItemChange("width", Number(e.target.value))}
                          className="border-gray-300 focus:border-primary"
                          placeholder="0.0"
                        />
                      </div>
                      <div className="form-item">
                        <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M21 3v18"></path>
                            <path d="M7 19h10"></path>
                            <path d="M10 7v4"></path>
                            <path d="M14 7v4"></path>
                            <path d="M17 11h-4"></path>
                            <path d="M8 15h8"></path>
                          </svg>
                          Cao (cm)
                        </label>
                        <Input 
                          type="number"
                          min="0"
                          value={tempItem.height || ""}
                          onChange={(e) => handleTempItemChange("height", Number(e.target.value))}
                          className="border-gray-300 focus:border-primary"
                          placeholder="0.0"
                        />
                      </div>
                      <div className="form-item">
                        <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M12 3v3"></path>
                            <path d="M18.5 14.4c-.15 0-.26.07-.35.2l-.54.76a.5.5 0 0 1-.46.26H7.9a.6.6 0 0 1-.49-.24l-.7-1.1a.41.41 0 0 0-.35-.2c-.31 0-.65.35-.45.71l2.55 4.88a.5.5 0 0 0 .45.28h7.13c.19 0 .36-.1.45-.28l2.55-4.88c.2-.36-.14-.71-.45-.71Z"></path>
                            <path d="M10 13h4"></path>
                            <path d="M13 10V7"></path>
                            <path d="M12 7H9.62a1 1 0 0 0-.97.68l-.74 2.68A1 1 0 0 0 8.88 12h6.62"></path>
                          </svg>
                          Cân Nặng (kg)
                        </label>
                        <Input 
                          type="number"
                          min="0"
                          step="0.1"
                          value={tempItem.weight || ""}
                          onChange={(e) => handleTempItemChange("weight", Number(e.target.value))}
                          className="border-gray-300 focus:border-primary"
                          placeholder="0.0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h5 className="font-medium mb-3 text-gray-700">Thông Tin Bổ Sung</h5>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="form-item">
                        <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <path d="M6 10h12"></path>
                            <path d="M6 6h7"></path>
                            <path d="M6 14h7"></path>
                            <path d="M14 18h1"></path>
                            <rect width="20" height="16" x="2" y="2" rx="2"></rect>
                          </svg>
                          Số Lượng
                        </label>
                        <Input 
                          type="number"
                          min="1"
                          value={tempItem.quantity || ""}
                          onChange={(e) => handleTempItemChange("quantity", Number(e.target.value))}
                          className="border-gray-300 focus:border-primary"
                          placeholder="1"
                        />
                      </div>
                      <div className="form-item">
                        <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M8 12s1.5 2 4 2 4-2 4-2"></path>
                            <path d="M9 9h.01"></path>
                            <path d="M15 9h.01"></path>
                          </svg>
                          Xuất Xứ
                        </label>
                        <Select 
                          value={tempItem.country_of_origin || "VN"}
                          onValueChange={(value) => handleTempItemChange("country_of_origin", value)}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-primary">
                            <SelectValue placeholder="Quốc gia" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="VN">Việt Nam</SelectItem>
                            <SelectItem value="CN">Trung Quốc</SelectItem>
                            <SelectItem value="JP">Nhật Bản</SelectItem>
                            <SelectItem value="KR">Hàn Quốc</SelectItem>
                            <SelectItem value="US">Hoa Kỳ</SelectItem>
                            <SelectItem value="TH">Thái Lan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="form-item">
                      <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                        Mã HS (Không bắt buộc)
                      </label>
                      <Input 
                        placeholder="Mã HS Code"
                        value={tempItem.hs_code || ""}
                        onChange={(e) => handleTempItemChange("hs_code", e.target.value)}
                        className="border-gray-300 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditItem}
                    >
                      Huỷ Bỏ
                    </Button>
                    <Button
                      type="button"
                      onClick={saveItemChanges}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" /> Lưu Lại
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}