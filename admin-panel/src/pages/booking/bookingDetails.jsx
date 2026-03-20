import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserService } from "../../services/user.service";
import { BookingService } from "../../services/booking.service";
import { PriceUtils } from "./priceUtil";

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchBooking = async () => {
    const { data } = await BookingService.getBookingDetail(id);
    setBooking(data);
    setSelectedStatus(data.status);
    setSelectedProvider(data.providerId || "");
  };

  const fetchProviders = async () => {
    const data = await UserService.getAllProviders();
    console.log(data, data.data);
    setProviders(data.data);
  };

  const handleAssign = async () => {
    setIsAssigning(true);
    try {
      await BookingService.assignProvider(id, selectedProvider);
      await fetchBooking();
      alert("Provider assigned successfully!");
    } catch {
      alert("Failed to assign provider");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await BookingService.updateStatus(id, selectedStatus);
      await fetchBooking();
      alert("Status updated successfully!");
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const STATUS_OPTIONS = [
    "pending",
    "confirmed",
    "on_the_way",
    "completed",
    "cancelled",
  ];

  useEffect(() => {
    fetchBooking();
    fetchProviders();
  }, []);

  if (!booking)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Loading booking details...
          </p>
        </div>
      </div>
    );

  const statusConfig = {
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    confirmed: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    on_the_way: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
      dot: "bg-indigo-500",
    },
    completed: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    cancelled: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
    },
  };

  const currentStatus = statusConfig[booking.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Bookings
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Booking Details
              </h1>
              <p className="text-gray-500 mt-1">Reference #{booking.id}</p>
            </div>
            <div
              className={`inline-flex items-center px-4 py-2 rounded-lg border ${currentStatus.border} ${currentStatus.bg}`}
            >
              <span
                className={`w-2 h-2 rounded-full ${currentStatus.dot} mr-2`}
              ></span>
              <span
                className={`text-sm font-semibold uppercase tracking-wide ${currentStatus.text}`}
              >
                {booking.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Customer Information
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                    {booking.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.user?.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {booking.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Service Details
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {booking.service?.title}
                    </h3>
                    <p className="text-gray-600">
                      {booking.service?.description}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{PriceUtils.calculateBookingTotal(booking)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total Amount
                    </div>
                  </div>
                </div>
              </div>
            </div>
{/* Pricing Details */}
<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
    <h2 className="text-lg font-semibold text-gray-900">
      Pricing Details
    </h2>
  </div>

  <div className="p-6 space-y-4">
    {booking.addons && booking.addons.length > 0 && booking.addons.map((addon) => {
      const addonPrice = Number(addon.rate?.price || addon.price || 0);
      return (
      <div
        key={addon.id}
        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50"
      >
        <div>
          <div className="font-semibold text-gray-900">
            {addon.title || addon.service?.title || "Addon"}
          </div>

          <div className="text-sm text-gray-500 mt-1">
            Qty: {addon.quantity}
          </div>

          <div className="text-xs text-gray-400 mt-1">
            Status: {addon.status}
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-blue-600">
            ₹{addonPrice * addon.quantity}
          </div>
          <div className="text-xs text-gray-500">
            ₹{addonPrice} / unit
          </div>
        </div>
      </div>
    )})}

    {/* Pricing Breakdown */}
    <div className="pt-4 border-t border-gray-200 space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Base Service</span>
        <span>₹{booking.basePriceAtBooking}</span>
      </div>

      {booking.addons && booking.addons.length > 0 && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Addons (Approved)</span>
          <span>
            ₹{PriceUtils.calculateAddonsTotal(booking).toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex justify-between text-sm text-gray-600">
        <span>Tax ({booking.taxPercentageAtBooking || 0}%)</span>
        <span>₹{PriceUtils.calculateTax(booking)}</span>
      </div>

      <div className="flex justify-between pt-2 border-t border-gray-200 text-lg font-bold text-gray-900">
        <span>Final Amount</span>
        <span className="text-blue-600">₹{PriceUtils.calculateBookingTotal(booking)}</span>
      </div>
    </div>
  </div>
</div>
            {/* Schedule & Location */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Schedule & Location
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Date
                      </div>
                      <div className="text-gray-900 font-medium">
                        {booking.bookingDate}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Time
                      </div>
                      <div className="text-gray-900 font-medium">
                        {new Date(booking.bookingTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Location
                      </div>
                      <div className="text-gray-900 font-medium">
                        {booking.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Update Status
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Booking Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium transition-all"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleStatusUpdate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Update Status
                </button>
              </div>
            </div>

            {/* Assign Provider */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Service Provider
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium transition-all"
                  >
                    <option value="">Select a provider</option>
                    {providers.length > 0 &&
                      providers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {p.phone}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={handleAssign}
                  disabled={!selectedProvider || isAssigning}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
                >
                  {isAssigning ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Assigning...
                    </span>
                  ) : (
                    "Assign Provider"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
