import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/services/api";

interface Provider {
  id: number;
  name: string;
  services: ProviderService[];
}

interface ProviderService {
  id: number;
  name: string;
}

interface NetPrice {
  weight: string;
  prices: string;
}

interface OtherFee {
  display_name: string;
  amount: string;
  unit: string;
}

export default function PriceManagementPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [prices, setPrices] = useState<NetPrice[]>([]);
  const [otherFees, setOtherFees] = useState<OtherFee[]>([]);
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [providersData, countriesData] = await Promise.all([
          api.get("/providers"),
          api.get("/countries"),
        ]);
        setProviders(providersData.providers);
        setCountries(countriesData.countries);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProvider && selectedService && selectedCountry) {
      api
        .get(
          `/providers/${selectedProvider}/prices/?provider_service_id=${selectedService}&country_id=${selectedCountry}`,
        )
        .then((data) => {
          setPrices(data.net_prices);
          setOtherFees(data.other_fees || []);
        })
        .catch((error) => console.error("Error fetching prices:", error));
    }
  }, [selectedProvider, selectedService, selectedCountry]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));
  };

  const getServicesByProvider = (providerId: string) => {
    const provider = providers.find((p) => p.id.toString() === providerId);
    return provider?.services || [];
  };

  return (
    <DashboardLayout title="Price Management">
      <Card>
        <CardHeader>
          <CardTitle>Price Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Select onValueChange={setSelectedProvider}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id.toString()}>
                    {provider.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedService}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Service" />
              </SelectTrigger>
              <SelectContent>
                {selectedProvider &&
                  getServicesByProvider(selectedProvider).map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="net_prices" className="w-full">
            <TabsList>
              <TabsTrigger value="net_prices">Giá Gốc</TabsTrigger>
              <TabsTrigger value="other_fees">Phụ Phí</TabsTrigger>
            </TabsList>

            <TabsContent value="net_prices">
              {prices.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Weight (kg)</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.map((price, index) => (
                      <TableRow key={index}>
                        <TableCell>{price.weight}</TableCell>
                        <TableCell>{formatPrice(price.prices)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="other_fees">
              {otherFees.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherFees.map((fee, index) => (
                      <TableRow key={index}>
                        <TableCell>{fee.display_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={fee.amount}
                              onChange={(e) => {
                                const updatedFees = [...otherFees];
                                updatedFees[index].amount = e.target.value;
                                setOtherFees(updatedFees);
                              }}
                              className="w-32"
                            />
                            <span className="text-sm text-gray-600">
                              {fee.unit === 'percentage' && '%'}
                              {fee.unit === 'per_kg' && `VND/kg`}
                              {fee.unit === 'money' && 'VND'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {fee.unit !== 'percentage' && formatPrice(fee.amount)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await api.put(
                                  `/providers/${selectedProvider}/update_prices/?provider_service_id=${selectedService}&country_id=${selectedCountry}`,
                                  {
                                    fee_type: fee.type,
                                    amount: fee.amount
                                  }
                                );
                                
                                if (response.status === 200) {
                                  toast({
                                    title: "Cập nhật thành công",
                                    description: `Đã cập nhật ${fee.display_name} thành ${formatPrice(fee.amount)}`,
                                    variant: "default"
                                  });
                                } else {
                                  throw new Error('Failed to update price');
                                }
                              } catch (error) {
                                toast({
                                  title: "Lỗi cập nhật",
                                  description: "Không thể cập nhật giá, vui lòng thử lại",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
