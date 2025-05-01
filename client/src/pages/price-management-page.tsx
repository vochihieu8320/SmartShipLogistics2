
import { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/services/api";

interface Provider {
  id: number;
  name: string;
}

interface ProviderService {
  id: number;
  name: string;
}

interface Country {
  id: number;
  name: string;
}

interface NetPrice {
  weight: string;
  prices: string;
}

interface OtherFee {
  id: number;
  name: string;
  display_name: string;
  description: string;
  amount: string;
  unit: string;
}

export default function PriceManagementPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [prices, setPrices] = useState<{ net_prices: NetPrice[], other_fees: OtherFee[] }>();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [providersData, countriesData] = await Promise.all([
          api.get("/providers"),
          api.get("/countries")
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
    if (selectedProvider) {
      api.get(`/providers/${selectedProvider}/services`)
        .then(data => setServices(data.services))
        .catch(error => console.error("Error fetching services:", error));
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (selectedProvider && selectedService && selectedCountry) {
      api.get(`/providers/${selectedProvider}/prices/?provider_service_id=${selectedService}&country_id=${selectedCountry}`)
        .then(data => setPrices(data))
        .catch(error => console.error("Error fetching prices:", error));
    }
  }, [selectedProvider, selectedService, selectedCountry]);

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(parseFloat(price));
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
                {providers.map(provider => (
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
                {services.map(service => (
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
                {countries.map(country => (
                  <SelectItem key={country.id} value={country.id.toString()}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {prices && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Net Prices</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Weight (kg)</TableHead>
                      <TableHead>Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.net_prices.map((price, index) => (
                      <TableRow key={index}>
                        <TableCell>{price.weight}</TableCell>
                        <TableCell>{formatPrice(price.prices)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Other Fees</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Unit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.other_fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>{fee.name}</TableCell>
                        <TableCell>{fee.display_name}</TableCell>
                        <TableCell>{fee.description}</TableCell>
                        <TableCell>{fee.amount}</TableCell>
                        <TableCell>{fee.unit}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
