import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Calendar, Shield } from "lucide-react";
import { WarrantyService } from "../../services/warranty.service";
import { ServiceService } from "../../services/services.service";
import { useParams } from "react-router-dom";

export default function WarrantyList() {
  const { id: serviceId } = useParams();

  const [warranties, setWarranties] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newWarranties, setNewWarranties] = useState([
    { title: "", durationInDays: "", description: "" },
  ]);

  const [editModal, setEditModal] = useState(false);
  const [editWarranty, setEditWarranty] = useState({
    id: "",
    title: "",
    durationInDays: "",
    description: "",
  });

  // Load warranty data
  const load = async () => {
    try {
      setLoading(true);
      if (serviceId) {
        const res = await WarrantyService.getByService(serviceId);
        setWarranties(res.data.data || []);
      } else {
        const res = await WarrantyService.getAllWarranties();
        setWarranties(res.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Load services
  const loadServices = async () => {
    try {
      const res = await ServiceService.getAll({ limit: 1000 });
      setServices(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load();
    loadServices();
  }, [serviceId]);

  const handleAddRow = () => {
    setNewWarranties([
      ...newWarranties,
      { title: "", durationInDays: "", description: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    const temp = [...newWarranties];
    temp.splice(index, 1);
    setNewWarranties(temp);
  };

  const handleChange = (index, field, value) => {
    const temp = [...newWarranties];
    temp[index][field] = value;
    setNewWarranties(temp);
  };

  const handleSubmit = async () => {
    try {
      await Promise.all(
        newWarranties.map((warranty) =>
          WarrantyService.createWarranty({
            serviceId,
            title: warranty.title,
            description: warranty.description,
            durationInDays: parseInt(warranty.durationInDays),
            status: "active",
          }),
        ),
      );

      setShowModal(false);
      setNewWarranties([{ title: "", durationInDays: "", description: "" }]);
      load();
    } catch (error) {
      console.error(error);
      alert("Failed to add warranties");
    }
  };

  const handleEditClick = (warranty) => {
    setEditWarranty({
      id: warranty.id,
      title: warranty.title,
      durationInDays: warranty.durationInDays,
      description: warranty.description || "",
    });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      await WarrantyService.updateWarranty(editWarranty.id, {
        title: editWarranty.title,
        durationInDays: parseInt(editWarranty.durationInDays),
        description: editWarranty.description,
        status: "active",
      });
      setEditModal(false);
      load();
    } catch (error) {
      console.error(error);
      alert("Failed to update warranty");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warranty?"))
      return;

    try {
      await WarrantyService.deleteWarranty(id);
      load();
    } catch (error) {
      console.error(error);
      alert("Failed to delete warranty");
    }
  };

  const getServiceName = () => {
    const service = services.find((s) => s.id === parseInt(serviceId));
    return service?.title || "Unknown Service";
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            Warranty Management
          </h2>
          {serviceId && (
            <p className="text-sm text-gray-500 mt-1">
              Service: {getServiceName()}
            </p>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
        >
          <Plus size={16} />
          Add Warranty
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="py-3 px-4 text-left">ID</th>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Duration (Days)</th>
              <th className="py-3 px-4 text-left">Description</th>
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
            ) : warranties.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No warranties found
                </td>
              </tr>
            ) : (
              warranties.map((warranty) => (
                <tr key={warranty.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{warranty.id}</td>
                  <td className="py-3 px-4 font-medium">{warranty.title}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-600" />
                      {warranty.durationInDays} days
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-xs">
                    {warranty.description || "N/A"}
                  </td>

                  <td className="py-3 px-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleEditClick(warranty)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded"
                      title="Edit"
                    >
                      <Pencil size={16} className="text-blue-600" />
                    </button>

                    <button
                      onClick={() => handleDelete(warranty.id)}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded"
                      title="Delete"
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

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Add Warranty</h3>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <X />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {newWarranties.map((warranty, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="Warranty Title"
                    value={warranty.title}
                    onChange={(e) =>
                      handleChange(index, "title", e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <input
                    type="number"
                    placeholder="Duration in Days"
                    value={warranty.durationInDays}
                    onChange={(e) =>
                      handleChange(index, "durationInDays", e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  />

                  <textarea
                    placeholder="Description (optional)"
                    value={warranty.description}
                    onChange={(e) =>
                      handleChange(index, "description", e.target.value)
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    rows="2"
                  />

                  {newWarranties.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(index)}
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddRow}
                className="flex items-center gap-2 text-blue-600"
              >
                <Plus size={16} />
                Add another warranty
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Warranty
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[500px]">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold">Edit Warranty</h3>

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
                placeholder="Warranty Title"
                value={editWarranty.title}
                onChange={(e) =>
                  setEditWarranty({ ...editWarranty, title: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <input
                type="number"
                placeholder="Duration in Days"
                value={editWarranty.durationInDays}
                onChange={(e) =>
                  setEditWarranty({
                    ...editWarranty,
                    durationInDays: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2"
              />

              <textarea
                placeholder="Description (optional)"
                value={editWarranty.description}
                onChange={(e) =>
                  setEditWarranty({
                    ...editWarranty,
                    description: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows="3"
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Warranty
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
