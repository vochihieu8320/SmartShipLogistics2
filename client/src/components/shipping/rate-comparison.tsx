import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, TrendingDown, Clock, CheckCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define form schema
const rateComparisonSchema = z.object({
  // Sender address
  senderName: z.string().min(2, "Name is required"),
  senderStreet: z.string().min(2, "Street address is required"),
  senderCity: z.string().min(2, "City is required"),
  senderState: z.string().min(2, "State/Province is required"),
  senderPostalCode: z.string().min(2, "Postal code is required"),
  senderCountry: z.string().min(2, "Country is required"),
  
  // Recipient address
  recipientName: z.string().min(2, "Name is required"),
  recipientStreet: z.string().min(2, "Street address is required"),
  recipientCity: z.string().min(2, "City is required"),
  recipientState: z.string().min(2, "State/Province is required"),
  recipientPostalCode: z.string().min(2, "Postal code is required"),
  recipientCountry: z.string().min(2, "Country is required"),
  
  // Package details
  packageLength: z.coerce.number().min(1, "Length must be at least 1 cm"),
  packageWidth: z.coerce.number().min(1, "Width must be at least 1 cm"),
  packageHeight: z.coerce.number().min(1, "Height must be at least 1 cm"),
  packageWeight: z.coerce.number().min(0.1, "Weight must be at least 0.1 kg"),
  packageQuantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
  
  // Shipment type
  shipmentType: z.enum(["domestic", "international"]).default("domestic"),
});

// Types for the rate quote response from the API
interface AppliedFee {
  name: string;
  display_name: string;
  amount: string;
  description: string;
  note: string | null;
}

interface PackageFee {
  package: number;
  applied_fees: AppliedFee[];
}

interface ServicePrices {
  net_price: number;
  fuel_surcharge: number;
  peak_season: number;
  oversize_fee: PackageFee[];
}

interface ProviderService {
  id: number;
  name: string;
  prices: ServicePrices;
}

// Legacy RateQuote for compatibility with existing code
interface RateQuote {
  carrier: string;
  service: string;
  deliveryDays: number;
  baseRate: number;
  taxes: number;
  fees: number;
  insurance: number;
  totalRate: number;
  currency: string;
  estimatedDelivery: string;
  deliveryGuarantee?: boolean;
}

type RateComparison = z.infer<typeof rateComparisonSchema>;

