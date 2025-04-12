import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Check, PackageOpen, Package, Truck, InfoIcon } from "lucide-react";

interface TrackingStep {
  status: string;
  location: string;
  timestamp: Date;
  description: string;
}

interface TrackingInfo {
  trackingNumber: string;
  awbNumber: string;
  orderNumber: string;
  status: string;
  carrier: string;
  serviceType: string;
  packageWeight: number;
  packageLength: number;
  packageWidth: number;
  packageHeight: number;
  estimatedDelivery: Date;
  sender: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  recipient: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  // API response may use either trackingEvents or trackingSteps
  trackingEvents: TrackingStep[];
}

interface TrackingDetailProps {
  trackingNumber: string;
}

export default function TrackingDetail({ trackingNumber }: TrackingDetailProps) {
  const { toast } = useToast();
  
  const { data: trackingInfo, isLoading, error } = useQuery<TrackingInfo>({
    queryKey: ['/api/tracking', trackingNumber],
    queryFn: async () => {
      if (!trackingNumber) throw new Error("No tracking number provided");
      const response = await fetch(`/api/tracking/${trackingNumber}`);
      if (!response.ok) throw new Error("Tracking information not found");
      return await response.json();
    },
    enabled: trackingNumber.length > 0,
    refetchOnWindowFocus: false
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error retrieving tracking information",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-500';
      case 'in transit':
      case 'out for delivery':
        return 'bg-blue-500';
      case 'processing':
      case 'package received':
      case 'order created':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <Check className="h-5 w-5" />;
      case 'in transit':
        return <Truck className="h-5 w-5" />;
      case 'out for delivery':
        return <Truck className="h-5 w-5" />;
      case 'processing':
        return <Package className="h-5 w-5" />;
      case 'package received':
        return <PackageOpen className="h-5 w-5" />;
      case 'order created':
        return <InfoIcon className="h-5 w-5" />;
      default:
        return <InfoIcon className="h-5 w-5" />;
    }
  };
  
  // Format address
  const formatAddress = (address: any) => {
    if (!address) return "N/A";
    return (
      <>
        <p>{address.name}</p>
        <p>{address.street}</p>
        <p>{`${address.city}, ${address.state} ${address.postalCode}`}</p>
        <p>{address.country}</p>
      </>
    );
  };
  
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Retrieving tracking information...</p>
      </div>
    );
  }
  
  if (error || !trackingInfo) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Tracking information not found</h3>
        <p className="text-muted-foreground">
          The tracking number "{trackingNumber}" could not be found. Please verify and try again.
        </p>
      </div>
    );
  }
  
  // Sort tracking steps by date (latest first for display)
  const sortedSteps = [...(trackingInfo.trackingEvents || [])].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Current status
  const currentStatus = sortedSteps[0]?.status || "Processing";
  
  // Function to check if the package is currently delayed
  const isDelayed = () => {
    // For this demonstration, we'll consider it delayed if it's past the estimated delivery date
    // and the status is not "Delivered"
    const today = new Date();
    return (
      today > new Date(trackingInfo.estimatedDelivery) && 
      trackingInfo.status.toLowerCase() !== "delivered"
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center space-y-4 pb-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Tracking Details</h2>
          <p className="text-muted-foreground">
            Tracking Number: <span className="font-medium">{trackingInfo.trackingNumber}</span>
          </p>
          {trackingInfo.awbNumber && (
            <p className="text-muted-foreground">
              AWB Number: <span className="font-medium">{trackingInfo.awbNumber}</span>
            </p>
          )}
        </div>
        
        <Badge 
          className={cn(
            "text-white py-1 px-3",
            getStatusColor(currentStatus)
          )}
        >
          {currentStatus}
        </Badge>
        
        {isDelayed() && (
          <Badge variant="destructive">Delayed</Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tracking Timeline */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tracking Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sortedSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex space-x-4">
                  <div className="flex-none">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white",
                      getStatusColor(step.status)
                    )}>
                      {getStatusIcon(step.status)}
                    </div>
                    
                    {/* Vertical line connecting timeline items */}
                    {index < sortedSteps.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mx-auto my-1"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex flex-col space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{step.status}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDateTime(step.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>{step.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Shipment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Shipment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Carrier Information</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Carrier:</div>
                <div className="font-medium">{trackingInfo.carrier}</div>
                
                <div className="text-muted-foreground">Service:</div>
                <div className="font-medium">{trackingInfo.serviceType}</div>
                
                <div className="text-muted-foreground">Est. Delivery:</div>
                <div className="font-medium">
                  {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Package Information</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Weight:</div>
                <div className="font-medium">{trackingInfo.packageWeight} kg</div>
                
                <div className="text-muted-foreground">Dimensions:</div>
                <div className="font-medium">
                  {trackingInfo.packageLength} × {trackingInfo.packageWidth} × {trackingInfo.packageHeight} cm
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Sender</h3>
              <div className="text-sm space-y-1">
                {formatAddress(trackingInfo.sender)}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Recipient</h3>
              <div className="text-sm space-y-1">
                {formatAddress(trackingInfo.recipient)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}