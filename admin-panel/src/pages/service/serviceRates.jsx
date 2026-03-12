import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { ServiceService } from "../../services/services.service";
import { useParams } from "react-router-dom";

export default function ServiceRates() {
  const { id: serviceId } = useParams();

  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newRates, setNewRates] = useState([{ title: "", price: "" }]);

  const [editModal, setEditModal] = useState(false);
  const [editRate, setEditRate] = useState({ id: "", title: "", price: "" });

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
    setNewRates([...newRates, { title: "", price: "" }]);
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
    try {
      await Promise.all(
        newRates.map((rate) =>
          ServiceService.addRate({
            serviceId,
            title: rate.title,
            price: rate.price,
          })
        )
      );

      setShowModal(false);
      setNewRates([{ title: "", price: "" }]);
      load();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (rate) => {
    setEditRate({
      id: rate.id,
      title: rate.title,
      price: rate.price,
    });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await ServiceService.updateRate(editRate.id, {
        title: editRate.title,
        price: editRate.price,
      });

      setEditModal(false);
      load();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this rate?")) return;

    try {
      await ServiceService.deleteRate(id);
      load();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Service Rate List
        </h2>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <Plus size={16} />
          Add Rate
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Price</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : rates.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-400">
                  No rates found
                </td>
              </tr>
            ) : (
              rates.map((rate) => (
                <tr key={rate.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{rate.id}</td>
                  <td className="py-3 px-4">{rate.title}</td>
                  <td className="py-3 px-4 font-medium">₹{rate.price}</td>

                  <td className="py-3 px-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(rate)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded"
                    >
                      <Pencil size={16} className="text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(rate.id)}
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
          
          <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[80vh] overflow-y-auto">

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
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Rate Title"
                    value={rate.title}
                    onChange={(e) =>
                      handleChange(index, "title", e.target.value)
                    }
                    className="flex-1 border rounded-lg px-3 py-2"
                  />

                  <input
                    type="number"
                    placeholder="Price"
                    value={rate.price}
                    onChange={(e) =>
                      handleChange(index, "price", e.target.value)
                    }
                    className="w-28 border rounded-lg px-3 py-2"
                  />

                  {newRates.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="text-red-500"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              ))}

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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save Rates
              </button>
            </div>

          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

          <div className="bg-white rounded-xl shadow-xl w-[420px]">

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
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="number"
                placeholder="Price"
                value={editRate.price}
                onChange={(e) =>
                  setEditRate({ ...editRate, price: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />
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
                Update
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}