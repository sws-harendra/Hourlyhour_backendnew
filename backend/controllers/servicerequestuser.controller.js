const { RequestedService, User } = require("../models");

exports.createRequest = async (req, res) => {
  try {
    const request = await RequestedService.create({
      userId: req.user.id,
      name: req.body.name,
    });

    res.json({ success: true, data: request });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getMyRequests = async (req, res) => {
  const data = await RequestedService.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });

  res.json({ success: true, data });
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  await RequestedService.update({ status }, { where: { id: req.params.id } });

  res.json({ success: true });
};
exports.getAllRequests = async (req, res) => {
  try {
    const data = await RequestedService.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "name", "phone", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
