import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertPayment, insertPaymentSchema } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type PaymentFormValues = InsertPayment & {
  orderId: string;
}

export default function PaymentForm() {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [orderAmount, setOrderAmount] = useState<number | null>(null);
  
  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(insertPaymentSchema.extend({
      orderId: insertPaymentSchema.shape.orderId.pipe(val => val.toString()),
    })),
    defaultValues: {
      amount: 0,
      paymentMethod: "Credit Card",
      reference: "",
    },
  });
  
  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      const paymentData = {
        ...data,
        orderId: parseInt(data.orderId),
      };
      const res = await apiRequest("POST", "/api/payments", paymentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Payment recorded",
        description: "The payment has been successfully recorded.",
      });
      
      form.reset({
        orderId: "",
        amount: 0,
        paymentMethod: "Credit Card",
        reference: "",
      });
      
      setSelectedOrder("");
      setOrderAmount(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error recording payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(data: PaymentFormValues) {
    createPaymentMutation.mutate(data);
  }
  
  const handleOrderChange = (orderId: string) => {
    setSelectedOrder(orderId);
    
    if (orders) {
      const selectedOrderData = orders.find(order => order.id.toString() === orderId);
      if (selectedOrderData) {
        setOrderAmount(Number(selectedOrderData.totalPrice));
        form.setValue("amount", Number(selectedOrderData.totalPrice));
      }
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleOrderChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an order" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {orders?.map(order => (
                        <SelectItem key={order.id} value={order.id.toString()}>
                          {order.orderNumber} - ${Number(order.totalPrice).toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Amount</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        className="rounded-l-none"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction ID, check number, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="mt-4"
              disabled={createPaymentMutation.isPending || !selectedOrder}
            >
              {createPaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording Payment...
                </>
              ) : (
                "Record Payment"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
