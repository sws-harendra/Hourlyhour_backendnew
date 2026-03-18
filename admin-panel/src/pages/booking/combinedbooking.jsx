import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookingService } from "../../services/booking.service";
import { UserService } from "../../services/user.service";

export default function CombinedBookingDetail() {
  const { groupId } = useParams();

  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const STATUS_OPTIONS = [
    "pending",
    "confirmed",
    "on_the_way",
    "completed",
    "cancelled",
  ];

  const fetchGroup = async () => {
    setLoading(true);
    const res = await BookingService.getGroupBookings(groupId);
    setBookings(res.data || []);
    setSelectedStatus(res.data[0]?.status || "");
    setSelectedProvider(res.data[0]?.providerId || "");
    setLoading(false);
  };

  const fetchProviders = async () => {
    const res = await UserService.getAllProviders();
    setProviders(res.data || []);
  };

  const handleAssignAll = async () => {
    try {
      await BookingService.assignProviderToGroup(groupId, selectedProvider);
      alert("Provider assigned to all bookings!");
      fetchGroup();
    } catch {
      alert("Failed to assign");
    }
  };

  const handleStatusAll = async () => {
    try {
      await BookingService.updateGroupStatus(groupId, selectedStatus);
      alert("Status updated for all!");
      fetchGroup();
    } catch {
      alert("Failed to update");
    }
  };

  useEffect(() => {
    fetchGroup();
    fetchProviders();
  }, []);

  if (loading) return <div className="p-10">Loading...</div>;

  const total = bookings.reduce(
    (sum, b) => sum + (b.priceAtBooking || 0),
    0
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h1 className="text-2xl font-bold">
          Group #{groupId}
        </h1>
        <p className="text-gray-500">
          {bookings.length} bookings | ₹{total}
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Status */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Update Status (All)</h2>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={handleStatusAll}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Update All
          </button>
        </div>

        {/* Assign */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Assign Provider (All)</h2>

          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full border p-2 rounded mb-3"
          >
            <option value="">Select</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.phone}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssignAll}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Assign All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-3">#{b.id}</td>
                <td className="p-3">{b.user?.name}</td>
                <td className="p-3">{b.service?.title}</td>
                <td className="p-3">{b.bookingDate}</td>
                <td className="p-3">₹{b.priceAtBooking}</td>
                <td className="p-3">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}