const db = require("../models");
const AppSetting = db.AppSetting;

/**
 * GET settings
 */
exports.getSetting = async (req, res) => {
  try {
    const setting = await AppSetting.findByPk(1);
    res.json({ data: setting });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * CREATE or UPDATE settings (Upsert)
 */
exports.saveSetting = async (req, res) => {
  try {
    const { adminCommissionPercent, minimumBalance, driverAssignType } =
      req.body;

    if (
      adminCommissionPercent == null ||
      minimumBalance == null ||
      driverAssignType == null
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [setting] = await AppSetting.upsert({
      id: 1,
      adminCommissionPercent,
      minimumBalance,
      assignType: driverAssignType,
    });

    res.json({
      message: "Settings saved successfully",
      data: setting,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * DELETE settings (reset)
 */
exports.deleteSetting = async (req, res) => {
  try {
    await AppSetting.destroy({ where: { id: 1 } });
    res.json({ message: "Settings deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
