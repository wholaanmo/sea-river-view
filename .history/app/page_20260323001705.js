// app/page.js
import GuestLayout from '../guest/layout';

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-textPrimary font-playfair mb-4">
        Welcome to SandyFeet Reservation
      </h1>
      <p className="text-textSecondary">
        Your perfect beach getaway awaits...
      </p>
    </div>
  );
}