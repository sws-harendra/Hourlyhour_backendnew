import React, { useEffect, useState } from "react";
import { Tag, Trash2, Plus, X, Save } from "lucide-react";
import CouponService from "../../services/coupon.service";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountValue: "",
    expiryDate: "",
    description: "",
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await CouponService.getAll();
      if (res.data?.data?.length >= 0) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.code?.trim() || form.discountValue === "" || form.discountValue === undefined) {
      alert("Code and discount value are required");
      return;
    }
    const discountNum = parseFloat(form.discountValue);
    if (isNaN(discountNum) || discountNum < 0) {
      alert("Discount value must be a positive number");
      return;
    }

    try {
      await CouponService.create({
        code: form.code.trim(),
        discountValue: discountNum,
        expiryDate: form.expiryDate || null,
        description: form.description?.trim() || null,
      });
      setForm({ code: "", discountValue: "", expiryDate: "", description: "" });
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(msg || "Failed to create coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await CouponService.remove(id);
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  const handleCancel = () => {
    setForm({ code: "", discountValue: "", expiryDate: "", description: "" });
    setShowForm(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Coupon Management</h1>
            <p className="text-slate-600 mt-1">Create and manage coupon codes</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              New Coupon
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Tag size={20} />
                Create New Coupon
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Code *</label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Discount Value *</label>
                <input
                  type="number"
                  name="discountValue"
                  placeholder="e.g. 20"
                  min="0"
                  step="0.01"
                  value={form.discountValue}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">Amount off (fixed or percentage depending on your app)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date (optional)</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description (optional)</label>
                <textarea
                  name="description"
                  placeholder="e.g. 20% off first booking"
                  value={form.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:scale-[1.02] transition-all duration-200"
                >
                  <Save size={18} />
                  Create Coupon
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200"
                >
                  <X size={18} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Loading coupons...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Discount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Expiry</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Description</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-semibold text-blue-600">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{coupon.discountValue}</td>
                      <td className="px-6 py-4 text-slate-600">{formatDate(coupon.expiryDate)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            coupon.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {coupon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {coupon.description || "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-all duration-200"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {coupons.length === 0 && !loading && (
              <div className="p-16 text-center border-t border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No coupons yet</h3>
                <p className="text-slate-600 mb-6">Create your first coupon code to get started</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:scale-105 transition-all duration-200"
                >
                  <Plus size={20} />
                  Create Coupon
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
