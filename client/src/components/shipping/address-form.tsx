import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface AddressFormProps {
  form: UseFormReturn<any>;
  type: "sender" | "receiver";
  title: string;
}

export default function AddressForm({ form, type, title }: AddressFormProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.name`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ và tên</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Họ và tên" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.company`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Công ty (Tùy chọn)</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Tên công ty" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.email`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Địa chỉ Email" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.phone`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Điện thoại</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Số điện thoại" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.address1`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa Chỉ</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Nhập địa chỉ" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.address2`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ dòng 2 (Tùy chọn)</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Căn hộ, Suite, Unit, v.v." {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.city`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thành phố</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Thành phố" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.state`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Thành phố</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Tỉnh/Thành phố" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.postal_code`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã bưu chính</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Mã bưu chính" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-4">
          <FormField
            control={form.control}
            name={`shipment.${type}_address_attributes.country_id`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quốc gia</FormLabel> {/* Changed to Vietnamese */}
                <FormControl>
                  <Input placeholder="Quốc gia" type="number" {...field} /> {/* Changed to Vietnamese */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}