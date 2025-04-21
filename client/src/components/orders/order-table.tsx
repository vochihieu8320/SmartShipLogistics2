import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Order, OrderStatus, PaymentStatus, UserRole } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MoreHorizontal, Eye, Edit, Printer, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderTableProps {
  title?: string;
  limit?: number;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case OrderStatus.DELIVERED:
      return "success";
    case OrderStatus.IN_TRANSIT:
      return "info";
    case OrderStatus.PROCESSING:
      return "warning";
    case OrderStatus.RETURNED:
    case OrderStatus.CANCELLED:
      return "destructive";
    default:
      return "secondary";
  }
}

function getPaymentStatusBadgeVariant(status: string) {
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
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function OrderTable({ title = "Orders", limit }: OrderTableProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  
  // Mock user for development purposes
  const user = {
    id: 1,
    username: "admin",
    email: "admin@example.com",
    fullName: "Admin User",
    role: UserRole.ADMIN,
    createdAt: new Date()
  };
  const { toast } = useToast();
  
  // Fetch orders from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/v1/admin/orders"],
    queryFn: async () => {
      const response = await fetch("/api/v1/admin/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      return data.orders;
    },
  });
  
  // Update status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      // In a real app, this would be an API call to update the status
      // For mock demonstration, we're just returning the input
      return { id, status };
    },
    onSuccess: () => {
      // Show success toast
      toast({
        title: "Order updated",
        description: "The order status has been updated successfully.",
      });
      
      setIsUpdateOpen(false);
      // Refetch orders to get updated data
      queryClient.invalidateQueries({ queryKey: ["/api/v1/admin/orders"] });
    },
    onError: (error) => {
      // Show error toast
      toast({
        title: "Error updating order",
        description: (error as Error).message || "Failed to update order status",
        variant: "destructive",
      });
    }
  });
  
  const filteredOrders = useMemo(() => {
    if (!data) return [];
    
    let filtered = [...data];
    
    // Apply status filter
    if (selectedStatus && selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }
    
    // Apply search filter (on order number, carrier, and customer name)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(lowerSearchTerm) ||
        order.carrier.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply limit if provided
    if (limit && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }
    
    // Sort by created date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data, selectedStatus, searchTerm, limit]);
  
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };
  
  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateOpen(true);
  };
  
  const handleStatusChange = (status: string) => {
    if (selectedOrder) {
      updateOrderStatusMutation.mutate({ id: selectedOrder.id, status });
    }
  };
  
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                <SelectItem value={OrderStatus.IN_TRANSIT}>In Transit</SelectItem>
                <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                <SelectItem value={OrderStatus.RETURNED}>Returned</SelectItem>
                <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Carrier</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{order.carrier}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{order.shipmentType}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status) as any} className="capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus) as any} className="capitalize">
                          {order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>${Number(order.totalPrice).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            {(user?.role === UserRole.ADMIN || user?.role === UserRole.MANAGER) && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                                <Edit className="h-4 w-4 mr-2" /> Update Status
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" /> Print Label
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" /> Download AWB
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* View Order Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Created on {selectedOrder && formatDate(selectedOrder.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="mt-4">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Shipment Details</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Shipment Information</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Carrier:</span> {selectedOrder.carrier}</p>
                        <p><span className="font-medium">Service:</span> {selectedOrder.serviceType}</p>
                        <p><span className="font-medium">Type:</span> {selectedOrder.shipmentType}</p>
                        <p><span className="font-medium">AWB Number:</span> {selectedOrder.awbNumber}</p>
                        <p><span className="font-medium">Package Type:</span> {selectedOrder.packageType}</p>
                        <p>
                          <span className="font-medium">Dimensions:</span> 
                          {selectedOrder.packageLength} × {selectedOrder.packageWidth} × {selectedOrder.packageHeight} cm
                        </p>
                        <p><span className="font-medium">Weight:</span> {selectedOrder.packageWeight} kg</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Pricing</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Base Price:</span> ${Number(selectedOrder.basePrice).toFixed(2)}</p>
                        {Number(selectedOrder.insurancePrice) > 0 && (
                          <p><span className="font-medium">Insurance:</span> ${Number(selectedOrder.insurancePrice).toFixed(2)}</p>
                        )}
                        {Number(selectedOrder.additionalFees) > 0 && (
                          <p><span className="font-medium">Additional Fees:</span> ${Number(selectedOrder.additionalFees).toFixed(2)}</p>
                        )}
                        <p><span className="font-medium">Tax:</span> ${Number(selectedOrder.tax).toFixed(2)}</p>
                        <p className="font-semibold mt-2">
                          <span>Total:</span> ${Number(selectedOrder.totalPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Current Status</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(selectedOrder.status) as any} className="capitalize">
                          {selectedOrder.status}
                        </Badge>
                        <Badge variant={getPaymentStatusBadgeVariant(selectedOrder.paymentStatus) as any} className="capitalize">
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="tracking" className="mt-4">
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground">
                      Tracking information will be available here once the carrier provides updates.
                    </p>
                    <Button variant="outline" className="mt-4">
                      Track with {selectedOrder.carrier}
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="payment" className="mt-4">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm font-semibold">Payment Status</h4>
                        <Badge variant={getPaymentStatusBadgeVariant(selectedOrder.paymentStatus) as any} className="capitalize mt-1">
                          {selectedOrder.paymentStatus}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <h4 className="text-sm font-semibold">Total Amount</h4>
                        <p className="text-lg font-bold">${Number(selectedOrder.totalPrice).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 border-t border-border pt-4">
                      <h4 className="text-sm font-semibold mb-2">Payment History</h4>
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No payment records found for this order.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Status Dialog */}
      <Dialog open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status for order {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Select
              value={selectedOrder?.status}
              onValueChange={handleStatusChange}
              disabled={updateOrderStatusMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={OrderStatus.PROCESSING}>Processing</SelectItem>
                <SelectItem value={OrderStatus.IN_TRANSIT}>In Transit</SelectItem>
                <SelectItem value={OrderStatus.DELIVERED}>Delivered</SelectItem>
                <SelectItem value={OrderStatus.RETURNED}>Returned</SelectItem>
                <SelectItem value={OrderStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedOrder) {
                  updateOrderStatusMutation.mutate({
                    id: selectedOrder.id,
                    status: selectedOrder.status
                  });
                }
              }}
              disabled={updateOrderStatusMutation.isPending}
            >
              {updateOrderStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
