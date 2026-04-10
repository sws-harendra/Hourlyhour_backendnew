import { useState, useEffect } from "react";
import { WarrantyService } from "../../services/warranty.service";
import { ServiceService } from "../../services/services.service";
import { X } from "lucide-react";

export default function WarrantyForm({ open, onClose, data, reload }) {
  const [title, setTitle] = useState(data?.title || "");
  const [description, setDescription] = useState(data?.description || "");
  const [durationInDays, setDurationInDays] = useState(data?.durationInDays || "");
  const [serviceId, setServiceId] = useState(data?.serviceId || "");
  const [status, setStatus] = useState(data?.status || "active");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await ServiceService.getAllServices();
        setServices(res.data.data);
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { 
      title, 
      description, 
      durationInDays: parseInt(durationInDays), 
      serviceId: parseInt(serviceId), 
      status 
    };

    try {
      if (data?.id) {
        await WarrantyService.updateWarranty(data.id, payload);
      } else {
        await WarrantyService.createWarranty(payload);
      }
      reload();
      onClose();
    } catch (err) {
      console.error("Failed to save warranty:", err);
      alert("Error saving warranty. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">
            {data ? "Edit Warranty" : "Add New Warranty"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Select Service</label>
            <select
              required
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={!!data} // Don't allow changing service after creation
            >
              <option value="">Select a service</option>
              {services?.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Warranty Title</label>
            <input
              required
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g. 30 Days Service Warranty"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Description</label>
            <textarea
              required
              className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
              placeholder="What does this warranty cover?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Duration (Days)</label>
              <input
                required
                type="number"
                className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="30"
                value={durationInDays}
                onChange={(e) => setDurationInDays(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Status</label>
              <select
                className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all disabled:bg-blue-300 active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {loading ? "Saving..." : data ? "Update Warranty" : "Add Warranty"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
