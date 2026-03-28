// app/rooms/page.js
import GuestLayout from '../guest/layout';

export default function RoomsPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-textPrimary font-playfair mb-4">
        Our Rooms
      </h1>
      <p className="text-textSecondary">
        Discover our comfortable and luxurious rooms...
      </p>
    </div>
  );
}