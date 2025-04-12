import DashboardLayout from "@/layouts/DashboardLayout";
import BookingForm from "@/components/booking/booking-form";

export default function BookingPage() {
  return (
    <DashboardLayout title="New Booking">
      <BookingForm />
    </DashboardLayout>
  );
}
