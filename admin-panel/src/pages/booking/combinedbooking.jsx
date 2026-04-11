import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookingService } from "../../services/booking.service";
import { UserService } from "../../services/user.service";
import { ServiceAreaService } from "../../services/serviceArea.service";
import { PriceUtils } from "./priceUtil";
import SearchableSelect from "../../components/SearchableSelect";

export default function CombinedBookingDetail() {
  const { groupId } = useParams();

  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [serviceArea, setServiceArea] = useState(null);

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

    const firstBooking = res.data?.[0];
    if (firstBooking?.areaId) {
      try {
        const areaRes = await ServiceAreaService.getById(firstBooking.areaId);
        setServiceArea(areaRes.data || null);
      } catch (error) {
        setServiceArea(null);
      }
    } else {
      setServiceArea(null);
    }

    setLoading(false);
  };

  const fetchProviders = async (search = "") => {
    setIsProvidersLoading(true);
    try {
      const res = await UserService.getAllProviders({ search, limit: 100 });
      setProviders(res.data || []);
    } finally {
      setIsProvidersLoading(false);
    }
  };

  const handleAssignAll = async () => {
    try {
      await BookingService.assignProviderToGroup(groupId, selectedProvider);

      // Automatically update status to confirmed if group is pending
      const isAnyPending = bookings.some((b) => b.status === "pending");
      if (isAnyPending) {
        await BookingService.updateGroupStatus(groupId, "confirmed");
      }

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
    (sum, b) => sum + Number(PriceUtils.calculateBookingTotal(b)),
    0
  );

  const providerOptions = providers.map(p => ({
    id: p.id,
    label: p.name,
    sublabel: p.phone
  }));

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const pointInPolygon = (lng, lat, polygon) => {
    const ring = polygon?.coordinates?.[0];
    if (!Array.isArray(ring) || ring.length < 4) return false;

    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = Number(ring[i][0]);
      const yi = Number(ring[i][1]);
      const xj = Number(ring[j][0]);
      const yj = Number(ring[j][1]);

      const intersects =
        yi > lat !== yj > lat &&
        lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
      if (intersects) inside = !inside;
    }

    return inside;
  };

  const isProviderInArea = (provider) => {
    if (!serviceArea?.polygon) return false;
    const latitude = toNumber(provider?.latitude);
    const longitude = toNumber(provider?.longitude);
    if (latitude === null || longitude === null) return false;
    return pointInPolygon(longitude, latitude, serviceArea.polygon);
  };

  const areaProviders = providers.filter(isProviderInArea);
  const otherProviders = providers.filter((p) => !isProviderInArea(p));
  const providerGroups = [
    {
      label: "In Area",
      options: areaProviders.map((p) => ({
        id: p.id,
        label: p.name,
        sublabel: p.phone,
      })),
    },
    {
      label: "Other Providers",
      options: otherProviders.map((p) => ({
        id: p.id,
        label: p.name,
        sublabel: p.phone,
      })),
    },
  ].filter((group) => group.options.length > 0);

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

          <SearchableSelect
            options={providerOptions}
            groups={providerGroups}
            value={selectedProvider}
            onChange={setSelectedProvider}
            onSearch={fetchProviders}
            loading={isProvidersLoading}
            placeholder="Select a provider"
            searchPlaceholder="Search name or number..."
          />
          <p className="mt-2 text-xs text-gray-500">
            In-area providers are shown first in the dropdown.
          </p>

          <button
            onClick={handleAssignAll}
            className="w-full bg-green-600 text-white py-2 rounded"
          >
            Assign All
          </button>

          {serviceArea && (
            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
              Area detected: <span className="font-semibold">{serviceArea.name}</span>
              {" "}The dropdown above is grouped by this area.
            </div>
          )}
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
                <td className="p-3">₹{PriceUtils.calculateBookingTotal(b)}</td>
                <td className="p-3">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
