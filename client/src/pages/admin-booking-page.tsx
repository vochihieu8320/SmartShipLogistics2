
import DashboardLayout from "@/layouts/DashboardLayout";
import BookingForm from "@/components/booking/booking-form";

export default function AdminBookingPage() {
  return (
    <DashboardLayout title="Tạo Đơn Vận Chuyển">
      <BookingForm />
    </DashboardLayout>
  );
}
