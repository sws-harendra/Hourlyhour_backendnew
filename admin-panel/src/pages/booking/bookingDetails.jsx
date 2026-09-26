import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { UserService } from "../../services/user.service";
import { BookingService } from "../../services/booking.service";
import { ServiceAreaService } from "../../services/serviceArea.service";
import { PriceUtils } from "./priceUtil";
import {
  MapPin,
  X,
  Info,
  Phone,
  Mail,
  Star,
  Briefcase,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import SearchableSelect from "../../components/SearchableSelect";

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [serviceArea, setServiceArea] = useState(null);
  const [providers, setProviders] = useState([]);
  const [isProvidersLoading, setIsProvidersLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [mapProvider, setMapProvider] = useState(null);

  // Provider Detail Modal state
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [inspectProvider, setInspectProvider] = useState(null);
  const [providerBookings, setProviderBookings] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState("overview"); // "overview" | "active" | "all"

  const fetchBooking = async () => {
    const { data } = await BookingService.getBookingDetail(id);
    setBooking(data);
    setSelectedStatus(data.status);
    setSelectedProvider(data.providerId || "");

    if (data?.areaId) {
      try {
        const areaRes = await ServiceAreaService.getById(data.areaId);
        setServiceArea(areaRes.data || null);
      } catch (err) {
        setServiceArea(null);
      }
    } else {
      setServiceArea(null);
    }
  };

  const fetchProviders = async (search = "") => {
    setIsProvidersLoading(true);
    try {
      const data = await UserService.getAllProviders({ search, limit: 100 });
      setProviders(data.data || []);
    } finally {
      setIsProvidersLoading(false);
    }
  };

  const handleOpenProviderDetails = async (providerOrId, initialTab = "overview") => {
    if (!providerOrId) return;

    let targetProvider = null;
    if (typeof providerOrId === "object" && providerOrId !== null) {
      targetProvider = providerOrId;
    } else {
      targetProvider = providers.find((p) => p.id === providerOrId) ||
        (booking?.provider?.id === providerOrId ? booking.provider : { id: providerOrId });
    }

    setInspectProvider(targetProvider);
    setModalActiveTab(initialTab);
    setShowProviderModal(true);
    setModalLoading(true);

    try {
      const res = await BookingService.getAll({
        page: 1,
        limit: 1000,
        providerId: targetProvider.id,
      });
      setProviderBookings(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to load provider bookings:", err);
      setProviderBookings([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleOpenProviderMap = (providerOrId) => {
    if (!providerOrId) return;

    let targetProvider = null;
    if (typeof providerOrId === "object" && providerOrId !== null) {
      targetProvider = providerOrId;
    } else {
      targetProvider = providers.find((p) => p.id === providerOrId) ||
        (booking?.provider?.id === providerOrId ? booking.provider : { id: providerOrId });
    }

    setMapProvider(targetProvider);
    setShowMap(true);
  };

  const providerStats = useMemo(() => {
    const total = providerBookings.length;
    const completed = providerBookings.filter((b) => b.status === "completed");
    const cancelled = providerBookings.filter((b) => b.status === "cancelled");
    const active = providerBookings.filter(
      (b) =>
        b.status === "confirmed" ||
        b.status === "on_the_way" ||
        b.status === "pending"
    );
    const onTheWay = providerBookings.filter((b) => b.status === "on_the_way");
    const confirmed = providerBookings.filter((b) => b.status === "confirmed");
    const pending = providerBookings.filter((b) => b.status === "pending");

    return {
      total,
      completed: completed.length,
      cancelled: cancelled.length,
      active: active.length,
      activeBookings: active,
      onTheWay: onTheWay.length,
      confirmed: confirmed.length,
      pending: pending.length,
    };
  }, [providerBookings]);

  const handleAssign = async (force = false) => {
    setIsAssigning(true);
    try {
      await BookingService.assignProvider(id, selectedProvider, force);

      // Automatically update status to confirmed if it's currently pending
      if (booking.status === "pending") {
        await BookingService.updateStatus(id, "confirmed");
      }

      await fetchBooking();
      fetchProviders();
      alert("Provider assigned successfully!");
    } catch (err) {
      console.error("Assignment error:", err);
      const resData = err?.response?.data;
      if (err?.response?.status === 409 && resData?.conflict) {
        const proceed = window.confirm(
          `⚠️ WARNING: ${resData.message}\n\nDo you still want to force assign this booking to this provider?`
        );
        if (proceed) {
          setIsAssigning(false);
          return handleAssign(true);
        }
      } else {
        alert(resData?.message || "Failed to assign provider");
      }
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

  const mapProviderToOption = (p) => {
    const activeCount = Number(p.activeBookingsCount || 0);
    const isCurrentAssigned = booking?.providerId && String(booking.providerId) === String(p.id);
    const isBusy = activeCount > 0 && !isCurrentAssigned;

    return {
      id: p.id,
      label: p.name,
      sublabel: p.phone,
      provider: p,
      isBusy,
      badge: isCurrentAssigned
        ? "Assigned Here"
        : isBusy
        ? `Busy (${activeCount} active)`
        : "Available",
      badgeColor: isCurrentAssigned
        ? "bg-blue-100 text-blue-800 border border-blue-200"
        : isBusy
        ? "bg-amber-100 text-amber-800 border border-amber-200"
        : "bg-emerald-100 text-emerald-800 border border-emerald-200",
    };
  };

  const providerOptions = providers.map(mapProviderToOption);

  const areaProviders = providers.filter(isProviderInArea);
  const otherProviders = providers.filter((p) => !isProviderInArea(p));
  const providerGroups = [
    {
      label: "In Area",
      options: areaProviders.map(mapProviderToOption),
    },
    {
      label: "Other Providers",
      options: otherProviders.map(mapProviderToOption),
    },
  ].filter((group) => group.options.length > 0);

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
                {booking.addons &&
                  booking.addons.length > 0 &&
                  booking.addons.map((addon) => {
                    const addonPrice = Number(
                      addon.rate?.price || addon.price || 0,
                    );
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
                    );
                  })}

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
                    <span className="text-blue-600">
                      ₹{PriceUtils.calculateBookingTotal(booking)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Payment Information
                </h2>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    booking.paymentStatus === "paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {booking.paymentStatus || "pending"}
                </span>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Payment Method
                    </div>
                    <div className="text-gray-900 font-semibold flex items-center gap-1.5">
                      {booking.paymentMethod === "cash" ? (
                        <>
                          <span className="text-base">💵</span> Cash on Delivery
                        </>
                      ) : booking.paymentMethod === "online" ? (
                        <>
                          <span className="text-base">📱</span> Online (UPI / QR)
                        </>
                      ) : (
                        <span className="text-gray-400">Not selected yet</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Payment Status
                    </div>
                    <div className="text-gray-900 font-semibold capitalize">
                      {booking.paymentStatus || "Pending"}
                      {booking.paidAt && (
                        <span className="text-xs text-gray-500 block font-normal">
                          Paid: {new Date(booking.paidAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cash Payment Proof Picture */}
                {booking.cashProofImage && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <span className="text-base">📷</span> Cash Payment Proof (Uploaded by Provider)
                    </div>
                    <div className="relative group inline-block">
                      <a
                        href={booking.cashProofImage}
                        target="_blank"
                        rel="noreferrer"
                        title="Click to view full photo"
                      >
                        <img
                          src={booking.cashProofImage}
                          alt="Cash Payment Proof"
                          className="h-40 w-auto max-w-xs object-cover rounded-xl border border-gray-200 shadow-xs hover:opacity-90 transition-opacity"
                        />
                        <div className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                          ↗ Click to view full image
                        </div>
                      </a>
                    </div>
                  </div>
                )}
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
                        {booking?.bookingTime}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 ">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">
                  Service Provider
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Assign Provider
                    </label>
                    {selectedProvider && (
                      <button
                        type="button"
                        onClick={() => handleOpenProviderDetails(selectedProvider, "overview")}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="View Selected Provider Details"
                      >
                        <Info className="w-3.5 h-3.5" />
                        Provider Info
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <SearchableSelect
                        options={providerOptions}
                        groups={providerGroups}
                        value={selectedProvider}
                        onChange={setSelectedProvider}
                        onSearch={fetchProviders}
                        onOptionAction={(opt) => handleOpenProviderDetails(opt.id, "overview")}
                        onOptionLocation={(opt) => handleOpenProviderMap(opt.provider || opt.id)}
                        loading={isProvidersLoading}
                        placeholder="Select a provider"
                        searchPlaceholder="Search name or number..."
                      />
                    </div>
                    {selectedProvider && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenProviderMap(selectedProvider)}
                          className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-200 transition-colors"
                          title="View provider live/current location on map"
                        >
                          <MapPin className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenProviderDetails(selectedProvider, "overview")}
                          className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg border border-blue-200 transition-colors"
                          title="View provider profile, active bookings & history"
                        >
                          <Info className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                    <span>In-area providers first.</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 inline" /> Location
                    </span>
                    <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                      <Info className="w-3.5 h-3.5 inline" /> Details & Bookings
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => handleAssign(false)}
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

                {booking.provider && (
                  <div className="pt-4 border-t border-gray-100 mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Current Provider
                        </div>
                        <div className="text-gray-900 font-bold">
                          {booking.provider.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.provider.phone}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenProviderDetails(booking.provider, "overview")}
                          className="flex flex-col items-center gap-1 p-2 hover:bg-blue-50 rounded-lg group transition-all"
                          title="View Provider Details & Bookings"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Info className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">
                            Details
                          </span>
                        </button>

                        <button
                          onClick={() => setShowMap(true)}
                          className="flex flex-col items-center gap-1 p-2 hover:bg-green-50 rounded-lg group transition-all"
                          title="Track Current Location"
                        >
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-bold text-green-700 uppercase tracking-tight">
                            Track Location
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {serviceArea && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                    Area detected:{" "}
                    <span className="font-semibold">{serviceArea.name}</span>{" "}
                    The dropdown above is grouped by this area.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🚀 PROVIDER DETAILS MODAL (CURRENT BOOKINGS, PAST BOOKINGS & WORKLOAD)    */}
        {/* ========================================================================= */}
        {showProviderModal && inspectProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
              
              {/* Modal Header */}
              <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white p-6 relative">
                <button
                  onClick={() => setShowProviderModal(false)}
                  className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/15 border-2 border-white/30 flex items-center justify-center font-black text-2xl shadow-inner backdrop-blur-md">
                      {(inspectProvider.name || "P")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                          {inspectProvider.name || "Service Provider"}
                        </h2>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            inspectProvider.status === "active"
                              ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
                              : "bg-white/20 text-white/90"
                          }`}
                        >
                          {inspectProvider.status || "active"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-blue-100/90 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 opacity-80" />
                          {inspectProvider.phone || "No phone"}
                        </span>
                        {inspectProvider.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 opacity-80" />
                            {inspectProvider.email}
                          </span>
                        )}
                        <span className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md border border-white/10">
                          <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                          <strong className="text-white">
                            {Number(inspectProvider.averageRating || 0).toFixed(1)}
                          </strong>
                          <span className="text-white/70">
                            ({inspectProvider.totalReviews || 0} reviews)
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProviderMap(inspectProvider)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 text-white"
                      title="View live map location"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                      Map Location
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/15">
                  <button
                    onClick={() => setModalActiveTab("overview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      modalActiveTab === "overview"
                        ? "bg-white text-indigo-900 shadow-md"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Overview
                  </button>

                  <button
                    onClick={() => setModalActiveTab("active")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      modalActiveTab === "active"
                        ? "bg-white text-indigo-900 shadow-md"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Current Active Jobs
                    {providerStats.active > 0 && (
                      <span className={`text-xs px-2 py-0.2 rounded-full font-bold ${
                        modalActiveTab === "active" ? "bg-amber-100 text-amber-900" : "bg-amber-400 text-slate-900"
                      }`}>
                        {providerStats.active}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setModalActiveTab("all")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      modalActiveTab === "all"
                        ? "bg-white text-indigo-900 shadow-md"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    All Bookings ({providerStats.total})
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
                {modalLoading ? (
                  <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm font-medium">Fetching provider bookings & workload...</p>
                  </div>
                ) : (
                  <>
                    {/* TAB 1: OVERVIEW */}
                    {modalActiveTab === "overview" && (
                      <div className="space-y-5">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                              Total Bookings
                            </span>
                            <h3 className="text-2xl font-black text-slate-800 mt-1">
                              {providerStats.total}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Lifetime assigned</p>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                              Active / Ongoing
                            </span>
                            <h3 className="text-2xl font-black text-amber-600 mt-1">
                              {providerStats.active}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {providerStats.onTheWay} on way, {providerStats.confirmed} confirmed
                            </p>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                              Completed
                            </span>
                            <h3 className="text-2xl font-black text-emerald-600 mt-1">
                              {providerStats.completed}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {providerStats.total > 0
                                ? `${Math.round((providerStats.completed / providerStats.total) * 100)}% completed`
                                : "0%"}
                            </p>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-rose-200/80 shadow-xs">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
                              Cancelled
                            </span>
                            <h3 className="text-2xl font-black text-rose-600 mt-1">
                              {providerStats.cancelled}
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {providerStats.total > 0
                                ? `${Math.round((providerStats.cancelled / providerStats.total) * 100)}% cancel rate`
                                : "0%"}
                            </p>
                          </div>
                        </div>

                        {/* Current Active Workload Notice */}
                        {providerStats.active > 0 ? (
                          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                                Current Ongoing Jobs ({providerStats.active})
                              </span>
                              <button
                                onClick={() => setModalActiveTab("active")}
                                className="text-xs font-semibold text-amber-800 hover:underline"
                              >
                                View All Active →
                              </button>
                            </div>
                            <div className="space-y-2">
                              {providerStats.activeBookings.slice(0, 3).map((b) => (
                                <div
                                  key={b.id}
                                  className="bg-white p-3 rounded-lg border border-amber-200/70 flex items-center justify-between gap-3 text-xs"
                                >
                                  <div>
                                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                                      <span>#{b.id} - {b.service?.title || "Service"}</span>
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                                        {b.status}
                                      </span>
                                    </div>
                                    <p className="text-slate-500 mt-0.5">
                                      📍 {b.location || "N/A"} • 📅 {b.bookingDate || "N/A"} {b.bookingTime ? `at ${b.bookingTime}` : ""}
                                    </p>
                                  </div>
                                  <a
                                    href={`/bookings`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 font-semibold hover:underline shrink-0 flex items-center gap-1"
                                  >
                                    View <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                            <div>
                              <p className="text-xs font-bold text-emerald-900">
                                Available for immediate assignment
                              </p>
                              <p className="text-[11px] text-emerald-700">
                                This provider currently has no active or ongoing jobs.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: ACTIVE JOBS */}
                    {modalActiveTab === "active" && (
                      <div className="space-y-3">
                        {providerStats.active === 0 ? (
                          <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                            <p className="text-slate-700 font-semibold text-sm">No Active Jobs Assigned</p>
                            <p className="text-slate-400 text-xs mt-1">Provider is free to take this booking.</p>
                          </div>
                        ) : (
                          providerStats.activeBookings.map((b) => (
                            <div
                              key={b.id}
                              className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs hover:border-amber-400 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">
                                      Booking #{b.id}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase bg-amber-100 text-amber-800">
                                      {b.status}
                                    </span>
                                  </div>
                                  <p className="text-sm font-semibold text-indigo-700 mt-1">
                                    🛠 {b.service?.title || "Service"}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span>{b.location || "No address provided"}</span>
                                  </p>
                                  <p className="text-xs text-slate-500 mt-0.5">
                                    📅 Date: {b.bookingDate || "N/A"} | ⏰ Time: {b.bookingTime || "N/A"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-xs font-bold text-slate-700 block">
                                    ₹{Number(b.priceAtBooking || 0).toLocaleString("en-IN")}
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    Customer: {b.user?.name || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* TAB 3: ALL BOOKINGS */}
                    {modalActiveTab === "all" && (
                      <div className="space-y-3">
                        {providerBookings.length === 0 ? (
                          <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
                            <p className="text-slate-500 text-sm">No bookings recorded for this provider.</p>
                          </div>
                        ) : (
                          providerBookings.slice(0, 20).map((b) => (
                            <div
                              key={b.id}
                              className="bg-white p-3.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">#{b.id}</span>
                                  <span className="font-semibold text-slate-700">{b.service?.title || "Service"}</span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      b.status === "completed"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : b.status === "cancelled"
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {b.status}
                                  </span>
                                </div>
                                <p className="text-slate-500 mt-1">
                                  📍 {b.location || "N/A"} • 📅 {b.bookingDate || "N/A"}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="font-bold text-slate-800">
                                  ₹{Number(b.priceAtBooking || 0).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                        {providerBookings.length > 20 && (
                          <p className="text-center text-xs text-slate-400 pt-2">
                            Showing latest 20 of {providerBookings.length} total bookings
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Provider ID: #{inspectProvider.id}
                </span>
                <button
                  type="button"
                  onClick={() => setShowProviderModal(false)}
                  className="px-5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMap && (mapProvider || booking.provider) && (() => {
          const activeMapProvider = mapProvider || booking.provider;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-linear-to-r from-green-600 to-emerald-600 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        Provider Current Location
                      </h3>
                      <p className="text-xs text-white/80">
                        Tracking {activeMapProvider.name || "Provider"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowMap(false);
                      setMapProvider(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6">
                  {activeMapProvider.latitude && activeMapProvider.longitude ? (
                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner h-[500px]">
                      <iframe
                        title="Provider Location"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${activeMapProvider.latitude},${activeMapProvider.longitude}&z=15&output=embed`}
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[500px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <MapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium text-lg">
                        Location data not available
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {activeMapProvider.name || "Provider"} has not shared their current location yet
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => {
                      setShowMap(false);
                      setMapProvider(null);
                    }}
                    className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
