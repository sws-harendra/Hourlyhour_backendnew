import { useState } from "react";
// import CategoryForm from "./CategoryForm";
import { CategoryService } from "../../services/category.service";
import { useEffect } from "react";
import { Edit2, Package, Plus, Trash2 } from "lucide-react";
import CategoryForm from "./categoryAdd";
import Delete from "../../components/Delete";
export default function Categories() {
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    const res = await CategoryService.getAllCategories();

    // ✅ FIX HERE
    setCategories(res.data.data);

    setLoading(false);
  };

  const handleDelete = async () => {
    try {
      setDeletingId(deleteId);
      await CategoryService.deleteCategory(deleteId);

      // instant UI update
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      await load();
    };

    fetchCategories();
  }, []);
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Categories
              </h1>
              <p className="text-gray-600">Manage your product categories</p>
            </div>
            <button
              onClick={() => {
                setSelected(null);
                setOpenForm(true);
              }}
              className="group flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              Add Category
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first category
            </p>
            <button
              onClick={() => {
                setSelected(null);
                setOpenForm(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories?.map((cat) => (
              <div
                key={cat.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                {cat.image ? (
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ) : (
                  <div className="h-48 bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Package className="w-16 h-16 text-blue-600 opacity-50" />
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setSelected(cat);
                        setOpenForm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors duration-200"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setDeleteId(cat.id);
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-xl font-medium hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {openForm && (
        <CategoryForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          data={selected}
          reload={load}
        />
      )}
      <Delete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deletingId === deleteId}
        title="Delete Category?"
        description="This category will be permanently removed."
      />
    </div>
  );
}
