import { useState } from "react";
import { Link } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package, ArrowRight, CheckCircle2, Loader2, Calculator } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import RateComparisonTool from "@/components/shipping/rate-comparison";

// Define the shipping form schema
const addressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  company: z.string().optional(),
  streetAddress: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
});

const shippingFormSchema = z.object({
  // Sender and recipient
  sender: addressSchema,
  recipient: addressSchema,
  
  // Package details
  shipmentType: z.string({ required_error: "Please select a shipment type" }),
  serviceType: z.string({ required_error: "Please select a service type" }),
  packageType: z.string({ required_error: "Please select a package type" }),
  packageWeight: z.coerce.number().min(0.1, "Package weight must be greater than 0"),
  packageLength: z.coerce.number().min(1, "Package length must be greater than 0"),
  packageWidth: z.coerce.number().min(1, "Package width must be greater than 0"),
  packageHeight: z.coerce.number().min(1, "Package height must be greater than 0"),
  packageQuantity: z.coerce.number().int().min(1, "Package quantity must be at least 1"),
  
  // Shipping details
  description: z.string().min(5, "Description must be at least 5 characters"),
  declaredValue: z.coerce.number().min(1, "Declared value must be greater than 0"),
  carrier: z.string({ required_error: "Please select a carrier" }),
  shippingDate: z.string({ required_error: "Please select a shipping date" }),
  
  // Additional services
  insurance: z.boolean().default(false),
  signature: z.boolean().default(false),
  priority: z.boolean().default(false),
});

type ShippingFormValues = z.infer<typeof shippingFormSchema>;

