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
    const currentField = fields[index] || defaultItem;

    setTempItem({
      weight: currentField.weight || 0,
      length: currentField.length || 0,
      width: currentField.width || 0,
      height: currentField.height || 0,
      quantity: currentField.quantity || 1,
      description: currentField.description || "",
      value: currentField.value || 0,
      country_of_origin: currentField.country_of_origin || "VN",
      hs_code: currentField.hs_code || ""
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
    const newItem = createNewItem();
    append(newItem);
    startEditItem(fields.length -1);
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
                      <TableCell>
                        <Input
                          value={field.description || ""}
                          onChange={(e) => update(index, { ...field, description: e.target.value })}
                          className="max-w-[200px]"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Input
                            type="number"
                            value={field.length || 0}
                            onChange={(e) => update(index, { ...field, length: Number(e.target.value) })}
                            className="w-[60px]"
                          />
                          ×
                          <Input
                            type="number"
                            value={field.width || 0}
                            onChange={(e) => update(index, { ...field, width: Number(e.target.value) })}
                            className="w-[60px]"
                          />
                          ×
                          <Input
                            type="number"
                            value={field.height || 0}
                            onChange={(e) => update(index, { ...field, height: Number(e.target.value) })}
                            className="w-[60px]"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={field.weight || 0}
                          onChange={(e) => update(index, { ...field, weight: Number(e.target.value) })}
                          className="w-[80px] mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          value={field.quantity || 1}
                          onChange={(e) => update(index, { ...field, quantity: Number(e.target.value) })}
                          className="w-[80px] mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          value={field.country_of_origin || "VN"}
                          onChange={(e) => update(index, { ...field, country_of_origin: e.target.value })}
                          className="w-[80px] mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
          <Dialog open={editingItemIndex !== null} onOpenChange={() => cancelEditItem()}>
            <DialogContent className="max-w-3xl">
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
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}