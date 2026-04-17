import { useEffect, useState } from "react";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import RazorpayConfigService from "../../services/razorpayConfig.service";
import Delete from "../../components/Delete";

export default function RazorpayConfig() {
  const [form, setForm] = useState({
    keyId: "",
    keySecret: "",
    webhookSecret: "",
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await RazorpayConfigService.get();
      if (res.data?.data) {
        setForm({
          keyId: res.data.data.keyId || "",
          keySecret: res.data.data.keySecret || "",
          webhookSecret: res.data.data.webhookSecret || "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await RazorpayConfigService.save(form);
      setSaved(true);
    } catch (err) {
      alert("Failed to save Razorpay config");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await RazorpayConfigService.remove();
      setForm({ keyId: "", keySecret: "", webhookSecret: "" });
    } catch (err) {
      alert("Failed to delete config");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              Razorpay Configuration
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              Manage your payment gateway credentials
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="space-y-6">
              {/* Key ID Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  API Key ID <span className="text-red-500">*</span>
                </label>
                <input
                  name="keyId"
                  value={form.keyId}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="rzp_test_xxxxxxxxxxxxx"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Your Razorpay API Key ID from the dashboard
                </p>
              </div>

              {/* Key Secret Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  API Key Secret <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    name="keySecret"
                    value={form.keySecret}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="********"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showSecret ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Keep this secret secure and never share it publicly
                </p>
              </div>

              {/* Webhook Secret Field */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Webhook Secret{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type={showWebhook ? "text" : "password"}
                    name="webhookSecret"
                    value={form.webhookSecret}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="optional"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWebhook(!showWebhook)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showWebhook ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Used to verify webhook signatures for enhanced security
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
                >
                  Delete
                </button>

                {saved && (
                  <span className="text-green-600 text-sm font-medium self-center flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Saved successfully
                  </span>
                )}
              </div>
            </div>

            {/* Info Box */}
          </div>
        </div>
      </div>
      <Delete
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          await handleDelete();
          setDeleteOpen(false);
        }}
        title="Delete Razorpay Configuration?"
        description="This will permanently remove your Razorpay credentials."
      />
    </div>
  );
}
