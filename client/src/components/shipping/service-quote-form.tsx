
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ServiceQuote {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  delivery_time: string;
}

interface ServiceQuoteFormProps {
  shipmentId: number;
  onServiceSelect: (service: ServiceQuote) => void;
}

export default function ServiceQuoteForm({ shipmentId, onServiceSelect }: ServiceQuoteFormProps) {
  const { data: quotes, isLoading } = useQuery({
    queryKey: ['shipmentQuotes', shipmentId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/shipments/${shipmentId}/quote`);
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {quotes?.map((quote: ServiceQuote) => (
        <Card key={quote.id} className="cursor-pointer hover:border-primary">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium">{quote.name}</h3>
              <p className="text-sm text-gray-500">{quote.description}</p>
              <p className="text-sm text-gray-500">Thời gian giao hàng: {quote.delivery_time}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: quote.currency
                }).format(quote.price)}
              </p>
              <Button 
                size="sm" 
                className="mt-2"
                onClick={() => onServiceSelect(quote)}
              >
                Chọn
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
