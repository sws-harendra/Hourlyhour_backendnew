"use client";
import React, { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { sectionService } from "../../services/section.service";
import { ServiceService } from "../../services/services.service";

export default function ManageSections() {
  const [sections, setSections] = useState([]);
  const [services, setServices] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "service",
    order: 0,
  });

  const [selectedServices, setSelectedServices] = useState([]);

  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  /* ================= FETCH DATA ================= */

  const fetchSections = async () => {
    const res = await sectionService.getAllSections();
    setSections(res.sections || []);
  };

  const fetchServices = async () => {
    const res = await ServiceService.getAllServices();
    setServices(Array.isArray(res.data?.data) ? res.data.data : []);
  };

  useEffect(() => {
    fetchSections();
    fetchServices();
  }, []);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const toggleService = (id) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("Title is required");
      return;
    }

    try {
      setLoading(true);

      const payload = { ...form, serviceIds: selectedServices };

      if (isEdit) {
        await sectionService.updateSection(editingId, payload);
      } else {
        await sectionService.createSection(payload);
      }

      setShowModal(false);
      setIsEdit(false);
      setEditingId(null);
      setForm({ title: "", description: "", type: "service", order: 0 });
      setSelectedServices([]);
      fetchSections();
    } catch (error) {
      alert("Failed to save section");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (section) => {
    setIsEdit(true);
    setEditingId(section.id);
    setForm({
      title: section.title || "",
      description: section.description || "",
      type: section.type || "service",
      order: section.order || 0,
    });
    const serviceIds = section.Services?.map((s) => s.id) || [];
    setSelectedServices(serviceIds);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      await sectionService.deleteSection(id);
      fetchSections();
    } catch (error) {
      alert("Failed to delete section");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-white font-semibold">Manage Sections</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Section
        </button>
      </div>

      {/* Sections Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-center">Order</th>
              <th className="px-4 py-3 text-center">Services</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sections.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No sections found
                </td>
              </tr>
            )}

            {sections.map((section) => (
              <tr key={section.id} className="border-t">
                <td className="px-4 py-3">{section.title}</td>
                <td className="px-4 py-3 text-center">{section.order}</td>
                <td className="px-4 py-3 text-center text-xs">
                  {section.Services?.map((s) => s.title).join(", ") || "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      section.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {section.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center space-x-3">
                  <button
                    onClick={() => handleEdit(section)}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ADD / EDIT SECTION MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {isEdit ? "Edit Section" : "Add New Section"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsEdit(false);
                  setEditingId(null);
                  setSelectedServices([]);
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Section title"
                value={form.title}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />

              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded px-3 py-2"
              />

              <input
                type="number"
                name="order"
                placeholder="Order"
                value={form.order}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />

              {/* SERVICES MULTI SELECT */}
              <div>
                <p className="text-sm font-medium mb-2">Select Services</p>
                <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                  {Array.isArray(services) &&
                    services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => toggleService(service.id)}
                        />
                        {service.title}
                      </label>
                    ))}

                  {services.length === 0 && (
                    <p className="text-xs text-gray-500">
                      No services available
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
              >
                {loading
                  ? "Saving..."
                  : isEdit
                  ? "Update Section"
                  : "Create Section"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
