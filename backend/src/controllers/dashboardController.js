const dashboardService = require("../services/dashboardService");

const getStats = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardStats();
    res.status(200).json(data);
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStats };
