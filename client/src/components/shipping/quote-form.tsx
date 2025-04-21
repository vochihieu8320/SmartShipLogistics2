import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";
import RateComparisonTool from "@/components/shipping/rate-comparison";

interface QuoteFormProps {
  form: UseFormReturn<any>;
  onShowRateComparison: () => void;
}

export default function QuoteForm({ form, onShowRateComparison }: QuoteFormProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Carrier and Service Selection</h3>

        <div className="mb-6">
          <Button 
            variant="outline" 
            type="button"
            onClick={onShowRateComparison}
            className="flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Compare Shipping Rates
          </Button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shipment.provider_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Carrier</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">FedEx</SelectItem>
                    <SelectItem value="2">DHL</SelectItem>
                    <SelectItem value="3">UPS</SelectItem>
                    <SelectItem value="4">SF Express</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="shipment.provider_service_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">Standard</SelectItem>
                    <SelectItem value="2">Express</SelectItem>
                    <SelectItem value="3">Priority</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}