import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Product {
  description: string;
  quantity: number;
  origin: string;
  unit: string;
  unit_price: number;
  sub_total: number;
}

interface ShippingSummaryProps {
  formData: any;
}

export default function ShippingSummary({ formData }: ShippingSummaryProps) {
  const { shipment } = formData;

  // Get addresses from the form data
  const sender_address_attributes = shipment?.sender_address_attributes || {};
  const receiver_address_attributes = shipment?.receiver_address_attributes || {};

  // Get products from form data
  const products = shipment?.products || [];

  // Get the first package and item (assuming only one for now)
  const firstPackage = shipment?.packages_attributes?.[0] || {};
  const firstItem = firstPackage?.items_attributes?.[0] || {};

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Determine which provider is selected
  const getProviderName = (id: number) => {
    switch (id) {
      case 1:
        return "UPS";
      default:
        return "Unknown";
    }
  };

  // Determine which service is selected
  const getServiceName = (id: number) => {
    switch (id) {
      case 1:
        return "Worldwide Saver";
      case 2:
        return "Worldwide Expedited";
      case 3:
        return "Worldwide Express Freight";
      default:
        return "Unknown";
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
                <p className="font-semibold">
                  {sender_address_attributes?.name}
                </p>
                {sender_address_attributes?.company && (
                  <p className="text-sm text-muted-foreground">
                    {sender_address_attributes.company}
                  </p>
                )}
                <p className="text-sm mt-1">
                  {sender_address_attributes?.address1}
                </p>
                {sender_address_attributes?.address2 && (
                  <p className="text-sm">
                    {sender_address_attributes.address2}
                  </p>
                )}
                <p className="text-sm">
                  {sender_address_attributes?.city},{" "}
                  {sender_address_attributes?.state}{" "}
                  {sender_address_attributes?.postal_code}
                </p>
                <p className="text-sm">
                  Country ID: {sender_address_attributes?.country_id}
                </p>
                <p className="text-sm mt-1">
                  {sender_address_attributes?.phone}
                </p>
                <p className="text-sm">{sender_address_attributes?.email}</p>
              </div>
            </div>

            {/* Receiver Information */}
            <div>
              <h4 className="text-md font-medium mb-2">Recipient</h4>
              <div className="bg-muted p-3 rounded-md">
                <p className="font-semibold">
                  {receiver_address_attributes?.name}
                </p>
                {receiver_address_attributes?.company && (
                  <p className="text-sm text-muted-foreground">
                    {receiver_address_attributes.company}
                  </p>
                )}
                <p className="text-sm mt-1">
                  {receiver_address_attributes?.address1}
                </p>
                {receiver_address_attributes?.address2 && (
                  <p className="text-sm">
                    {receiver_address_attributes.address2}
                  </p>
                )}
                <p className="text-sm">
                  {receiver_address_attributes?.city},{" "}
                  {receiver_address_attributes?.state}{" "}
                  {receiver_address_attributes?.postal_code}
                </p>
                <p className="text-sm">
                  Country ID: {receiver_address_attributes?.country_id}
                </p>
                <p className="text-sm mt-1">
                  {receiver_address_attributes?.phone}
                </p>
                <p className="text-sm">{receiver_address_attributes?.email}</p>
              </div>
            </div>

            {/* Service Information */}
            <div>
              <h4 className="text-md font-medium mb-2">Service Information</h4>
              <div className="bg-muted p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Service Provider:</span>
                  <Badge variant="secondary">
                    {getProviderName(shipment?.provider_id)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Service Type:</span>
                  <Badge variant="secondary">
                    {getServiceName(shipment?.provider_service_id)}
                  </Badge>
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
                    <span className="text-sm text-muted-foreground">
                      Packaging:
                    </span>
                    <p className="font-medium capitalize">
                      {firstPackage.packaging || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Shipping Type:
                    </span>
                    <p className="font-medium capitalize">
                      {firstPackage.type_shipping || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Currency:
                    </span>
                    <p className="font-medium">
                      {firstPackage.currency || "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Unit of Weight:
                    </span>
                    <p className="font-medium">
                      {firstPackage.unit_of_weight || "kg_cm"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Estimated Price */}
            <div>
              <h4 className="text-md font-medium mb-2">Total Price</h4>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground mb-1">
                  {formatCurrency(parseInt(localStorage.getItem("shipment_total_price") || "0"))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Product List</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: Product, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{product.origin}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell>{formatCurrency(product.unit_price)}</TableCell>
                      <TableCell>{formatCurrency(product.sub_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}