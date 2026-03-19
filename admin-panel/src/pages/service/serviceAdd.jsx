import { useEffect, useState } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { CategoryService } from "../../services/category.service";
import { ServiceService } from "../../services/services.service";
import { CommonService } from "../../services/common.service";

export default function ServiceForm({ open, onClose, data, reload }) {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);

  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    rateType: "fixed",
    duration: "",
    isMostBooked: false,
    relatedServiceIds: [],
    mainimage: "",
    images: [],  rateListHeading: "", // ✅ ADD THIS

  });

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

useEffect(() => {
  if (data) {
    setForm({
      ...data,
      categoryId: data.categoryId || "",
      images: data.images || [],
      relatedServiceIds: data.relatedServices
        ? data.relatedServices.map((s) => String(s.id)) // 👈 FIX
        : [],
    });
  }
}, [data]);  const loadServices = async () => {
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

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append("categoryId", form.categoryId);
    formData.append("title", form.title);
    formData.append("shortDescription", form.shortDescription);
    formData.append("fullDescription", form.fullDescription);
    formData.append("price", form.price);
    formData.append("rateType", form.rateType);
    formData.append("duration", form.duration);
    formData.append("isMostBooked", form.isMostBooked);
    formData.append(
      "relatedServiceIds",
      JSON.stringify(form.relatedServiceIds)
    );
    formData.append("rateListHeading", form.rateListHeading)
    // main image
    if (mainImageFile) {
      formData.append("mainimage", mainImageFile);
    }

    // gallery images
    galleryFiles.forEach((file) => {
      formData.append("images", file);
    });

    if (data?.id) {
      formData.append("id", data.id);
      await ServiceService.updateService(data.id, formData);
    } else {
      await ServiceService.addService(formData);
    }

    reload();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white overflow-y-auto h-6/6 rounded-2xl w-full max-w-3xl shadow-lg animate-fadeIn p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {data ? "Edit Service" : "Add New Service"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="font-medium">Category</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
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
            <label className="font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              placeholder="Service title"
            />
          </div>

          {/* Short Description */}
          <div className="col-span-2">
            <label className="font-medium">Short Description</label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              rows="2"
            />
          </div>
<div className="col-span-2">
  <label className="font-medium">Rate List Heading</label>
  <input
    name="rateListHeading"
    value={form.rateListHeading}
    onChange={handleChange}
    className="w-full mt-1 p-3 border rounded-xl"
    placeholder="Heading for rate List sections"
  />
</div>
          {/* Full Description */}
          <div className="col-span-2">
            <label className="font-medium">Full Description</label>
            <textarea
              name="fullDescription"
              value={form.fullDescription}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              rows="4"
            />
          </div>

          {/* Price */}
          <div>
            <label className="font-medium">Price</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              placeholder="Price"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="font-medium">Duration (optional)</label>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-xl"
              placeholder="45 min / 1 hour"
            />
          </div>

          {/* Main Image Upload */}
          <div>
            <label className="font-medium">Main Image</label>
            <input
              type="file"
              className="w-full mt-1"
              onChange={(e) => setMainImageFile(e.target.files[0])}
            />

            {form.mainimage && (
              <img
                src={form.mainimage}
                className="h-24 w-24 mt-2 rounded-lg object-cover"
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
            <label className="font-medium">Mark as Popular Service</label>
          </div>
          <div className="col-span-2">
            <label className="font-medium">
              Related Services (Click to add.)
            </label>
            <select
              multiple
              className="w-full mt-1 p-3 border rounded-xl"
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
          <div>
            <label className="font-medium">Gallery Images</label>
            <input
              type="file"
              multiple
              className="w-full mt-1"
              onChange={(e) => setGalleryFiles([...e.target.files])}
            />

            <div className="flex gap-2 mt-2 overflow-x-auto">
              {form.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className="h-20 w-20 rounded-lg object-cover border"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="mt-6 w-full p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          {data ? "Update Service" : "Create Service"}
        </button>
      </div>
    </div>
  );
}
