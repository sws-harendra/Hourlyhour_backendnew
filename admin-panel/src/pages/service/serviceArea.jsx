import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { ServiceAreaService } from '../../services/serviceArea.service';
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
const ServiceArea = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const featureGroupRef = useRef(null);
  const drawControlRef = useRef(null);

  const [serviceAreas, setServiceAreas] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const topRef = useRef(null);
  const editingLayerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map centered on India (default view)
    const map = L.map(mapRef.current).setView([25.60727, 85.067846], 14);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create feature group for draw plugin
    const featureGroup = new L.FeatureGroup();
    map.addLayer(featureGroup);

    // Add draw control
    const drawControl = new L.Control.Draw({
      position: "topleft",
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: "#b00b00",
            timeout: 2500,
          },
          shapeOptions: {
            color: "#2196F3",
            fillColor: "#2196F3",
            fillOpacity: 0.3,
            weight: 2,
          },
          showArea: true,
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false, // ← IMPORTANT (this removes small circle icon)
      },
      edit: {
        featureGroup: featureGroup,
        remove: true,
      },
    });

    map.addControl(drawControl);

    // Handle draw events
    map.on("draw:created", (e) => {
      const layer = e.layer;
      featureGroup.addLayer(layer);

      // Extract and process coordinates
      if (layer instanceof L.Polygon) {
        const latlngs = layer.getLatLngs();
        const coordinates = latlngs[0].map((latlng) => [
          latlng.lng,
          latlng.lat,
        ]);

        // Ensure polygon is closed (add first point at end if not already)
        if (
          JSON.stringify(coordinates[0]) !==
          JSON.stringify(coordinates[coordinates.length - 1])
        ) {
          coordinates.push(coordinates[0]);
        }

        const polygon = {
          type: "Polygon",
          coordinates: [coordinates],
        };

        setDrawnPolygon(polygon);
        setMessage(`✓ Polygon created with ${coordinates.length - 1} points`);
      }
    });

    map.on("draw:edited", (e) => {
      const layers = e.layers;

      layers.eachLayer((layer) => {
        if (layer instanceof L.Polygon) {
          const latlngs = layer.getLatLngs();

          const coordinates = latlngs[0].map((latlng) => [
            latlng.lng,
            latlng.lat,
          ]);

          if (
            JSON.stringify(coordinates[0]) !==
            JSON.stringify(coordinates[coordinates.length - 1])
          ) {
            coordinates.push(coordinates[0]);
          }

          const polygon = {
            type: "Polygon",
            coordinates: [coordinates],
          };

          setDrawnPolygon(polygon);
        }
      });
    });
    map.on("draw:deleted", () => {
      setDrawnPolygon(null);
      setMessage("");
    });

    mapInstanceRef.current = map;
    featureGroupRef.current = featureGroup;
    drawControlRef.current = drawControl;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch service areas
  const fetchServiceAreas = async () => {
    try {
      const response = await ServiceAreaService.getAll();
      if (response.success) {
        setServiceAreas(response.data);
      }
    } catch (error) {
      console.error("Error fetching service areas:", error);
      setMessage("Error fetching service areas");
    }
  };

  // Load service areas on mount
  useEffect(() => {
    fetchServiceAreas();
  }, []);

  // Save service area
  const handleSaveServiceArea = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage("⚠️ Please enter service area name");
      return;
    }

    if (!editingId && !drawnPolygon) {
      setMessage("⚠️ Please draw a polygon on the map");
      return;
    }

    setIsLoading(true);
    try {
      let updatedPolygon = drawnPolygon;

      if (editingId && editingLayerRef.current) {
        const latlngs = editingLayerRef.current.getLatLngs();

        const coordinates = latlngs[0].map((latlng) => [
          latlng.lng,
          latlng.lat,
        ]);

        if (
          JSON.stringify(coordinates[0]) !==
          JSON.stringify(coordinates[coordinates.length - 1])
        ) {
          coordinates.push(coordinates[0]);
        }

        updatedPolygon = {
          type: "Polygon",
          coordinates: [coordinates],
        };
      }

      const payload = {
        name,
        description,
        polygon: updatedPolygon || undefined,
        isActive: true,
      };

      const response = editingId
        ? await ServiceAreaService.update(editingId, payload)
        : await ServiceAreaService.create(payload);

      if (response.success) {
        setMessage(
          editingId
            ? "✓ Service area updated successfully!"
            : `✓ Service area "${name}" saved successfully!`
        );

        setName("");
        setDescription("");
        setDrawnPolygon(null);
        setEditingId(null);

        if (featureGroupRef.current) {
          featureGroupRef.current.clearLayers();
        }

        await fetchServiceAreas();
      }
    } catch (error) {
      console.error("Error saving service area:", error);
      setMessage(`✗ Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Display polygon info
  const getPolygonInfo = () => {
    if (!drawnPolygon) return null;

    const coordinates = drawnPolygon.coordinates[0];
    const area = calculatePolygonArea(coordinates);

    return (
      <div className=" bg-white border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Polygon Details</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Points</p>
            <p className="font-semibold text-lg">{coordinates.length - 1}</p>
          </div>
          <div>
            <p className="text-gray-600">Area</p>
            <p className="font-semibold">{area.toFixed(2)} km²</p>
          </div>
        </div>
        <div className="mt-3 p-2 bg-white rounded border border-gray-200 text-xs text-gray-700 max-h-32 overflow-y-auto">
          <p className="font-semibold mb-2">Coordinates [lng, lat]:</p>
          {coordinates.slice(0, 5).map((coord, idx) => (
            <div key={idx}>
              {coord[0].toFixed(6)}, {coord[1].toFixed(6)}
            </div>
          ))}
          {coordinates.length > 6 && (
            <div className="text-gray-500 mt-2">
              ... and {coordinates.length - 6} more points
            </div>
          )}
        </div>
      </div>
    );
  };

  // Calculate polygon area (Shoelace formula)
  const calculatePolygonArea = (coordinates) => {
    const R = 6371; // Earth's radius in km
    let area = 0;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lng1, lat1] = coordinates[i];
      const [lng2, lat2] = coordinates[i + 1];

      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;

      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      area += distance * distance;
    }

    return area / 100;
  };

  const handleDelete = (id) => {
    setDeleteId(id); // open modal
  };
  const confirmDelete = async () => {
    try {
      const response = await ServiceAreaService.delete(deleteId);

      if (response.success) {
        setServiceAreas((prev) => prev.filter((area) => area.id !== deleteId));
        setMessage("✓ Service area deleted successfully");
      }
    } catch (error) {
      setMessage("✗ Failed to delete service area");
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (area) => {
    if (!mapInstanceRef.current || !featureGroupRef.current) return;

    setEditingId(area.id);
    setName(area.name);
    setDescription(area.description || "");

    featureGroupRef.current.clearLayers();

    // 🔥 FIX: parse string to object
    const polygonData = JSON.parse(area.polygon);

    const geoLayer = L.geoJSON(polygonData, {
      style: {
        color: "#2196F3",
        weight: 2,
        fillOpacity: 0.3,
      },
    });

    geoLayer.eachLayer((layer) => {
      featureGroupRef.current.addLayer(layer);

      editingLayerRef.current = layer;

      if (layer.editing) {
        layer.editing.enable();
      }
    });

    mapInstanceRef.current.fitBounds(geoLayer.getBounds());

    setDrawnPolygon(polygonData);

    setTimeout(() => {
      mapInstanceRef.current.invalidateSize();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setDrawnPolygon(null);

    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div ref={topRef} className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          Service Area Management
        </h1>
        {editingId && (
          <div className="flex items-center justify-between bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg mb-4">
            <span>✏️ You are editing a service area</span>

            <button
              onClick={handleCancelEdit}
              className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          </div>
        )}
        <p className="text-slate-300 mb-6">
          Draw polygons on the map to define service areas
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div ref={mapRef} className="h-[600px] w-full" />
            </div>
          </div>

          {/* Form Container */}
          <div className="space-y-6">
            {/* Draw Instructions */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 mb-3">
                📍 How to Use
              </h3>
              <ol className="text-sm text-indigo-800 space-y-2">
                <li>1. Click polygon tool on map</li>
                <li>2. Click points to draw shape</li>
                <li>3. Double-click to close polygon</li>
                <li>4. Polygon auto-closes (1st = last)</li>
                <li>5. Edit or delete with tools</li>
                <li>6. Fill form & save</li>
              </ol>
            </div>

            {/* Polygon Info */}
            {drawnPolygon && getPolygonInfo()}

            {/* Form */}
            <form onSubmit={handleSaveServiceArea} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Service Area Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Downtown Area"
                  className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes about this service area..."
                  rows="3"
                  className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !name || (!editingId && !drawnPolygon)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isLoading
                  ? editingId
                    ? "Updating..."
                    : "Saving..."
                  : editingId
                    ? "Update Service Area"
                    : "Save Service Area"}
              </button>
            </form>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${message.includes("✗")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
                  }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* Service Areas List */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Existing Service Areas ({serviceAreas.length})
          </h2>

          {serviceAreas.length === 0 ? (
            <div className="bg-slate-700 text-slate-300 text-center py-8 rounded-lg">
              No service areas created yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceAreas.map((area) => (
                <div
                  key={area.id}
                  className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {area.name}
                  </h3>
                  {area.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {area.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-1 rounded ${area.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {area.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-gray-500">
                      {area.polygon?.coordinates?.[0]?.length - 1 || 0} points
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {/* Edit Icon */}
                    <button
                      onClick={() => handleEdit(area)}
                      className="w-1/2 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition"
                    >
                      <Pencil size={18} />
                      Edit
                    </button>

                    {/* Delete Icon */}
                    <button
                      onClick={() => handleDelete(area.id)}
                      className="w-1/2 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>

                  {/* Keep this */}
                  <button
                    onClick={() => navigate(`/service-area/${area.id}/prices`)}
                    className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    Manage Pricing
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {deleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md">

          {/* Modal Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm text-center animate-scaleIn">

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Delete Service Area
            </h2>

            <p className="text-gray-600 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="w-1/2 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="w-1/2 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceArea;
