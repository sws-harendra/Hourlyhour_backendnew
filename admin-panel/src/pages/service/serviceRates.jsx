import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { ServiceService } from "../../services/services.service";
import { useParams } from "react-router-dom";
import Delete from "../../components/Delete";

export default function ServiceRates() {
  const { id: serviceId } = useParams();

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newRates, setNewRates] = useState([
    { title: "", price: "", warranty: "" },
  ]);

  const [editModal, setEditModal] = useState(false);
  const [editRate, setEditRate] = useState({
    id: "",
    title: "",
    price: "",
    warranty: "",
    oldTitle: "",
  });

  const [applyToCategory, setApplyToCategory] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteRate, setDeleteRate] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [syncModal, setSyncModal] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const load = async () => {
    try {
      const res = await ServiceService.getByService(serviceId);
      setRates(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddRow = () => {
    setNewRates([...newRates, { title: "", price: "", warranty: "" }]);
  };

  const handleRemoveRow = (index) => {
    const temp = [...newRates];
    temp.splice(index, 1);
    setNewRates(temp);
  };

  const handleChange = (index, field, value) => {
    const temp = [...newRates];
    temp[index][field] = value;
    setNewRates(temp);
  };

  const handleSubmit = async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    try {
      if (applyToCategory) {
        await Promise.all(
          newRates.map((rate) =>
            ServiceService.bulkAddRate({
              serviceId,
              title: rate.title,
              price: rate.price,
              warranty: rate.warranty,
            })
          )
        );
      } else {
        await Promise.all(
          newRates.map((rate) =>
            ServiceService.addRate({
              serviceId,
              title: rate.title,
              price: rate.price,
              warranty: rate.warranty,
            })
          )
        );
      }

      setShowModal(false);
      setNewRates([{ title: "", price: "" }]);
      setApplyToCategory(false);
      load();
    } catch (error) {
      console.error(error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleEditClick = (rate) => {
    setEditRate({
      id: rate.id,
      title: rate.title,
      price: rate.price,
      warranty: rate.warranty || "",
      oldTitle: rate.title,
    });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      if (applyToCategory) {
        await ServiceService.bulkUpdateRate({
          serviceId,
          oldTitle: editRate.oldTitle,
          title: editRate.title,
          price: editRate.price,
          warranty: editRate.warranty,
        });
      } else {
        await ServiceService.updateRate(editRate.id, {
          title: editRate.title,
          price: editRate.price,
          warranty: editRate.warranty,
        });
      }

      setEditModal(false);
      setApplyToCategory(false);
      load();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = (rate) => {
    setDeleteRate(rate);
    setDeleteModal(true);
  };

  const confirmDelete = async (isBulk = false) => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    try {
      if (isBulk) {
        await ServiceService.bulkDeleteRate({
          serviceId,
          title: deleteRate.title,
        });
      } else {
        await ServiceService.deleteRate(deleteRate.id);
      }

      setDeleteModal(false);
      setDeleteRate(null);
      load();
    } catch (error) {
      console.error(error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSyncToCategory = async () => {
    setSyncLoading(true);

    try {
      await ServiceService.syncRatesToCategory(serviceId, "replace");

      setSyncModal(false);
      setSyncResult({
        type: "success",
        title: "Sync Completed",
        description: "Rates synced to all services successfully.",
      });

      load();
    } catch (error) {
      console.error(error);

      setSyncModal(false);
      setSyncResult({
        type: "error",
        title: "Sync Failed",
        description: "Unable to sync category rates.",
      });
    } finally {
      setSyncLoading(false);
    }
  };
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Service Rate
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => setSyncModal(true)}
            disabled={syncLoading}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50"
          >
            {syncLoading ? "Syncing..." : "Sync to Category"}
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <Plus size={16} />
            Add Rate
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-left">Warranty</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No rates found
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr key={rate.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{rate.id}</td>
                  <td className="py-3 px-4">{rate.title}</td>
                  <td className="py-3 px-4 font-medium">₹{rate.price}</td>

                  <td className="py-3 px-4">
                    {rate.warranty ? `${rate.warranty} Days` : "-"}
                  </td>

                  <td className="py-3 px-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(rate)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded"
                    >
                      <Pencil size={16} className="text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(rate)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-[calc(100%-24px)] sm:w-[480px] mx-3 max-h-[80vh] overflow-y-auto">

            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Add Service Rates</h3>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {newRates.map((rate, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center bg-gray-50 border border-gray-100 rounded-2xl p-3"
                >
                  <input
                    type="text"
                    placeholder="Rate Title"
                    value={rate.title}
                    onChange={(e) =>
                      handleChange(index, "title", e.target.value)
                    }
                    className="sm:col-span-6 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Price"
                    value={rate.price}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "price",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    className="sm:col-span-3 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Days"
                    value={rate.warranty}
                    onChange={(e) =>
                      handleChange(
                        index,
                        "warranty",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                    className="sm:col-span-3 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {newRates.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="sm:col-span-2 w-full sm:w-auto py-2 px-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl flex justify-center"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <input
                  type="checkbox"
                  id="applyToCategoryAdd"
                  checked={applyToCategory}
                  onChange={(e) => setApplyToCategory(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label
                  htmlFor="applyToCategoryAdd"
                  className="text-sm text-gray-700 font-medium"
                >
                  Apply to all services in this category
                </label>
              </div>

              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 text-blue-600"
              >
                <Plus size={16} />
                Add another rate
              </button>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={saveLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {saveLoading ? "Saving..." : "Save Rates"}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[calc(100%-24px)] sm:w-[420px] mx-3">

            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Edit Rate</h3>

              <button
                onClick={() => setEditModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Rate Title"
                value={editRate.title}
                onChange={(e) =>
                  setEditRate({ ...editRate, title: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                inputMode="numeric"
                placeholder="Price"
                value={editRate.price}
                onChange={(e) =>
                  setEditRate({
                    ...editRate,
                    price: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                inputMode="numeric"
                placeholder="Warranty Days"
                value={editRate.warranty}
                onChange={(e) =>
                  setEditRate({
                    ...editRate,
                    warranty: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="applyToCategoryEdit"
                  checked={applyToCategory}
                  onChange={(e) => setApplyToCategory(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label
                  htmlFor="applyToCategoryEdit"
                  className="text-sm text-gray-700 font-medium"
                >
                  Update in all services in this category (matches by title)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {updateLoading ? "Updating..." : "Update"}
              </button>
            </div>

          </div>
        </div>
      )}

      {deleteModal && deleteRate && (
        <Delete
          open={deleteModal}
          title={`Delete "${deleteRate.title}" ?`}
          description="Delete this service rate."
          onClose={() => {
            setDeleteModal(false);
            setDeleteRate(null);
          }}
          onConfirm={() => confirmDelete(false)}
        />
      )}

      {syncModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Sync to Category
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                This will replace all existing rates in other services of this category.
              </p>
            </div>

            <div className="p-6 flex justify-end gap-3">
              <button
                onClick={() => setSyncModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={handleSyncToCategory}
                disabled={syncLoading}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
              >
                {syncLoading ? "Syncing..." : "Confirm Sync"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}