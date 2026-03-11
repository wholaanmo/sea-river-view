export default function AdminOverview() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0F172B] mb-4">Admin Dashboard Rooms</h1>
      <p className="text-gray-600">Welcome to Sea & River View Resort Admin Dashboard</p>
      
      {/* Test cards to verify content is visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="font-semibold text-[#0F172B]">Total Rooms</h3>
          <p className="text-2xl text-[#00B8DB]">45</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="font-semibold text-[#0F172B]">Reservations</h3>
          <p className="text-2xl text-[#00B8DB]">156</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="font-semibold text-[#0F172B]">Staff</h3>
          <p className="text-2xl text-[#00B8DB]">18</p>
        </div>
      </div>
    </div>
  );
}