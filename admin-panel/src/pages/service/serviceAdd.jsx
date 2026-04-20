import { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { CategoryService } from "../../services/category.service";
import { ServiceService } from "../../services/services.service";
import { CommonService } from "../../services/common.service";

export default function ServiceForm({ open, onClose, data, reload }) {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    rateType: "fixed",
    duration: "",
    warranty: "",
    isMostBooked: false,
    relatedServiceIds: [],
    mainimage: "",
    images: [], rateListHeading: "", // ✅ ADD THIS

  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  useEffect(() => {
    if (data) {
      console.table(data.relatedServices)

      setForm({
        ...data,
        categoryId: data.categoryId || "",
        warranty: data.warranty
          ? String(data.warranty).replace(/[^0-9]/g, "")
          : "",

        images: Array.isArray(data.images) ? data.images : [],
        relatedServiceIds: data.relatedServices
          ? data.relatedServices.map((s) => String(s.id))
          : [],
      });
    }
  }, [data]); const loadServices = async () => {
    const res = await ServiceService.getAllServices({
      page: 1,
      limit: 100, // important for dropdown
    });

    setServices(res.data.data || []);
  };

  // Load all categories
  useEffect(() => {
    const loadCategories = async () => {
      const res = await CategoryService.getAllCategories();
      setCategories(res.data.data);
    };

    loadServices();

    loadCategories();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const uploadMainImage = async () => {
    if (!mainImageFile) return null;
    return await CommonService.uploadfile(mainImageFile);
  };

  const uploadGalleryImages = async () => {
    let uploaded = [];
    for (let file of galleryFiles) {
      const fileUrl = await CommonService.uploadfile(file);
      uploaded.push(fileUrl);
    }
    return uploaded;
  };
  const resetForm = () => {
    setForm({
      categoryId: "",
      title: "",
      shortDescription: "",
      fullDescription: "",
      price: "",
      rateType: "fixed",
      duration: "",
      warranty: "",
      isMostBooked: false,
      relatedServiceIds: [],
      mainimage: "",
      images: [],
      rateListHeading: "",
    });

    setMainImageFile(null);
    setGalleryFiles([]);
  };
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      // ✅ VALIDATION
      if (!form.categoryId) {
        return setError("Please select a category");
      }

      if (!form.title.trim()) {
        return setError("Title is required");
      }

      if (!form.shortDescription.trim()) {
        return setError("Short description is required");
      }

      if (!form.price) {
        return setError("Price is required");
      }

      if (!data && !mainImageFile && !form.mainimage) {
        return setError("Main image is required");
      }

      const formData = new FormData();

      formData.append("categoryId", form.categoryId);
      formData.append("title", form.title);
      formData.append("shortDescription", form.shortDescription);
      formData.append("fullDescription", form.fullDescription);
      formData.append("price", form.price);
      formData.append("rateType", form.rateType);
      formData.append("duration", form.duration);
      formData.append(
        "warranty",
        form.warranty
      );
      formData.append("isMostBooked", form.isMostBooked);
      formData.append(
        "relatedServiceIds",
        JSON.stringify(form.relatedServiceIds)
      );
      formData.append("rateListHeading", form.rateListHeading);

      if (mainImageFile) {
        formData.append("mainimage", mainImageFile);
      }

      galleryFiles.forEach((file) => {
        formData.append("images", file);
      });

      // ✅ API CALL
      if (data?.id) {
        await ServiceService.updateService(data.id, formData);
      } else {
        await ServiceService.addService(formData);
      }
      resetForm();
      reload();
      onClose();
    } catch (err) {
      console.error(err);

      // ✅ SHOW BACKEND ERROR
      setError(
        err.response?.data?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white overflow-y-auto max-h-[95vh] rounded-3xl  w-full max-w-5xl shadow-2xl animate-fadeIn relative border border-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="sticky top-0 z-10 bg-blue-600 text-white border-b border-gray-100 px-5 sm:px-8 py-5 rounded-t-3xl">
          <h2 className="text-xl sm:text-3xl font-bold">
            {data ? "Edit Service" : "Create New Service"}
          </h2>
          <p className="text-sm text-gray-100 mt-1">
            Manage service details, pricing, photos and warranty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-5 sm:px-8 py-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Service title"
            />
          </div>

          {/* Short Description */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              rows="2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Rate List Heading</label>
            <input
              name="rateListHeading"
              value={form.rateListHeading}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Heading for rate List sections"
            />
          </div>
          {/* Full Description */}
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Description</label>
            <textarea
              name="fullDescription"
              value={form.fullDescription}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              rows="4"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Price</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Price"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (optional)</label>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="45 min / 1 hour"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Warranty (in Days)
            </label>

            <input
              type="number"
              min="1"
              name="warranty"
              value={form.warranty}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter in days"
            />
          </div>

          {/* Main Image Upload */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main Image
            </label>

            <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all p-5 text-center">
              <input
                type="file"
                className="hidden"
                onChange={(e) => setMainImageFile(e.target.files[0])}
              />

              <div className="text-sm text-gray-500">
                Click to upload cover image
              </div>

              <div className="text-xs text-gray-400 mt-1">
                JPG, PNG recommended
              </div>
            </label>

            {(mainImageFile || form.mainimage) && (
              <img
                src={
                  mainImageFile
                    ? URL.createObjectURL(mainImageFile)
                    : form.mainimage
                }
                className="h-32 w-full object-cover rounded-2xl mt-3 border"
              />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={form.isMostBooked}
              onChange={(e) =>
                setForm({ ...form, isMostBooked: e.target.checked })
              }
            />
            <label className="block text-sm font-semibold text-gray-700 mb-1">Mark as Popular Service</label>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Related Services (Click to add.)
            </label>
            <select
              multiple
              className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              value={form.relatedServiceIds}
              onChange={(e) =>
                setForm({
                  ...form,
                  relatedServiceIds: Array.from(
                    e.target.selectedOptions,
                    (o) => o.value
                  ),
                })
              }
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>

          {/* Gallery Images */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Gallery Images
            </label>

            <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all p-5 text-center">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setGalleryFiles([...e.target.files])}
              />

              <div className="text-sm text-gray-500">
                Click to upload multiple images
              </div>

              <div className="text-xs text-gray-400 mt-1">
                Select gallery photos
              </div>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4">
              {galleryFiles.length > 0
                ? galleryFiles.map((img, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(img)}
                    className="h-24 w-full object-cover rounded-xl border"
                  />
                ))
                : Array.isArray(form.images) &&
                form.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="h-24 w-full object-cover rounded-xl border"
                  />
                ))}
            </div>
          </div>

        </div>

        {/* Submit Button */}
        {error && (
          <div className="mx-5 sm:mx-8 mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 sm:px-8 py-4 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 font-medium text-gray-700 transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={!form.title || !form.categoryId || submitting}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold transition-all shadow-lg"
            >
              {submitting
                ? "Saving..."
                : data
                  ? "Update Service"
                  : "Create Service"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
