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
  id?: string;
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
      country_of_origin: "",
      hs_code: ""
    };
  };
  
  // Start editing an item
  const startEditItem = (index: number) => {
    const item = fields[index] as unknown as ShipmentItem;
    setTempItem({
      ...item,
      // Ensure all required fields are present
      weight: item.weight || 0,
      length: item.length || 0,
      width: item.width || 0,
      height: item.height || 0,
      quantity: item.quantity || 1,
      description: item.description || "",
      value: item.value || 0,
      country_of_origin: item.country_of_origin || "",
      hs_code: item.hs_code || ""
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
  
  // Calculate volume weight (L*W*H/5000)
  const calculateVolumeWeight = (length: number, width: number, height: number) => {
    return (length * width * height / 5000).toFixed(1);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Package Information</h3>
        
        {/* Package-level attributes first */}
        <div className="space-y-4 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="shipment.packages_attributes.0.carriage_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carriage Value</FormLabel>
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
                  <FormLabel>Currency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                      <SelectItem value="CNY">CNY</SelectItem>
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
                  <FormLabel>Unit of Weight</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
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
                  <FormLabel>Shipping Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="items">Items</SelectItem>
                      <SelectItem value="documents">Documents</SelectItem>
                      <SelectItem value="merchandise">Merchandise</SelectItem>
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
                  <FormLabel>Packaging Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select packaging type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="envelope">Envelope</SelectItem>
                      <SelectItem value="pallet">Pallet</SelectItem>
                      <SelectItem value="tube">Tube</SelectItem>
                      <SelectItem value="custom">Custom Packaging</SelectItem>
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
            <h4 className="text-md font-medium">Items in Package</h4>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addNewItem}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
          
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-center">Dimensions (L×W×H)</TableHead>
                  <TableHead className="text-center">Weight</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-center">Value</TableHead>
                  <TableHead className="text-center">Vol. Weight</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No items added yet. Click "Add Item" to begin.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map((field, index) => {
                    const item = field as unknown as ShipmentItem;
                    return (
                      <TableRow key={field.id}>
                        <TableCell>{item.description || "—"}</TableCell>
                        <TableCell className="text-center">
                          {item.length || 0}×{item.width || 0}×{item.height || 0} cm
                        </TableCell>
                        <TableCell className="text-center">{item.weight || 0} kg</TableCell>
                        <TableCell className="text-center">{item.quantity || 1}</TableCell>
                        <TableCell className="text-center">{item.value || 0}</TableCell>
                        <TableCell className="text-center">
                          {calculateVolumeWeight(item.length || 0, item.width || 0, item.height || 0)} kg
                        </TableCell>
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
                    );
                  })
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
                    {editingItemIndex < fields.length ? "Edit Item" : "Add New Item"}
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
                      <label className="text-sm font-medium">Description</label>
                      <Input 
                        value={tempItem.description || ""} 
                        onChange={(e) => handleTempItemChange("description", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="form-item">
                      <label className="text-sm font-medium">Length (cm)</label>
                      <Input 
                        type="number"
                        min="0"
                        value={tempItem.length || ""}
                        onChange={(e) => handleTempItemChange("length", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Width (cm)</label>
                      <Input 
                        type="number"
                        min="0"
                        value={tempItem.width || ""}
                        onChange={(e) => handleTempItemChange("width", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Height (cm)</label>
                      <Input 
                        type="number"
                        min="0"
                        value={tempItem.height || ""}
                        onChange={(e) => handleTempItemChange("height", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Weight (kg)</label>
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
                      <label className="text-sm font-medium">Quantity</label>
                      <Input 
                        type="number"
                        min="1"
                        value={tempItem.quantity || ""}
                        onChange={(e) => handleTempItemChange("quantity", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Value</label>
                      <Input 
                        type="number"
                        min="0"
                        value={tempItem.value || ""}
                        onChange={(e) => handleTempItemChange("value", Number(e.target.value))}
                      />
                    </div>
                    <div className="form-item">
                      <label className="text-sm font-medium">Country of Origin</label>
                      <Input 
                        placeholder="e.g., VN, US"
                        value={tempItem.country_of_origin || ""}
                        onChange={(e) => handleTempItemChange("country_of_origin", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="form-item">
                      <label className="text-sm font-medium">HS Code (Optional)</label>
                      <Input 
                        placeholder="Harmonized System Code"
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
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={saveItemChanges}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" /> Save Item
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