import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Percent,
  User,
} from "lucide-react";
import AppSettingService from "../../services/setting.service";

export default function AppSetting() {
  const [form, setForm] = useState({
    adminCommissionPercent: "",
    minimumBalance: "",driverAssignType:"",
    platformfee: "",
    tax: ""
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    loadSetting();
  }, []);

  const loadSetting = async () => {
    try {
      const res = await AppSettingService.get();
      if (res.data?.data) {
        setForm({
          adminCommissionPercent: res.data.data.adminCommissionPercent ?? "",
          minimumBalance: res.data.data.minimumBalance ?? "",
          driverAssignType: res.data.data.driverAssignType??"",
          tax: res.data.data.tax??"",
          platformfee: res.data.data.platformfee ?? ""

        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load settings");
    } finally {
      setInitialLoad(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await AppSettingService.save({
        adminCommissionPercent: Number(form.adminCommissionPercent),
        minimumBalance: Number(form.minimumBalance),
        driverAssignType: form.driverAssignType,
        platformfee: Number(form.platformfee),
        tax: Number(form.tax),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (
      !window.confirm("Are you sure you want to reset all settings to default?")
    )
      return;

    try {
      await AppSettingService.remove();
      setForm({
        adminCommissionPercent: "",
        minimumBalance: "",
      });
      setSaved(false);
    } catch (err) {
      setError("Failed to reset settings. Please try again.");
    }
  };

  if (initialLoad) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Application Settings
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                Configure system-wide parameters
              </p>
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mx-8 mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {saved && (
          <div className="mx-8 mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">Success</p>
              <p className="text-green-700 text-sm mt-1">
                Settings saved successfully
              </p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-8 space-y-6">
          {/* Admin Commission */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Percent className="w-4 h-4 text-gray-500" />
              Admin Commission Percentage
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                name="adminCommissionPercent"
                value={form.adminCommissionPercent}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g., 10"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                %
              </span>
            </div>
            <p className="text-xs text-gray-500 ml-1">
              Percentage of commission charged on transactions
            </p>
          </div>
<div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <IndianRupee className="w-4 h-4 text-gray-500" />
              Platform Fee
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="platformfee"
                value={form.platformfee}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g., 20"
                required
              />
            </div>
            <p className="text-xs text-gray-500 ml-1">
              Any platform fee that will be added to final amount of order.
            </p>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <IndianRupee className="w-4 h-4 text-gray-500" />
              Tax Percentage
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                %
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="tax"
                value={form.tax}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g., 5"
                required
              />
            </div>
            <p className="text-xs text-gray-500 ml-1">
              Any platform fee that will be added to final amount of order.
            </p>
          </div>
          {/* Minimum Balance */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <IndianRupee className="w-4 h-4 text-gray-500" />
              Minimum Balance Requirement
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                name="minimumBalance"
                value={form.minimumBalance}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="e.g., 500"
                required
              />
            </div>
            <p className="text-xs text-gray-500 ml-1">
              Minimum balance users must maintain in their accounts
            </p>
          </div>
         <div className="space-y-2">
          
            {/* Driver Assign Type */}
<div className="space-y-2">
  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
    Driver Assign Type
  </label>

  <select
    name="driverAssignType"
    value={form.driverAssignType}
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
  >
    <option value="manual">Manual</option>
    <option value="auto">Automatic</option>
  </select>

  <p className="text-xs text-gray-500 ml-1">
    Select how drivers will be assigned to rides
  </p>
</div>
          </div>
          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </button>

            {/* <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button> */}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleDateString()} • Changes take
            effect immediately
          </p>
        </div>
      </div>
    </div>
  );
}
