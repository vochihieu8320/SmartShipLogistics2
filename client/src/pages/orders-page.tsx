import DashboardLayout from "@/layouts/DashboardLayout";
import OrderTable from "@/components/orders/order-table";

export default function OrdersPage() {
  return (
    <DashboardLayout title="Order Management">
      <OrderTable title="All Orders" />
    </DashboardLayout>
  );
}
