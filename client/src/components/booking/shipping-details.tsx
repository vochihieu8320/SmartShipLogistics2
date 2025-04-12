import { UseFormReturn } from "react-hook-form";
import { BookingFormValues, Carriers, ShipmentTypes } from "@shared/schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ShippingDetails({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <FormField
          control={form.control}
          name="shipmentType"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Shipment Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={ShipmentTypes.DOMESTIC} id="domestic" />
                    <label htmlFor="domestic" className="text-sm">Domestic</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={ShipmentTypes.INTERNATIONAL} id="international" />
                    <label htmlFor="international" className="text-sm">International</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={form.control}
          name="carrier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Carrier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a carrier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={Carriers.UPS}>UPS</SelectItem>
                  <SelectItem value={Carriers.FEDEX}>FedEx</SelectItem>
                  <SelectItem value={Carriers.DHL}>DHL</SelectItem>
                  <SelectItem value={Carriers.SF_EXPRESS}>SF Express</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={form.control}
          name="shippingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div>
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your reference number"
                  {...field}
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
