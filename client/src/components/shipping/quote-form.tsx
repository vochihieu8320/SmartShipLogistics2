import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from "@/config/api";

interface Quote {
  id: number;
  name: string;
  prices: {
    net_price: number;
    fuel_surcharge: number;
    peak_season: number;
    oversize_fee: Array<{
      package: number;
      applied_fees: Array<{
        name: string;
        display_name: string;
        amount: string;
        description: string;
        note: string | null;
      }>;
    }>;
  };
}

interface QuoteFormProps {
  shipmentId: number;
  onQuoteSelect: (quote: Quote) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function QuoteForm({ shipmentId, onQuoteSelect }: QuoteFormProps) {
  const { data: quotes, isLoading } = useQuery({
    queryKey: ["shipmentQuotes", shipmentId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/shipments/${shipmentId}/quote`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch quotes");
      }
      const data = await response.json();
      return data.quotes || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!quotes || quotes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No shipping quotes available at this time.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote: Quote) => (
        <Card 
          key={quote.id} 
          className="cursor-pointer hover:bg-accent/5"
          onClick={() => onQuoteSelect(quote)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{quote.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price:</span>
                <span className="font-medium">{formatCurrency(quote.prices.net_price)}</span>
              </div>

              {quote.prices.fuel_surcharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Fuel Surcharge ({quote.prices.fuel_surcharge}%):
                  </span>
                  <span className="font-medium">
                    {formatCurrency((quote.prices.net_price * quote.prices.fuel_surcharge) / 100)}
                  </span>
                </div>
              )}

              {quote.prices.peak_season > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Peak Season Surcharge ({quote.prices.peak_season}%):
                  </span>
                  <span className="font-medium">
                    {formatCurrency((quote.prices.net_price * quote.prices.peak_season) / 100)}
                  </span>
                </div>
              )}

              {quote.prices.oversize_fee.map((fee, index) => (
                <div key={index} className="mt-2 pt-2 border-t">
                  <div className="text-sm font-medium mb-1">
                    Additional Fees - Package #{fee.package}
                  </div>
                  {fee.applied_fees.map((appliedFee, feeIndex) => (
                    <div key={feeIndex} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{appliedFee.display_name}:</span>
                      <span>{formatCurrency(parseFloat(appliedFee.amount))}</span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="mt-4 pt-2 border-t flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span className="text-primary">
                  {formatCurrency(
                    quote.prices.net_price +
                    (quote.prices.net_price * quote.prices.fuel_surcharge) / 100 +
                    (quote.prices.net_price * quote.prices.peak_season) / 100 +
                    quote.prices.oversize_fee.reduce(
                      (sum, fee) =>
                        sum +
                        fee.applied_fees.reduce(
                          (feeSum, applied) => feeSum + parseFloat(applied.amount),
                          0
                        ),
                      0
                    )
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}