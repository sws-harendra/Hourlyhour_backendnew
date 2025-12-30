"use client";

import { useEffect, useState } from "react";
import ServiceRequestService from "../../services/servicerequest.service";

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await ServiceRequestService.getAll();
      setRequests(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await ServiceRequestService.updateStatus(id, { status });
      fetchRequests();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-4">
        Service Requests
      </h1>

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        {loading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr className="text-left text-sm text-gray-600">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((item, index) => (
                <tr key={item.id} className="border-t text-sm hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>

                  <td className="px-4 py-3 font-medium">{item.name}</td>

                  <td className="px-4 py-3">{item.User?.name || "-"}</td>

                  <td className="px-4 py-3">
                    <div>
                      <div>{item.User?.phone}</div>
                      <div className="text-xs text-gray-500">
                        {item.User?.email}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                      className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {requests.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-sm text-gray-500"
                  >
                    No service requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
