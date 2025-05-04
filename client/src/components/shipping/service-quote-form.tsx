import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/config/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ServiceQuoteFormProps {
  shipmentId: number;
  onQuoteSelect: (quote: any) => void;
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
  const { data: shipmentData, isLoading } = useQuery({
    queryKey: ["shipment", shipmentId],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/shipments/${shipmentId}`,
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

  const quotes = shipmentData?.data?.quotes || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quotes.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium mb-2">Không tìm thấy báo giá</h3>
              <p className="text-gray-500 max-w-md">
                Rất tiếc, không có báo giá nào có sẵn cho lô hàng này. Vui lòng
                thử thay đổi thông tin hoặc liên hệ hỗ trợ.
              </p>
            </div>
          </div>
        ) : (
          quotes.map((quote: any, index: number) => (
            <Card
              key={quote.id}
              className="overflow-hidden border-gray-200 transition-all duration-200 hover:shadow-md"
            >
              <div className="border-l-4 border-primary h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-5">
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
                    <div className="text-right bg-primary/5 px-4 py-3 rounded-lg">
                      <div className="text-xs uppercase text-gray-500 font-medium mb-1">
                        Tổng Cộng
                      </div>
                      <div className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        {formatCurrency(quote.prices.total_price)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 pb-5 border-b border-gray-100">
                    <div className="space-y-4">
                      {quote.prices.oversize_fee.map((fee: any, feeIndex: number) => (
                        fee.applied_fees.length > 0 && (
                          <div key={feeIndex} className="bg-gray-50 rounded-lg p-3">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Chi tiết</TableHead>
                                  <TableHead>Phí</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {fee.applied_fees.map((appliedFee: any, appliedFeeIndex: number) => (
                                  <TableRow key={appliedFeeIndex}>
                                    <TableCell>
                                      <div className="font-medium">
                                        {appliedFee.item_id === null
                                          ? "Áp dụng cho tất cả kiện hàng"
                                          : `Kiện ${feeIndex + 1}`}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {appliedFee.description}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      {formatCurrency(parseFloat(appliedFee.amount))}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )
                      ))}
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
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}