import { useEffect, useState } from "react";
import { WarrantyService } from "../../services/warranty.service";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  Search,
  Filter,
} from "lucide-react";

export default function WarrantyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [updateModal, setUpdateModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const res = await WarrantyService.getAllClaims();
      setClaims(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredClaims = claims?.filter((claim) => {
    const matchStatus = !statusFilter || claim.status === statusFilter;
    const matchSearch =
      !search ||
      claim.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      claim.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      claim.booking?.id?.toString().includes(search);
    return matchStatus && matchSearch;
  });

  const handleUpdateStatus = async () => {
    try {
      await WarrantyService.updateClaimStatus(selectedClaim.id, {
        status: updateStatus,
        adminNotes,
      });
      setUpdateModal(false);
      load();
    } catch (error) {
      console.error(error);
      alert("Failed to update claim");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "resolved":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Warranty Claims Management
          </h1>
          <p className="text-gray-600">
            Review and manage warranty claims from customers
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Search by customer name, email, or booking ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {filteredClaims.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No warranty claims found</p>
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Claim Header */}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === claim.id ? null : claim.id)
                  }
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Status Badge */}
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        claim.status
                      )}`}
                    >
                      {getStatusIcon(claim.status)}
                      {claim.status.toUpperCase()}
                    </div>

                    {/* Claim Info */}
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        Claim #{claim.id} • Booking #{claim.booking?.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {claim.user?.name} • {claim.user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Chevron */}
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === claim.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Expanded Details */}
                {expandedId === claim.id && (
                  <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Customer Information
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {claim.user?.name}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {claim.user?.email}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {claim.user?.phone || "N/A"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Warranty & Booking Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">
                          Warranty & Service
                        </h3>
                        <div className="space-y-2 text-sm"><p>
  <span className="text-gray-600">Provider Name:</span>
  <span className="font-medium text-gray-900 ml-2">
    {claim.booking?.provider?.name || "N/A"}
  </span>
</p>

<p>
  <span className="text-gray-600">Provider Phone:</span>
  <span className="font-medium text-gray-900 ml-2">
    {claim.booking?.provider?.phone || "N/A"}
  </span>
</p>

<p>
  <span className="text-gray-600">Provider Email:</span>
  <span className="font-medium text-gray-900 ml-2">
    {claim.booking?.provider?.email || "N/A"}
  </span>
</p>
                          <p>
                            <span className="text-gray-600">Warranty:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {claim.warranty?.title}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Amount:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              ₹{claim.booking?.priceAtBooking}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-600">Claimed On:</span>
                            <span className="font-medium text-gray-900 ml-2">
                              {new Date(claim.claimedAt).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Claim Description */}
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Claim Description
                      </h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {claim.claimDescription || "No description provided"}
                        </p>
                      </div>
                    </div>

                    {/* Admin Notes */}
                    {claim.adminNotes && (
                      <div className="mt-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Admin Notes
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-gray-700 text-sm">
                            {claim.adminNotes}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Action Button 
                    {claim.status === "pending" && (*/}
                      <div className="mt-6">
                        <button
                          onClick={() => {
                            setSelectedClaim(claim);
                            setUpdateStatus("approved");
                            setAdminNotes("");
                            setUpdateModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                        >
                          Review & Update Claim
                        </button>
                      </div>
                    
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {updateModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                Update Claim Status
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Claim #{selectedClaim.id}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {["approved", "rejected", "resolved"].map((s) => (
                    <label key={s} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={updateStatus === s}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700 capitalize">
                        {s}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about the decision..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="4"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setUpdateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
