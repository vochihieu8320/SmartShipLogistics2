
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AddressFormProps {
  form: UseFormReturn<any>;
  type: "sender" | "receiver";
  title: string;
}

export default function AddressForm({ form, type, title }: AddressFormProps) {
  const baseField = type === "sender" ? "shipment.sender_address_attributes" : "shipment.receiver_address_attributes";

  return (
    <div className="space-y-4">
      <h4 className="font-medium">{title}</h4>
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`${baseField}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input placeholder="Nhập họ và tên" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.company`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên công ty (không bắt buộc)</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên công ty" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.country_id`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã quốc gia</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Nhập mã quốc gia" {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.postal_code`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã bưu điện</FormLabel>
              <FormControl>
                <Input placeholder="Nhập mã bưu điện" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thành phố</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên thành phố" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.state`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tỉnh/Bang (không bắt buộc)</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tên tỉnh/bang" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.address1`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ 1</FormLabel>
              <FormControl>
                <Input placeholder="Nhập địa chỉ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.address2`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ 2 (không bắt buộc)</FormLabel>
              <FormControl>
                <Input placeholder="Nhập địa chỉ bổ sung" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.address3`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ 3 (không bắt buộc)</FormLabel>
              <FormControl>
                <Input placeholder="Nhập địa chỉ bổ sung" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder="Nhập số điện thoại" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.email`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Nhập địa chỉ email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
