import { UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { MapPin, User } from "lucide-react";

interface Country {
  id: number;
  name: string;
  code: string;
}

interface AddressFormProps {
  form: UseFormReturn<any>;
  type: "sender" | "receiver";
  title: string;
}

export default function AddressForm({ form, type, title }: AddressFormProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const baseField =
    type === "sender"
      ? "shipment.sender_address_attributes"
      : "shipment.receiver_address_attributes";
  const isReceiver = type === "receiver";

  useEffect(() => {
    // Set default country for sender
    if (!isReceiver) {
      form.setValue(`${baseField}.country_id`, 1); // Vietnam ID
    }

    // Fetch countries for recipient dropdown
    if (isReceiver) {
      const fetchCountries = async () => {
        try {
          const response = await api.get<{ countries: Country[] }>(
            "/countries",
          );
          setCountries(response.countries);
        } catch (error) {
          console.error("Error fetching countries:", error);
        }
      };
      fetchCountries();
    }
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-2">
        <div
          className={`w-10 h-10 rounded-full ${isReceiver ? "bg-blue-100 text-blue-600" : "bg-primary/20 text-primary"} flex items-center justify-center mr-3`}
        >
          {isReceiver ? <MapPin size={20} /> : <User size={20} />}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`${baseField}.name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
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
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name={`${baseField}.phone`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="+1 (555) 000-0000" {...field} />
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
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name={`${baseField}.address1`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 1</FormLabel>
            <FormControl>
              <Input placeholder="Street address" {...field} />
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
            <FormLabel>Address Line 2 (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Apartment, suite, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name={`${baseField}.city`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" {...field} />
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
              <FormLabel>Postal Code</FormLabel>
              <FormControl>
                <Input placeholder="Postal code" {...field} />
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
              <FormLabel>Country</FormLabel>
              {!isReceiver ? (
                <FormControl>
                  <Input value="Vietnam" disabled />
                </FormControl>
              ) : (
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem
                        key={country.id}
                        value={country.id.toString()}
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
