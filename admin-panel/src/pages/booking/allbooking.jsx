// Improved AllBooking UI with cleaner design, fewer icons, reduced clutter
import { useEffect, useState } from "react";
import React from "react";
import { BookingService } from "../../services/booking.service";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash,
} from "lucide-react";
import { Link } from "react-router-dom";
import { handleDownload } from "../../utils/filedownload";
import { useNavigate } from "react-router-dom";
import { PriceUtils } from "./priceUtil";
export default function AllBooking() {

const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("DESC");
const groupedBookings = Object.values(
  bookings.reduce((acc, b) => {
    if (!acc[b.groupId]) acc[b.groupId] = [];
    acc[b.groupId].push(b);
    return acc;
  }, {})
);
  const load = async () => {
    setLoading(true);
    const res = await BookingService.getAll({
      search,
      status,
      page,
      limit: 10,
      sortBy,
      order,
    });
    setBookings(res.data.data || []);
    setTotalPages(res.data.totalPages || 1);
    setLoading(false);
  };
  useEffect(() => {
    const fetchCategories = async () => {
      load();
    };
    fetchCategories();
  }, [search, status, page, sortBy, order]);
const downloadGroupInvoice = async (group) => {
  try {
    const groupId = group[0].groupId;

    const res = await BookingService.downloadGroupInvoice(groupId);

    handleDownload(res, `group-invoice-${groupId}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Failed to download group invoice");
  }
};const downloadSingleInvoice = async (bookingId) => {
  try {
    const res = await BookingService.downloadSingleInvoice(bookingId);

    handleDownload(res, `invoice-${bookingId}.pdf`);
  } catch (err) {
    console.error(err);
    alert("Failed to download invoice");
  }
};
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">All Bookings</h1>
        <p className="text-slate-500 mt-1">{bookings.length} total records</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-6 mb-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, service, location..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="px-4 py-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="on_the_way">On the Way</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center gap-3 border border-slate-300 rounded-xl px-4">
            <SlidersHorizontal className="text-slate-600 w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent py-3 outline-none"
            >
              <option value="id">ID</option>
              <option value="bookingDate">Date</option>
              <option value="bookingTime">Time</option>
            </select>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="bg-transparent py-3 outline-none"
            >
              <option value="DESC">DESC</option>
              <option value="ASC">ASC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Booking Table */}
      <div className="bg-white rounded-2xl shadow border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
<table className="w-full border-separate border-spacing-y-3">            <thead className="bg-slate-100">
              <tr>
                {[
                  "ID",
                  "User",
                  "Service",
                  "Date",
                  "Time",
                  "Location",
                  "Price",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

 <tbody className="divide-y divide-slate-100">
  {loading ? (
    [...Array(10)].map((_, i) => (
      <tr key={i}>
        {[...Array(9)].map((__, j) => (
          <td key={j} className="px-6 py-4">
            <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
          </td>
        ))}
      </tr>
    ))
  ) : bookings.length === 0 ? (
    <tr>
      <td colSpan="9" className="text-center py-10 text-slate-500">
        No bookings found
      </td>
    </tr>
  ) : (
    groupedBookings.map((group) => {
  const isGrouped = group.length > 1;
  console.table(group)
const total = group
  .reduce((sum, b) => sum + Number(PriceUtils.calculateBookingTotal(b)), 0)
  .toFixed(2);  return [
    // ✅ SPACE BEFORE SINGLE BOOKING (KEY PART)
!isGrouped && (
  <tr key={`space-${group[0].id}`}>
    <td colSpan="9" className="h-4 bg-slate-100 border-0"></td>
  </tr>
),

    // ✅ GROUP HEADER
    isGrouped && (
      <tr key={`group-${group[0].groupId}`} className=" bg-blue-100">
        <td colSpan="9" className="px-6  py-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-blue-700">
              Group #{group[0].groupId} ({group.length})
            </span>
              
            
            <div   
 className="flex items-center gap-4"><button  onClick={() => navigate(`/booking/group/${group[0].groupId}`)} className="bg-blue-100 border border-blue-400 px-3 py-1 rounded text-blue-700">
                View Combined
              </button>
           <span className="bg-blue-100 px-3 py-1 rounded text-blue-700 font-semibold">
          ₹{total} {/* ✅ Group total with tax */}
        </span>

              <button
                onClick={() => downloadGroupInvoice(group)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Download
              </button>
            </div>
          </div>
        </td>
      </tr>
    ),

    // ✅ ROWS
    ...group.map((b) => (
      <tr
  key={b.id}
  className={isGrouped ? "bg-blue-50" : "bg-white shadow-sm"}
>
        <td className="px-6 py-4 text-blue-600 font-semibold">
          #{b.id}
        </td>
        <td className="px-6 py-4">{b.user?.name || "Unknown"}</td>
        <td className="px-6 py-4">{b.service?.title}</td>
        <td className="px-6 py-4">{b.bookingDate}</td>
        <td className="px-6 py-4">
          {b.bookingTime}
        </td>
        <td className="px-6 py-4">{b.location}</td>
        <td className="px-6 py-4 font-semibold">
₹{PriceUtils.calculateBookingTotal(b)}        </td>
        <td className="px-6 py-4">{b.status}</td>

        <td className="px-6 py-4 flex gap-3">
          <Link to={`/booking/allbookings/${b.id}`}>
            <Eye size={18} />
          </Link>

          {!isGrouped && (
            <button onClick={() => downloadSingleInvoice(b.id)}>
              ⬇️
            </button>
          )}

          <Trash size={18} />
        </td>
      </tr>
    )),
  ];
})
  )}
</tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-slate-700 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-sm font-medium text-slate-700">
            Page <span className="text-blue-600">{page}</span> of {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-slate-700 disabled:opacity-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
