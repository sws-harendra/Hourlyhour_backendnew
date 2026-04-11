import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { ServiceAreaPriceService } from "../../services/serviceAreaPrice.service";
import { ServiceService } from "../../services/services.service";

export default function ServiceAreaPricing() {
  const { areaId } = useParams();
  const navigate = useNavigate();

  const [area, setArea] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await ServiceAreaPriceService.getByArea(areaId);
      setArea(res.data.data.area);
      setRows((res.data.data.rows || []).map((row) => ({ ...row })));
    } catch (error) {
      console.error("Failed to load service area pricing:", error);
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [areaId]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.title?.toLowerCase().includes(query));
  }, [rows, search]);

  const updatePrice = (serviceId, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.serviceId === serviceId
          ? { ...row, price: value, hasOverride: true }
          : row,
      ),
    );
  };

  const resetToBase = (serviceId) => {
    setRows((prev) =>
      prev.map((row) =>
        row.serviceId === serviceId
          ? {
              ...row,
              price: row.basePrice,
              hasOverride: false,
            }
          : row,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const payload = rows.map((row) => ({
        serviceId: row.serviceId,
        price: row.price,
      }));

      await ServiceAreaPriceService.saveBulk(areaId, payload);
      setMessage("Service area pricing saved successfully");
      await load();
    } catch (error) {
      console.error("Failed to save area prices:", error);
      setMessage(error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!row.areaPriceId) return resetToBase(row.serviceId);
    if (!window.confirm(`Remove price override for ${row.title}?`)) return;

    try {
      await ServiceAreaPriceService.deletePrice(areaId, row.areaPriceId);
      setMessage(`Removed override for ${row.title}`);
      await load();
    } catch (error) {
      console.error("Failed to delete area price:", error);
      setMessage(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <button
              onClick={() => navigate("/service-area")}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:text-sky-700"
            >
              <ArrowLeft size={16} />
              Back to Service Areas
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Service Area Pricing
            </h1>
            <p className="mt-1 text-slate-600">
              Set custom prices for services in{" "}
              <span className="font-semibold text-slate-900">
                {area?.name || `Area #${areaId}`}
              </span>
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="rounded-2xl bg-slate-900 px-5 py-3 text-white shadow-lg">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Services
              </p>
              <p className="text-2xl font-bold">{rows.length}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white shadow-lg transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Save Prices
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Area pricing overrides
            </h2>
            <p className="text-sm text-slate-600">
              Leave a service at its base price, or set a custom value for this
              service area.
            </p>
          </div>
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none ring-0 transition focus:border-sky-300 focus:bg-white"
            />
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              message.toLowerCase().includes("fail") ||
              message.toLowerCase().includes("error")
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Service</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Base Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Area Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      Loading service prices...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      No services found for this area
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.serviceId} className="border-t border-slate-100">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {row.mainimage ? (
                            <img
                              src={row.mainimage}
                              alt={row.title}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <Plus size={16} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900">{row.title}</p>
                            <p className="text-xs text-slate-500">ID #{row.serviceId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">₹{Number(row.basePrice || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => updatePrice(row.serviceId, e.target.value)}
                          className="w-40 rounded-xl border border-slate-200 px-3 py-2 outline-none transition focus:border-sky-400"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            row.hasOverride
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {row.hasOverride ? "Custom price" : "Base price"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => resetToBase(row.serviceId)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => handleDelete(row)}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
