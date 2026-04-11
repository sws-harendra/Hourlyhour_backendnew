// controllers/sectionController.js
const { Section, Service } = require("../models");
const {
  resolveServiceAreaContext,
  getAreaPriceMap,
  serializeServiceWithAreaPrice,
} = require("../helpers/serviceAreaPricing");

exports.createSection = async (req, res) => {
  try {
    const { title, description, order, serviceIds } = req.body;
    const section = await Section.create({ title, description, order });

    if (serviceIds && serviceIds.length > 0) {
      await section.setServices(serviceIds);
    }
    const sectionWithServices = await Section.findByPk(section.id, {
      include: [{ model: Service, through: { attributes: [] } }],
    });

    res.json({ success: true, section: sectionWithServices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSections = async (req, res) => {
  try {
    const areaContext = await resolveServiceAreaContext(req);
    const sections = await Section.findAll({
      where: { isActive: true },
      order: [["order", "ASC"]],
      include: [
        {
          model: Service,
          through: { attributes: [] }, // hide join table
        },
      ],
    });

    const allServices = sections.flatMap((section) => section.Services || []);
    const areaPriceMap = await getAreaPriceMap(
      allServices.map((service) => service.id),
      areaContext.matchedArea?.id,
    );

    const enrichedSections = sections.map((section) => {
      const plainSection = section.get ? section.get({ plain: true }) : section;
      return {
        ...plainSection,
        Services: (plainSection.Services || []).map((service) =>
          serializeServiceWithAreaPrice(
            service,
            areaContext.matchedArea,
            areaPriceMap.get(String(service.id)),
          ),
        ),
      };
    });

    res.json({ success: true, sections: enrichedSections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSectionById = async (req, res) => {
  try {
    const areaContext = await resolveServiceAreaContext(req);
    const section = await Section.findByPk(req.params.id, {
      include: [{ model: Service }],
    });

    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    const plainSection = section.get ? section.get({ plain: true }) : section;
    const areaPriceMap = await getAreaPriceMap(
      (plainSection.Services || []).map((service) => service.id),
      areaContext.matchedArea?.id,
    );

    res.json({
      success: true,
      section: {
        ...plainSection,
        Services: (plainSection.Services || []).map((service) =>
          serializeServiceWithAreaPrice(
            service,
            areaContext.matchedArea,
            areaPriceMap.get(String(service.id)),
          ),
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSection = async (req, res) => {
  try {
    const { title, description, type, order, isActive, serviceIds } = req.body;

    const section = await Section.findByPk(req.params.id);
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    await section.update({ title, description, type, order, isActive });

    if (Array.isArray(serviceIds)) {
      await section.setServices(serviceIds);
    }

    res.json({ success: true, section });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    await section.destroy();
    res.json({ success: true, message: "Section deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
