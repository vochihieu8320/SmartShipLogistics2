
import DashboardLayout from "@/layouts/DashboardLayout";
import OrderTable from "@/components/orders/order-table";

export default function OrdersPage() {
  return (
    <DashboardLayout title="Quản Lý Đơn Hàng">
      <OrderTable title="Tất Cả Đơn Hàng" />
    </DashboardLayout>
  );
}