export default function RateComparisonTool() {
  const { toast } = useToast();
  const [rateQuotes, setRateQuotes] = useState<RateQuote[]>([]);
  const [selectedSort, setSelectedSort] = useState<"price" | "time">("price");
  
  const form = useForm<RateComparison>({
    resolver: zodResolver(rateComparisonSchema),
    defaultValues: {
      senderName: "John Doe",
      senderStreet: "123 Main St",
      senderCity: "San Francisco",
      senderState: "CA",
      senderPostalCode: "94105",
      senderCountry: "USA",
      
      recipientName: "Jane Smith",
      recipientStreet: "456 Market St",
      recipientCity: "Los Angeles",
      recipientState: "CA",
      recipientPostalCode: "90001",
      recipientCountry: "USA",
      
      packageLength: 20,
      packageWidth: 15,
      packageHeight: 10,
      packageWeight: 2,
      packageQuantity: 1,
      
      shipmentType: "domestic",
    }
  });
  
  // Rate quote mutation
  const rateQuoteMutation = useMutation({
    mutationFn: async (data: RateComparison) => {
      // Format the data for the API
      const requestData = {
        sender: {
          name: data.senderName,
          street: data.senderStreet,
          city: data.senderCity,
          state: data.senderState,
          postalCode: data.senderPostalCode,
          country: data.senderCountry
        },
        recipient: {
          name: data.recipientName,
          street: data.recipientStreet,
          city: data.recipientCity,
          state: data.recipientState,
          postalCode: data.recipientPostalCode,
          country: data.recipientCountry
        },
        package: {
          length: data.packageLength,
          width: data.packageWidth,
          height: data.packageHeight,
          weight: data.packageWeight,
          quantity: data.packageQuantity
        },
        shipmentType: data.shipmentType
      };
      
      const res = await apiRequest('POST', '/api/shipping/rates', requestData);
      const resData = await res.json();
      return resData.rates as RateQuote[];
    },
    onSuccess: (data) => {
      setRateQuotes(data);
      toast({
        title: "Rate quotes retrieved",
        description: `Found ${data.length} shipping options`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to get rates",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  function onSubmit(data: RateComparison) {
    rateQuoteMutation.mutate(data);
  }
  
  // Format currency
  function formatCurrency(amount: number, currency = "USD") {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }
  
  // Sort quotes
  const sortedQuotes = [...rateQuotes].sort((a, b) => {
    if (selectedSort === "price") {
      return a.totalRate - b.totalRate;
    } else {
      return a.deliveryDays - b.deliveryDays;
    }
  });
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rate Form */}
        <Card>
          <CardHeader>
            <CardTitle>Compare Shipping Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Tabs defaultValue="sender" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="sender">Sender</TabsTrigger>
                    <TabsTrigger value="recipient">Recipient</TabsTrigger>
                    <TabsTrigger value="package">Package</TabsTrigger>
                  </TabsList>
                  
                  {/* Sender Tab */}
                  <TabsContent value="sender" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="senderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="senderStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="senderCity"
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
                        name="senderState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input placeholder="State/Province" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="senderPostalCode"
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
                        name="senderCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Recipient Tab */}
                  <TabsContent value="recipient" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="recipientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="recipientStreet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipientCity"
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
                        name="recipientState"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province</FormLabel>
                            <FormControl>
                              <Input placeholder="State/Province" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="recipientPostalCode"
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
                        name="recipientCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="Country" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  {/* Package Tab */}
                  <TabsContent value="package" className="space-y-4">
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
                                <RadioGroupItem value="domestic" id="domestic" />
                                <label htmlFor="domestic" className="text-sm">Domestic</label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="international" id="international" />
                                <label htmlFor="international" className="text-sm">International</label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="packageLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="packageWidth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="packageHeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="packageWeight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="packageQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min="1" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={rateQuoteMutation.isPending}
                >
                  {rateQuoteMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Rates...
                    </>
                  ) : (
                    "Compare Rates"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Rate Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Shipping Options</CardTitle>
            {rateQuotes.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select
                  defaultValue="price"
                  value={selectedSort}
                  onValueChange={(value: "price" | "time") => setSelectedSort(value)}
                >
                  <SelectTrigger className="w-[130px] h-8">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="time">Delivery Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {rateQuoteMutation.isPending ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-center text-muted-foreground">
                  Getting the best rates for your shipment...
                </p>
              </div>
            ) : rateQuotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-center text-muted-foreground">
                  Fill out the form and click "Compare Rates" to see shipping options
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedQuotes.map((quote, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{quote.carrier}</h3>
                      <span className="text-lg font-semibold text-primary">
                        {formatCurrency(quote.totalRate, quote.currency)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-3">
                      {quote.service}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">{quote.deliveryDays} day{quote.deliveryDays !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm">Est. Delivery: {new Date(quote.estimatedDelivery).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        {quote.deliveryGuarantee ? (
                          <Badge className="flex items-center" variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                            <span className="text-xs">Guaranteed</span>
                          </Badge>
                        ) : (
                          <Badge className="flex items-center" variant="outline">
                            <X className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs">No Guarantee</span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-2" />
                    
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                      <div>
                        <div>Base Rate</div>
                        <div>{formatCurrency(quote.baseRate)}</div>
                      </div>
                      <div>
                        <div>Taxes</div>
                        <div>{formatCurrency(quote.taxes)}</div>
                      </div>
                      <div>
                        <div>Fees</div>
                        <div>{formatCurrency(quote.fees)}</div>
                      </div>
                      <div>
                        <div>Insurance</div>
                        <div>{formatCurrency(quote.insurance)}</div>
                      </div>
                    </div>
                    
                    {index === 0 && selectedSort === "price" && (
                      <div className="mt-3">
                        <Badge variant="secondary" className="flex items-center w-fit">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          <span className="text-xs">Best Value</span>
                        </Badge>
                      </div>
                    )}
                    
                    {index === 0 && selectedSort === "time" && (
                      <div className="mt-3">
                        <Badge variant="secondary" className="flex items-center w-fit">
                          <Clock className="h-3 w-3 mr-1" />
                          <span className="text-xs">Fastest Delivery</span>
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}