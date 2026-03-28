// app/reservation-tracker/page.js
import GuestLayout from '../guest/layout';

export default function ReservationTrackerPage() {
  return (
    <GuestLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-textPrimary font-playfair mb-4">
          Reservation Tracker
        </h1>
        <p className="text-textSecondary">
          Track your reservations here...
        </p>
      </div>
    </GuestLayout>
  );
}