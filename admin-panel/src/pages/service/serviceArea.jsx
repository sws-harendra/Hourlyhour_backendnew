import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8008/api";

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

          // Ensure polygon is closed
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
          setMessage(`✓ Polygon updated with ${coordinates.length - 1} points`);
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

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch service areas
  const fetchServiceAreas = async () => {
    try {
      const response = await axios.get(`${API_BASE}/service-area`);
      if (response.data.success) {
        setServiceAreas(response.data.data);
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

    if (!drawnPolygon) {
      setMessage("⚠️ Please draw a polygon on the map");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        description,
        polygon: drawnPolygon,
        isActive: true,
      };

      const response = await axios.post(`${API_BASE}/service-area`, payload);

      if (response.data.success) {
        setMessage(`✓ Service area "${name}" saved successfully!`);
        setName("");
        setDescription("");
        setDrawnPolygon(null);

        // Clear map
        if (featureGroupRef.current) {
          featureGroupRef.current.clearLayers();
        }

        // Refresh list
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
      <div className=" border-blue-200 rounded-lg p-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          Service Area Management
        </h1>
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
                disabled={isLoading || !name || !drawnPolygon}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {isLoading ? "Saving..." : "Save Service Area"}
              </button>
            </form>

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  message.includes("✗")
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
                      className={`px-2 py-1 rounded ${
                        area.isActive
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
                  <button
                    onClick={() => navigate(`/service-area/${area.id}/prices`)}
                    className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
                  >
                    Manage Pricing
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceArea;
