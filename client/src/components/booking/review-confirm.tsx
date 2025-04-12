import { UseFormReturn, useWatch } from "react-hook-form";
import { BookingFormValues } from "@shared/schema";
import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormLabel,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Helper to format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export default function ReviewConfirm({
  form,
}: {
  form: UseFormReturn<BookingFormValues>;
}) {
  // Watch all form values for the summary
  const values = useWatch({ control: form.control });
  
  // Calculate pricing based on form values
  const baseShippingCost = values.packageWeight * 10; // $10 per kg
  const insuranceCost = values.insurance ? (values.declaredValue * 0.05) : 0; // 5% of declared value
  const additionalServicesCost = (values.signatureRequired ? 5 : 0) + (values.saturdayDelivery ? 10 : 0);
  const fuelSurcharge = baseShippingCost * 0.08; // 8% fuel surcharge
  const tax = (baseShippingCost + insuranceCost + additionalServicesCost + fuelSurcharge) * 0.1; // 10% tax
  const totalCost = baseShippingCost + insuranceCost + additionalServicesCost + fuelSurcharge + tax;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-neutral-50 px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Shipment Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-neutral-700 mb-2">Shipment Details</h5>
              <dl className="grid grid-cols-3 gap-1 text-sm">
                <dt className="col-span-1 text-neutral-500">Type:</dt>
                <dd className="col-span-2 capitalize">{values.shipmentType}</dd>
                
                <dt className="col-span-1 text-neutral-500">Carrier:</dt>
                <dd className="col-span-2">{values.carrier}</dd>
                
                <dt className="col-span-1 text-neutral-500">Date:</dt>
                <dd className="col-span-2">
                  {new Date(values.shippingDate).toLocaleDateString()}
                </dd>
                
                <dt className="col-span-1 text-neutral-500">Service:</dt>
                <dd className="col-span-2">
                  {values.serviceType === 'standard' ? 'Standard Delivery' :
                   values.serviceType === 'express' ? 'Express Delivery' : 
                   values.serviceType === 'next_day' ? 'Next Day Delivery' : 'Economy'}
                </dd>
              </dl>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-neutral-700 mb-2">Package Information</h5>
              <dl className="grid grid-cols-3 gap-1 text-sm">
                <dt className="col-span-1 text-neutral-500">Weight:</dt>
                <dd className="col-span-2">{values.packageWeight} kg</dd>
                
                <dt className="col-span-1 text-neutral-500">Dimensions:</dt>
                <dd className="col-span-2">
                  {values.packageLength} × {values.packageWidth} × {values.packageHeight} cm
                </dd>
                
                <dt className="col-span-1 text-neutral-500">Type:</dt>
                <dd className="col-span-2 capitalize">{values.packageType}</dd>
                
                <dt className="col-span-1 text-neutral-500">Quantity:</dt>
                <dd className="col-span-2">{values.packageQuantity}</dd>
              </dl>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-neutral-700 mb-2">Sender Information</h5>
              <address className="not-italic text-sm text-neutral-700">
                {values.senderName}<br />
                {values.senderCompany && <>{values.senderCompany}<br /></>}
                {values.senderStreetAddress}<br />
                {values.senderCity}, {values.senderPostalCode}<br />
                {values.senderCountry}<br />
                <div className="mt-1">
                  <div>{values.senderEmail}</div>
                  <div>{values.senderPhone}</div>
                </div>
              </address>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-neutral-700 mb-2">Recipient Information</h5>
              <address className="not-italic text-sm text-neutral-700">
                {values.recipientName}<br />
                {values.recipientCompany && <>{values.recipientCompany}<br /></>}
                {values.recipientStreetAddress}<br />
                {values.recipientCity}, {values.recipientPostalCode}<br />
                {values.recipientCountry}<br />
                <div className="mt-1">
                  <div>{values.recipientEmail}</div>
                  <div>{values.recipientPhone}</div>
                </div>
              </address>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="bg-neutral-50 px-4 py-3 border-b">
          <CardTitle className="text-base font-medium">Shipping Quote</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <dl className="divide-y divide-gray-200">
            <div className="py-2 flex justify-between">
              <dt className="text-sm text-gray-600">Base Shipping Cost</dt>
              <dd className="text-sm font-medium text-gray-900">{formatCurrency(baseShippingCost)}</dd>
            </div>
            {values.insurance && (
              <div className="py-2 flex justify-between">
                <dt className="text-sm text-gray-600">Insurance</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(insuranceCost)}</dd>
              </div>
            )}
            {(values.signatureRequired || values.saturdayDelivery) && (
              <div className="py-2 flex justify-between">
                <dt className="text-sm text-gray-600">Additional Services</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(additionalServicesCost)}</dd>
              </div>
            )}
            <div className="py-2 flex justify-between">
              <dt className="text-sm text-gray-600">Fuel Surcharge</dt>
              <dd className="text-sm font-medium text-gray-900">{formatCurrency(fuelSurcharge)}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-sm text-gray-600">Tax</dt>
              <dd className="text-sm font-medium text-gray-900">{formatCurrency(tax)}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-sm font-bold text-gray-900">Total</dt>
              <dd className="text-sm font-bold text-gray-900">{formatCurrency(totalCost)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      
      <FormField
        control={form.control}
        name="termsAccepted"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>I agree to the terms and conditions</FormLabel>
              <FormDescription>
                By proceeding, you acknowledge that all information provided is accurate and you agree to our{' '}
                <a href="#" className="text-primary underline hover:text-primary/80">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary underline hover:text-primary/80">
                  Shipping Policies
                </a>.
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}
