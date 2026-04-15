// controllers/sectionController.js
const { Section, Service, Category, Warranty } = require("../models");
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
          through: { attributes: [] },
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name", "image"],
            },
            {
              model: Service,
              as: "relatedServices",
              attributes: ["id", "title", "price", "mainimage"],
              through: { attributes: [] },
            },
            {
              model: Warranty,
              as: "warranties",
              where: { status: "active" },
              required: false,
            },
          ],
        },
      ],
    });

    const allMainServices = sections.flatMap(
      (section) => section.Services || section.services || [],
    );
    const allRelatedServices = allMainServices.flatMap(
      (service) => service.relatedServices || [],
    );

    const areaPriceMap = await getAreaPriceMap(
      allMainServices.map((service) => service.id),
      areaContext.matchedArea?.id,
    );

    const relatedAreaPriceMap = await getAreaPriceMap(
      allRelatedServices.map((service) => service.id),
      areaContext.matchedArea?.id,
    );

    const enrichedSections = sections.map((section) => {
      const plainSection = section.get ? section.get({ plain: true }) : section;
      const sectionServices =
        plainSection.Services || plainSection.services || [];

      return {
        ...plainSection,
        services: sectionServices.map((service) =>
          serializeServiceWithAreaPrice(
            service,
            areaContext.matchedArea,
            areaPriceMap.get(String(service.id)),
            relatedAreaPriceMap,
          ),
        ),
        // Keep capitalized version for compatibility if needed
        Services: sectionServices.map((service) =>
          serializeServiceWithAreaPrice(
            service,
            areaContext.matchedArea,
            areaPriceMap.get(String(service.id)),
            relatedAreaPriceMap,
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
      include: [
        {
          model: Service,
          through: { attributes: [] },
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name", "image"],
            },
            {
              model: Service,
              as: "relatedServices",
              attributes: ["id", "title", "price", "mainimage"],
              through: { attributes: [] },
            },
            {
              model: Warranty,
              as: "warranties",
              where: { status: "active" },
              required: false,
            },
          ],
        },
      ],
    });

    if (!section)
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });

    const plainSection = section.get ? section.get({ plain: true }) : section;
    const sectionServices =
      plainSection.Services || plainSection.services || [];

    const areaPriceMap = await getAreaPriceMap(
      sectionServices.map((service) => service.id),
      areaContext.matchedArea?.id,
    );

    const relatedAreaPriceMap = await getAreaPriceMap(
      sectionServices
        .flatMap((s) => s.relatedServices || [])
        .map((rs) => rs.id),
      areaContext.matchedArea?.id,
    );

    res.json({
      success: true,
      section: {
        ...plainSection,
        services: sectionServices.map((service) =>
          serializeServiceWithAreaPrice(
            service,
            areaContext.matchedArea,
            areaPriceMap.get(String(service.id)),
            relatedAreaPriceMap,
          ),
        ),
        Services: sectionServices.map((service) =>
          serializeServiceWithAreaPrice(
            service,
            areaContext.matchedArea,
            areaPriceMap.get(String(service.id)),
            relatedAreaPriceMap,
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
