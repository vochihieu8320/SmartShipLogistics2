
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Quote {
  id: number;
  name: string;
  prices: {
    net_price: number;
    fuel_surcharge: number;
    peak_season: number;
    oversize_fee: Array<{
      package: number;
      applied_fees: Array<any>;
    }>;
    total_price: number;
  };
}

interface ServiceQuoteFormProps {
  shipmentId: number;
  onQuoteSelect: (quote: Quote) => void;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export default function ServiceQuoteForm({ shipmentId, onQuoteSelect }: ServiceQuoteFormProps) {
  const { data: quoteResponse, isLoading } = useQuery({
    queryKey: ['shipmentQuotes', shipmentId],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/quote`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
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

  const quotes = quoteResponse?.quote || [];

  return (
    <div className="grid gap-4">
      {quotes.map((quote: Quote) => (
        <Card key={quote.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{quote.name}</h3>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(quote.prices.total_price)}
                </p>
              </div>
              <Button onClick={() => onQuoteSelect(quote)}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Chọn
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Giá Gốc</p>
                <p className="font-medium">{formatCurrency(quote.prices.net_price)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phụ Phí Nhiên Liệu ({quote.prices.fuel_surcharge}%)</p>
                <p className="font-medium">{formatCurrency((quote.prices.net_price * quote.prices.fuel_surcharge) / 100)}</p>
              </div>
              {quote.prices.peak_season > 0 && (
                <div>
                  <p className="text-muted-foreground">Phụ Phí Mùa Cao Điểm ({quote.prices.peak_season}%)</p>
                  <p className="font-medium">{formatCurrency((quote.prices.net_price * quote.prices.peak_season) / 100)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
