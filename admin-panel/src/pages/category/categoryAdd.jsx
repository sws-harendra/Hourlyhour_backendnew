import { useState, useEffect } from "react";
import { CategoryService } from "../../services/category.service";
import { CommonService } from "../../services/common.service";
import {
  Wind,
  Snowflake,
  Shirt,
  Droplets,
  Flame,
  Zap,
  Fan,
  Laptop,
  Home,
  Tv,
  Wrench,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

const PRESET_ICONS = [
  { key: "Wind", label: "AC / Air Conditioner", icon: Wind },
  { key: "Snowflake", label: "Fridge / Refrigerator", icon: Snowflake },
  { key: "Shirt", label: "Washing Machine", icon: Shirt },
  { key: "Droplets", label: "Water Purifier / RO", icon: Droplets },
  { key: "Flame", label: "Geyser / Water Heater", icon: Flame },
  { key: "Zap", label: "Microwave / Electric", icon: Zap },
  { key: "Fan", label: "Kitchen Chimney", icon: Fan },
  { key: "Laptop", label: "Laptop / Computer", icon: Laptop },
  { key: "Home", label: "Home Decorator", icon: Home },
  { key: "Tv", label: "Television", icon: Tv },
  { key: "Wrench", label: "Appliance Repair", icon: Wrench },
  { key: "Sparkles", label: "Cleaning and Service", icon: Sparkles },
];

export default function CategoryForm({ open, onClose, data, reload }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [icon, setIcon] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(data?.name || "");
      setDescription(data?.description || "");
      setImage(data?.image || "");
      setIcon(data?.icon || "");
      setFilePreview(data?.image || "");
    }
  }, [open, data]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFilePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await CommonService.uploadfile(formData);
      const uploadedUrl = res.data.url;
      setImage(uploadedUrl);
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert("Please enter category name");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      image,
      icon: icon.trim() || undefined,
    };

    try {
      setLoading(true);
      if (data?.id) {
        payload.id = data.id;
        await CategoryService.updateCategory(payload);
      } else {
        await CategoryService.addCategory(payload);
      }
      reload();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-white p-6 rounded-2xl w-full max-w-[500px] shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {data ? "Edit Category" : "Add Category"}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure category name, description, image, and appliance icon
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Category Name *
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition"
              placeholder="e.g. Air Conditioner Repair, Geyser Repair"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition resize-none"
              placeholder="Category details and services brief..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Icon Selector Option */}
          <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Select Category Icon (For Website Display)
              </label>
              {icon && (
                <button
                  type="button"
                  onClick={() => setIcon("")}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Clear Icon
                </button>
              )}
            </div>

            <p className="text-xs text-gray-600 mb-2.5">
              Select an appliance icon below or enter a custom icon name:
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
              {PRESET_ICONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = icon === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setIcon(item.key)}
                    title={item.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-105"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                    }`}
                  >
                    <IconComp className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-medium truncate w-full">
                      {item.key}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-lg p-2 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                placeholder="Selected icon: e.g. Wind, Shirt, Snowflake, Flame"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
              {icon && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-semibold whitespace-nowrap">
                  Active: {icon}
                </span>
              )}
            </div>
          </div>

          {/* Image Upload Option */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
              Category Banner / Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full border border-gray-300 rounded-lg p-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              onChange={handleFileSelect}
            />

            {filePreview && (
              <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-xs">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage("");
                    setFilePreview("");
                  }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/25 disabled:bg-blue-300 transition duration-150"
            >
              {loading ? "Saving..." : data ? "Update Category" : "Add Category"}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
