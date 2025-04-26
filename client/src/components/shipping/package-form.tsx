
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
    setTempItem({
      ...fields[index],
      weight: fields[index].weight || 0,
      length: fields[index].length || 0,
      width: fields[index].width || 0,
      height: fields[index].height || 0,
      quantity: fields[index].quantity || 1,
      description: fields[index].description || "",
      value: fields[index].value || 0,
      country_of_origin: fields[index].country_of_origin || "VN",
      hs_code: fields[index].hs_code || ""
    });
    setEditingItemIndex(index);
  };
  
  // Save item changes
  const saveItemChanges = () => {
    if (editingItemIndex !== null && tempItem) {
      update(editingItemIndex, tempItem);
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
    append(createNewItem());
    startEditItem(fields.length);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Thông Tin Gói Hàng</h3>
        
        {/* Package-level attributes */}
        <div className="space-y-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="shipment.packages_attributes.0.carriage_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá Trị Vận Chuyển</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
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
                  <FormLabel>Tiền Tệ</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn tiền tệ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="VND">VND</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="shipment.packages_attributes.0.unit_of_weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đơn Vị</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đơn vị" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="kg_cm">kg/cm</SelectItem>
                      <SelectItem value="lb_in">lb/in</SelectItem>
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
                  <FormLabel>Loại Vận Chuyển</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="items">Hàng Hoá</SelectItem>
                      <SelectItem value="documents">Tài Liệu</SelectItem>
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
                  <FormLabel>Đóng Gói</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại đóng gói" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="box">Hộp</SelectItem>
                      <SelectItem value="envelope">Phong Bì</SelectItem>
                      <SelectItem value="pallet">Pallet</SelectItem>
                      <SelectItem value="tube">Ống</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Separator className="my-6" />
          
        {/* Items Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium">Danh Sách Hàng Hoá</h4>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addNewItem}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Thêm Hàng Hoá
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mô Tả</TableHead>
                  <TableHead className="text-center">Kích Thước (D×R×C)</TableHead>
                  <TableHead className="text-center">Cân Nặng</TableHead>
                  <TableHead className="text-center">Số Lượng</TableHead>
                  <TableHead className="text-center">Giá Trị</TableHead>
                  <TableHead className="text-center">Xuất Xứ</TableHead>
                  <TableHead className="text-center">Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Chưa có hàng hoá. Nhấn "Thêm Hàng Hoá" để bắt đầu.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>{field.description || "—"}</TableCell>
                      <TableCell className="text-center">
                        {field.length || 0}×{field.width || 0}×{field.height || 0} cm
                      </TableCell>
                      <TableCell className="text-center">{field.weight || 0} kg</TableCell>
                      <TableCell className="text-center">{field.quantity || 1}</TableCell>
                      <TableCell className="text-center">{field.value || 0}</TableCell>
                      <TableCell className="text-center">{field.country_of_origin || "VN"}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditItem(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Edit Item Dialog */}
        {editingItemIndex !== null && tempItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">
                    {editingItemIndex < fields.length ? "Sửa Hàng Hoá" : "Thêm Hàng Hoá"}
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={cancelEditItem}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="form-item">
                      <label className="text-sm font-medium">Mô Tả Hàng Hoá</label>
                      <Input 
                        value={tempItem.description || ""} 
                        onChange={(e) => handleTempItemChange("description", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="form-item">
                      <label className="text-sm font-medium">Dài (cm)</label>
                      <Input 
                        type="number"
                        min="0"
                        value={tempItem.length || ""}
                        onChange={(e) => handleTempItemChange("length", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Rộng (cm)</label>
                      <Input 
                        type="number"
                        min="0"
                        value={tempItem.width || ""}
                        onChange={(e) => handleTempItemChange("width", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Cao (cm)</label>
                      <Input 
                        type="number"
                        min="0"
                        value={tempItem.height || ""}
                        onChange={(e) => handleTempItemChange("height", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Cân Nặng (kg)</label>
                      <Input 
                        type="number"
                        min="0"
                        step="0.1"
                        value={tempItem.weight || ""}
                        onChange={(e) => handleTempItemChange("weight", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="form-item">
                      <label className="text-sm font-medium">Số Lượng</label>
                      <Input 
                        type="number"
                        min="1"
                        value={tempItem.quantity || ""}
                        onChange={(e) => handleTempItemChange("quantity", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Giá Trị</label>
                      <Input 
                        type="number"
                        min="0"
                        value={tempItem.value || ""}
                        onChange={(e) => handleTempItemChange("value", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Xuất Xứ</label>
                      <Input 
                        placeholder="VN"
                        value={tempItem.country_of_origin || ""}
                        onChange={(e) => handleTempItemChange("country_of_origin", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="form-item">
                      <label className="text-sm font-medium">Mã HS (Không bắt buộc)</label>
                      <Input 
                        placeholder="Mã HS Code"
                        value={tempItem.hs_code || ""}
                        onChange={(e) => handleTempItemChange("hs_code", e.target.value)}
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