export default function ShippingPage() {
  const [step, setStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Default values for the form
  const defaultValues: Partial<ShippingFormValues> = {
    sender: user ? {
      name: user.fullName,
      email: user.email,
      phone: "",
      company: "",
      streetAddress: "",
      city: "",
      postalCode: "",
      country: ""
    } : {
      name: "",
      email: "",
      phone: "",
      company: "",
      streetAddress: "",
      city: "",
      postalCode: "",
      country: ""
    },
    recipient: {
      name: "",
      email: "",
      phone: "",
      company: "",
      streetAddress: "",
      city: "",
      postalCode: "",
      country: ""
    },
    shipmentType: "",
    serviceType: "",
    packageType: "",
    packageWeight: undefined,
    packageLength: undefined,
    packageWidth: undefined,
    packageHeight: undefined,
    packageQuantity: 1,
    description: "",
    declaredValue: undefined,
    carrier: "",
    shippingDate: "",
    insurance: false,
    signature: false,
    priority: false
  };
  
  // Form setup
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues,
    mode: "onChange"
  });
  
  // Submit mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: ShippingFormValues) => {
      // If user is not logged in, redirect to login
      if (!user) {
        throw new Error("Please log in to create a shipment");
      }
      
      const response = await apiRequest("POST", "/api/orders", {
        ...data,
        userId: user.id,
        status: "processing",
        paymentStatus: "unpaid",
        // Generate a random tracking/order number
        orderNumber: `ORD${Math.floor(100000 + Math.random() * 900000)}`,
        awbNumber: `AWB${Math.floor(100000 + Math.random() * 900000)}`
      });
      
      return await response.json();
    },
    onSuccess: () => {
      setIsComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create shipment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  function onSubmit(data: ShippingFormValues) {
    createOrderMutation.mutate(data);
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
              <a className="font-medium text-gray-600 hover:text-primary">Home</a>
            </Link>
            <Link href="/shipping">
              <a className="font-medium text-primary">Shipping</a>
            </Link>
            <Link href="/track">
              <a className="font-medium text-gray-600 hover:text-primary">Track</a>
            </Link>
            <a href="/#services" className="font-medium text-gray-600 hover:text-primary">Services</a>
            <a href="/#contact" className="font-medium text-gray-600 hover:text-primary">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden md:inline-block">
                  Welcome, {user.fullName}
                </span>
                <Link href="/admin">
                  <Button variant="outline" className="hidden md:inline-flex">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="outline" className="hidden md:inline-flex">Log In</Button>
                </Link>
                <Link href="/auth?register=true">
                  <Button className="hidden md:inline-flex">Sign Up</Button>
                </Link>
              </>
            )}
            <Button variant="ghost" className="md:hidden p-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create a Shipment</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fill out the form below to create a new shipment. We'll provide you with tracking information and a receipt for your records.
            </p>
          </div>

          {!isComplete ? (
            <div className="max-w-4xl mx-auto">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      1
                    </div>
                    <span className="text-sm mt-1">Sender & Recipient</span>
                  </div>
                  <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div className={`h-full bg-primary ${
                      step > 1 ? "w-full" : "w-0"
                    } transition-all duration-300`}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      2
                    </div>
                    <span className="text-sm mt-1">Package & Service</span>
                  </div>
                  <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div className={`h-full bg-primary ${
                      step > 2 ? "w-full" : "w-0"
                    } transition-all duration-300`}></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 3 ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                    }`}>
                      3
                    </div>
                    <span className="text-sm mt-1">Review & Confirm</span>
                  </div>
                </div>
              </div>

              {/* Shipping Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Sender and Recipient Information */}
                  {step === 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Sender and Recipient Information</CardTitle>
                        <CardDescription>
                          Please provide the contact information for both the sender and the recipient.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Tabs defaultValue="sender">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="sender">Sender</TabsTrigger>
                            <TabsTrigger value="recipient">Recipient</TabsTrigger>
                          </TabsList>
                          <TabsContent value="sender" className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="sender.name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="sender.email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input placeholder="john@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="sender.phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+1 123-456-7890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="sender.company"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Company (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Company Ltd." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="sender.streetAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main St, Apt 4B" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="sender.city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="New York" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="sender.postalCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="10001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="sender.country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                      <Input placeholder="United States" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>
                          <TabsContent value="recipient" className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="recipient.name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Jane Smith" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="recipient.email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input placeholder="jane@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="recipient.phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                      <Input placeholder="+1 987-654-3210" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="recipient.company"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Company (Optional)</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Company Ltd." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={form.control}
                              name="recipient.streetAddress"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="456 Elm St" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="recipient.city"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Los Angeles" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="recipient.postalCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Postal Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="90001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="recipient.country"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                      <Input placeholder="United States" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button
                          type="button"
                          onClick={() => setStep(2)}
                          disabled={
                            !form.formState.isValid ||
                            Object.keys(form.formState.errors).some(key => key.startsWith('sender') || key.startsWith('recipient'))
                          }
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  )}

                  {/* Step 2: Package and Service Information */}
                  {step === 2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Package and Service Information</CardTitle>
                        <CardDescription>
                          Provide details about your package and select your desired shipping service.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Shipment Type</h3>
                          <FormField
                            control={form.control}
                            name="shipmentType"
                            render={({ field }) => (
                              <FormItem>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                >
                                  <FormItem className="flex flex-col space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="document" className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <span>Document</span>
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex flex-col space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="parcel" className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                      <Package className="h-8 w-8 mb-2" />
                                      <span>Parcel</span>
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex flex-col space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="heavy_freight" className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                      <Truck className="h-8 w-8 mb-2" />
                                      <span>Heavy Freight</span>
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Package Details</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="packageType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Package Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select package type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="envelope">Envelope</SelectItem>
                                      <SelectItem value="small_box">Small Box</SelectItem>
                                      <SelectItem value="medium_box">Medium Box</SelectItem>
                                      <SelectItem value="large_box">Large Box</SelectItem>
                                      <SelectItem value="pallet">Pallet</SelectItem>
                                      <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="packageQuantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid md:grid-cols-4 gap-4">
                            <FormField
                              control={form.control}
                              name="packageWeight"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Weight (kg)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.1" min="0.1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="packageLength"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Length (cm)</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
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
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="packageHeight"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Height (cm)</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Shipping Details</h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="carrier"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Carrier</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select carrier" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="fedex">FedEx</SelectItem>
                                      <SelectItem value="dhl">DHL</SelectItem>
                                      <SelectItem value="sf_express">SF Express</SelectItem>
                                      <SelectItem value="ups">UPS</SelectItem>
                                      <SelectItem value="usps">USPS</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="serviceType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Service Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select service type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="standard">Standard</SelectItem>
                                      <SelectItem value="express">Express</SelectItem>
                                      <SelectItem value="priority">Priority</SelectItem>
                                      <SelectItem value="economy">Economy</SelectItem>
                                      <SelectItem value="same_day">Same Day</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="shippingDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Shipping Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="declaredValue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Declared Value ($)</FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Package Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Briefly describe the contents of your package"
                                    className="resize-none min-h-24"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>
                          Previous
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setStep(3)}
                          disabled={
                            !form.formState.isValid ||
                            Object.keys(form.formState.errors).some(key => 
                              !key.startsWith('sender') && !key.startsWith('recipient')
                            )
                          }
                        >
                          Next <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  )}

                  {/* Step 3: Review and Confirm */}
                  {step === 3 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Review and Confirm</CardTitle>
                        <CardDescription>
                          Please review your shipment details before confirming.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h3 className="font-medium border-b pb-2">Sender</h3>
                            <div>
                              <p className="font-medium">{form.getValues("sender.name")}</p>
                              <p>{form.getValues("sender.email")}</p>
                              <p>{form.getValues("sender.phone")}</p>
                              {form.getValues("sender.company") && <p>{form.getValues("sender.company")}</p>}
                              <p className="mt-2">
                                {form.getValues("sender.streetAddress")}<br />
                                {form.getValues("sender.city")}, {form.getValues("sender.postalCode")}<br />
                                {form.getValues("sender.country")}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-medium border-b pb-2">Recipient</h3>
                            <div>
                              <p className="font-medium">{form.getValues("recipient.name")}</p>
                              <p>{form.getValues("recipient.email")}</p>
                              <p>{form.getValues("recipient.phone")}</p>
                              {form.getValues("recipient.company") && <p>{form.getValues("recipient.company")}</p>}
                              <p className="mt-2">
                                {form.getValues("recipient.streetAddress")}<br />
                                {form.getValues("recipient.city")}, {form.getValues("recipient.postalCode")}<br />
                                {form.getValues("recipient.country")}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-medium border-b pb-2">Package Details</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Shipment Type</p>
                              <p className="font-medium capitalize">{form.getValues("shipmentType").replace("_", " ")}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Package Type</p>
                              <p className="font-medium capitalize">{form.getValues("packageType").replace("_", " ")}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Quantity</p>
                              <p className="font-medium">{form.getValues("packageQuantity")}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Weight</p>
                              <p className="font-medium">{form.getValues("packageWeight")} kg</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Dimensions</p>
                              <p className="font-medium">
                                {form.getValues("packageLength")} × {form.getValues("packageWidth")} × {form.getValues("packageHeight")} cm
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Declared Value</p>
                              <p className="font-medium">${form.getValues("declaredValue")}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm text-gray-500">Description</p>
                              <p className="font-medium">{form.getValues("description")}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-medium border-b pb-2">Shipping Details</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3">
                            <div>
                              <p className="text-sm text-gray-500">Carrier</p>
                              <p className="font-medium capitalize">{form.getValues("carrier").replace("_", " ").toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Service Type</p>
                              <p className="font-medium capitalize">{form.getValues("serviceType").replace("_", " ")}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Shipping Date</p>
                              <p className="font-medium">{new Date(form.getValues("shippingDate")).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h3 className="font-medium border-b pb-2">Estimated Costs</h3>
                          <div className="rounded-lg border p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span>Base Shipping Rate</span>
                                <span className="font-medium">$35.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Weight Surcharge</span>
                                <span className="font-medium">$10.00</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Service Fee</span>
                                <span className="font-medium">$5.00</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between">
                                <span className="font-medium">Estimated Total</span>
                                <span className="font-bold">$50.00</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                The final cost may vary based on actual weight and dimensions at the time of shipping.
                                Payment will be processed after shipment verification.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setStep(2)}>
                          Previous
                        </Button>
                        <Button type="submit" disabled={createOrderMutation.isPending}>
                          {createOrderMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>Confirm Shipment</>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  )}
                </form>
              </Form>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white p-8 rounded-lg shadow-sm border">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Shipment Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Your shipment has been successfully created and is now being processed.
                  You will receive a confirmation email with tracking information shortly.
                </p>
                <div className="space-y-2 mb-6 text-left">
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-600">Order Number</span>
                    <span className="font-medium">ORD123456</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-600">Tracking Number</span>
                    <span className="font-medium">AWB123456</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-gray-600">Estimated Total</span>
                    <span className="font-medium">$50.00</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/track">
                    <Button className="gap-2">
                      Track Shipment <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline">Return to Home</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-white">SmartShip Pro</span>
              </div>
              <p className="text-sm">
                Global logistics solutions for businesses and individuals.
              </p>
            </div>
            
            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-1">
                <li><a href="/" className="hover:text-primary">Home</a></li>
                <li><a href="/shipping" className="hover:text-primary">Shipping</a></li>
                <li><a href="/track" className="hover:text-primary">Tracking</a></li>
              </ul>
            </div>
            
            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">Services</h4>
              <ul className="space-y-1">
                <li><a href="#" className="hover:text-primary">Package Delivery</a></li>
                <li><a href="#" className="hover:text-primary">Freight Shipping</a></li>
                <li><a href="#" className="hover:text-primary">International Shipping</a></li>
              </ul>
            </div>
            
            <div className="text-sm">
              <h4 className="text-white text-lg font-semibold mb-2">Contact Us</h4>
              <ul className="space-y-1">
                <li>123 Shipping Street, LC 12345</li>
                <li>+1 (555) 123-4567</li>
                <li>info@smartshippro.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 pt-4 text-center text-sm">
            <p>© {new Date().getFullYear()} SmartShip Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}