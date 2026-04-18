import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { ServiceAreaService } from '../../services/serviceArea.service';
import { useNavigate } from "react-router-dom";
import { Pencil, Search, Trash2 } from "lucide-react";
import Delete from "../../components/Delete";

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
  const [deletingId, setDeletingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const topRef = useRef(null);
  const editingLayerRef = useRef(null);
  const [searchText, setSearchText] = useState("");
  const markerRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);

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
    map.whenReady(() => {
      map.invalidateSize();
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000); // 3 sec

    return () => clearTimeout(timer);
  }, [message]);

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
      setDeletingId(deleteId);

      const response = await ServiceAreaService.delete(deleteId);

      if (response.success) {
        setServiceAreas((prev) => prev.filter((area) => area.id !== deleteId));
        setMessage("✓ Service area deleted successfully");
      }
    } catch (error) {
      setMessage("✗ Failed to delete service area");
    } finally {
      setDeletingId(null);
      setDeleteId(null);
    }
  };

  const handleEdit = (area) => {
    if (!mapInstanceRef.current || !featureGroupRef.current) return;

    setEditingId(area.id);
    setName(area.name);
    setDescription(area.description || "");

    featureGroupRef.current.clearLayers();

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
    });

    const map = mapInstanceRef.current;

    map.fitBounds(geoLayer.getBounds());

    setDrawnPolygon(polygonData);

    // 🔥 IMPORTANT: trigger edit mode via control
    setTimeout(() => {
      map.invalidateSize();

      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current);

        const newControl = new L.Control.Draw({
          position: "topleft",
          draw: false,
          edit: {
            featureGroup: featureGroupRef.current,
            remove: true,
          },
        });

        map.addControl(newControl);
        drawControlRef.current = newControl;
      }

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

  const handleSearch = async () => {
    if (!searchText.trim()) {
      setMessage("⚠️ Please enter a location");
      return;
    }

    setMapLoading(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchText}`
      );

      const data = await res.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];

        const map = mapInstanceRef.current;
        if (!map) return;

        map.flyTo([lat, lon], 15, { duration: 1.5 });

        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(display_name).openPopup();

        markerRef.current = marker;

        setShowDropdown(false);

        // ✅ success message (optional)
        setMessage(`📍 Found: ${display_name}`);

        setTimeout(() => {
          map.invalidateSize();
          setMapLoading(false);
        }, 1200);
      } else {
        setMessage("❌ Location not found");
        setMapLoading(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Search failed");
      setMapLoading(false);
    }
  };

  const fetchSuggestions = (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`
        );

        const data = await res.json();

        setSuggestions(data);
        setShowDropdown(true);
      } catch (err) {
        console.error("Suggestion error:", err);
      }
    }, 500); // 🔥 delay = no 429
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
            <div className="bg-white rounded-lg shadow-lg overflow-hidden relative">

              {/* 🔍 SEARCH BAR */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[350px]">

                <div className="relative">

                  {/* ICON */}
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  {/* INPUT */}
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchText}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSearchText(value);
                      fetchSuggestions(value); // 🔥 autocomplete
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="w-full bg-white pl-10 pr-24 py-2 rounded-full border shadow focus:outline-none"
                  />

                  {/* 🔥 BUTTON */}
                  <button
                    onClick={handleSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm"
                  >
                    Search
                  </button>

                  {/* 🔽 DROPDOWN */}
                  {showDropdown && suggestions.length > 0 && (
                    <div className="absolute mt-2 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto z-[1000]">
                      {suggestions.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSearchText(item.display_name);
                            setShowDropdown(false);
                            handleSearch();
                          }}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                        >
                          {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
              {/* MAP */}
              <div className="relative">

                {/* MAP */}
                <div className="relative">

                  {/* 🔥 WRAPPER (important) */}
                  <div className={mapLoading ? "blur-sm" : ""}>
                    <div ref={mapRef} className="h-[600px] w-full" />
                  </div>
                </div>

                {/* 🔥 LOADER */}
                {mapLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm z-[500]">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-gray-700">
                        Searching location...
                      </p>
                    </div>
                  </div>
                )}

              </div>
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
              <div className="fixed top-6 right-6 z-[2000] animate-slide-in">
                <div
                  className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${message.includes("❌")
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : message.includes("⚠️")
                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      : "bg-green-100 text-green-700 border border-green-300"
                    }`}
                >
                  {message}
                </div>
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
      <Delete
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        loading={deletingId === deleteId}
        title="Delete Service Area?"
        description="This service area will be permanently removed."
      />
    </div>
  );
};

export default ServiceArea;
