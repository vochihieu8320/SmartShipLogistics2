import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface PackageFormProps {
  form: UseFormReturn<any>;
}

export default function PackageForm({ form }: PackageFormProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Package Information</h3>
        
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Package Details</h4>
          
          <div className="space-y-4">
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
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Item Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Declared Value</FormLabel>
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
            
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.country_of_origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country of Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="Country Code (e.g., US, UK)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipment.packages_attributes.0.items_attributes.0.hs_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HS Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Harmonized System Code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="mt-4">
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
            </div>
            
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}