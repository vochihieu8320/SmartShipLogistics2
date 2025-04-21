import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ShippingSummaryProps {
  formData: any;
}

export default function ShippingSummary({ formData }: ShippingSummaryProps) {
  const { shipment } = formData;
  
  // Get addresses from the correct path in the API structure
  const sender_address_attributes = shipment?.sender_address_attributes || {};
  const receiver_address_attributes = shipment?.receiver_address_attributes || {};
  
  // Get the first package and item (assuming only one for now)
  const firstPackage = shipment?.packages_attributes?.[0] || {};
  const firstItem = firstPackage?.items_attributes?.[0] || {};
  
  // Calculate volumetric weight
  const volumeWeight = firstItem.length && firstItem.width && firstItem.height 
    ? ((firstItem.length * firstItem.width * firstItem.height) / 5000).toFixed(1)
    : "N/A";
    
  // Determine which provider is selected
  const getProviderName = (id: number) => {
    switch(id) {
      case 1: return "FedEx";
      case 2: return "DHL";
      case 3: return "UPS";
      case 4: return "SF Express";
      default: return "Unknown";
    }
  };
  
  // Determine which service is selected
  const getServiceName = (id: number) => {
    switch(id) {
      case 1: return "Standard";
      case 2: return "Express";
      case 3: return "Priority";
      default: return "Unknown";
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4">Shipping Summary</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column - sender, receiver, service */}
          <div className="space-y-6">
            {/* Sender Information */}
            <div>
              <h4 className="text-md font-medium mb-2">Sender</h4>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-semibold">{sender_address_attributes?.name}</p>
                {sender_address_attributes?.company && (
                  <p className="text-sm text-muted-foreground">{sender_address_attributes.company}</p>
                )}
                <p className="text-sm mt-1">{sender_address_attributes?.address1}</p>
                {sender_address_attributes?.address2 && (
                  <p className="text-sm">{sender_address_attributes.address2}</p>
                )}
                <p className="text-sm">{sender_address_attributes?.city}, {sender_address_attributes?.state} {sender_address_attributes?.postal_code}</p>
                <p className="text-sm">Country ID: {sender_address_attributes?.country_id}</p>
                <p className="text-sm mt-1">{sender_address_attributes?.phone}</p>
                <p className="text-sm">{sender_address_attributes?.email}</p>
              </div>
            </div>
            
            {/* Receiver Information */}
            <div>
              <h4 className="text-md font-medium mb-2">Recipient</h4>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-semibold">{receiver_address_attributes?.name}</p>
                {receiver_address_attributes?.company && (
                  <p className="text-sm text-muted-foreground">{receiver_address_attributes.company}</p>
                )}
                <p className="text-sm mt-1">{receiver_address_attributes?.address1}</p>
                {receiver_address_attributes?.address2 && (
                  <p className="text-sm">{receiver_address_attributes.address2}</p>
                )}
                <p className="text-sm">{receiver_address_attributes?.city}, {receiver_address_attributes?.state} {receiver_address_attributes?.postal_code}</p>
                <p className="text-sm">Country ID: {receiver_address_attributes?.country_id}</p>
                <p className="text-sm mt-1">{receiver_address_attributes?.phone}</p>
                <p className="text-sm">{receiver_address_attributes?.email}</p>
              </div>
            </div>
            
            {/* Service Information */}
            <div>
              <h4 className="text-md font-medium mb-2">Service Information</h4>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Service Provider:</span>
                  <Badge variant="secondary">{getProviderName(shipment?.provider_id)}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Service Type:</span>
                  <Badge variant="secondary">{getServiceName(shipment?.provider_service_id)}</Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - package info */}
          <div className="space-y-6">
            {/* Package Information */}
            <div>
              <h4 className="text-md font-medium mb-2">Package Information</h4>
              <div className="bg-muted p-3 rounded-md">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Packaging:</span>
                    <p className="font-medium capitalize">{firstPackage.packaging || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Shipping Type:</span>
                    <p className="font-medium capitalize">{firstPackage.type_shipping || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Currency:</span>
                    <p className="font-medium">{firstPackage.currency || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Unit of Weight:</span>
                    <p className="font-medium">{firstPackage.unit_of_weight || "kg_cm"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Item Details */}
            <div>
              <h4 className="text-md font-medium mb-2">Item Details</h4>
              <div className="bg-muted p-3 rounded-md">
                <p className="mb-2">
                  <span className="font-medium">Description: </span>
                  {firstItem.description || "N/A"}
                </p>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <p className="font-medium">{firstItem.weight || "0"} kg</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Quantity:</span>
                    <p className="font-medium">{firstItem.quantity || "0"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Dimensions (L×W×H):</span>
                    <p className="font-medium">{firstItem.length || "0"} × {firstItem.width || "0"} × {firstItem.height || "0"} cm</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Volumetric Weight:</span>
                    <p className="font-medium">{volumeWeight} kg</p>
                  </div>
                </div>
                
                <div className="border-t border-border mt-3 pt-3">
                  <div className="grid grid-cols-2 gap-x-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Declared Value:</span>
                      <p className="font-medium">{firstPackage.currency || "USD"} {firstItem.value || "0"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Origin:</span>
                      <p className="font-medium">{firstItem.country_of_origin || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Estimated Price (Placeholder) */}
            <div>
              <h4 className="text-md font-medium mb-2">Estimated Price</h4>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">Final pricing will be calculated upon shipment creation</p>
                <p className="font-semibold text-lg">To be determined</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}