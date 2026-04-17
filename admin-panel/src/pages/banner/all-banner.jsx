import React, { useEffect, useState } from "react";
import { Image, Edit2, Trash2, Plus, X, Save } from "lucide-react";
import { CommonService } from "../../services/common.service";
import BannerService from "../../services/banner.service";
import { ServiceService } from "../../services/services.service";
import Delete from "../../components/Delete";
// Mock service for demonstration

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [form, setForm] = useState({
    image_url: "",
    title: "",
    description: "",
    service_id: "", // 👈 NEW
  });
  const [filePreview, setFilePreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await BannerService.getAll();
      if (res.data.data.length > 0) {
        setBanners(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchServices = async () => {
    const limit = 500;
    let page = 1;

    try {
      const res = await ServiceService.getAll({ page, limit }); // /service/all-services
      setServices(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchServices(); // 👈 NEW
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFilePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await CommonService.uploadfile(formData); // upload via service
      setForm((prev) => ({ ...prev, image_url: res.data.url }));
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.image_url || !form.title) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      if (editId) {
        await BannerService.update(editId, form);
        const res = await BannerService.update(editId, form);
        const updatedBanner = res.data.data;

        setBanners((prev) =>
          prev.map((b) => (b.id === editId ? updatedBanner : b))
        );
      } else {
        const res = await BannerService.create(form);
        const createdBanner = res.data.data;

        setBanners((prev) => [...prev, createdBanner]);
      }

      setForm({ image_url: "", title: "", description: "" });
      setFilePreview(null);
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (banner) => {
    setEditId(banner.id);
    setForm({
      image_url: banner.image_url,
      title: banner.title,
      description: banner.description || "",
      service_id: banner.service_id || "", // ✅ FIX
    });
    setFilePreview(banner.image_url);
    setShowForm(true);
  };

  const handleDelete = async () => {
    try {
      setDeletingId(deleteId);
      await BannerService.remove(deleteId);

      setBanners((prev) => prev.filter((b) => b.id !== deleteId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ image_url: "", title: "", description: "" });
    setFilePreview(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Banner Management
            </h1>
            <p className="text-slate-600 mt-1">
              Create and manage promotional banners
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              <Plus size={20} />
              New Banner
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Form Card */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Image size={20} />
                {editId ? "Edit Banner" : "Create New Banner"}
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full"
                />
                {filePreview && (
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="mt-3 w-48 h-32 object-cover rounded-lg border"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter banner title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter banner description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Redirect to Service (Optional)
                </label>
                <select
                  name="service_id"
                  value={form.service_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl
      focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No redirect</option>

                  {services.map((service) => (
                    <option value={String(service.id)}>{service.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-200"
                >
                  <Save size={18} />
                  {editId ? "Update Banner" : "Create Banner"}
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

        {/* Banners Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Loading banners...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="group bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden bg-slate-100">
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {banner.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {banner.description || "No description provided"}
                  </p>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-all duration-200"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(banner.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {banners.length === 0 && (
              <div className="col-span-full">
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-16 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Image size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    No banners yet
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Get started by creating your first promotional banner
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
                  >
                    <Plus size={20} />
                    Create Banner
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Delete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleteId}
        title="Delete Banner?"
        description="This banner will be permanently removed."
      />
    </div>
  );
};

export default Banner;
