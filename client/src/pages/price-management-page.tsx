import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config/api";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  id: number;
  zone: string;
  price: string;
  weight: string;
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
  const [prices, setPrices] = useState<NetPrice[]>([]);
  const [peakSeasonCharges, setPeakSeasonCharges] = useState<NetPrice[]>([]);
  const [otherFees, setOtherFees] = useState<OtherFee[]>([]);
  const [weightDiscounts, setWeightDiscounts] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch weight discounts
  useEffect(() => {
    api.get("/weight_discounts").then((response) => {
      setWeightDiscounts(response.weight_discounts || []);
    });
  }, []);

  // Get unique zones and weights for table headers
  const uniqueZones = [...new Set(prices?.map((p) => p.zone))].sort(
    (a, b) => parseFloat(a) - parseFloat(b),
  );
  const uniqueWeights = [...new Set(prices?.map((p) => p.weight))].sort(
    (a, b) => parseFloat(a) - parseFloat(b),
  );
  const uniquePeakZones = [
    ...new Set(peakSeasonCharges?.map((p) => p.zone)),
  ].sort((a, b) => parseFloat(a) - parseFloat(b));
  const uniquePeakWeights = [
    ...new Set(peakSeasonCharges?.map((p) => p.weight)),
  ].sort((a, b) => parseFloat(a) - parseFloat(b));

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const providersData = await api.get("/providers");
        setProviders(providersData.providers);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProvider && selectedService) {
      const fetchPrices = async () => {
        try {
          // Fetch net prices and other fees
          const { net_prices, other_fees } = await api.get(
            `/providers/${selectedProvider}/prices/?provider_service_id=${selectedService}`,
          );
          setPrices(net_prices);
          setOtherFees(other_fees || []);

          // Fetch peak season charges separately
          try {
            const response = await api.get(
              `/providers/${selectedProvider}/prices/?provider_service_id=${selectedService}&fee_type=peak_season_surcharge`,
            );
            setPeakSeasonCharges(response.other_fees || []);
          } catch (error) {
            console.error("Error fetching peak season charges:", error);
            setPeakSeasonCharges([]);
          }
        } catch (error) {
          console.error("Error fetching prices:", error);
        }
      };
      fetchPrices();
    }
  }, [selectedProvider, selectedService]);

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

  const getPriceForZoneAndWeight = (zone: string, weight: string) => {
    const price = prices.find((p) => p.zone === zone && p.weight === weight);
    return price ? formatPrice(price.price) : "-";
  };

  const getPeakSeasonPriceForZoneAndWeight = (zone: string, weight: string) => {
    const price = peakSeasonCharges?.find((p) => p.zone === zone);
    return price ? formatPrice(price.amount) : "-";
  };

  const handleFileUpload = async (e: any) => {
    if (!selectedProvider || !selectedService) {
      toast({
        title: "Error",
        description: "Please select a provider and service first",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("provider_id", selectedProvider);
    formData.append("provider_service_id", selectedService);

    console.log();
    try {
      console.log("formData", formData);
      // Verify form data is not empty
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      // Use fetch directly for file upload
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/seed_prices`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.status === 200) {
        toast({
          title: "Upload Success", 
          description: "Prices uploaded successfully",
          variant: "default",
        });
        
        // Refetch prices after successful upload
        try {
          const { net_prices, other_fees } = await api.get(
            `/providers/${selectedProvider}/prices/?provider_service_id=${selectedService}`,
          );
          setPrices(net_prices);
          setOtherFees(other_fees || []);

          // Refetch peak season charges
          const peakResponse = await api.get(
            `/providers/${selectedProvider}/prices/?provider_service_id=${selectedService}&fee_type=peak_season_surcharge`,
          );
          setPeakSeasonCharges(peakResponse.other_fees || []);
        } catch (error) {
          console.error("Error refreshing prices:", error);
        }
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

  const handleUpdateFee = async (fee: OtherFee) => {
    try {
      if (!selectedProvider || !selectedService) return;

      let updatedAmount = prompt(`Update ${fee.display_name}`, fee.amount);
      if (!updatedAmount) return;

      await api.put(`/providers/${selectedProvider}/update_prices`, {
        provider_service_id: selectedService,
        fee_type:
          fee.display_name === "Phụ phí cao điểm"
            ? "peak_season_surcharge"
            : "vat", // Assumed fee_type mapping
        amount: parseFloat(updatedAmount),
      });

      toast({
        title: "Success",
        description: "Fee updated successfully",
      });

      // Refresh data
      const { net_prices, other_fees } = await api.get(
        `/providers/${selectedProvider}/prices/?provider_service_id=${selectedService}`,
      );
      setPrices(net_prices);
      setOtherFees(other_fees || []);
    } catch (error) {
      console.error("Error updating fee:", error);
      toast({
        title: "Error",
        description: "Failed to update fee",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePeakSeasonCharge = async (charge: NetPrice) => {
    try {
      if (!selectedProvider || !selectedService) return;
      let updatedAmount = prompt(
        `Update peak season charge for zone ${charge.zone}`,
        charge.price,
      );
      if (!updatedAmount) return;

      await api.put(`/providers/${selectedProvider}/update_prices`, {
        provider_service_id: selectedService,
        fee_type: "peak_season_surcharge",
        fees: [
          {
            zone: charge.zone,
            other_fee: updatedAmount,
          },
        ],
      });

      toast({
        title: "Success",
        description: "Peak season charge updated successfully",
      });

      // Refresh data (adjust as needed)
      const response = await api.get(
        `/providers/${selectedProvider}/prices/?provider_service_id=${selectedService}&fee_type=peak_season_surcharge`,
      );
      setPeakSeasonCharges(response.other_fees || []);
    } catch (error) {
      console.error("Error updating peak season charge:", error);
      toast({
        title: "Error",
        description: "Failed to update peak season charge",
        variant: "destructive",
      });
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
              <TabsTrigger value="peak_season_charges">
                Mùa Cao Điểm
              </TabsTrigger>
              <TabsTrigger value="other_fees">Phụ Phí</TabsTrigger>
              <TabsTrigger value="weight_discounts">Giảm Giá</TabsTrigger>
            </TabsList>

            <TabsContent value="net_prices">
              {prices.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Weight/Zone</TableHead>
                        {uniqueZones.map((zone) => (
                          <TableHead
                            key={zone}
                            className="text-center font-bold"
                          >
                            Zone {zone}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uniqueWeights.map((weight) => (
                        <TableRow key={weight}>
                          <TableCell className="font-medium">
                            {weight} kg
                          </TableCell>
                          {uniqueZones.map((zone) => (
                            <TableCell
                              key={`${weight}-${zone}`}
                              className="text-right"
                            >
                              {getPriceForZoneAndWeight(zone, weight)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="peak_season_charges">
              {peakSeasonCharges && peakSeasonCharges.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Zone</TableHead>
                        <TableHead className="font-bold">Amount</TableHead>
                        <TableHead className="font-bold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {peakSeasonCharges.map((charge) => (
                        <TableRow key={charge.zone}>
                          <TableCell className="font-medium">
                            {charge.zone}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatPrice(charge.amount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleUpdatePeakSeasonCharge(charge)
                              }
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                    {otherFees
                      .filter((fee) => fee.display_name !== "Phụ phí cao điểm")
                      .map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell>{fee.display_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {formatPrice(fee.amount)}
                              <span className="text-sm text-gray-600">
                                {fee.unit === "percentage" && "%"}
                                {fee.unit === "per_kg" && `VND/kg`}
                                {fee.unit === "money" && "VND"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateFee(fee)}
                            >
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="weight_discounts">
              <div className="overflow-x-auto">
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={() => {
                        const minWeight = prompt("Enter minimum weight (kg)");
                        const maxWeight = prompt("Enter maximum weight (kg)");
                        const discountPercentage = prompt("Enter discount percentage");
                        
                        if (minWeight && maxWeight && discountPercentage) {
                          api.post("/weight_discounts", {
                            weight_discount: {
                              user_id: 3, // You may want to get this from auth context
                              min_weight: parseFloat(minWeight),
                              max_weight: parseFloat(maxWeight),
                              discount_percentage: parseFloat(discountPercentage)
                            }
                          }).then(() => {
                            toast({
                              title: "Success",
                              description: "Weight discount added successfully"
                            });
                          }).catch(() => {
                            toast({
                              title: "Error",
                              description: "Failed to add weight discount",
                              variant: "destructive"
                            });
                          });
                        }
                      }}
                    >
                      Add Weight Discount
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Min Weight (kg)</TableHead>
                        <TableHead>Max Weight (kg)</TableHead>
                        <TableHead>Discount (%)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {weightDiscounts?.map((discount) => (
                        <TableRow key={discount.id}>
                          <TableCell>{discount.min_weight}</TableCell>
                          <TableCell>{discount.max_weight}</TableCell>
                          <TableCell>{discount.discount_percentage}%</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const minWeight = prompt("Enter minimum weight (kg)", discount.min_weight.toString());
                                  const maxWeight = prompt("Enter maximum weight (kg)", discount.max_weight.toString());
                                  const discountPercentage = prompt("Enter discount percentage", discount.discount_percentage.toString());

                                  if (minWeight && maxWeight && discountPercentage) {
                                    api.put(`/weight_discounts/${discount.id}`, {
                                      weight_discount: {
                                        min_weight: parseFloat(minWeight),
                                        max_weight: parseFloat(maxWeight),
                                        discount_percentage: parseFloat(discountPercentage)
                                      }
                                    }).then(() => {
                                      toast({
                                        title: "Success",
                                        description: "Weight discount updated successfully"
                                      });
                                    }).catch(() => {
                                      toast({
                                        title: "Error",
                                        description: "Failed to update weight discount",
                                        variant: "destructive"
                                      });
                                    });
                                  }
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Are you sure you want to delete this weight discount?")) {
                                    api.delete(`/weight_discounts/${discount.id}`).then(() => {
                                      toast({
                                        title: "Success",
                                        description: "Weight discount deleted successfully"
                                      });
                                    }).catch(() => {
                                      toast({
                                        title: "Error",
                                        description: "Failed to delete weight discount",
                                        variant: "destructive"
                                      });
                                    });
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
