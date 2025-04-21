import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { InfoIcon, Calculator, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

interface QuoteFormProps {
  form: UseFormReturn<any>;
  onShowRateComparison: () => void;
}

export default function QuoteForm({ form, onShowRateComparison }: QuoteFormProps) {
  const { toast } = useToast();
  const [providerServices, setProviderServices] = useState<ProviderService[]>([]);
  const [selectedService, setSelectedService] = useState<ProviderService | null>(null);
  const [customFee, setCustomFee] = useState<number>(0);
  const [vatRate] = useState<number>(0.08); // 8% VAT
  
  // Calculate total price based on the selected service
  const calculateTotalPriceBeforeVAT = () => {
    if (!selectedService) return 0;
    
    const { net_price, fuel_surcharge, peak_season, oversize_fee } = selectedService.prices;
    
    // Calculate the sum of all oversize fees
    let oversizeFeeTotal = 0;
    oversize_fee.forEach(packageFee => {
      packageFee.applied_fees.forEach(fee => {
        oversizeFeeTotal += parseFloat(fee.amount);
      });
    });
    
    // Calculate percentages
    const fuelSurchargeAmount = (net_price * fuel_surcharge) / 100;
    const peakSeasonAmount = (net_price * peak_season) / 100;
    
    return net_price + fuelSurchargeAmount + peakSeasonAmount + oversizeFeeTotal;
  };
  
  const priceBeforeVAT = calculateTotalPriceBeforeVAT();
  const vatAmount = priceBeforeVAT * vatRate;
  const totalPrice = priceBeforeVAT + vatAmount + customFee;
  
  // Fetch service quotes
  const quotesMutation = useMutation({
    mutationFn: async (shipmentId: number) => {
      const res = await apiRequest('GET', `/api/shipments/${shipmentId}/quote`);
      return await res.json() as ProviderService[];
    },
    onSuccess: (data) => {
      setProviderServices(data);
      if (data.length > 0) {
        toast({
          title: "Service quotes loaded",
          description: `Found ${data.length} service options`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to load service quotes",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  // Mock fetch quotes on component mount
  useEffect(() => {
    // This would typically fetch based on the shipment ID
    // For now, we'll use a hardcoded mock API response
    const mockQuotes: ProviderService[] = [
      {
        id: 1,
        name: "Worldwide Saver",
        prices: {
          net_price: 6558288.04,
          fuel_surcharge: 26.75,
          peak_season: 9.0,
          oversize_fee: [
            {
              package: 80,
              applied_fees: [
                {
                  name: "local_ups_freight",
                  display_name: "VÙNG DÂN CƯ UPS Worldwide Express Freight",
                  amount: "3019515.0",
                  description: "Có một kiện hàng nặng hơn 70 kg",
                  note: null
                },
                {
                  name: "ahc",
                  display_name: "AHC",
                  amount: "368715.0",
                  description: "Có một kiện hàng năng hơn 25kg",
                  note: null
                },
                {
                  name: "lps",
                  display_name: "LPS",
                  amount: "1602700.0",
                  description: "Nếu chu vi nằm trong khoảng từ 300 đến 400cm thì dù kiện hàng có nghẹ hơn hãng vấn tính 40kg",
                  note: "Chu vi = (2 × 2 cạnh ngắn nhất) + cạnh dài nhất"
                }
              ]
            }
          ]
        }
      },
      {
        id: 2,
        name: "Worldwide Expedited",
        prices: {
          net_price: 5500000.0,
          fuel_surcharge: 26.75,
          peak_season: 0.0,
          oversize_fee: [
            {
              package: 80,
              applied_fees: [
                {
                  name: "local_ups_freight",
                  display_name: "VÙNG DÂN CƯ UPS Worldwide Express Freight",
                  amount: "3019515.0",
                  description: "Có một kiện hàng nặng hơn 70 kg",
                  note: null
                },
                {
                  name: "ahc",
                  display_name: "AHC",
                  amount: "368715.0",
                  description: "Có một kiện hàng năng hơn 25kg",
                  note: null
                }
              ]
            }
          ]
        }
      }
    ];
    
    setProviderServices(mockQuotes);
  }, []);

  // Update selected service when the provider service ID changes
  useEffect(() => {
    const serviceId = form.getValues("shipment.provider_service_id");
    if (serviceId && providerServices.length > 0) {
      const service = providerServices.find(s => s.id === parseInt(serviceId));
      setSelectedService(service || null);
    }
  }, [form, providerServices]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Update form values when total price changes
  useEffect(() => {
    if (selectedService) {
      form.setValue("shipment.total_price", totalPrice);
    }
  }, [totalPrice, selectedService, form]);
  
  // Handle custom fee change
  const handleCustomFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCustomFee(value);
    form.setValue("shipment.custom_fee", value);
  };

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
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                  onValueChange={(value) => {
                    field.onChange(value);
                    const service = providerServices.find(s => s.id === parseInt(value));
                    setSelectedService(service || null);
                  }}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providerServices.map(service => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {selectedService && (
          <div className="mt-6 border rounded-lg p-4">
            <h4 className="font-medium text-lg mb-4">Price Details</h4>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-sm text-muted-foreground">Base Price:</div>
                <div className="text-sm font-medium">
                  {formatCurrency(selectedService.prices.net_price)}
                </div>
                
                <div className="text-sm text-muted-foreground flex items-center">
                  Fuel Surcharge ({selectedService.prices.fuel_surcharge}%):
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency((selectedService.prices.net_price * selectedService.prices.fuel_surcharge) / 100)}
                </div>
                
                {selectedService.prices.peak_season > 0 && (
                  <>
                    <div className="text-sm text-muted-foreground">
                      Peak Season ({selectedService.prices.peak_season}%):
                    </div>
                    <div className="text-sm font-medium">
                      {formatCurrency((selectedService.prices.net_price * selectedService.prices.peak_season) / 100)}
                    </div>
                  </>
                )}
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="oversize-fees">
                  <AccordionTrigger className="text-sm py-2">
                    Additional Fees
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="text-xs">
                      {selectedService.prices.oversize_fee.map((packageFee, packageIndex) => (
                        <div key={packageIndex} className="mb-4">
                          <div className="mb-2 font-medium">
                            Package #{packageFee.package}
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[200px]">Fee</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {packageFee.applied_fees.map((fee, feeIndex) => (
                                <TableRow key={feeIndex}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center">
                                      {fee.display_name}
                                      {fee.note && (
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger>
                                              <InfoIcon className="h-3 w-3 ml-1 text-muted-foreground" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{fee.note}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>{fee.description}</TableCell>
                                  <TableCell className="text-right">{formatCurrency(parseFloat(fee.amount))}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-sm text-muted-foreground">Subtotal:</div>
                <div className="text-sm font-medium">{formatCurrency(priceBeforeVAT)}</div>
                
                <div className="text-sm text-muted-foreground">VAT ({(vatRate * 100).toFixed(0)}%):</div>
                <div className="text-sm font-medium">{formatCurrency(vatAmount)}</div>
                
                <div className="text-sm">
                  <div className="flex items-center">
                    <FormLabel htmlFor="custom-fee" className="text-muted-foreground mr-2">Additional Fees:</FormLabel>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Add any custom or additional fees not included in the carrier quote</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <div className="text-sm">
                  <Input
                    id="custom-fee"
                    type="number"
                    placeholder="0"
                    className="h-8"
                    value={customFee || ''}
                    onChange={handleCustomFeeChange}
                  />
                </div>
                
                <Separator className="col-span-2 my-1" />
                
                <div className="text-base font-bold">Total:</div>
                <div className="text-base font-bold text-primary">
                  {formatCurrency(totalPrice)}
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="shipment.total_price"
                render={({ field }) => (
                  <input type="hidden" {...field} value={totalPrice} />
                )}
              />
              
              <FormField
                control={form.control}
                name="shipment.custom_fee"
                render={({ field }) => (
                  <input type="hidden" {...field} value={customFee} />
                )}
              />
            </div>
            
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                Service: {selectedService.name}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}