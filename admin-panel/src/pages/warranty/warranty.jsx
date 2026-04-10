import { useState, useEffect } from "react";
import { WarrantyService } from "../../services/warranty.service";
import { Edit2, Shield, Plus, Trash2 } from "lucide-react";
import WarrantyForm from "./warrantyAdd";

export default function WarrantyPage() {
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await WarrantyService.getAllWarranties();
      setWarranties(res.data.data);
    } catch (error) {
      console.error("Failed to load warranties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this warranty?")) return;
    try {
      await WarrantyService.deleteWarranty(id);
      load();
    } catch (error) {
      console.error("Failed to delete warranty:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Service Warranties
              </h1>
              <p className="text-slate-600">
                Configure warranties for your services
              </p>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setOpenForm(true);
              }}
              className="group flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus className="w-5 h-5" />
              Add Warranty
            </button>
          </div>
        </div>

        {/* Warranties Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-slate-100 animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          ) : warranties.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                No warranties configured
              </h3>
              <p className="text-slate-500">
                Add your first warranty to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {warranties.map((warranty) => (
                    <tr
                      key={warranty.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {warranty.title}
                        </div>
                        <div className="text-sm text-slate-500 line-clamp-1">
                          {warranty.description}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-md">
                          {warranty.service?.title || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {warranty.durationInDays} Days
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            warranty.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {warranty.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelected(warranty);
                              setOpenForm(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(warranty.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {openForm && (
        <WarrantyForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          data={selected}
          reload={load}
        />
      )}
    </div>
  );
}
