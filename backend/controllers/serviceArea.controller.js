const { ServiceArea } = require("../models");

// Get all service areas
exports.getAllServiceAreas = async (req, res) => {
  try {
    const serviceAreas = await ServiceArea.findAll();
    res.status(200).json({
      success: true,
      data: serviceAreas,
    });
  } catch (error) {
    console.error("Error fetching service areas:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get service area by ID
exports.getServiceAreaById = async (req, res) => {
  try {
    const { id } = req.params;
    const serviceArea = await ServiceArea.findByPk(id);

    if (!serviceArea) {
      return res.status(404).json({
        success: false,
        message: "Service area not found",
      });
    }

    res.status(200).json({
      success: true,
      data: serviceArea,
    });
  } catch (error) {
    console.error("Error fetching service area:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create service area
exports.createServiceArea = async (req, res) => {
  try {
    const { name, polygon, description, isActive } = req.body;

    // Validate required fields
    if (!name || !polygon) {
      return res.status(400).json({
        success: false,
        message: "Name and polygon are required",
      });
    }

    // Validate GeoJSON polygon
    if (!polygon.type || polygon.type !== "Polygon" || !polygon.coordinates) {
      return res.status(400).json({
        success: false,
        message: "Invalid GeoJSON polygon format",
      });
    }

    // Validate that polygon is closed (first and last point are the same)
    const coordinates = polygon.coordinates[0];
    if (
      !coordinates ||
      coordinates.length < 4 ||
      JSON.stringify(coordinates[0]) !==
        JSON.stringify(coordinates[coordinates.length - 1])
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Polygon must be closed (first and last point must be the same)",
      });
    }

    const serviceArea = await ServiceArea.create({
      name,
      polygon,
      description,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: "Service area created successfully",
      data: serviceArea,
    });
  } catch (error) {
    console.error("Error creating service area:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update service area
exports.updateServiceArea = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, polygon, description, isActive } = req.body;

    const serviceArea = await ServiceArea.findByPk(id);

    if (!serviceArea) {
      return res.status(404).json({
        success: false,
        message: "Service area not found",
      });
    }

    // If polygon is being updated, validate it
    if (polygon) {
      if (!polygon.type || polygon.type !== "Polygon" || !polygon.coordinates) {
        return res.status(400).json({
          success: false,
          message: "Invalid GeoJSON polygon format",
        });
      }

      // Validate that polygon is closed
      const coordinates = polygon.coordinates[0];
      if (
        !coordinates ||
        coordinates.length < 4 ||
        JSON.stringify(coordinates[0]) !==
          JSON.stringify(coordinates[coordinates.length - 1])
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Polygon must be closed (first and last point must be the same)",
        });
      }
    }

    await serviceArea.update({
      name: name || serviceArea.name,
      polygon: polygon || serviceArea.polygon,
      description:
        description !== undefined ? description : serviceArea.description,
      isActive: isActive !== undefined ? isActive : serviceArea.isActive,
    });

    res.status(200).json({
      success: true,
      message: "Service area updated successfully",
      data: serviceArea,
    });
  } catch (error) {
    console.error("Error updating service area:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete service area
exports.deleteServiceArea = async (req, res) => {
  try {
    const { id } = req.params;

    const serviceArea = await ServiceArea.findByPk(id);

    if (!serviceArea) {
      return res.status(404).json({
        success: false,
        message: "Service area not found",
      });
    }

    await serviceArea.destroy();

    res.status(200).json({
      success: true,
      message: "Service area deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service area:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Check if point is within service area (for validation)
exports.checkPointInServiceArea = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const serviceAreas = await ServiceArea.findAll({
      where: { isActive: true },
    });

    const pointInArea = (point, polygon) => {
      const [lng, lat] = point;
      const coordinates = polygon.coordinates[0];
      let isInside = false;

      for (
        let i = 0, j = coordinates.length - 1;
        i < coordinates.length;
        j = i++
      ) {
        const xi = coordinates[i][0],
          yi = coordinates[i][1];
        const xj = coordinates[j][0],
          yj = coordinates[j][1];

        const intersect =
          yi > lat !== yj > lat &&
          lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersect) isInside = !isInside;
      }

      return isInside;
    };

    const matchedAreas = serviceAreas.filter((area) =>
      pointInArea([parseFloat(lng), parseFloat(lat)], area.polygon),
    );

    res.status(200).json({
      success: true,
      pointInServiceArea: matchedAreas.length > 0,
      matchedAreas,
    });
  } catch (error) {
    console.error("Error checking point in service area:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
