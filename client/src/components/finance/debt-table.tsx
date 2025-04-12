import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Order, PaymentStatus } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, Mail, FileText, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DebtTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    staleTime: 60000, // 1 minute
  });
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case PaymentStatus.PAID:
        return "success";
      case PaymentStatus.PARTIAL:
        return "warning";
      case PaymentStatus.UNPAID:
      case PaymentStatus.OVERDUE:
        return "destructive";
      default:
        return "secondary";
    }
  };
  
  const calculateDueDate = (createdAt: Date | string) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 30); // 30 days payment terms
    return date;
  };
  
  const isDueDatePassed = (dueDate: Date) => {
    const today = new Date();
    return dueDate < today;
  };
  
  const sendReminder = (orderNumber: string) => {
    toast({
      title: "Reminder sent",
      description: `Payment reminder sent for order ${orderNumber}`,
    });
  };
  
  const filteredOrders = orders
    ? orders
        .filter(order => 
          order.paymentStatus === PaymentStatus.UNPAID || 
          order.paymentStatus === PaymentStatus.PARTIAL || 
          order.paymentStatus === PaymentStatus.OVERDUE
        )
        .filter(order => 
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
        )
    : [];
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[300px]"
        />
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Export Debit Report
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => {
                const dueDate = calculateDueDate(order.createdAt);
                const isOverdue = isDueDatePassed(dueDate);
                
                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                        {formatDate(dueDate)}
                      </span>
                    </TableCell>
                    <TableCell>${Number(order.totalPrice).toFixed(2)}</TableCell>
                    <TableCell>${Number(order.totalPrice).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getPaymentStatusBadgeVariant(order.paymentStatus) as any} 
                        className="capitalize"
                      >
                        {isOverdue && order.paymentStatus !== PaymentStatus.PAID 
                          ? PaymentStatus.OVERDUE 
                          : order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => sendReminder(order.orderNumber)}>
                            <Mail className="h-4 w-4 mr-2" /> Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="h-4 w-4 mr-2" /> Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" /> View Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No outstanding debts found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
