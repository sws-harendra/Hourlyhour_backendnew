import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Receipt,
  Layers,
  Plus,
  Trash2,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  IndianRupee,
  RefreshCw,
  FolderPlus,
  Sparkles,
} from "lucide-react";
import { ServiceService } from "../../services/services.service";
import { CategoryService } from "../../services/category.service";
import toast from "react-hot-toast";
import Delete from "../../components/Delete";
import ServiceForm from "./serviceAdd";

export default function RateCardsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Rate Cards list & Categories data
  const [rateCards, setRateCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Mode: "overview" (view all cards) | "inside" (inside a specific rate card)
  const [selectedCard, setSelectedCard] = useState(null);

  // Rate List items inside selected card
  const [rateItems, setRateItems] = useState([]);
  const [cardHeading, setCardHeading] = useState("");
  const [savingRates, setSavingRates] = useState(false);

  // Create Rate Card Modal (Step 1)
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [newCardCategoryId, setNewCardCategoryId] = useState("");
  const [newCardHeading, setNewCardHeading] = useState("");
  const [createModalError, setCreateModalError] = useState("");

  // Reset / Delete Rate Card Modal
  const [resetModalCard, setResetModalCard] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Add Service directly to this Rate Card
  const [openServiceForm, setOpenServiceForm] = useState(false);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [rateCardsRes, categoriesRes] = await Promise.all([
        ServiceService.getRateCardsOverview(),
        CategoryService.getAllCategories(),
      ]);

      const cards = rateCardsRes.data?.data || [];
      const cats = categoriesRes.data?.data || [];

      setRateCards(cards);
      setCategories(cats);

      // Check URL query param ?category=ID
      const catParam = searchParams.get("category");
      if (catParam) {
        const found = cards.find((c) => String(c.categoryId) === String(catParam));
        if (found) {
          openCardDetail(found);
        }
      }
    } catch (err) {
      console.error("Failed to load rate cards overview:", err);
      toast.error("Failed to load rate cards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Enter inside a Rate Card ("rate card ke andar jakar")
  const openCardDetail = (card) => {
    setSelectedCard(card);
    setCardHeading(card.rateListHeading || `${card.categoryName} Rate Card`);

    if (Array.isArray(card.rates) && card.rates.length > 0) {
      setRateItems(
        card.rates.map((r) => ({
          id: r.id,
          title: r.title || "",
          price: r.price !== null && r.price !== undefined ? r.price : "",
          warranty: r.warranty || "",
        }))
      );
    } else {
      setRateItems([
        { title: "Standard Inspection & Diagnosis", price: 199, warranty: "30 Days" },
      ]);
    }

    setSearchParams({ category: String(card.categoryId) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Exit back to overview
  const backToOverview = () => {
    setSelectedCard(null);
    setRateItems([]);
    setCardHeading("");
    setSearchParams({});
    loadData();
  };

  // Dynamic row manipulation inside Rate Card
  const handleAddRow = () => {
    setRateItems((prev) => [
      ...prev,
      { title: "", price: "", warranty: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    setRateItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRowChange = (index, field, value) => {
    setRateItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Save the Rate List inside the Rate Card
  const handleSaveRateList = async () => {
    if (!selectedCard) return;

    if (!cardHeading.trim()) {
      toast.error("Please enter a Rate Card name / heading");
      return;
    }

    const cleanRates = rateItems
      .filter((r) => r && r.title && r.title.trim() !== "")
      .map((r) => ({
        title: r.title.trim(),
        price: r.price !== null && r.price !== "" ? parseFloat(r.price) : 0,
        warranty: r.warranty ? String(r.warranty).trim() : null,
      }));

    if (cleanRates.length === 0) {
      toast.error("Please add at least one rate item with a title and price");
      return;
    }

    try {
      setSavingRates(true);

      const payload = {
        categoryId: selectedCard.categoryId,
        rateListHeading: cardHeading.trim(),
        rates: cleanRates,
      };

      const res = await ServiceService.saveCategoryRateCard(payload);

      if (res.data?.success) {
        toast.success(
          `Rate Card & ${cleanRates.length} Rate List items saved successfully!`
        );

        // Update local state
        setSelectedCard((prev) => ({
          ...prev,
          rateListHeading: cardHeading.trim(),
          rates: cleanRates,
        }));

        loadData();
      } else {
        toast.error(res.data?.message || "Failed to save rate list");
      }
    } catch (err) {
      console.error("Save Rate List Error:", err);
      toast.error(
        err.response?.data?.message || "Failed to save rate list. Please try again."
      );
    } finally {
      setSavingRates(false);
    }
  };

  // Step 1: Create Rate Card Modal submission -> Immediately enters into the card!
  const handleCreateStep1Submit = () => {
    setCreateModalError("");

    if (!newCardCategoryId) {
      setCreateModalError("Please select a category for the rate card.");
      return;
    }

    const categoryObj = categories.find(
      (c) => String(c.id) === String(newCardCategoryId)
    );

    if (!categoryObj) {
      setCreateModalError("Selected category not found.");
      return;
    }

    const heading =
      newCardHeading.trim() || `${categoryObj.name} Service & Repair Rate Card`;

    // Check if card already exists in overview
    const existing = rateCards.find(
      (c) => String(c.categoryId) === String(newCardCategoryId)
    );

    const cardToOpen = existing
      ? { ...existing, rateListHeading: heading }
      : {
          categoryId: categoryObj.id,
          categoryName: categoryObj.name,
          categoryImage: categoryObj.image,
          servicesCount: 0,
          rateListHeading: heading,
          rates: [],
        };

    setOpenCreateModal(false);
    setNewCardCategoryId("");
    setNewCardHeading("");

    // Directly open inside the card so user can add rate items
    openCardDetail(cardToOpen);
    toast.success(
      `Rate Card for "${categoryObj.name}" created. Now add your Rate List items below!`
    );
  };

  // Reset / Delete Rate Card
  const handleResetConfirm = async () => {
    if (!resetModalCard) return;

    try {
      setResetLoading(true);
      await ServiceService.deleteCategoryRateCard(resetModalCard.categoryId);
      toast.success(
        `Rate card for "${resetModalCard.categoryName}" has been reset.`
      );
      setResetModalCard(null);

      if (selectedCard?.categoryId === resetModalCard.categoryId) {
        backToOverview();
      } else {
        loadData();
      }
    } catch (err) {
      console.error("Failed to reset rate card:", err);
      toast.error("Failed to reset rate card");
    } finally {
      setResetLoading(false);
    }
  };

  // Filtered rate cards for search
  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return rateCards;
    const q = searchQuery.toLowerCase();
    return rateCards.filter(
      (c) =>
        c.categoryName?.toLowerCase().includes(q) ||
        c.rateListHeading?.toLowerCase().includes(q) ||
        (Array.isArray(c.rates) &&
          c.rates.some((r) => r.title?.toLowerCase().includes(q)))
    );
  }, [rateCards, searchQuery]);

  // Statistics
  const totalCategories = rateCards.length;
  const configuredCards = rateCards.filter(
    (c) => c.rates && c.rates.length > 0
  ).length;
  const totalRatesCount = rateCards.reduce(
    (acc, c) => acc + (c.rates?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ======================================================== */}
        {/* VIEW 1: OVERVIEW OF ALL CATEGORY RATE CARDS               */}
        {/* ======================================================== */}
        {!selectedCard ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                  <Receipt className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Rate Cards Management
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Select a Category to create its Rate Card, then go inside to manage transparent component pricing.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/service")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-2xl border border-gray-200 transition-all cursor-pointer"
                >
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Services List
                </button>

                <button
                  type="button"
                  onClick={() => setOpenCreateModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Create Rate Card
                </button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Total Categories
                  </span>
                  <p className="text-2xl font-black text-gray-900 mt-1">
                    {totalCategories}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Configured Rate Cards
                  </span>
                  <p className="text-2xl font-black text-emerald-600 mt-1">
                    {configuredCards}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Total Rate Items
                  </span>
                  <p className="text-2xl font-black text-indigo-600 mt-1">
                    {totalRatesCount}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Search Filter */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Search rate cards by category name or component title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-medium focus:outline-none placeholder-gray-400 text-gray-800"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-gray-400 hover:text-gray-600 font-semibold px-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Rate Cards Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-10 bg-gray-100 rounded-xl"></div>
                    <div className="h-24 bg-gray-100 rounded-xl"></div>
                    <div className="h-10 bg-gray-200 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  No Rate Cards Found
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {searchQuery
                    ? "No rate cards match your search term. Try a different keyword."
                    : "Create your first category rate card to manage component charges and inspection rates."}
                </p>
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(true)}
                  className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  + Create First Rate Card
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCards.map((card) => {
                  const hasRates = Array.isArray(card.rates) && card.rates.length > 0;

                  return (
                    <div
                      key={card.categoryId}
                      className="bg-white rounded-3xl p-6 shadow-xs border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top Category Info */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            {card.categoryImage ? (
                              <img
                                src={card.categoryImage}
                                alt={card.categoryName}
                                className="w-12 h-12 object-cover rounded-2xl border border-gray-100 shadow-xs"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                                {card.categoryName?.charAt(0)}
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                {card.categoryName}
                              </h3>
                              <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Briefcase className="w-3 h-3 text-gray-400" />
                                {card.servicesCount} linked service(s)
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              hasRates
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {hasRates ? `${card.rates.length} Items` : "No Items"}
                          </span>
                        </div>

                        {/* Rate Card Heading */}
                        <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 mb-4">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Rate Card Name / Heading:
                          </span>
                          <p className="text-sm font-bold text-gray-800 line-clamp-1">
                            {card.rateListHeading || (
                              <span className="text-gray-400 italic">
                                Heading not set yet
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Rate List Preview */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-gray-600">
                              Rate List Items Preview:
                            </span>
                            {hasRates && (
                              <span className="text-[11px] text-blue-600 font-semibold">
                                View all ({card.rates.length})
                              </span>
                            )}
                          </div>

                          {hasRates ? (
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {card.rates.slice(0, 4).map((rate, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-gray-50/70 border border-gray-100 text-gray-700"
                                >
                                  <span className="truncate max-w-[170px] font-medium">
                                    {rate.title}
                                  </span>
                                  <div className="flex items-center gap-2 shrink-0">
                                    {rate.warranty && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                                        {rate.warranty}
                                      </span>
                                    )}
                                    <span className="font-bold text-gray-900">
                                      ₹{rate.price}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {card.rates.length > 4 && (
                                <p className="text-[11px] text-gray-400 text-center pt-1 font-medium">
                                  + {card.rates.length - 4} more items inside
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="py-4 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                              <p className="text-xs text-gray-400 italic">
                                Empty Rate List. Click below to add items.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openCardDetail(card)}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          Open Rate List
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {hasRates && (
                          <button
                            type="button"
                            onClick={() => setResetModalCard(card)}
                            title="Reset / Clear this rate card"
                            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW 2: INSIDE THE RATE CARD ("Rate Card ke Andar")        */
          /* ======================================================== */
          <div className="space-y-6 animate-fadeIn">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={backToOverview}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-2xl border border-gray-200 shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Rate Cards
              </button>

              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <span>Rate Cards</span>
                <span>/</span>
                <span className="font-bold text-blue-600">
                  {selectedCard.categoryName}
                </span>
              </div>
            </div>

            {/* Rate Card Header & Category Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  {selectedCard.categoryImage ? (
                    <img
                      src={selectedCard.categoryImage}
                      alt={selectedCard.categoryName}
                      className="w-14 h-14 object-cover rounded-2xl border border-gray-100 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20">
                      {selectedCard.categoryName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      Rate Card Category:
                    </span>
                    <h2 className="text-2xl font-black text-gray-900">
                      {selectedCard.categoryName}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-2xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    {selectedCard.servicesCount || 0} Linked Services
                  </span>
                  <span className="px-3.5 py-1.5 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                    {rateItems.length} Rate List Items
                  </span>
                </div>
              </div>

              {/* Rate Card Name Input */}
              <div className="mt-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Rate Card Name / Heading <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardHeading}
                    onChange={(e) => setCardHeading(e.target.value)}
                    placeholder="e.g. Standard Inspection & Component Repair Charges"
                    className="w-full px-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-bold text-gray-900 transition-all"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  This heading appears as the Rate Card title on customer quotation screens and booking modals.
                </p>
              </div>
            </div>

            {/* RATE LIST (ITEMS INSIDE THIS RATE CARD) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-gray-900">
                      Rate List Items
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      Inside this Rate Card
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Add component charges, spare parts, and diagnosis prices for this card.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenServiceForm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    + Add Service to this Rate Card
                  </button>

                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    + Add Component Row
                  </button>
                </div>
              </div>

              {/* Rate Items Table */}
              <div className="mt-6">
                {rateItems.length === 0 ? (
                  <div className="py-12 px-4 text-center bg-gray-50/70 rounded-3xl border border-dashed border-gray-300">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <p className="text-base font-bold text-gray-800">
                      No rate items added yet
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Click the button below to add your first rate item (e.g. Visit Charges, PCB Repair, Gas Top-up).
                    </p>
                    <button
                      type="button"
                      onClick={handleAddRow}
                      className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Rate Item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Table Header */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-xs font-bold text-gray-500 uppercase px-4 pb-2">
                      <div className="col-span-5">Item Title / Component *</div>
                      <div className="col-span-3">Price (₹) *</div>
                      <div className="col-span-3">Warranty Period</div>
                      <div className="col-span-1 text-center">Action</div>
                    </div>

                    {/* Table Rows */}
                    {rateItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50/80 hover:bg-gray-50 p-3.5 rounded-2xl border border-gray-200 flex flex-col sm:grid sm:grid-cols-12 gap-3 items-center transition-all hover:border-blue-300"
                      >
                        {/* Title */}
                        <div className="w-full sm:col-span-5">
                          <label className="block sm:hidden text-xs font-bold text-gray-500 mb-1">
                            Item Title / Component
                          </label>
                          <input
                            type="text"
                            value={item.title || ""}
                            onChange={(e) =>
                              handleRowChange(idx, "title", e.target.value)
                            }
                            placeholder="e.g. PCB Repair / Gas Refill"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-gray-800"
                          />
                        </div>

                        {/* Price */}
                        <div className="w-full sm:col-span-3">
                          <label className="block sm:hidden text-xs font-bold text-gray-500 mb-1">
                            Price (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={item.price ?? ""}
                              onChange={(e) =>
                                handleRowChange(idx, "price", e.target.value)
                              }
                              placeholder="0"
                              className="w-full pl-7 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-gray-900"
                            />
                          </div>
                        </div>

                        {/* Warranty */}
                        <div className="w-full sm:col-span-3">
                          <label className="block sm:hidden text-xs font-bold text-gray-500 mb-1">
                            Warranty
                          </label>
                          <input
                            type="text"
                            value={item.warranty || ""}
                            onChange={(e) =>
                              handleRowChange(idx, "warranty", e.target.value)
                            }
                            placeholder="e.g. 30 Days / 3 Months"
                            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium text-gray-700"
                          />
                        </div>

                        {/* Action */}
                        <div className="w-full sm:col-span-1 flex justify-end sm:justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            title="Remove this item"
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Quick Add Row Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAddRow}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 p-2 rounded-xl hover:bg-blue-50 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        + Add Another Row
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action Bar */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                  <span>Total Items: <strong className="text-gray-900">{rateItems.length}</strong></span>
                  <span>•</span>
                  <span>
                    Price Sum:{" "}
                    <strong className="text-blue-700">
                      ₹
                      {rateItems.reduce(
                        (sum, r) => sum + (parseFloat(r.price) || 0),
                        0
                      )}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={backToOverview}
                    disabled={savingRates}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveRateList}
                    disabled={savingRates}
                    className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingRates ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Saving Rate List...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Save Rate Card &amp; Rate List
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1 MODAL: CREATE RATE CARD (CATEGORY SELECTION)      */}
        {/* ======================================================== */}
        {openCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 p-6 sm:p-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Create Rate Card
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Step 1: Choose category and set heading, then add rate items.
                  </p>
                </div>
              </div>

              {createModalError && (
                <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createModalError}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Select Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newCardCategoryId}
                    onChange={(e) => {
                      setNewCardCategoryId(e.target.value);
                      const cat = categories.find(
                        (c) => String(c.id) === String(e.target.value)
                      );
                      if (cat) {
                        setNewCardHeading(`${cat.name} Service & Repair Charges`);
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rate Card Heading */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Rate Card Name / Heading
                  </label>
                  <input
                    type="text"
                    value={newCardHeading}
                    onChange={(e) => setNewCardHeading(e.target.value)}
                    placeholder="e.g. AC Inspection & Component Repair Rate Card"
                    className="w-full px-4 py-3 bg-gray-50 focus:bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Will be displayed on customer booking screens and quotations.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenCreateModal(false);
                    setCreateModalError("");
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleCreateStep1Submit}
                  className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  Proceed to Rate List
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Service Form Modal */}
        <ServiceForm
          open={openServiceForm}
          onClose={() => setOpenServiceForm(false)}
          initialCategoryId={selectedCard?.categoryId}
          initialRateCardHeading={cardHeading}
          reload={() => {
            loadData();
          }}
        />

        {/* Delete / Reset Modal */}
        <Delete
          open={!!resetModalCard}
          title={`Reset Rate Card for ${resetModalCard?.categoryName}?`}
          description="This will clear all rate items and headings for this category."
          loading={resetLoading}
          onClose={() => setResetModalCard(null)}
          onConfirm={handleResetConfirm}
        />
      </div>
    </div>
  );
}
