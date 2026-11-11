import { useEffect, useState, useMemo } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Receipt,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { CategoryService } from "../../services/category.service";
import { ServiceService } from "../../services/services.service";

export default function ServiceForm({
  open,
  onClose,
  data,
  reload,
  initialCategoryId,
  initialRateCardHeading,
}) {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [rateCardsOverview, setRateCardsOverview] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
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
    images: [],
    rateListHeading: "",
  });

  // Rate card selection mode: "existing" | "new"
  const [isNewRateCard, setIsNewRateCard] = useState(false);

  // Optional sub-rates / component spare parts
  const [rateItems, setRateItems] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [showComponentRates, setShowComponentRates] = useState(false);

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // Load all dependencies (Categories, Services, Rate Cards)
  const loadDependencies = async () => {
    try {
      setLoadingData(true);
      const [categoriesRes, servicesRes, rateCardsRes] = await Promise.all([
        CategoryService.getAllCategories(),
        ServiceService.getAllServices({ page: 1, limit: 200 }),
        ServiceService.getRateCardsOverview(),
      ]);

      setCategories(categoriesRes.data?.data || []);
      setServices(servicesRes.data?.data || []);
      setRateCardsOverview(rateCardsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load service dependencies:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadDependencies();
  }, [open]);

  const selectedCategory = useMemo(() => {
    return categories.find((c) => String(c.id) === String(form.categoryId));
  }, [categories, form.categoryId]);

  // Compute all available rate cards (category-specific or all configured rate cards)
  const availableRateCards = useMemo(() => {
    const list = [];
    const seen = new Set();

    if (form.categoryId) {
      // 1. First look in rateCardsOverview for this category
      const catCard = rateCardsOverview.find(
        (c) => String(c.categoryId) === String(form.categoryId)
      );
      if (catCard && catCard.rateListHeading?.trim()) {
        const heading = catCard.rateListHeading.trim();
        seen.add(heading.toLowerCase());
        list.push({
          heading,
          categoryName: catCard.categoryName,
          categoryId: catCard.categoryId,
          itemCount: catCard.rates?.length || 0,
        });
      }

      // 2. Also look in services for any other headings in this category
      services
        .filter((s) => String(s.categoryId) === String(form.categoryId))
        .forEach((s) => {
          const heading = s.rateListHeading?.trim();
          if (heading && !seen.has(heading.toLowerCase())) {
            seen.add(heading.toLowerCase());
            list.push({
              heading,
              categoryName: selectedCategory?.name || "",
              categoryId: form.categoryId,
              itemCount: 0,
            });
          }
        });
    } else {
      // If no category selected yet, surface all rate cards created in the system
      rateCardsOverview.forEach((c) => {
        const heading = c.rateListHeading?.trim();
        if (heading && !seen.has(heading.toLowerCase())) {
          seen.add(heading.toLowerCase());
          list.push({
            heading,
            categoryName: c.categoryName,
            categoryId: c.categoryId,
            itemCount: c.rates?.length || 0,
          });
        }
      });
    }

    return list;
  }, [form.categoryId, rateCardsOverview, services, selectedCategory]);

  useEffect(() => {
    if (data) {
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
        rateListHeading: data.rateListHeading || "",
      });

      setIsNewRateCard(false);

      if (data.id) {
        setRatesLoading(true);
        ServiceService.getByService(data.id)
          .then((res) => {
            const list = res.data?.data || [];
            if (Array.isArray(list) && list.length > 0) {
              setRateItems(
                list.map((r) => ({
                  id: r.id,
                  title: r.title || "",
                  price: r.price !== null && r.price !== undefined ? r.price : "",
                  warranty: r.warranty || "",
                }))
              );
              setShowComponentRates(true);
            } else {
              setRateItems([]);
            }
          })
          .catch((err) => {
            console.error("Failed to load service rates:", err);
            setRateItems([]);
          })
          .finally(() => {
            setRatesLoading(false);
          });
      } else {
        setRateItems([]);
      }
    } else {
      resetForm();
      if (initialCategoryId) {
        setForm((prev) => ({
          ...prev,
          categoryId: String(initialCategoryId),
          rateListHeading: initialRateCardHeading || "",
        }));
      }
    }
  }, [data, open, initialCategoryId, initialRateCardHeading]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({
      categoryId: initialCategoryId ? String(initialCategoryId) : "",
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
      rateListHeading: initialRateCardHeading || "",
    });

    setIsNewRateCard(false);
    setMainImageFile(null);
    setGalleryFiles([]);
    setRateItems([]);
    setShowComponentRates(false);
  };

  const handleAddRateItem = () => {
    setRateItems((prev) => [
      ...prev,
      { title: "", price: "", warranty: "" },
    ]);
  };

  const handleRemoveRateItem = (index) => {
    setRateItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRateItemChange = (index, field, value) => {
    setRateItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      if (!form.categoryId) {
        return setError("Please select a Category");
      }

      if (!form.rateListHeading?.trim()) {
        return setError("Please select or enter the Rate Card this service belongs to");
      }

      if (!form.title.trim()) {
        return setError("Service Title is required (this appears in the Rate List)");
      }

      if (!form.price && form.price !== 0) {
        return setError("Service Price / Rate (₹) is required");
      }

      if (!data && !mainImageFile && !form.mainimage) {
        return setError("Cover image is required");
      }

      const formData = new FormData();

      formData.append("categoryId", form.categoryId);
      formData.append("title", form.title.trim());
      formData.append(
        "shortDescription",
        form.shortDescription.trim() ||
          `Professional ${form.title.trim()} service & repair with warranty.`
      );
      formData.append("fullDescription", form.fullDescription || "");
      formData.append("price", form.price);
      formData.append("rateType", form.rateType || "fixed");
      formData.append("duration", form.duration || "");
      formData.append("warranty", form.warranty || "");
      formData.append("isMostBooked", form.isMostBooked);
      formData.append(
        "relatedServiceIds",
        JSON.stringify(form.relatedServiceIds || [])
      );
      formData.append("rateListHeading", form.rateListHeading.trim());

      // Component rates / spare parts
      const cleanRates = rateItems
        .filter((r) => r && r.title && r.title.trim() !== "")
        .map((r) => ({
          title: r.title.trim(),
          price: r.price !== null && r.price !== "" ? parseFloat(r.price) : 0,
          warranty: r.warranty ? String(r.warranty).trim() : null,
        }));
      formData.append("rates", JSON.stringify(cleanRates));

      if (mainImageFile) {
        formData.append("mainimage", mainImageFile);
      }

      galleryFiles.forEach((file) => {
        formData.append("images", file);
      });

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white overflow-y-auto max-h-[95vh] rounded-3xl w-full max-w-5xl shadow-2xl animate-fadeIn relative border border-gray-100 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {/* Close Button */}
        <button
          type="button"
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all cursor-pointer z-20"
          onClick={onClose}
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-linear-to-r from-blue-600 to-indigo-600 text-white border-b border-gray-100 px-5 sm:px-8 py-5 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                {data ? "Edit Service" : "Add Service to Rate Card"}
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Each service belongs to a Rate Card and appears directly in the customer rate list.
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 space-y-6">
          {/* STEP 1: CATEGORY & RATE CARD ASSIGNMENT */}
          <div className="p-5 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-slate-50 rounded-2xl border border-blue-200/80 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-blue-100">
              <Receipt className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                1. Category &amp; Rate Card Assignment
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={(e) => {
                    const catId = e.target.value;
                    const cat = categories.find((c) => String(c.id) === String(catId));

                    // Check if this newly selected category already has a rate card
                    const existingCatCard = rateCardsOverview.find(
                      (c) => String(c.categoryId) === String(catId)
                    );

                    setForm((prev) => ({
                      ...prev,
                      categoryId: catId,
                      rateListHeading:
                        existingCatCard?.rateListHeading?.trim() ||
                        (cat ? `${cat.name} Service & Repair Charges` : ""),
                    }));

                    setIsNewRateCard(false);
                  }}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-800"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  {selectedCategory
                    ? `Selected: ${selectedCategory.name}`
                    : "Choose the main category for this service"}
                </p>
              </div>

              {/* Rate Card (Which rate card to add to) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Rate Card (Rate List) <span className="text-red-500">*</span>
                  </label>

                  {availableRateCards.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isNewRateCard;
                        setIsNewRateCard(next);
                        if (next) {
                          setForm((prev) => ({ ...prev, rateListHeading: "" }));
                        } else if (availableRateCards.length > 0) {
                          setForm((prev) => ({
                            ...prev,
                            rateListHeading: availableRateCards[0].heading,
                          }));
                        }
                      }}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      {isNewRateCard ? "← Choose Existing Card" : "+ Create New Rate Card"}
                    </button>
                  )}
                </div>

                {!isNewRateCard && availableRateCards.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={form.rateListHeading}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__NEW__") {
                          setIsNewRateCard(true);
                          setForm((prev) => ({ ...prev, rateListHeading: "" }));
                        } else {
                          const matched = availableRateCards.find(
                            (c) => c.heading === val
                          );
                          setForm((prev) => ({
                            ...prev,
                            rateListHeading: val,
                            categoryId:
                              prev.categoryId ||
                              (matched?.categoryId
                                ? String(matched.categoryId)
                                : prev.categoryId),
                          }));
                        }
                      }}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-800"
                    >
                      <option value="">-- Choose Existing Rate Card --</option>
                      {availableRateCards.map((rc, idx) => (
                        <option key={idx} value={rc.heading}>
                          {rc.heading} {!form.categoryId && rc.categoryName ? `(${rc.categoryName})` : ""} {rc.itemCount > 0 ? `• [${rc.itemCount} items]` : ""}
                        </option>
                      ))}
                      <option value="__NEW__">+ Create New Rate Card...</option>
                    </select>

                    {form.rateListHeading && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Adding to: <strong>&quot;{form.rateListHeading}&quot;</strong> Rate Card.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      name="rateListHeading"
                      value={form.rateListHeading}
                      onChange={handleChange}
                      placeholder={
                        selectedCategory
                          ? `e.g. ${selectedCategory.name} Installation & Repair Rate Card`
                          : "e.g. Split AC Installation & Repair Charges"
                      }
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-800"
                    />

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      {availableRateCards.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewRateCard(false);
                            setForm((prev) => ({
                              ...prev,
                              rateListHeading: availableRateCards[0].heading,
                            }));
                          }}
                          className="text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          ← Or select from {availableRateCards.length} existing rate card(s)
                        </button>
                      ) : (
                        <span>
                          {form.categoryId
                            ? "No rate cards found in this category. Type a heading to create one."
                            : "Select a Category above to view its created rate cards."}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: SERVICE DETAILS (THE ITEM IN THE RATE LIST) */}
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                2. Service Details (Rate List Item)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Service Title */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Service Title / Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-800 transition-all"
                  placeholder="e.g. Split AC Deep Jet Cleaning & Service"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Service Price / Rate (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-900 transition-all"
                    placeholder="499"
                  />
                </div>
              </div>

              {/* Warranty */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Warranty (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  name="warranty"
                  value={form.warranty}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-800"
                  placeholder="e.g. 30, 90"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Duration (optional)
                </label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-800"
                  placeholder="e.g. 45 min / 1 hour"
                />
              </div>

              {/* Most Booked */}
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isMostBookedCheck"
                  checked={form.isMostBooked}
                  onChange={(e) =>
                    setForm({ ...form, isMostBooked: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="isMostBookedCheck" className="text-xs font-bold text-gray-700 cursor-pointer">
                  Mark as Most Booked / Popular
                </label>
              </div>

              {/* Short Description */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Short Description (Shown on Rate Card)
                </label>
                <textarea
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="2"
                  placeholder="Brief summary shown next to price on customer booking screen..."
                />
              </div>

              {/* Full Description */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Service Description
                </label>
                <textarea
                  name="fullDescription"
                  value={form.fullDescription}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows="3"
                  placeholder="Comprehensive details, technician inclusions, equipment used..."
                />
              </div>
            </div>
          </div>

          {/* STEP 3: OPTIONAL SPARE PARTS / COMPONENT SUB-RATES */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowComponentRates(!showComponentRates)}>
              <div>
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  3. Additional Component &amp; Spare Parts Rates (Optional)
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Extra spare parts or diagnosis rates technicians can bill under this service.
                </p>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {showComponentRates ? "Hide" : "+ Add Spare Parts"}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showComponentRates ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showComponentRates && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-600">
                    Component Items ({rateItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddRateItem}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Row
                  </button>
                </div>

                {rateItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-xl border border-gray-200 flex flex-col sm:grid sm:grid-cols-12 gap-2.5 items-center"
                  >
                    <div className="w-full sm:col-span-5">
                      <input
                        type="text"
                        value={item.title || ""}
                        onChange={(e) =>
                          handleRateItemChange(idx, "title", e.target.value)
                        }
                        placeholder="Component (e.g. PCB Repair)"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="w-full sm:col-span-3">
                      <input
                        type="number"
                        min="0"
                        value={item.price ?? ""}
                        onChange={(e) =>
                          handleRateItemChange(idx, "price", e.target.value)
                        }
                        placeholder="Price (₹)"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold"
                      />
                    </div>
                    <div className="w-full sm:col-span-3">
                      <input
                        type="text"
                        value={item.warranty || ""}
                        onChange={(e) =>
                          handleRateItemChange(idx, "warranty", e.target.value)
                        }
                        placeholder="Warranty (e.g. 30 Days)"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="w-full sm:col-span-1 flex justify-end sm:justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRateItem(idx)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 4: IMAGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Main Cover Image */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Cover Photo <span className="text-red-500">*</span>
              </label>

              <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all p-4 text-center">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setMainImageFile(e.target.files[0])}
                />
                <div className="text-xs font-bold text-blue-600">
                  Click to upload cover photo
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  PNG, JPG, WEBP recommended
                </div>
              </label>

              {(mainImageFile || form.mainimage) && (
                <img
                  src={
                    mainImageFile
                      ? URL.createObjectURL(mainImageFile)
                      : form.mainimage
                  }
                  className="h-28 w-full object-cover rounded-2xl mt-2 border border-gray-200"
                  alt="Cover preview"
                />
              )}
            </div>

            {/* Gallery Images */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Gallery Photos (Optional)
              </label>

              <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all p-4 text-center">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => setGalleryFiles([...e.target.files])}
                />
                <div className="text-xs font-bold text-blue-600">
                  Click to upload gallery photos
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Select multiple photos
                </div>
              </label>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {galleryFiles.length > 0
                  ? galleryFiles.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={URL.createObjectURL(img)}
                        className="h-20 w-full object-cover rounded-xl border"
                        alt={`Upload ${i}`}
                      />
                    ))
                  : Array.isArray(form.images) &&
                    form.images.slice(0, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="h-20 w-full object-cover rounded-xl border"
                        alt={`Gallery ${i}`}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {error && (
          <div className="mx-5 sm:mx-8 mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 sm:px-8 py-4 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!form.title || !form.categoryId || submitting}
              className="w-full sm:w-auto px-7 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              {submitting
                ? "Saving..."
                : data
                ? "Update Service in Rate Card"
                : "Add Service to Rate Card"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
