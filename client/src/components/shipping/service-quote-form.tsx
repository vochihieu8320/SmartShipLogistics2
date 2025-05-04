import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ServiceQuoteFormProps {
  shipmentId: number;
  quotes: any[];
  onQuoteSelect: (quote: any) => void;
}

function formatCurrency(amount: number) {
  if (amount == null || amount == undefined) return 0;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export default function ServiceQuoteForm({
  shipmentId,
  quotes,
  onQuoteSelect,
}: ServiceQuoteFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quotes.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Không tìm thấy báo giá
              </h3>
              <p className="text-gray-500 max-w-md">
                Rất tiếc, không có báo giá nào có sẵn cho lô hàng này. Vui lòng
                thử thay đổi thông tin hoặc liên hệ hỗ trợ.
              </p>
            </div>
          </div>
        ) : (
          quotes.map((quote: any) => (
            <Card
              key={quote.id}
              className="overflow-hidden border-gray-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="border-l-4 border-primary h-full">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center mb-1">
                        <div className="font-medium text-lg">
                          {quote.provider_name}
                        </div>
                        <div className="mx-2 text-gray-300">•</div>
                        <div className="text-primary">{quote.service_name}</div>
                      </div>
                      <h3 className="font-bold text-xl">{quote.name}</h3>
                    </div>

                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div className="text-gray-600">Giá Net</div>
                        <div className="font-medium">
                          {formatCurrency(quote.prices.net_price)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-gray-600">
                          Phụ phí nhiên liệu({quote.prices.fuel_rate}%)
                        </div>
                        <div className="font-medium">
                          {formatCurrency(quote.prices.fuel_surcharge)}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-gray-600">
                          Phụ phí mùa cao điểm
                        </div>
                        <div className="font-medium">
                          {formatCurrency(quote.prices.peak_season)}
                        </div>
                      </div>

                      {(() => {
                        const itemIds = [...new Set(
                          quote.prices.oversize_fee
                            .flatMap((fee) => fee.applied_fees)
                            .map((fee) => fee.item_id)
                            .filter((id) => id)
                        )];

                        return [...itemIds, null].map((itemId) => (
                          quote.prices.oversize_fee.map((fee, pkgIndex) =>
                            fee.applied_fees
                              .filter((appliedFee) =>
                                itemId === null
                                  ? !appliedFee.item_id
                                  : appliedFee.item_id === itemId
                              )
                              .map((appliedFee, feeIndex) => (
                                <div key={`${itemId}-${pkgIndex}-${feeIndex}`} className="flex justify-between items-center text-sm">
                                  <div className="text-gray-600">
                                    {itemId
                                      ? `Phụ phí Quá Khổ (Kiện ${pkgIndex + 1})`
                                      : "Phụ phí Quá Khổ (Tất cả kiện hàng)"}
                                  </div>
                                  <div className="font-medium">
                                    {formatCurrency(
                                      parseFloat(appliedFee.amount)
                                    )}
                                  </div>
                                </div>
                              ))
                          )
                        )).flat(2);
                      })()}

                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-gray-900">
                            Tổng cộng
                          </div>
                          <div className="text-lg font-bold text-primary">
                            {formatCurrency(quote.prices.total_price)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button
                        className="px-6 py-5 rounded-lg"
                        onClick={() => {
                          localStorage.setItem(
                            "shipment_total_price",
                            quote.prices.total_price.toString()
                          );
                          onQuoteSelect(quote);
                        }}
                      >
                        Chọn Dịch Vụ Này
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}