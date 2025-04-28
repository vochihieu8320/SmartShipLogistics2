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
    <div className="space-y-6">
      {quotes.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">Không tìm thấy báo giá</h3>
            <p className="text-gray-500 max-w-md">Rất tiếc, không có báo giá nào có sẵn cho lô hàng này. Vui lòng thử thay đổi thông tin hoặc liên hệ hỗ trợ.</p>
          </div>
        </div>
      ) : (
        quotes.map((quote: Quote) => (
          <Card
            key={quote.id}
            className="overflow-hidden border-gray-200 transition-all duration-200 hover:shadow-md"
          >
            <div className="border-l-4 border-primary h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="font-medium text-lg">{quote.provider_name}</div>
                      <div className="mx-2 text-gray-300">•</div>
                      <div className="text-primary">{quote.service_name}</div>
                    </div>
                    <h3 className="font-bold text-xl">{quote.name}</h3>
                  </div>
                  <div className="text-right bg-primary/5 px-4 py-3 rounded-lg">
                    <div className="text-xs uppercase text-gray-500 font-medium mb-1">Tổng Cộng</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
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

                <div className="mb-6 pb-5 border-b border-gray-100">
                  <div className="grid md:grid-cols-4 gap-5 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs uppercase font-medium mb-1">Giá Gốc</p>
                      <p className="font-semibold text-base">
                        {formatCurrency(quote.prices.net_price)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-500 text-xs uppercase font-medium mb-1">Phụ Phí Nhiên Liệu</p>
                      <p className="font-semibold text-base">
                        {formatCurrency(quote.prices.fuel_surcharge)}
                      </p>
                    </div>
                    
                    {quote.prices.peak_season > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 text-xs uppercase font-medium mb-1">Phụ Phí Cao Điểm</p>
                        <p className="font-semibold text-base">
                          {formatCurrency(quote.prices.peak_season)}
                        </p>
                      </div>
                    )}
                    
                    {quote.prices.oversize_fee.some(fee => fee.applied_fees.length > 0) && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 text-xs uppercase font-medium mb-1">Phí Bổ Sung</p>
                        <p className="font-semibold text-base">
                          {formatCurrency(
                            quote.prices.oversize_fee.reduce(
                              (sum, fee) =>
                                sum +
                                fee.applied_fees.reduce(
                                  (feeSum, applied) => feeSum + parseFloat(applied.amount),
                                  0,
                                ),
                              0,
                            )
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    Có sẵn giao ngay
                  </div>
                  <Button
                    className="px-6 py-5 rounded-lg"
                    onClick={async (e) => {
                      e.stopPropagation();
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
                          throw new Error("Không thể chọn dịch vụ");
                        }

                        onQuoteSelect(quote);
                      } catch (error) {
                        console.error("Error selecting service:", error);
                      }
                    }}
                  >
                    Chọn Dịch Vụ Này
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
