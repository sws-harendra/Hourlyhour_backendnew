import React, { useEffect, useState } from "react";
import {
  Edit2,
  MessageSquareQuote,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";
import { CommonService } from "../../services/common.service";
import TestimonialService from "../../services/testimonial.service";
import Delete from "../../components/Delete";

const initialForm = {
  name: "",
  designation: "",
  message: "",
  rating: 5,
  image: "",
};

const TestimonialPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await TestimonialService.getAll();
      setTestimonials(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load testimonials right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditId(null);
    setShowForm(false);
    setFilePreview("");
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilePreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await CommonService.uploadfile(formData);
      setForm((prev) => ({
        ...prev,
        image: res?.data?.url || "",
      }));
    } catch (err) {
      console.error(err);
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.message.trim()) {
      setError("Name and message are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      };

      if (editId) {
        const res = await TestimonialService.update(editId, payload);
        const updated = res?.data?.data;
        setTestimonials((prev) =>
          prev.map((item) => (item.id === editId ? updated : item)),
        );
      } else {
        const res = await TestimonialService.create(payload);
        const created = res?.data?.data;
        setTestimonials((prev) => [created, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Unable to save testimonial.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (testimonial) => {
    setEditId(testimonial.id);
    setForm({
      name: testimonial.name || "",
      designation: testimonial.designation || "",
      message: testimonial.message || "",
      rating: Number(testimonial.rating) || 5,
      image: testimonial.image || "",
    });
    setFilePreview(testimonial.image || "");
    setError("");
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await TestimonialService.remove(deleteId);

      setTestimonials((prev) =>
        prev.filter((item) => item.id !== deleteId)
      );

      if (editId === deleteId) {
        resetForm();
      }

      setDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
        "Unable to delete testimonial."
      );
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-100">
      <div className="border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Testimonial Management
            </h1>
            <p className="mt-1 text-slate-600">
              Show customer feedback and manage it from one place.
            </p>
          </div>

          {!showForm && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setShowForm(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white shadow-lg transition hover:scale-[1.02] hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Testimonial
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && !showForm && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl shadow-orange-100/60"
          >
            <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900 via-blue-700 to-blue-600 px-6 py-5 text-white">
              <MessageSquareQuote size={22} />
              <div>
                <h2 className="text-xl font-semibold">
                  {editId ? "Edit Testimonial" : "Create Testimonial"}
                </h2>
                <p className="text-sm text-orange-100">
                  Add customer details, feedback, rating, and image.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="Ex: Homeowner, Business Owner"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  min="1"
                  max="5"
                  step="0.1"
                  value={form.rating}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Customer Image
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-3 text-slate-600 transition hover:border-orange-400 hover:bg-orange-50">
                  <Upload size={18} />
                  {uploading ? "Uploading..." : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                {filePreview && (
                  <img
                    src={filePreview}
                    alt="Testimonial preview"
                    className="mt-3 h-24 w-24 rounded-2xl border border-slate-200 object-cover"
                  />
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Write the customer feedback here"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            {error && (
              <div className="px-6 pb-2 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3 px-6 pb-6 pt-2">
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-medium text-white shadow-lg shadow-orange-200 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={18} />
                {saving ? "Saving..." : editId ? "Update Testimonial" : "Create Testimonial"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-200"
              >
                <X size={18} />
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-600">
            Loading testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-16 text-center shadow-sm">
            <UserCircle2 className="mx-auto mb-4 text-slate-400" size={42} />
            <h3 className="text-xl font-semibold text-slate-800">
              No testimonials found
            </h3>
            <p className="mt-2 text-slate-600">
              Create the first testimonial to show customer feedback here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-3xl border border-orange-100 bg-white p-6 shadow-lg shadow-orange-100/40"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-14 w-14 rounded-2xl object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                        <UserCircle2 size={28} />
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {testimonial.designation || "Customer"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(testimonial)}
                      className="rounded-xl bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(testimonial.id)}
                      className="rounded-xl bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={16}
                      fill={index < Math.round(Number(testimonial.rating) || 0) ? "currentColor" : "none"}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate-600">
                    {Number(testimonial.rating || 0).toFixed(1)}
                  </span>
                </div>

                <p className="text-sm leading-6 text-slate-600">
                  {testimonial.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      {deleteModal && (
        <Delete
          open={deleteModal}
          title="Delete Testimonial?"
          description="This testimonial will be permanently removed."
          onClose={() => {
            setDeleteModal(false);
            setDeleteId(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
};

export default TestimonialPage;
