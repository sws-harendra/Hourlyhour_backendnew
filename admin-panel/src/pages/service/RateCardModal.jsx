import { useEffect, useState } from "react";
import { X, Plus, Trash2, Receipt, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { CategoryService } from "../../services/category.service";
import { ServiceService } from "../../services/services.service";

export default function RateCardModal({
  open,
  onClose,
  initialCategoryId = null,
  initialData = null,
  reload,
}) {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [rateListHeading, setRateListHeading] = useState("");
  const [rateItems, setRateItems] = useState([
    { title: "", price: "", warranty: "" },
  ]);
  const [categoryServices, setCategoryServices] = useState([]);
  const [loadingCategoryData, setLoadingCategoryData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load all categories on mount
  useEffect(() => {
    if (!open) return;

    CategoryService.getAllCategories()
      .then((res) => {
        setCategories(res.data?.data || []);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
      });
  }, [open]);

  // Handle initialization when modal opens or initialCategory changes
  useEffect(() => {
    if (!open) return;

    setError("");
    setSuccessMsg("");

    if (initialCategoryId) {
      setSelectedCategoryId(String(initialCategoryId));
    } else if (initialData?.categoryId) {
      setSelectedCategoryId(String(initialData.categoryId));
      setRateListHeading(initialData.rateListHeading || "");
      if (Array.isArray(initialData.rates) && initialData.rates.length > 0) {
        setRateItems(
          initialData.rates.map((r) => ({
            id: r.id,
            title: r.title || "",
            price: r.price !== null && r.price !== undefined ? r.price : "",
            warranty: r.warranty || "",
          }))
        );
      } else {
        setRateItems([{ title: "", price: "", warranty: "" }]);
      }
    } else {
      setSelectedCategoryId("");
      setRateListHeading("");
      setRateItems([{ title: "", price: "", warranty: "" }]);
      setCategoryServices([]);
    }
  }, [open, initialCategoryId, initialData]);

  // When selectedCategoryId changes, load services & existing rates for that category
  useEffect(() => {
    if (!open || !selectedCategoryId) {
      setCategoryServices([]);
      return;
    }

    setLoadingCategoryData(true);
    ServiceService.getServicesByCategory(selectedCategoryId, 1, 100)
      .then((res) => {
        const services = res.data?.data || [];
        setCategoryServices(services);

        // If not editing an existing passed data, pre-fill from category's existing services
        if (!initialData || String(initialData.categoryId) !== String(selectedCategoryId)) {
          const primaryWithRates =
            services.find((s) => s.rateListHeading) || services[0];

          if (primaryWithRates?.rateListHeading) {
            setRateListHeading(primaryWithRates.rateListHeading);
          } else {
            const cat = categories.find((c) => String(c.id) === String(selectedCategoryId));
            if (cat) {
              setRateListHeading(`${cat.name} Service & Repair Rate Card`);
            }
          }

          // If primary service has an ID, fetch its rate list
          if (primaryWithRates?.id) {
            ServiceService.getByService(primaryWithRates.id)
              .then((rateRes) => {
                const list = rateRes.data?.data || [];
                if (Array.isArray(list) && list.length > 0) {
                  setRateItems(
                    list.map((r) => ({
                      id: r.id,
                      title: r.title || "",
                      price: r.price !== null && r.price !== undefined ? r.price : "",
                      warranty: r.warranty || "",
                    }))
                  );
                } else {
                  setRateItems([{ title: "", price: "", warranty: "" }]);
                }
              })
              .catch(() => {
                setRateItems([{ title: "", price: "", warranty: "" }]);
              });
          } else {
            setRateItems([{ title: "", price: "", warranty: "" }]);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load category services:", err);
      })
      .finally(() => {
        setLoadingCategoryData(false);
      });
  }, [selectedCategoryId, open]);

  const handleAddRateRow = () => {
    setRateItems((prev) => [
      ...prev,
      { title: "", price: "", warranty: "" },
    ]);
  };

  const handleRemoveRateRow = (index) => {
    setRateItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRateRowChange = (index, field, value) => {
    setRateItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    try {
      setError("");
      setSuccessMsg("");

      if (!selectedCategoryId) {
        return setError("Please select a category for this rate card.");
      }

      if (!rateListHeading.trim()) {
        return setError("Please provide a name/heading for the rate card.");
      }

      const cleanRates = rateItems
        .filter((r) => r && r.title && r.title.trim() !== "")
        .map((r) => ({
          title: r.title.trim(),
          price: r.price !== null && r.price !== "" ? parseFloat(r.price) : 0,
          warranty: r.warranty ? String(r.warranty).trim() : null,
        }));

      if (cleanRates.length === 0) {
        return setError("Please add at least one rate item with a title and price.");
      }

      setSaving(true);

      const payload = {
        categoryId: parseInt(selectedCategoryId, 10),
        rateListHeading: rateListHeading.trim(),
        rates: cleanRates,
      };

      const res = await ServiceService.saveCategoryRateCard(payload);

      if (res.data?.success) {
        setSuccessMsg("Rate Card and Rate List saved successfully!");
        if (reload) reload();
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        setError(res.data?.message || "Failed to save rate card.");
      }
    } catch (err) {
      console.error("Save Rate Card Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save rate card. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const currentCategory = categories.find(
    (c) => String(c.id) === String(selectedCategoryId)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white overflow-hidden rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] border border-gray-100 animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {initialData ? "Edit Rate Card & Rate List" : "Create Rate Card & Rate List"}
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                First select the Category for this Rate Card, then manage the Rate List items inside it.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-all text-white/90 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-gray-200">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: RATE CARD SETUP */}
          <div className="p-5 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-slate-50 rounded-2xl border border-blue-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-blue-100">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                1
              </span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Step 1: Rate Card Details
                </h3>
                <p className="text-xs text-gray-500">
                  Select the category and set the title for this Rate Card.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Rate Card Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                >
                  <option value="">-- Choose Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1.5">
                  <span>
                    {loadingCategoryData
                      ? "Loading category info..."
                      : currentCategory
                      ? `${categoryServices.length} service(s) currently in this category`
                      : "Select category to link rate card"}
                  </span>
                </div>
              </div>

              {/* Rate Card Name / Heading */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Rate Card Name / Heading <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={rateListHeading}
                  onChange={(e) => setRateListHeading(e.target.value)}
                  placeholder="e.g. Standard Inspection & Repair Charges"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Shown as the heading on the website & customer booking modal.
                </p>
              </div>
            </div>
          </div>

          {/* STEP 2: RATE LIST INSIDE RATE CARD */}
          <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                  2
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-gray-900">
                      Step 2: Rate List (Items Inside This Rate Card)
                    </h3>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200">
                      {rateItems.length} items
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Define individual inspection charges, component rates, and warranties.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddRateRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Rate Item
              </button>
            </div>

            {/* Rate Items Table / List */}
            {rateItems.length === 0 ? (
              <div className="py-8 px-4 text-center bg-gray-50/60 rounded-xl border border-dashed border-gray-300">
                <p className="text-sm text-gray-600 font-medium">
                  No rate items added in this rate card yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Click the button below to add pricing items like Visit Charges, PCB Repair, Gas Refill, etc.
                </p>
                <button
                  type="button"
                  onClick={handleAddRateRow}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add First Item
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase px-3">
                  <div className="col-span-5">Item Title / Service Component</div>
                  <div className="col-span-3">Price (₹)</div>
                  <div className="col-span-3">Warranty</div>
                  <div className="col-span-1 text-center">Action</div>
                </div>

                {rateItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50/80 hover:bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:grid sm:grid-cols-12 gap-2.5 items-center transition-all"
                  >
                    <div className="w-full sm:col-span-5">
                      <label className="block sm:hidden text-xs font-semibold text-gray-500 mb-1">
                        Item Title
                      </label>
                      <input
                        type="text"
                        value={item.title || ""}
                        onChange={(e) =>
                          handleRateRowChange(idx, "title", e.target.value)
                        }
                        placeholder="e.g. PCB Repair / Inspection Visit"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                      />
                    </div>
                    <div className="w-full sm:col-span-3">
                      <label className="block sm:hidden text-xs font-semibold text-gray-500 mb-1">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.price ?? ""}
                        onChange={(e) =>
                          handleRateRowChange(idx, "price", e.target.value)
                        }
                        placeholder="₹ Amount"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                      />
                    </div>
                    <div className="w-full sm:col-span-3">
                      <label className="block sm:hidden text-xs font-semibold text-gray-500 mb-1">
                        Warranty
                      </label>
                      <input
                        type="text"
                        value={item.warranty || ""}
                        onChange={(e) =>
                          handleRateRowChange(idx, "warranty", e.target.value)
                        }
                        placeholder="e.g. 30 Days / 3 Months"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                      />
                    </div>
                    <div className="w-full sm:col-span-1 flex justify-end sm:justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRateRow(idx)}
                        title="Delete item"
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-500 hidden sm:block">
            {currentCategory
              ? `Applies to all services in "${currentCategory.name}"`
              : "Select category above"}
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !selectedCategoryId}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {saving ? "Saving Rate Card..." : "Save Rate Card & Rate List"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

