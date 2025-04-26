import { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Loader2, Package, Truck, X } from "lucide-react";
import AddressForm from "@/components/shipping/address-form";
import PackageForm from "@/components/shipping/package-form";
import QuoteForm from "@/components/shipping/quote-form";
import ShippingSummary from "@/components/shipping/shipping-summary";
import RateComparisonTool from "@/components/shipping/rate-comparison";

// Define the schema using zod
const createShipmentSchema = z.object({
  shipment: z.object({
    provider_id: z.coerce.number(),
    provider_service_id: z.coerce.number(),
    status: z.string().optional(),
    sender_address_attributes: z.object({
      name: z.string().min(2, "Name is required"),
      company: z.string().optional(),
      country_id: z.coerce.number(),
      postal_code: z.string().min(1, "Postal code is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().optional(),
      address1: z.string().min(1, "Address is required"),
      address2: z.string().optional(),
      address3: z.string().optional(),
      phone: z.string().min(1, "Phone is required"),
      email: z.string().email("Invalid email"),
    }),
    receiver_address_attributes: z.object({
      name: z.string().min(2, "Name is required"),
      company: z.string().optional(),
      country_id: z.coerce.number(),
      postal_code: z.string().min(1, "Postal code is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().optional(),
      address1: z.string().min(1, "Address is required"),
      address2: z.string().optional(),
      address3: z.string().optional(),
      phone: z.string().min(1, "Phone is required"),
      email: z.string().email("Invalid email"),
    }),
    packages_attributes: z.array(
      z.object({
        carriage_value: z.coerce.number(),
        unit_of_weight: z.string(),
        currency: z.string(),
        type_shipping: z.string(),
        packaging: z.string(),
        items_attributes: z.array(
          z.object({
            weight: z.coerce.number(),
            length: z.coerce.number(),
            width: z.coerce.number(),
            height: z.coerce.number(),
            quantity: z.coerce.number(),
            description: z.string(),
            value: z.coerce.number(),
            country_of_origin: z.string(),
            hs_code: z.string().optional(),
          }),
        ),
      }),
    ),
  }),
});

type CreateShipmentFormValues = z.infer<typeof createShipmentSchema>;

export default function CreateShippingPage() {
  const [activeTab, setActiveTab] = useState("details");
  const [isComplete, setIsComplete] = useState(false);
  const [displayRateComparison, setDisplayRateComparison] = useState(false);
  const { toast } = useToast();
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  // Form setup with default values
  const form = useForm<CreateShipmentFormValues>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      shipment: {
      provider_id: 1,
      provider_service_id: 1,
      status: "created",
      sender_address_attributes: {
        name: user?.fullName || "",
        company: "Furniture Exports",
        country_id: 1,
        postal_code: "70000",
        city: "Ho Chi Minh City",
        state: "",
        address1: "789 Cach Mang Thang 8",
        address2: "District 3",
        address3: "",
        phone: "+84918765432",
        email: user?.email || "le@example.com",
      },
      receiver_address_attributes: {
        name: "Li Wei",
        company: "",
        country_id: 5,
        postal_code: "018956",
        city: "Singapore",
        state: "",
        address1: "10 Marina Boulevard",
        address2: "#25-01",
        address3: "",
        phone: "+6591234567",
        email: "li.wei@example.com",
      },
      packages_attributes: [
        {
          carriage_value: 1200,
          unit_of_weight: "kg_cm",
          currency: "USD",
          type_shipping: "items",
          packaging: "box",
          items_attributes: [], // Empty array - items will be added via the table interface
        },
      ],
    }
  }

  // Submit mutation
  const createShipmentMutation = useMutation({
    mutationFn: async (data: CreateShipmentFormValues) => {
      const response = await fetch("/api/v1/shipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create shipment");
      }

      return await response.json();
    },
    onSuccess: () => {
      setIsComplete(true);
      toast({
        title: "Success",
        description: "Your shipment has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create shipment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: CreateShipmentFormValues) {
    createShipmentMutation.mutate(data);
  }

  function handleTabChange(value: string) {
    setActiveTab(value);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SmartShip Pro</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/">
              <a className="font-medium text-gray-600 hover:text-primary">
                Home
              </a>
            </Link>
            <Link href="/shipping">
              <a className="font-medium text-primary">Shipping</a>
            </Link>
            <Link href="/track">
              <a className="font-medium text-gray-600 hover:text-primary">
                Track
              </a>
            </Link>
            <Link href="/shipments">
              <a className="font-medium text-gray-600 hover:text-primary">
                Shipments
              </a>
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden md:inline-block">
                  Welcome, {user.fullName}
                </span>
                <Link href="/admin">
                  <Button variant="outline" className="hidden md:inline-flex">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="hidden md:inline-flex">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth?register=true">
                  <Button className="hidden md:inline-flex">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create a Shipment</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fill out the form below to create a new shipment. We'll provide
              you with tracking information and a receipt for your records.
            </p>
          </div>

          {!isComplete ? (
            <div className="max-w-4xl mx-auto">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">
                        Shipment Details
                      </TabsTrigger>
                      <TabsTrigger value="quotes">Get Quotes</TabsTrigger>
                      <TabsTrigger value="review">Review</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details">
                      <PackageForm form={form} />
                      <AddressForm
                        form={form}
                        type="sender"
                        title="Sender Information"
                      />
                      <AddressForm
                        form={form}
                        type="receiver"
                        title="Recipient Information"
                      />
                      <div className="flex justify-end mt-6">
                        <Button
                          type="button"
                          onClick={() => setActiveTab("quotes")}
                        >
                          Next
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="quotes">
                      <div className="space-y-4">
                        {/* Rate Comparison Modal */}
                        {displayRateComparison && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                              <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                  <h2 className="text-2xl font-bold">
                                    Compare Shipping Rates
                                  </h2>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      setDisplayRateComparison(false)
                                    }
                                  >
                                    <X className="h-5 w-5" />
                                  </Button>
                                </div>
                                <RateComparisonTool />
                              </div>
                            </div>
                          </div>
                        )}

                        <QuoteForm
                          form={form}
                          onShowRateComparison={() =>
                            setDisplayRateComparison(true)
                          }
                        />
                      </div>
                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("details")}
                        >
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setActiveTab("review")}
                        >
                          Next
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="review">
                      <ShippingSummary formData={form.getValues()} />
                      <div className="flex justify-between mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab("quotes")}
                        >
                          Previous
                        </Button>
                        <Button
                          type="submit"
                          disabled={createShipmentMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          {createShipmentMutation.isPending && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Create Shipment
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </form>
              </Form>
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <CardTitle>Shipment Created Successfully</CardTitle>
                </div>
                <CardDescription>
                  Your shipment has been created and is being processed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border border-border rounded-md p-4 flex items-center gap-4">
                    <Package className="h-10 w-10 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Your Reference Number
                      </p>
                      <p className="font-semibold">
                        #{createShipmentMutation.data?.id || "N/A"}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Please keep your reference number for future tracking. Once
                    your shipment is processed, you will receive a tracking
                    number via email.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3 justify-end">
                <Link href="/shipments">
                  <Button variant="outline" className="w-full sm:w-auto">
                    View All Shipments
                  </Button>
                </Link>
                <Link href="/shipping">
                  <Button className="w-full sm:w-auto">
                    Create Another Shipment
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
