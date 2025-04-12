import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { BookingFormValues, bookingFormSchema, ShipmentTypes, Carriers, ServiceTypes, PackageTypes } from "@shared/schema";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ShippingDetails from "./shipping-details";
import SenderRecipient from "./sender-recipient";
import PackageService from "./package-service";
import ReviewConfirm from "./review-confirm";

const defaultValues: BookingFormValues = {
  shipmentType: ShipmentTypes.DOMESTIC,
  carrier: Carriers.UPS,
  serviceType: ServiceTypes.STANDARD,
  shippingDate: new Date().toISOString().split('T')[0],
  reference: "",
  
  senderName: "",
  senderCompany: "",
  senderPhone: "",
  senderEmail: "",
  senderStreetAddress: "",
  senderCity: "",
  senderPostalCode: "",
  senderCountry: "",
  
  recipientName: "",
  recipientCompany: "",
  recipientPhone: "",
  recipientEmail: "",
  recipientStreetAddress: "",
  recipientCity: "",
  recipientPostalCode: "",
  recipientCountry: "",
  
  packageWeight: 1,
  packageLength: 10,
  packageWidth: 10,
  packageHeight: 10,
  packageType: PackageTypes.BOX,
  packageQuantity: 1,
  description: "",
  declaredValue: 0,
  
  insurance: false,
  signatureRequired: false,
  saturdayDelivery: false,
  
  termsAccepted: false,
};

export default function BookingForm() {
  const [activeStep, setActiveStep] = useState("shipping-details");
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues,
    mode: "onChange",
  });
  
  const createOrderMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const res = await apiRequest("POST", "/api/orders", data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/recent-orders"] });
      
      toast({
        title: "Shipment booked successfully!",
        description: `Your order has been created with tracking number: ${data.orderNumber}`,
      });
      
      navigate("/orders");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating shipment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: BookingFormValues) {
    createOrderMutation.mutate(data);
  }
  
  // Calculate step indicator based on active step
  const steps = [
    { id: "shipping-details", label: "Shipment Details" },
    { id: "sender-recipient", label: "Sender & Recipient" },
    { id: "package-service", label: "Package & Service" },
    { id: "review-confirm", label: "Review & Confirm" },
  ];
  
  const activeStepIndex = steps.findIndex(step => step.id === activeStep);
  
  function goToNextStep() {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1].id);
    }
  }
  
  function goToPreviousStep() {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1].id);
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">New Shipment Booking</h3>
        <p className="text-sm text-neutral-500">Complete all required information to book a new shipment</p>
      </div>
      
      <div className="p-4">
        {/* Progress tracker */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px]">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index <= activeStepIndex 
                      ? "bg-primary text-white" 
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {index + 1}
                </div>
                <div className={`ml-2 text-sm font-medium ${
                  index <= activeStepIndex ? "text-neutral-800" : "text-neutral-500"
                }`}>
                  {step.label}
                </div>
                
                {/* Connector line between steps */}
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    index < activeStepIndex ? "bg-primary" : "bg-neutral-200"
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeStep} onValueChange={setActiveStep}>
              <TabsList className="hidden">
                {steps.map(step => (
                  <TabsTrigger key={step.id} value={step.id}>{step.label}</TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="shipping-details">
                <ShippingDetails form={form} />
                <div className="mt-8 flex justify-end">
                  <Button 
                    type="button" 
                    onClick={goToNextStep}
                  >
                    Continue to Sender & Recipient
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="sender-recipient">
                <SenderRecipient form={form} />
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goToPreviousStep}
                  >
                    Back to Shipment Details
                  </Button>
                  <Button 
                    type="button" 
                    onClick={goToNextStep}
                  >
                    Continue to Package & Service
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="package-service">
                <PackageService form={form} />
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goToPreviousStep}
                  >
                    Back to Sender & Recipient
                  </Button>
                  <Button 
                    type="button" 
                    onClick={goToNextStep}
                  >
                    Continue to Review & Confirm
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="review-confirm">
                <Alert className="mb-6 bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    Please review all shipment details before confirming. You won't be able to modify this information once the order is placed.
                  </AlertDescription>
                </Alert>
                
                <ReviewConfirm form={form} />
                
                <div className="mt-8 flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goToPreviousStep}
                  >
                    Back to Package & Service
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Creating Order..." : "Confirm and Book Shipment"}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </div>
    </div>
  );
}
