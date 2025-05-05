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
import { Loader2 } from "@/components/ui/loader";

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
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFileUpload = async (e: any) => {
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("provider_id", selectedProvider);
    formData.append("provider_service_id", selectedService);

    try {
      const response = await api.post("/api/v1/seed_prices", formData);
      if (response.status === 200) {
        toast({
          title: "Upload Success",
          description: "Prices uploaded successfully",
          variant: "default",
        });
      } else {
        throw new Error("Failed to upload prices");
      }
    } catch (error) {
      toast({
        title: "Upload Error",
        description: "Failed to upload prices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="price-upload"
              disabled={isUploading}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("price-upload")?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Tải lên bảng giá XLSX
                </>
              )}
            </Button>
          </div>
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