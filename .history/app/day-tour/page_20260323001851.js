// app/day-tour/page.js
import GuestLayout from '../guest/layout';

export default function DayTourPage() {
  return (
    <GuestLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-textPrimary font-playfair mb-4">
          Day Tour Packages
        </h1>
        <p className="text-textSecondary">
          Explore our exciting day tour experiences...
        </p>
      </div>
    </GuestLayout>
  );
}