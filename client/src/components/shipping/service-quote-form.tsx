import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Quote {
  id: number;
  name: string;
  provider_name: string;
  service_name: string;
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

interface ServiceQuoteFormProps {
  shipmentId: number;
  onQuoteSelect: (quote: Quote) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function ServiceQuoteForm({
  shipmentId,
  onQuoteSelect,
}: ServiceQuoteFormProps) {
  const { data: quoteResponse, isLoading } = useQuery({
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

  const quotes = quoteResponse || [];

  return (
    <div className="space-y-4">
      {quotes.map((quote: Quote) => (
        <Card
          key={quote.id}
          className="cursor-pointer hover:bg-accent/5"
          onClick={() => onQuoteSelect(quote)}
        >
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-lg">{quote.name}</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(
                    quote.prices.net_price +
                      (quote.prices.net_price * quote.prices.fuel_surcharge) /
                        100 +
                      (quote.prices.net_price * quote.prices.peak_season) /
                        100 +
                      quote.prices.oversize_fee.reduce(
                        (sum, fee) =>
                          sum +
                          fee.applied_fees.reduce(
                            (feeSum, applied) =>
                              feeSum + parseFloat(applied.amount),
                            0,
                          ),
                        0,
                      ),
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Giá Gốc</p>
                <p className="font-medium">
                  {formatCurrency(quote.prices.net_price)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Phụ Phí Nhiên Liệu</p>
                <p className="font-medium">
                  {formatCurrency(quote.prices.fuel_surcharge)}
                </p>
              </div>
              {quote.prices.peak_season > 0 && (
                <div>
                  <p className="text-muted-foreground">Phụ Phí Mùa Cao Điểm</p>
                  <p className="font-medium">
                    {formatCurrency(quote.prices.peak_season)}
                  </p>
                </div>
              )}
              {quote.prices.oversize_fee.map((fee, feeIndex) => (
                <div key={feeIndex}>
                  <p className="text-muted-foreground">Phụ Phí Quá Khổ</p>
                  {fee.applied_fees.map((appliedFee, appliedIndex) => (
                    <div key={appliedIndex}>
                      <p className="text-muted-foreground text-xs">
                        {appliedFee.display_name}
                      </p>
                      <p className="font-medium">
                        {formatCurrency(parseFloat(appliedFee.amount))}
                      </p>
                      {appliedFee.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {appliedFee.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <Button
              className="w-full mt-4"
              onClick={async () => {
                try {
                  const response = await fetch(
                    `${API_BASE_URL}/shipments/${shipmentId}/select_service`,
                    {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                      },
                      body: JSON.stringify({
                        provider_id: 1,
                        provider_service_id: quote.id,
                      }),
                    },
                  );

                  if (!response.ok) {
                    throw new Error("Failed to select service");
                  }

                  onQuoteSelect(quote);
                } catch (error) {
                  console.error("Error selecting service:", error);
                }
              }}
            >
              Chọn Dịch Vụ Này
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
