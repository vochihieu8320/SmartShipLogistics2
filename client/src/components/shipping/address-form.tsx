
import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MapPin, Building2, Globe, Mail, Phone, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddressFormProps {
  form: UseFormReturn<any>;
  type: "sender" | "receiver";
  title: string;
}

// Countries list with their IDs to make it more user-friendly
const countries = [
  { id: 1, name: "Vietnam", code: "VN" },
  { id: 2, name: "United States", code: "US" },
  { id: 3, name: "China", code: "CN" },
  { id: 4, name: "Japan", code: "JP" },
  { id: 5, name: "Singapore", code: "SG" },
  { id: 6, name: "Korea", code: "KR" },
  { id: 7, name: "Thailand", code: "TH" },
  { id: 8, name: "Malaysia", code: "MY" },
  { id: 9, name: "Indonesia", code: "ID" },
  { id: 10, name: "Australia", code: "AU" },
];

export default function AddressForm({ form, type, title }: AddressFormProps) {
  const baseField = type === "sender" ? "shipment.sender_address_attributes" : "shipment.receiver_address_attributes";
  const isReceiver = type === "receiver";

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-2">
        <div className={`w-10 h-10 rounded-full ${isReceiver ? 'bg-blue-100 text-blue-600' : 'bg-primary/20 text-primary'} flex items-center justify-center mr-3`}>
          {isReceiver ? <MapPin size={20} /> : <User size={20} />}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name={`${baseField}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-500" />
                Họ và tên
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập họ và tên" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
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
              <FormLabel className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-gray-500" />
                Công ty (không bắt buộc)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập tên công ty" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
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
              <FormLabel className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-gray-500" />
                Quốc gia
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="border-gray-300 focus:border-primary">
                    <SelectValue placeholder="Chọn quốc gia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name} ({country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${baseField}.postal_code`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                Mã bưu điện
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập mã bưu điện" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
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
              <FormLabel className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                Thành phố
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập tên thành phố" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
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
              <FormLabel className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                Tỉnh/Bang (không bắt buộc)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập tên tỉnh/bang" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name={`${baseField}.address1`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-500" />
                  Địa chỉ
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Nhập địa chỉ" 
                    {...field} 
                    className="border-gray-300 focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name={`${baseField}.address2`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                Địa chỉ bổ sung 1 (không bắt buộc)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập địa chỉ bổ sung" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
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
              <FormLabel className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-500" />
                Địa chỉ bổ sung 2 (không bắt buộc)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập địa chỉ bổ sung" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
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
              <FormLabel className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-500" />
                Số điện thoại
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nhập số điện thoại" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
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
              <FormLabel className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-500" />
                Email
              </FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Nhập địa chỉ email" 
                  {...field} 
                  className="border-gray-300 focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
