// helpers/geo.js
const turf = require("@turf/turf");

function findMatchingArea(userLat, userLng, areas) {
  const point = turf.point([userLng, userLat]); // ⚠️ lng, lat

  for (const area of areas) {
    const polygon = turf.polygon(area.polygon.coordinates);

    if (turf.booleanPointInPolygon(point, polygon)) {
      return area;
    }
  }

  return null;
}

module.exports = { findMatchingArea };
